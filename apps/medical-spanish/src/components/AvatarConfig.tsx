import React, { useEffect, useMemo, useState } from "react";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Field } from "./ui/Field";
import {
  AVATARS,
  STT_LANGUAGE_LIST,
  VOICE_EMOTIONS,
} from "../../app/lib/constants";

type VoiceOption = { id: string; name: string };

interface AvatarConfigProps {
  avatarId: string;
  onAvatarIdChange: (avatarId: string) => void;
  voiceId: string;
  onVoiceIdChange: (voiceId: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  emotion: string;
  onEmotionChange: (emotion: string) => void;
  contextId: string;
  onContextIdChange: (contextId: string) => void;
  timerDuration: number | null;
  onTimerDurationChange: (duration: number | null) => void;
  backgroundImage: string | null;
  onBackgroundImageChange: (image: string | null) => void;
}

export const AvatarConfig: React.FC<AvatarConfigProps> = ({
  avatarId,
  onAvatarIdChange,
  voiceId,
  onVoiceIdChange,
  language,
  onLanguageChange,
  emotion,
  onEmotionChange,
  contextId,
  onContextIdChange,
  timerDuration,
  onTimerDurationChange,
  backgroundImage,
  onBackgroundImageChange,
}) => {
  const [isCustomTimer, setIsCustomTimer] = useState<boolean>(false);
  const [customTimerValue, setCustomTimerValue] = useState<string>("");
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(false);
  const [voicesError, setVoicesError] = useState<string | null>(null);
  const [useCustomVoice, setUseCustomVoice] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setVoicesLoading(true);
    setVoicesError(null);
    fetch("/api/list-voices")
      .then((res) => {
        if (!res.ok)
          return res
            .json()
            .then((j) => Promise.reject(j?.error ?? res.statusText));
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        if (json?.error) {
          setVoicesError(json.error);
          return;
        }
        const list = Array.isArray(json)
          ? json
          : (json?.data ?? json?.voices ?? json?.results ?? []);
        const items = Array.isArray(list) ? list : [];
        setVoices(
          items
            .map((v: { id?: string; voice_id?: string; name?: string }) => ({
              id: String(v.id ?? v.voice_id ?? ""),
              name: String(v.name ?? v.id ?? v.voice_id ?? "Unknown"),
            }))
            .filter((v: VoiceOption) => v.id),
        );
      })
      .catch((err) => {
        if (!cancelled)
          setVoicesError(
            typeof err === "string"
              ? err
              : (err?.error ?? err?.message ?? "Failed to load voices"),
          );
      })
      .finally(() => {
        if (!cancelled) setVoicesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedVoice = useMemo(() => {
    if (useCustomVoice || (voiceId && !voices.find((v) => v.id === voiceId))) {
      return { isCustom: true, id: voiceId, name: "Custom voice ID" };
    }
    if (!voiceId) return null;
    const found = voices.find((v) => v.id === voiceId);
    if (found) return { isCustom: false, ...found };
    return null;
  }, [voiceId, voices, useCustomVoice]);

  const selectedAvatar = useMemo(() => {
    const avatar = AVATARS.find((avatar) => avatar.avatar_id === avatarId);

    if (!avatar) {
      return {
        isCustom: true,
        name: "Custom Avatar ID",
        avatarId: null,
      };
    } else {
      return {
        isCustom: false,
        name: avatar.name,
        avatarId: avatar.avatar_id,
      };
    }
  }, [avatarId]);

  const timerOptions = [5, 10, 15, 20, "CUSTOM"];

  const getTimerDisplayValue = () => {
    if (isCustomTimer) return "Custom";
    if (timerDuration === null) return null;
    return `${timerDuration} minutes`;
  };

  const handleTimerSelect = (option: number | string) => {
    if (option === "CUSTOM") {
      setIsCustomTimer(true);
      onTimerDurationChange(null);
    } else {
      setIsCustomTimer(false);
      setCustomTimerValue("");
      onTimerDurationChange(option as number);
    }
  };

  const handleCustomTimerChange = (value: string) => {
    setCustomTimerValue(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      onTimerDurationChange(numValue);
    } else {
      onTimerDurationChange(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onBackgroundImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    onBackgroundImageChange(null);
  };

  return (
    <div className="relative flex flex-col gap-4 w-full py-4 max-h-full overflow-y-auto px-4">
      <div className="text-xl font-semibold text-white mb-2">LiveAvatarAPI</div>
      <Field label="Background Image (shown when inactive)">
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full text-white text-sm bg-zinc-700 py-2 px-6 rounded-lg outline-none cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-zinc-600 file:text-white hover:file:bg-zinc-500"
          />
          {backgroundImage && (
            <div className="relative">
              <img
                src={backgroundImage}
                alt="Background preview"
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </Field>
      <Field label="Session Duration">
        <Select
          isSelected={(option) => {
            if (option === "CUSTOM") return isCustomTimer;
            return !isCustomTimer && timerDuration === option;
          }}
          options={timerOptions}
          placeholder="Select duration"
          renderOption={(option) => {
            return option === "CUSTOM" ? "Custom" : `${option} minutes`;
          }}
          value={getTimerDisplayValue()}
          onSelect={(option) => handleTimerSelect(option)}
        />
      </Field>
      {isCustomTimer && (
        <Field label="Custom Duration (minutes)">
          <Input
            placeholder="Enter minutes"
            value={customTimerValue}
            onChange={handleCustomTimerChange}
            type="number"
          />
        </Field>
      )}
      <Field label="Knowledge Base ID (Context ID)">
        <Input
          placeholder="Enter knowledge base ID"
          value={contextId}
          onChange={onContextIdChange}
        />
      </Field>
      <Field label="Voice">
        <Select
          isSelected={(option) =>
            typeof option === "string"
              ? !!selectedVoice?.isCustom
              : option.id === selectedVoice?.id
          }
          options={[...voices, "CUSTOM"]}
          placeholder={voicesLoading ? "Loading voices…" : "Select voice"}
          disabled={voicesLoading}
          renderOption={(option) =>
            typeof option === "string" ? "Custom voice ID" : option.name
          }
          value={
            selectedVoice?.isCustom
              ? "Custom voice ID"
              : (selectedVoice?.name ?? null)
          }
          onSelect={(option) => {
            if (typeof option === "string") {
              setUseCustomVoice(true);
              onVoiceIdChange("");
            } else {
              setUseCustomVoice(false);
              onVoiceIdChange(option.id);
            }
          }}
        />
        {voicesError && (
          <p className="text-red-400 text-xs mt-1">{voicesError}</p>
        )}
        {!voicesLoading && voices.length === 0 && !voicesError && (
          <p className="text-zinc-400 text-xs mt-1">
            No voices from API.{" "}
            <a
              href="https://docs.liveavatar.com/reference/list_voices_v1_voices_get"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              View list in LiveAvatar docs
            </a>{" "}
            (use Try it) or enter a voice ID below.
          </p>
        )}
      </Field>
      {(selectedVoice?.isCustom || (!voicesLoading && voices.length === 0)) && (
        <Field label="Custom Voice ID">
          <Input
            placeholder="Paste voice ID from LiveAvatar docs or support"
            value={voiceId}
            onChange={onVoiceIdChange}
          />
        </Field>
      )}
      <Field label="Avatar ID">
        <Select
          isSelected={(option) =>
            typeof option === "string"
              ? !!selectedAvatar?.isCustom
              : option.avatar_id === selectedAvatar?.avatarId
          }
          options={[...AVATARS, "CUSTOM"]}
          placeholder="Select Avatar"
          renderOption={(option) => {
            return typeof option === "string"
              ? "Custom Avatar ID"
              : option.name;
          }}
          value={
            selectedAvatar?.isCustom ? "Custom Avatar ID" : selectedAvatar?.name
          }
          onSelect={(option) => {
            if (typeof option === "string") {
              onAvatarIdChange("");
            } else {
              onAvatarIdChange(option.avatar_id);
            }
          }}
        />
      </Field>
      {selectedAvatar?.isCustom && (
        <Field label="Custom Avatar ID">
          <Input
            placeholder="Enter custom avatar ID"
            value={avatarId}
            onChange={onAvatarIdChange}
          />
        </Field>
      )}
      <Field label="Language Listening to:">
        <Select
          isSelected={(option) => option.value === language}
          options={STT_LANGUAGE_LIST}
          renderOption={(option) => option.label}
          value={
            STT_LANGUAGE_LIST.find((option) => option.value === language)?.label
          }
          onSelect={(option) => onLanguageChange(option.value)}
        />
      </Field>
      <Field label="Emotion">
        <Select
          isSelected={(option) => option === emotion}
          options={[...VOICE_EMOTIONS]}
          renderOption={(option) =>
            option.charAt(0).toUpperCase() + option.slice(1)
          }
          value={emotion.charAt(0).toUpperCase() + emotion.slice(1)}
          onSelect={(option) => onEmotionChange(option)}
        />
      </Field>
    </div>
  );
};
