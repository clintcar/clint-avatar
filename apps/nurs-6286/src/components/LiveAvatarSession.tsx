"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  LiveAvatarContextProvider,
  useSession,
  useTextChat,
  useVoiceChat,
} from "../liveavatar";
import { SessionState, ConnectionQuality } from "@heygen/liveavatar-web-sdk";
import { useAvatarActions } from "../liveavatar/useAvatarActions";
import { Button } from "./ui/Button";
import { AvatarConfig } from "./AvatarConfig";
import { MessageHistory } from "./MessageHistory";
import { LoadingIcon, FullscreenIcon, MicIcon, MicOffIcon } from "./ui/Icons";
import { Select } from "./ui/Select";
import { AVATAR_PRESETS, AvatarPreset } from "./avatarPresets";
import { CONTEXT_ID, LANGUAGE } from "../../app/api/secrets";

// Note: These need to be imported as constants, adjusting if needed
const DEFAULT_CONTEXT_ID = CONTEXT_ID || "";
const DEFAULT_LANGUAGE = LANGUAGE || "en";

const LiveAvatarSessionComponent: React.FC<{
  mode: "FULL" | "CUSTOM";
  onSessionStopped: () => void;
  onRestartSession?: (config: {
    avatar_id?: string;
    language?: string;
    emotion?: string;
    context_id?: string;
  }) => Promise<void> | void;
}> = ({ mode, onSessionStopped, onRestartSession }) => {
  const [message, setMessage] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("avatarBackgroundImage");
      return saved || "/headshot.png";
    }
    return "/headshot.png";
  });
  const [avatarId, setAvatarId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("avatarIdOverride") || "";
    }
    return "";
  });
  const [language, setLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("avatarLanguage") || DEFAULT_LANGUAGE;
    }
    return DEFAULT_LANGUAGE;
  });
  const [emotion, setEmotion] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("avatarEmotion") || "friendly";
    }
    return "friendly";
  });
  const [contextId, setContextId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("avatarContextId") || DEFAULT_CONTEXT_ID;
    }
    return DEFAULT_CONTEXT_ID;
  });
  const [timerDuration, setTimerDuration] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isVoiceChatMode, setIsVoiceChatMode] = useState(true);
  const [isPresetLoading, setIsPresetLoading] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    sessionState,
    isStreamReady,
    startSession,
    stopSession,
    connectionQuality,
    attachElement,
  } = useSession();
  const {
    isAvatarTalking,
    isUserTalking,
    isMuted,
    isActive,
    isLoading,
    start,
    stop,
    mute,
    unmute,
  } = useVoiceChat();

  const { repeat } = useAvatarActions(mode);

  const { sendMessage } = useTextChat(mode);
  const videoRef = useRef<HTMLVideoElement>(null);

  const selectedPreset = useMemo(() => {
    return AVATAR_PRESETS.find(
      (preset) =>
        preset.avatarId === avatarId && preset.contextId === contextId,
    );
  }, [avatarId, contextId]);

  useEffect(() => {
    if (sessionState === SessionState.DISCONNECTED) {
      onSessionStopped();
    }
  }, [sessionState, onSessionStopped]);

  useEffect(() => {
    if (
      isStreamReady &&
      videoRef.current &&
      (sessionState === SessionState.CONNECTED ||
        sessionState === SessionState.CONNECTING)
    ) {
      attachElement(videoRef.current);
      // Ensure video plays with audio
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.play().catch((err) => {
          console.error("Video play error:", err);
        });
      }
    }
  }, [attachElement, isStreamReady, sessionState]);

  // Timer effect
  useEffect(() => {
    if (
      sessionState === SessionState.DISCONNECTED ||
      sessionState === SessionState.INACTIVE
    ) {
      setTimeRemaining(null);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    } else if (
      sessionState === SessionState.CONNECTED &&
      timerDuration !== null &&
      timerDuration > 0 &&
      timeRemaining === null
    ) {
      setTimeRemaining(timerDuration * 60);
    }
  }, [sessionState, timerDuration, timeRemaining]);

  useEffect(() => {
    if (timeRemaining === null || sessionState !== SessionState.CONNECTED) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    if (timeRemaining <= 0) {
      stopSession();
      setTimeRemaining(null);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timeRemaining, sessionState, stopSession]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen?.();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen toggle failed", err);
    }
  }, []);

  const handleStartVoiceChat = async () => {
    if (isPresetLoading) {
      return;
    }
    if (isActive) {
      stop();
    } else {
      if (sessionState === SessionState.INACTIVE) {
        await startSession();
      }
      await start();
    }
  };

  const handlePresetSelect = useCallback(
    async (preset: AvatarPreset) => {
      setIsPresetLoading(true);
      setAvatarId(preset.avatarId);
      setContextId(preset.contextId);

      if (typeof window !== "undefined") {
        localStorage.setItem("avatarIdOverride", preset.avatarId);
        localStorage.setItem("avatarContextId", preset.contextId);
      }

      try {
        if (onRestartSession) {
          if (sessionState !== SessionState.INACTIVE) {
            if (isActive) {
              stop();
            }
            await stopSession();
          }
          await onRestartSession({
            avatar_id: preset.avatarId,
            language: language,
            emotion: emotion,
            context_id: preset.contextId,
          });
        }
      } finally {
        setIsPresetLoading(false);
      }
    },
    [
      emotion,
      isActive,
      language,
      onRestartSession,
      sessionState,
      stop,
      stopSession,
    ],
  );

  // const handleStartTextChat = async () => {
  //   if (sessionState === SessionState.INACTIVE) {
  //     await startSession();
  //   }
  //   setIsVoiceChatMode(false);
  //   if (isActive) {
  //     stop();
  //   }
  // };

  const handleStopChat = useCallback(async () => {
    if (isActive) {
      stop();
    }
    await stopSession();
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.error("Failed to exit fullscreen:", err);
      }
    }
    // Automatically restart Full Avatar Session with current settings
    if (onRestartSession) {
      onRestartSession({
        avatar_id: avatarId || undefined,
        language: language,
        emotion: emotion,
        context_id: contextId || undefined,
      });
    }
  }, [
    isActive,
    stop,
    stopSession,
    onRestartSession,
    avatarId,
    language,
    emotion,
    contextId,
  ]);

  const handleSendMessage = useCallback(() => {
    if (message.trim() === "") {
      return;
    }
    sendMessage(message);
    setMessage("");
  }, [message, sendMessage]);

  // useEffect(() => {
  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     if (
  //       event.key === "Enter" &&
  //       !isVoiceChatMode &&
  //       sessionState === SessionState.CONNECTED
  //     ) {
  //       handleSendMessage();
  //     }
  //   };

  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => window.removeEventListener("keydown", handleKeyDown);
  // }, [handleSendMessage, isVoiceChatMode, sessionState]);

  const isConnected = sessionState === SessionState.CONNECTED;
  const isConnecting = sessionState === SessionState.CONNECTING;
  const isInactive = sessionState === SessionState.INACTIVE;
  const shouldShowVideo = isConnected || isConnecting;

  return (
    <div className="w-full flex flex-col gap-8 max-w-[1080px]">
      <div className="flex flex-col rounded-xl bg-zinc-900 overflow-hidden">
        {isInactive && (
          <div className="flex flex-row items-center gap-4 p-4 border-b border-zinc-700">
            <div className="flex flex-row items-center gap-4">
              {mode === "FULL" && (
                <>
                  <Button
                    onClick={handleStartVoiceChat}
                    disabled={isPresetLoading}
                  >
                    Start Voice Chat
                  </Button>
                  {/* <Button onClick={handleStartTextChat}>Start Text Chat</Button> */}
                </>
              )}
              {mode === "CUSTOM" && (
                <Button onClick={() => startSession()}>Start Session</Button>
              )}
            </div>
            <div className="ml-auto w-full max-w-[320px]">
              <Select
                isSelected={(option) =>
                  option.avatarId === avatarId && option.contextId === contextId
                }
                options={AVATAR_PRESETS}
                placeholder="Select a preset"
                renderOption={(option) => option.name}
                value={selectedPreset?.name || null}
                onSelect={handlePresetSelect}
                disabled={isPresetLoading}
              />
            </div>
          </div>
        )}
        {(isConnected || isConnecting) && (
          <div className="flex flex-row justify-center items-center gap-4 p-4 border-b border-zinc-700">
            <Button
              onClick={handleStopChat}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Stop Chat
            </Button>
          </div>
        )}
        <div
          ref={containerRef}
          className="relative w-full aspect-video overflow-hidden flex flex-col items-center justify-center bg-black"
        >
          {shouldShowVideo ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={false}
                className="w-full h-full object-contain bg-black"
              />
              {isConnecting && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <LoadingIcon size={32} />
                </div>
              )}
              {timeRemaining !== null && timeRemaining > 0 && isConnected && (
                <div className="absolute bottom-16 left-3 bg-black bg-opacity-75 text-white rounded-lg px-3 py-2 text-sm">
                  Time remaining: {Math.floor(timeRemaining / 60)}:
                  {(timeRemaining % 60).toString().padStart(2, "0")}
                </div>
              )}
              {connectionQuality !== ConnectionQuality.UNKNOWN &&
                isConnected && (
                  <div className="absolute bottom-3 left-3 bg-black bg-opacity-75 text-white rounded-lg px-3 py-2 text-sm">
                    Connection Quality: {connectionQuality}
                  </div>
                )}
              {isConnected && (
                <button
                  aria-label="Toggle Full Screen"
                  onClick={toggleFullscreen}
                  className="absolute bottom-4 right-4 bg-zinc-900 bg-opacity-75 text-white p-2 rounded-md hover:bg-opacity-90"
                >
                  <FullscreenIcon size={20} />
                </button>
              )}
              {isConnected && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
                  <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isAvatarTalking
                          ? "bg-red-500 animate-pulse"
                          : "bg-green-500"
                      }`}
                    ></div>
                    {isAvatarTalking
                      ? "Avatar is speaking"
                      : "Avatar is listening"}
                  </div>
                  {mode === "FULL" && isVoiceChatMode && isActive && (
                    <Button
                      className="!p-2 relative"
                      disabled={isLoading}
                      onClick={() => {
                        if (isMuted) {
                          unmute();
                        } else {
                          mute();
                        }
                      }}
                    >
                      <div
                        className={`absolute left-0 top-0 rounded-lg border-2 border-[#CFB87C] w-full h-full ${
                          isUserTalking ? "animate-ping" : ""
                        }`}
                      />
                      {isLoading ? (
                        <LoadingIcon className="animate-spin" size={20} />
                      ) : isMuted ? (
                        <MicOffIcon size={20} />
                      ) : (
                        <MicIcon size={20} />
                      )}
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            backgroundImage && (
              <img
                src={backgroundImage}
                alt="Background"
                className="w-full h-full object-cover"
              />
            )
          )}
        </div>
        {isInactive && (
          <div className="border-t border-zinc-700">
            <div
              className="w-full cursor-pointer select-none p-4 text-sm font-medium bg-zinc-800 text-white"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            >
              {isSettingsOpen ? "▲ Settings" : "▼ Settings"}
            </div>
            {isSettingsOpen && (
              <div className="p-4 bg-zinc-800">
                <AvatarConfig
                  avatarId={avatarId}
                  onAvatarIdChange={(value) => {
                    setAvatarId(value);
                    if (typeof window !== "undefined") {
                      if (value) {
                        localStorage.setItem("avatarIdOverride", value);
                      } else {
                        localStorage.removeItem("avatarIdOverride");
                      }
                    }
                  }}
                  language={language}
                  onLanguageChange={(value) => {
                    setLanguage(value);
                    if (typeof window !== "undefined") {
                      localStorage.setItem("avatarLanguage", value);
                    }
                  }}
                  emotion={emotion}
                  onEmotionChange={(value) => {
                    setEmotion(value);
                    if (typeof window !== "undefined") {
                      localStorage.setItem("avatarEmotion", value);
                    }
                  }}
                  contextId={contextId}
                  onContextIdChange={(value) => {
                    setContextId(value);
                    if (typeof window !== "undefined") {
                      if (value) {
                        localStorage.setItem("avatarContextId", value);
                      } else {
                        localStorage.removeItem("avatarContextId");
                      }
                    }
                  }}
                  onPresetSelect={handlePresetSelect}
                  timerDuration={timerDuration}
                  onTimerDurationChange={setTimerDuration}
                  backgroundImage={backgroundImage}
                  onBackgroundImageChange={(image) => {
                    setBackgroundImage(image);
                    if (typeof window !== "undefined") {
                      if (image) {
                        localStorage.setItem("avatarBackgroundImage", image);
                      } else {
                        localStorage.removeItem("avatarBackgroundImage");
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}
        {(isConnected || isConnecting) && (
          <div className="flex flex-col gap-6 items-center justify-center p-8 border-t border-zinc-700 w-full">
            {mode === "FULL" && (
              <div className="flex flex-row gap-2 items-center">
                <button
                  className={`px-4 py-2 rounded-lg text-sm ${
                    isVoiceChatMode
                      ? "bg-zinc-300 text-black"
                      : "bg-zinc-700 text-white"
                  }`}
                  onClick={() => {
                    setIsVoiceChatMode(true);
                    if (!isActive && sessionState === SessionState.CONNECTED) {
                      start();
                    }
                  }}
                  disabled={isLoading}
                >
                  Voice Chat
                </button>
                {/* <button
                  className={`px-4 py-2 rounded-lg text-sm ${
                    !isVoiceChatMode
                      ? "bg-zinc-300 text-black"
                      : "bg-zinc-700 text-white"
                  }`}
                  onClick={() => {
                    setIsVoiceChatMode(false);
                    if (isActive) {
                      stop();
                    }
                  }}
                  disabled={isLoading}
                >
                  Text Chat
                </button> */}
              </div>
            )}
            {/* {!isVoiceChatMode && mode === "FULL" && (
              <div className="flex flex-row gap-2 items-end w-full max-w-[600px]">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 bg-white text-black px-4 py-2 rounded-lg"
                  placeholder="Type a message..."
                />
                <Button className="!p-2" onClick={handleSendMessage}>
                  Send
                </Button>
              </div>
            )} */}
            {mode === "CUSTOM" && (
              <div className="flex flex-row gap-2 items-end w-full max-w-[600px]">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 bg-white text-black px-4 py-2 rounded-lg"
                  placeholder="Type a message..."
                />
                <Button className="!p-2" onClick={handleSendMessage}>
                  Send
                </Button>
                <Button
                  className="!p-2"
                  onClick={() => {
                    repeat(message);
                    setMessage("");
                  }}
                >
                  Repeat
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      {isConnected && (
        <div className="w-full flex flex-col">
          <MessageHistory />
        </div>
      )}
    </div>
  );
};

export const LiveAvatarSession: React.FC<{
  mode: "FULL" | "CUSTOM";
  sessionAccessToken: string;
  onSessionStopped: () => void;
  onRestartSession?: (config: {
    avatar_id?: string;
    language?: string;
    emotion?: string;
    context_id?: string;
  }) => Promise<void> | void;
}> = ({ mode, sessionAccessToken, onSessionStopped, onRestartSession }) => {
  return (
    <LiveAvatarContextProvider
      key={sessionAccessToken}
      sessionAccessToken={sessionAccessToken}
    >
      <LiveAvatarSessionComponent
        mode={mode}
        onSessionStopped={onSessionStopped}
        onRestartSession={onRestartSession}
      />
    </LiveAvatarContextProvider>
  );
};
