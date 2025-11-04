import React, { useMemo, useState } from "react";
import {
  AvatarQuality,
  ElevenLabsModel,
  STTProvider,
  VoiceEmotion,
  StartAvatarRequest,
  VoiceChatTransport,
} from "@heygen/streaming-avatar";

import { Input } from "../Input";
import { Select } from "../Select";

import { Field } from "./Field";

import { AVATARS, STT_LANGUAGE_LIST } from "@/app/lib/constants";

interface AvatarConfigProps {
  onConfigChange: (config: StartAvatarRequest) => void;
  config: StartAvatarRequest;
  timerDuration: number | null;
  onTimerDurationChange: (duration: number | null) => void;
  backgroundImage: string | null;
  onBackgroundImageChange: (image: string | null) => void;
}

export const AvatarConfig: React.FC<AvatarConfigProps> = ({
  onConfigChange,
  config,
  timerDuration,
  onTimerDurationChange,
  backgroundImage,
  onBackgroundImageChange,
}) => {
  const onChange = <T extends keyof StartAvatarRequest>(
    key: T,
    value: StartAvatarRequest[T],
  ) => {
    onConfigChange({ ...config, [key]: value });
  };
  const [showMore, setShowMore] = useState<boolean>(true);
  const [isCustomTimer, setIsCustomTimer] = useState<boolean>(false);
  const [customTimerValue, setCustomTimerValue] = useState<string>("");

  const selectedAvatar = useMemo(() => {
    const avatar = AVATARS.find(
      (avatar) => avatar.avatar_id === config.avatarName,
    );

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
  }, [config.avatarName]);

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
    <div className="relative flex flex-col gap-4 w-[550px] py-8 max-h-full overflow-y-auto px-4">
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
      <Field label="Custom Knowledge Base ID">
        <Input
          placeholder="Enter custom knowledge base ID"
          value={config.knowledgeId}
          onChange={(value) => onChange("knowledgeId", value)}
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
              onChange("avatarName", "");
            } else {
              onChange("avatarName", option.avatar_id);
            }
          }}
        />
      </Field>
      {selectedAvatar?.isCustom && (
        <Field label="Custom Avatar ID">
          <Input
            placeholder="Enter custom avatar ID"
            value={config.avatarName}
            onChange={(value) => onChange("avatarName", value)}
          />
        </Field>
      )}
      <Field label="Language">
        <Select
          isSelected={(option) => option.value === config.language}
          options={STT_LANGUAGE_LIST}
          renderOption={(option) => option.label}
          value={
            STT_LANGUAGE_LIST.find((option) => option.value === config.language)
              ?.label
          }
          onSelect={(option) => onChange("language", option.value)}
        />
      </Field>
      <Field label="Avatar Quality">
        <Select
          isSelected={(option) => option === config.quality}
          options={Object.values(AvatarQuality)}
          renderOption={(option) => option}
          value={config.quality}
          onSelect={(option) => onChange("quality", option)}
        />
      </Field>
      <Field label="Voice Chat Transport">
        <Select
          isSelected={(option) => option === config.voiceChatTransport}
          options={Object.values(VoiceChatTransport)}
          renderOption={(option) => option}
          value={config.voiceChatTransport}
          onSelect={(option) => onChange("voiceChatTransport", option)}
        />
      </Field>
      {showMore && (
        <>
          <h1 className="text-zinc-100 w-full text-center mt-5">
            Voice Settings
          </h1>
          <Field label="Custom Voice ID">
            <Input
              placeholder="Enter custom voice ID"
              value={config.voice?.voiceId}
              onChange={(value) =>
                onChange("voice", { ...config.voice, voiceId: value })
              }
            />
          </Field>
          <Field label="Emotion">
            <Select
              isSelected={(option) => option === config.voice?.emotion}
              options={Object.values(VoiceEmotion)}
              renderOption={(option) => option}
              value={config.voice?.emotion}
              onSelect={(option) =>
                onChange("voice", { ...config.voice, emotion: option })
              }
            />
          </Field>
          <Field label="ElevenLabs Model">
            <Select
              isSelected={(option) => option === config.voice?.model}
              options={Object.values(ElevenLabsModel)}
              renderOption={(option) => option}
              value={config.voice?.model}
              onSelect={(option) =>
                onChange("voice", { ...config.voice, model: option })
              }
            />
          </Field>
          <h1 className="text-zinc-100 w-full text-center mt-5">
            STT Settings
          </h1>
          <Field label="Provider">
            <Select
              isSelected={(option) => option === config.sttSettings?.provider}
              options={Object.values(STTProvider)}
              renderOption={(option) => option}
              value={config.sttSettings?.provider}
              onSelect={(option) =>
                onChange("sttSettings", {
                  ...config.sttSettings,
                  provider: option,
                })
              }
            />
          </Field>
        </>
      )}
      <button
        className="text-zinc-400 text-sm cursor-pointer w-full text-center bg-transparent"
        onClick={() => setShowMore(!showMore)}
      >
        {showMore ? "Show less" : "Show more..."}
      </button>

      {/* <div
  aria-label={`Avatar name Agent Vicki`}
  className="absolute left-2 top-2 z-10 rounded-md bg-black/60 px-3 py-1 text-white font-semibold"
>
  Agent Vicki
</div> */}

      
    </div>
  );
};
