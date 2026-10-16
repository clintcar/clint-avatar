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
  const [backgroundImage] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("avatarBackgroundImage");
    }
    return null;
  });
  const [avatarPreviewImage, setAvatarPreviewImage] = useState<string | null>(
    null,
  );
  const [avatarId, setAvatarId] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("avatarIdOverride") ||
        AVATAR_PRESETS[0]?.avatarId ||
        ""
      );
    }
    return AVATAR_PRESETS[0]?.avatarId || "";
  });
  const [language] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("avatarLanguage") || DEFAULT_LANGUAGE;
    }
    return DEFAULT_LANGUAGE;
  });
  const [emotion] = useState<string>(() => {
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
  const [timerDuration] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isVoiceChatMode, setIsVoiceChatMode] = useState(true);
  const [isPresetLoading, setIsPresetLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
    if (!avatarId) {
      setAvatarPreviewImage(null);
      return;
    }

    const controller = new AbortController();

    const loadAvatarPreview = async () => {
      try {
        const response = await fetch(
          `/api/avatar-preview?avatarId=${encodeURIComponent(avatarId)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Unable to load avatar preview");
        }

        const data = await response.json();
        setAvatarPreviewImage(data.previewUrl || null);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setAvatarPreviewImage(null);
        }
      }
    };

    loadAvatarPreview();

    return () => controller.abort();
  }, [avatarId]);

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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

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
      if (document.fullscreenElement === containerRef.current) {
        await document.exitFullscreen();
      } else {
        await containerRef.current?.requestFullscreen?.();
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
    if (document.fullscreenElement === containerRef.current) {
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
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col overflow-hidden border border-[#d8d5cc] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
        {isInactive && (
          <div className="flex flex-col gap-5 border-b-4 border-[#CFB87C] bg-white p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#6b5a2f]">
                Ready when you are
              </p>
              {mode === "FULL" && (
                <>
                  <Button
                    onClick={handleStartVoiceChat}
                    disabled={isPresetLoading}
                  >
                    Begin voice session
                  </Button>
                  {/* <Button onClick={handleStartTextChat}>Start Text Chat</Button> */}
                </>
              )}
              {mode === "CUSTOM" && (
                <Button onClick={() => startSession()}>Begin session</Button>
              )}
            </div>
            <div className="w-full sm:max-w-[360px]">
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-zinc-600">
                Conversation character
              </label>
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
          <div className="flex flex-row items-center justify-between gap-4 border-b-4 border-[#CFB87C] bg-black p-4 text-white">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#CFB87C]">
                Live simulation
              </p>
              <p className="text-sm text-zinc-300">
                {selectedPreset?.name || "Clinical conversation"}
              </p>
            </div>
            <Button
              onClick={handleStopChat}
              className="bg-red-700 text-white hover:bg-red-800"
            >
              End session
            </Button>
          </div>
        )}
        <div
          ref={containerRef}
          className="relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden bg-black fullscreen:h-screen fullscreen:w-screen fullscreen:aspect-auto"
        >
          {shouldShowVideo ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={false}
                className="h-full w-full bg-black object-contain"
              />
              {isConnecting && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <LoadingIcon size={32} />
                </div>
              )}
              {timeRemaining !== null && timeRemaining > 0 && isConnected && (
                <div className="absolute bottom-16 left-3 bg-black/75 px-3 py-2 text-sm text-white">
                  Time remaining: {Math.floor(timeRemaining / 60)}:
                  {(timeRemaining % 60).toString().padStart(2, "0")}
                </div>
              )}
              {connectionQuality !== ConnectionQuality.UNKNOWN &&
                isConnected && (
                  <div className="absolute bottom-3 left-3 bg-black/75 px-3 py-2 text-sm text-white">
                    Connection Quality: {connectionQuality}
                  </div>
                )}
              {isConnected && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-black/75 px-4 py-2 text-sm font-medium text-white">
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
                      className="relative !p-2"
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
                        className={`absolute left-0 top-0 h-full w-full border-2 border-[#CFB87C] ${
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
            (backgroundImage || avatarPreviewImage) && (
              <img
                src={backgroundImage || avatarPreviewImage || ""}
                alt={
                  backgroundImage
                    ? "Custom background"
                    : `${selectedPreset?.name || "Avatar"} preview`
                }
                className="h-full w-full object-contain"
              />
            )
          )}
          <button
            type="button"
            aria-label={
              isFullscreen
                ? "Exit avatar full screen"
                : "Display avatar full screen"
            }
            aria-pressed={isFullscreen}
            title={isFullscreen ? "Exit full screen" : "Display full screen"}
            onClick={toggleFullscreen}
            className="absolute right-4 top-4 z-10 flex items-center gap-2 border border-[#CFB87C] bg-black/80 px-3 py-2 text-sm font-bold text-white shadow-md transition hover:bg-[#CFB87C] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CFB87C]"
          >
            <FullscreenIcon size={20} />
            <span>{isFullscreen ? "Exit full screen" : "Full screen"}</span>
          </button>
        </div>
        {(isConnected || isConnecting) && (
          <div className="flex w-full flex-col items-center justify-center gap-6 border-t-4 border-[#CFB87C] bg-white p-8">
            {mode === "FULL" && (
              <div className="flex flex-row items-center gap-2">
                <button
                  className={`px-4 py-2 text-sm font-bold ${
                    isVoiceChatMode
                      ? "bg-[#CFB87C] text-black"
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
              <div className="flex w-full max-w-[600px] flex-row items-end gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 border border-zinc-500 bg-white px-4 py-2 text-black"
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
        <div className="flex w-full flex-col">
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
