import React, { useMemo, useState } from "react";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Field } from "./ui/Field";
import { AVATAR_PRESETS, AvatarPreset } from "./avatarPresets";
import {
  AVATARS,
  STT_LANGUAGE_LIST,
  VOICE_EMOTIONS,
} from "../../app/lib/constants";

interface AvatarConfigProps {
  avatarId: string;
  onAvatarIdChange: (avatarId: string) => void;
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
  onPresetSelect?: (preset: AvatarPreset) => void;
}

export const AvatarConfig: React.FC<AvatarConfigProps> = ({
  avatarId,
  onAvatarIdChange,
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
  onPresetSelect,
}) => {
  const [isCustomTimer, setIsCustomTimer] = useState<boolean>(false);
  const [customTimerValue, setCustomTimerValue] = useState<string>("");

  const selectedPreset = useMemo(() => {
    return AVATAR_PRESETS.find(
      (preset) =>
        preset.avatarId === avatarId && preset.contextId === contextId,
    );
  }, [avatarId, contextId]);

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
    <div className="relative flex max-h-full w-full flex-col gap-5 overflow-y-auto px-5 py-5">
      <div className="mb-1">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6b5a2f]">
          Session controls
        </p>
        <p className="mt-1 text-xl font-black text-black">
          Simulation settings
        </p>
      </div>
      <Field label="Background Image (shown when inactive)">
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full cursor-pointer border border-zinc-400 bg-white px-4 py-2 text-sm text-zinc-700 outline-none file:mr-4 file:border-0 file:bg-black file:px-4 file:py-1 file:text-sm file:font-bold file:text-white hover:file:bg-zinc-800"
          />
          {backgroundImage && (
            <div className="relative">
              <img
                src={backgroundImage}
                alt="Background preview"
                className="h-32 w-full border border-zinc-300 object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute right-2 top-2 bg-red-700 px-2 py-1 text-xs font-bold text-white hover:bg-red-800"
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
