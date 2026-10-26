"use client";

import { useState, useEffect } from "react";
import { LiveAvatarSession } from "./LiveAvatarSession";

export const LiveAvatarDemo = () => {
  const [sessionToken, setSessionToken] = useState("");
  const [mode, setMode] = useState<"FULL" | "CUSTOM">("FULL");
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);

  const handleStart = async (config?: {
    avatar_id?: string;
    language?: string;
    emotion?: string;
    context_id?: string;
  }): Promise<void> => {
    setIsStarting(true);
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
    } finally {
      setIsStarting(false);
    }
  };

  const handleStartCustom = async () => {
    setIsStarting(true);
    try {
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
      setError(null);
    } finally {
      setIsStarting(false);
    }
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
    <>
      <section
        id="simulation"
        className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-5 py-8 sm:px-8 sm:py-10"
      >
        <div className="mb-7 flex flex-col gap-2 border-l-4 border-[#CFB87C] pl-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6b5a2f]">
            NURS 6286
          </p>
          <h2 className="text-3xl font-black tracking-tight text-black sm:text-4xl">
            Choose a conversation
          </h2>
          <p className="max-w-3xl text-zinc-600">
            Select a character from the menu and begin when you are ready.
          </p>
        </div>

        {!sessionToken ? (
          <div
            aria-live="polite"
            className="flex min-h-72 flex-col items-center justify-center gap-5 border border-[#d8d5cc] bg-white p-8 text-center shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
          >
            {error ? (
              <>
                <p className="max-w-xl text-sm font-bold text-red-700">
                  {"Unable to prepare the simulation: " + error}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => handleStart()}
                    disabled={isStarting}
                    className="bg-[#CFB87C] px-6 py-3 text-sm font-bold text-black transition hover:bg-[#bda668] disabled:opacity-50"
                  >
                    Try again
                  </button>
                  <button
                    onClick={handleStartCustom}
                    disabled={isStarting}
                    className="border-2 border-black px-6 py-3 text-sm font-bold text-black transition hover:bg-black hover:text-white disabled:opacity-50"
                  >
                    Start custom session
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-[#CFB87C]" />
                <div>
                  <p className="font-bold text-black">
                    Preparing your simulation
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Connecting securely to the clinical conversation lab…
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <LiveAvatarSession
            mode={mode}
            sessionAccessToken={sessionToken}
            onSessionStopped={onSessionStopped}
            onRestartSession={onRestartSession}
          />
        )}

        <div className="mt-[30px] grid grid-cols-1 items-start gap-6 min-[651px]:grid-cols-2 min-[651px]:gap-12">
          <section
            aria-label="Project contact"
            className="min-w-0 border-l-[3px] border-[#CFB87C] bg-[#f6f5f2] px-[22px] py-[18px] text-sm leading-relaxed text-[#595959]"
          >
            <p>
              <a
                href="mailto:christina.baker@cuanschutz.edu?subject=Live%20Avatars%20%40%20CU-AMC"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-[#705a24] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#956c13]"
              >
                Contact Christina Baker, PhD, RN, NCSN, NI-BC to learn more
                about this project.
              </a>
            </p>
          </section>

          <section
            aria-label="CU-AMC Avatar"
            className="min-w-0 border-r-[3px] border-[#CFB87C] bg-[#f6f5f2] px-[22px] py-[18px] text-right text-sm leading-relaxed text-[#595959]"
          >
            <p>Learn more about Live AI Avatars at CU Anschutz.</p>
            <a
              href="https://xr.cuanschutz.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-[#705a24] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#956c13]"
            >
              Meet Grace, our CU-AMC Avatar ↗
            </a>
          </section>
        </div>
      </section>

      <footer className="border-t-4 border-[#CFB87C] bg-black text-zinc-300">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-5 py-6 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>NURS 6286</p>
          <a
            href="https://xr.cuanschutz.edu/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#CFB87C]"
          >
            xr.cuanschutz.edu ↗
          </a>
        </div>
      </footer>
    </>
  );
};
