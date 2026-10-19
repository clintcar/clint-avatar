"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ConnectionQuality, SessionState } from "@heygen/liveavatar-web-sdk";
import type { Patient } from "../../app/lib/patients";
import { LANGUAGE } from "../../app/api/secrets";
import {
  LiveAvatarContextProvider,
  useChatHistory,
  useSession,
  useTextChat,
  useVoiceChat,
} from "../liveavatar";
import type { LiveAvatarSessionMessage } from "../liveavatar/types";
import { Button } from "./ui/Button";
import { FullscreenIcon, LoadingIcon, MicIcon, MicOffIcon } from "./ui/Icons";

const SessionInner: React.FC<{
  patient: Patient;
  onSessionEnded: () => void;
  onMessagesChange: (messages: LiveAvatarSessionMessage[]) => void;
}> = ({ patient, onSessionEnded, onMessagesChange }) => {
  const [message, setMessage] = useState("");
  const [isVoiceChatMode, setIsVoiceChatMode] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const messages = useChatHistory();

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
    onMessagesChange(messages);
  }, [messages, onMessagesChange]);

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
      videoRef.current.play().catch((error) => {
        console.error("Video play error:", error);
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
      } catch (error) {
        console.error("Failed to exit fullscreen:", error);
      }
    }
    onSessionEnded();
  }, [isActive, onSessionEnded, stop, stopSession]);

  const isConnected = sessionState === SessionState.CONNECTED;
  const isConnecting = sessionState === SessionState.CONNECTING;

  return (
    <div className="overflow-hidden rounded-xl border border-[#dededf] bg-white">
      <div className="border-b border-[#dededf] bg-[#eceff1] px-3.5 py-2.5 font-bold">
        {patient.name}
      </div>
      <div className="p-3.5">
        <div
          ref={containerRef}
          className="relative aspect-video overflow-hidden rounded-md bg-[#101416]"
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="h-full w-full object-contain"
          />
          {isConnecting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
              <LoadingIcon size={32} />
            </div>
          )}
          {connectionQuality !== ConnectionQuality.UNKNOWN && isConnected && (
            <div className="absolute left-3 top-3 rounded-lg bg-black/75 px-2 py-1 text-xs text-white">
              {connectionQuality}
            </div>
          )}
          {isConnected && (
            <button
              type="button"
              aria-label="Toggle full screen"
              onClick={() => {
                if (!document.fullscreenElement) {
                  void containerRef.current?.requestFullscreen?.();
                } else {
                  void document.exitFullscreen();
                }
              }}
              className="absolute bottom-3 right-3 rounded bg-black/70 p-2 text-white hover:bg-black/85"
            >
              <FullscreenIcon size={18} />
            </button>
          )}
          {isConnected && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
              <div className="flex items-center gap-2 rounded-md bg-black/75 px-3 py-1.5 text-xs font-medium text-white">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isAvatarTalking
                      ? "animate-pulse bg-red-500"
                      : "bg-green-500"
                  }`}
                />
                {isAvatarTalking ? "Speaking" : "Listening"}
              </div>
              {isVoiceChatMode && isActive && (
                <button
                  type="button"
                  aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
                  disabled={isLoading}
                  onClick={() => {
                    if (isMuted) {
                      void unmute();
                    } else {
                      void mute();
                    }
                  }}
                  className="relative rounded-md bg-white p-2 text-sdm-ink"
                >
                  <span
                    className={`absolute inset-0 rounded-md border-2 border-sdm-gold ${
                      isUserTalking ? "animate-ping" : ""
                    }`}
                  />
                  {isLoading ? (
                    <LoadingIcon size={18} />
                  ) : isMuted ? (
                    <MicOffIcon size={18} />
                  ) : (
                    <MicIcon size={18} />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-col items-center gap-3">
          <Button
            onClick={() => void handleStopChat()}
            className="bg-[#a33a32] hover:bg-[#862e28] focus:bg-[#862e28]"
          >
            Stop Chat
          </Button>
          {isConnected && (
            <>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`rounded px-3 py-1.5 text-xs font-bold ${
                    isVoiceChatMode
                      ? "bg-sdm-black text-white"
                      : "border border-sdm-line bg-white text-sdm-ink"
                  }`}
                  onClick={() => {
                    setIsVoiceChatMode(true);
                    if (!isActive) {
                      void start();
                    }
                  }}
                >
                  Voice Chat
                </button>
                <button
                  type="button"
                  className={`rounded px-3 py-1.5 text-xs font-bold ${
                    !isVoiceChatMode
                      ? "bg-sdm-black text-white"
                      : "border border-sdm-line bg-white text-sdm-ink"
                  }`}
                  onClick={() => {
                    setIsVoiceChatMode(false);
                    if (isActive) {
                      stop();
                    }
                  }}
                >
                  Text Chat
                </button>
              </div>
              {!isVoiceChatMode && (
                <div className="flex w-full items-end gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && message.trim()) {
                        void sendMessage(message);
                        setMessage("");
                      }
                    }}
                    className="flex-1 rounded border border-sdm-line px-3 py-2 text-sm"
                    placeholder="Type a message..."
                  />
                  <Button
                    className="text-sm"
                    onClick={() => {
                      if (!message.trim()) {
                        return;
                      }
                      void sendMessage(message);
                      setMessage("");
                    }}
                  >
                    Send
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export function AvatarSession({
  patient,
  sessionAccessToken,
  onSessionEnded,
  onMessagesChange,
}: {
  patient: Patient;
  sessionAccessToken: string;
  onSessionEnded: () => void;
  onMessagesChange: (messages: LiveAvatarSessionMessage[]) => void;
}) {
  return (
    <LiveAvatarContextProvider sessionAccessToken={sessionAccessToken}>
      <SessionInner
        patient={patient}
        onSessionEnded={onSessionEnded}
        onMessagesChange={onMessagesChange}
      />
    </LiveAvatarContextProvider>
  );
}

export function AvatarPreview({
  patient,
  isStarting,
  error,
  onStart,
}: {
  patient: Patient;
  isStarting: boolean;
  error: string | null;
  onStart: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#dededf] bg-white">
      <div className="border-b border-[#dededf] bg-[#eceff1] px-3.5 py-2.5 font-bold">
        {patient.name}
      </div>
      <div className="p-3.5">
        <div className="relative aspect-video overflow-hidden rounded-md bg-[#101416]">
          <img
            src={patient.previewImage}
            alt={`${patient.name} preview`}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/25" />
          {error && (
            <p className="relative z-10 px-4 pt-4 text-center text-sm text-[#f4c7c4]">
              {error}
            </p>
          )}
        </div>
        <div className="mt-3 flex justify-center">
          <Button onClick={onStart} disabled={isStarting}>
            {isStarting ? "Starting..." : "Start Chat"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export async function fetchSessionToken(patient: Patient) {
  const response = await fetch("/api/start-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      avatar_id: patient.avatarId,
      context_id: patient.contextId,
      language: LANGUAGE || "en",
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to start session");
  }

  const { session_token } = (await response.json()) as {
    session_token: string;
  };
  return session_token;
}
