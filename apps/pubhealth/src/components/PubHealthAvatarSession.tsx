"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  LiveAvatarContextProvider,
  useSession,
  useTextChat,
  useVoiceChat,
} from "../liveavatar";
import { SessionState, ConnectionQuality } from "@heygen/liveavatar-web-sdk";
import { Button } from "./ui/Button";
import { ClinicalDashboard, TranscriptPanel } from "./ClinicalDashboard";
import { LoadingIcon, FullscreenIcon, MicIcon, MicOffIcon } from "./ui/Icons";
import { LANGUAGE } from "../../app/api/secrets";
import type { LiveAvatarSessionMessage } from "../liveavatar/types";

type SessionConfig = {
  avatarId: string;
  contextId: string;
};

const PubHealthAvatarSessionInner: React.FC<{
  onSessionEnded: () => void;
  title: string;
  scenarioId: string;
  onMessagesChange?: (messages: LiveAvatarSessionMessage[]) => void;
}> = ({ onSessionEnded, title, scenarioId, onMessagesChange }) => {
  const [message, setMessage] = useState("");
  const [isVoiceChatMode, setIsVoiceChatMode] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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
  const { sendMessage } = useTextChat("FULL");

  useEffect(() => {
    if (sessionState === SessionState.DISCONNECTED) {
      onSessionEnded();
    }
  }, [sessionState, onSessionEnded]);

  useEffect(() => {
    if (
      isStreamReady &&
      videoRef.current &&
      (sessionState === SessionState.CONNECTED ||
        sessionState === SessionState.CONNECTING)
    ) {
      attachElement(videoRef.current);
      videoRef.current.muted = false;
      videoRef.current.play().catch((err) => {
        console.error("Video play error:", err);
      });
    }
  }, [attachElement, isStreamReady, sessionState]);

  useEffect(() => {
    if (hasStarted || sessionState !== SessionState.INACTIVE) {
      return;
    }

    const boot = async () => {
      setHasStarted(true);
      await startSession();
      await start();
    };

    void boot();
  }, [hasStarted, sessionState, start, startSession]);

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
    onSessionEnded();
  }, [isActive, onSessionEnded, stop, stopSession]);

  const handleSendMessage = useCallback(() => {
    if (message.trim() === "") {
      return;
    }
    sendMessage(message);
    setMessage("");
  }, [message, sendMessage]);

  const isConnected = sessionState === SessionState.CONNECTED;
  const isConnecting = sessionState === SessionState.CONNECTING;
  const shouldShowVideo = isConnected || isConnecting;

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)] gap-4 p-[18px] bg-white items-stretch">
      <div className="flex flex-col min-w-0 overflow-hidden rounded-[4px] border border-chwe-line bg-[#101416] shadow-chwe">
        <div
          ref={containerRef}
          className="relative w-full aspect-video overflow-hidden flex items-center justify-center bg-[#101416]"
        >
          {shouldShowVideo ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={false}
                className="w-full h-full object-contain"
              />
              {isConnecting && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <LoadingIcon size={32} />
                </div>
              )}
              {connectionQuality !== ConnectionQuality.UNKNOWN &&
                isConnected && (
                  <div className="absolute top-3 left-3 bg-black/75 text-white rounded-lg px-2 py-1 text-xs">
                    {connectionQuality}
                  </div>
                )}
              {isConnected && (
                <button
                  aria-label="Toggle Full Screen"
                  onClick={toggleFullscreen}
                  className="absolute bottom-3 right-3 bg-black/70 text-white p-2 rounded-[3px] hover:bg-black/85"
                >
                  <FullscreenIcon size={18} />
                </button>
              )}
              {isConnected && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  <div className="bg-black/75 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isAvatarTalking
                          ? "bg-red-500 animate-pulse"
                          : "bg-green-500"
                      }`}
                    />
                    {isAvatarTalking ? "Speaking" : "Listening"}
                  </div>
                  {isVoiceChatMode && isActive && (
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
                        className={`absolute inset-0 rounded-[3px] border-2 border-chwe-green ${
                          isUserTalking ? "animate-ping" : ""
                        }`}
                      />
                      {isLoading ? (
                        <LoadingIcon className="animate-spin" size={18} />
                      ) : isMuted ? (
                        <MicOffIcon size={18} />
                      ) : (
                        <MicIcon size={18} />
                      )}
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <LoadingIcon size={32} />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 items-center px-4 py-3.5 bg-[#eef1f2] border-t border-chwe-line">
          {(isConnected || isConnecting) && (
            <Button
              onClick={handleStopChat}
              className="bg-[#a33a32] hover:bg-[#862e28] focus:bg-[#862e28] text-white text-sm"
            >
              Stop Chat
            </Button>
          )}
          {isConnected && (
            <>
              <div className="flex flex-row gap-2 items-center">
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-[3px] text-xs font-bold ${
                    isVoiceChatMode
                      ? "bg-chwe-blue text-white"
                      : "bg-white text-chwe-ink border border-chwe-line"
                  }`}
                  onClick={() => {
                    setIsVoiceChatMode(true);
                    if (!isActive) {
                      void start();
                    }
                  }}
                  disabled={isLoading}
                >
                  Voice Chat
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-[3px] text-xs font-bold ${
                    !isVoiceChatMode
                      ? "bg-chwe-blue text-white"
                      : "bg-white text-chwe-ink border border-chwe-line"
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
                </button>
              </div>
              {!isVoiceChatMode && (
                <div className="flex flex-row gap-2 items-end w-full">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 bg-white text-chwe-ink px-3 py-2 rounded-[3px] text-sm border border-chwe-line"
                    placeholder="Type a message..."
                  />
                  <Button className="!p-2 text-sm" onClick={handleSendMessage}>
                    Send
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <ClinicalDashboard
        compact
        title={title}
        scenarioId={scenarioId}
        onMessagesChange={onMessagesChange}
      />
    </div>
  );
};

export const PubHealthAvatarSession: React.FC<{
  sessionAccessToken: string;
  onSessionEnded: () => void;
  title: string;
  scenarioId: string;
  onMessagesChange?: (messages: LiveAvatarSessionMessage[]) => void;
}> = ({
  sessionAccessToken,
  onSessionEnded,
  title,
  scenarioId,
  onMessagesChange,
}) => {
  return (
    <LiveAvatarContextProvider sessionAccessToken={sessionAccessToken}>
      <PubHealthAvatarSessionInner
        onSessionEnded={onSessionEnded}
        title={title}
        scenarioId={scenarioId}
        onMessagesChange={onMessagesChange}
      />
    </LiveAvatarContextProvider>
  );
};

async function fetchSessionToken(config: SessionConfig) {
  const res = await fetch("/api/start-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      avatar_id: config.avatarId,
      context_id: config.contextId,
      language: LANGUAGE || "en",
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to start session");
  }

  const { session_token } = await res.json();
  return session_token as string;
}

export function PubHealthAvatarSection({
  scenarioId,
  title,
  name,
  kicker,
  intro,
  avatarId,
  contextId,
  previewImage,
}: {
  scenarioId: string;
  title: string;
  name: string;
  kicker: string;
  intro: string;
  avatarId: string;
  contextId: string;
  previewImage: string;
}) {
  const [sessionToken, setSessionToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [savedMessages, setSavedMessages] = useState<
    LiveAvatarSessionMessage[]
  >([]);
  const config = { avatarId, contextId };

  const handleStartChat = useCallback(async () => {
    setIsStarting(true);
    setError(null);
    setSavedMessages([]);
    try {
      const token = await fetchSessionToken(config);
      setSessionToken(token);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsStarting(false);
    }
  }, [avatarId, contextId]);

  const handleSessionEnded = useCallback(() => {
    setSessionToken("");
  }, []);

  const handleMessagesChange = useCallback(
    (messages: LiveAvatarSessionMessage[]) => {
      if (messages.length > 0) {
        setSavedMessages(messages);
      }
    },
    [],
  );

  return (
    <section className="w-full">
      <p className="m-0 mb-2 text-[0.78rem] font-bold uppercase tracking-[0.12em] text-chwe-green-dark">
        {kicker}
      </p>
      <h3 className="m-0 mb-2 text-[1.35rem] font-bold leading-[1.2] tracking-[-0.02em] text-chwe-ink">
        {name}
      </h3>
      <p className="m-0 mb-4 max-w-[46rem] text-[0.98rem] text-chwe-muted">
        {`${intro} Use the interactive avatar below to begin the conversation.`}
      </p>

      <div className="overflow-hidden rounded-[4px] border border-chwe-line bg-white shadow-chwe">
        <div className="flex items-center justify-between gap-4 px-[18px] py-3.5 bg-chwe-soft border-b border-chwe-line">
          <p className="m-0 text-[0.95rem] font-bold text-chwe-ink">{title}</p>
        </div>

        {sessionToken ? (
          <PubHealthAvatarSession
            key={sessionToken}
            sessionAccessToken={sessionToken}
            onSessionEnded={handleSessionEnded}
            title={title}
            scenarioId={scenarioId}
            onMessagesChange={handleMessagesChange}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)] gap-4 p-[18px] bg-white items-stretch">
            <div className="flex flex-col min-w-0 overflow-hidden rounded-[4px] border border-chwe-line bg-[#101416]">
              <div className="relative w-full aspect-video overflow-hidden bg-[#101416]">
                <img
                  src={previewImage}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-4">
                  {error && (
                    <p className="text-sm text-[#f4c7c4] text-center">
                      {error}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center px-4 py-3.5 bg-[#eef1f2] border-t border-chwe-line">
                <Button
                  onClick={() => void handleStartChat()}
                  disabled={isStarting}
                >
                  {isStarting ? "Starting..." : "Start Chat"}
                </Button>
              </div>
            </div>
            <TranscriptPanel
              messages={savedMessages}
              compact
              title={title}
              scenarioId={scenarioId}
            />
          </div>
        )}
      </div>
    </section>
  );
}
