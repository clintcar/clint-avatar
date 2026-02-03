"use client";

import { useState, useEffect } from "react";
import { LiveAvatarSession } from "./LiveAvatarSession";

export const LiveAvatarDemo = () => {
  const [sessionToken, setSessionToken] = useState("");
  const [mode, setMode] = useState<"FULL" | "CUSTOM">("FULL");
  const [error, setError] = useState<string | null>(null);

  const handleStart = async (config?: {
    avatar_id?: string;
    language?: string;
    emotion?: string;
    context_id?: string;
  }): Promise<void> => {
    try {
      const res = await fetch("/api/start-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config || {}),
      });
      if (!res.ok) {
        const error = await res.json();
        setError(error.error);
        return;
      }
      const { session_token } = await res.json();
      setSessionToken(session_token);
      setMode("FULL");
      setError(null);
    } catch (error: unknown) {
      setError((error as Error).message);
    }
  };

  const handleStartCustom = async () => {
    const res = await fetch("/api/start-custom-session", {
      method: "POST",
    });
    if (!res.ok) {
      const error = await res.json();
      setError(error.error);
      return;
    }
    const { session_token } = await res.json();
    setSessionToken(session_token);
    setMode("CUSTOM");
  };

  const onSessionStopped = () => {
    // Reset the FE state
    setSessionToken("");
  };

  const onRestartSession = async (config?: {
    avatar_id?: string;
    language?: string;
    emotion?: string;
    context_id?: string;
  }) => {
    // Automatically restart the Full Avatar Session with config
    await handleStart(config);
  };

  // Auto-start Full Avatar Session on page load
  useEffect(() => {
    if (!sessionToken) {
      // Read saved settings from localStorage
      const savedLanguage =
        typeof window !== "undefined"
          ? localStorage.getItem("avatarLanguage")
          : null;
      const savedEmotion =
        typeof window !== "undefined"
          ? localStorage.getItem("avatarEmotion")
          : null;
      const savedAvatarId =
        typeof window !== "undefined"
          ? localStorage.getItem("avatarIdOverride")
          : null;
      const savedContextId =
        typeof window !== "undefined"
          ? localStorage.getItem("avatarContextId")
          : null;

      handleStart({
        language: savedLanguage || undefined,
        emotion: savedEmotion || undefined,
        avatar_id: savedAvatarId || undefined,
        context_id: savedContextId || undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      {!sessionToken ? (
        <>
          {error && (
            <div className="text-red-500">
              {"Error getting session token: " + error}
            </div>
          )}
          <button
            onClick={() => handleStart()}
            className="w-fit bg-white text-black px-4 py-2 rounded-md"
          >
            Start Full Avatar Session
          </button>

          <button
            onClick={handleStartCustom}
            className="w-fit bg-white text-black px-4 py-2 rounded-md"
          >
            Start Custom Avatar Session
          </button>
        </>
      ) : (
        <LiveAvatarSession
          mode={mode}
          sessionAccessToken={sessionToken}
          onSessionStopped={onSessionStopped}
          onRestartSession={onRestartSession}
        />
      )}
    </div>
  );
};
