"use client";
import { useEffect, useRef, useState } from "react";
import type { LiveAvatarSession } from "@heygen/liveavatar-web-sdk";
import type { VerifiedReport } from "../lib/verifiedAssessment";
import { Button } from "./ui/Button";

/** Uses a dedicated feedback avatar; the original roleplay transcript remains frozen. */
export function SpokenFeedbackVideo({
  report,
  onFinish,
}: {
  report: VerifiedReport;
  onFinish: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null),
    sdkRef = useRef<LiveAvatarSession | null>(null);
  const [state, setState] = useState(
    "Connecting the avatar for spoken feedback...",
  );
  const [spokenIndex, setSpokenIndex] = useState(0);
  const [caption, setCaption] = useState("");
  const [audioError, setAudioError] = useState("");
  const indexRef = useRef(0),
    sessionReady = useRef(false),
    advancing = useRef(false);
  const ref = useRef(report);
  ref.current = report;
  const sendCategory = async (index: number, session: LiveAvatarSession) => {
    const category = ref.current.categories[index];
    if (!category) {
      setState("Spoken assessment complete");
      return;
    }
    indexRef.current = index;
    setSpokenIndex(index);
    const result = category.result;
    const content = result
      ? {
          category: category.title,
          status: result.status,
          strength: result.strength,
          improvement: result.improvement,
          nextStep: result.nextStep,
          evidence: result.evidence,
        }
      : {
          category: category.title,
          status: "not_reviewed",
          strength: "No verified assessment is available for this category.",
          improvement: "No conclusion can be drawn.",
          nextStep: "Review this item manually.",
          evidence: [],
        };
    const message = `You are now OUT OF ROLEPLAY, delivering verified coaching. Spoken feedback item ${index + 1} of ${ref.current.categories.length}. Speak naturally and calmly. Address the learner directly, explicitly name this rubric category, distinguish observed behavior from uncertainty, describe the strength, an opportunity, and next step. Mention a short exact learner quotation only when provided. No scores, no invented observations. Pause briefly after the category. Content: ${JSON.stringify(content)}`;
    setState(
      `Speaking: ${index + 1} of ${ref.current.categories.length} · ${category.title}`,
    );
    session.message(message);
  };
  useEffect(() => {
    let canceled = false,
      contextId = "";
    let sdk: LiveAvatarSession | null = null;
    const start = async () => {
      try {
        const response = await fetch("/api/spoken-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ report }),
        });
        const data = await response.json();
        if (!response.ok)
          throw Error(
            data.error || "The spoken feedback session could not be prepared.",
          );
        contextId = data.contextId;
        const live = await import("@heygen/liveavatar-web-sdk");
        if (canceled) return;
        sdk = new live.LiveAvatarSession(data.token, {
          voiceChat: false,
          apiUrl: "https://api.liveavatar.com",
        });
        sdkRef.current = sdk;
        sdk.on(live.SessionEvent.SESSION_STREAM_READY, () => {
          if (video.current && sdk) {
            sdk.attach(video.current);
            void video.current
              .play()
              .catch(() =>
                setAudioError(
                  "Browser prevented playback. Click the video to enable audio.",
                ),
              );
          }
        });
        sdk.on(live.AgentEventsEnum.AVATAR_TRANSCRIPTION, (e) => {
          if (e.text) setCaption(e.text);
        });
        sdk.on(live.AgentEventsEnum.AVATAR_SPEAK_ENDED, () => {
          if (!sessionReady.current || advancing.current || !sdk) return;
          advancing.current = true;
          const next = indexRef.current + 1;
          setTimeout(() => {
            advancing.current = false;
            if (!canceled && sdk) {
              if (next < ref.current.categories.length)
                void sendCategory(next, sdk);
              else
                setState(
                  "Spoken assessment complete. You can end this review.",
                );
            }
          }, 1300);
        });
        await sdk.start();
        if (canceled) return;
        sessionReady.current = true;
        setTimeout(() => {
          if (!canceled && sdk) void sendCategory(0, sdk);
        }, 500);
      } catch (e) {
        setAudioError(
          e instanceof Error
            ? e.message
            : "Spoken feedback is unavailable. The written report remains available.",
        );
        setState("Spoken feedback unavailable");
      }
    };
    void start();
    return () => {
      canceled = true;
      sessionReady.current = false;
      void sdkRef.current?.stop().catch(() => {});
      if (contextId)
        void fetch("/api/spoken-feedback", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contextId }),
          keepalive: true,
        }).catch(() => {});
    };
  }, [report]);
  return (
    <div className="flex flex-col min-w-0 rounded-[4px] border border-chwe-line bg-[#101416] overflow-hidden">
      <div className="relative aspect-video bg-[#101416]">
        <video
          ref={video}
          autoPlay
          playsInline
          className="w-full h-full object-contain"
          onClick={() => {
            if (video.current) {
              video.current.muted = false;
              void video.current.play();
            }
          }}
        />
        <div className="absolute top-3 left-3 bg-chwe-blue/95 text-white text-xs px-3 py-1.5 rounded">
          Out of roleplay · Assessment mode
        </div>
      </div>
      <div className="px-4 py-3 bg-[#eef1f2] border-t border-chwe-line space-y-2">
        <p className="text-sm font-bold text-chwe-ink">{state}</p>
        {audioError && (
          <p className="text-xs text-[#a33a32]" role="alert">
            {audioError}
          </p>
        )}
        {caption && (
          <p className="text-xs text-chwe-muted max-h-20 overflow-y-auto">
            {caption}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            className="text-xs !px-3"
            onClick={() => {
              if (sdkRef.current) {
                sdkRef.current.interrupt();
                const next = Math.min(
                  spokenIndex + 1,
                  report.categories.length - 1,
                );
                void sendCategory(next, sdkRef.current);
              }
            }}
          >
            Next category
          </Button>
          <Button className="text-xs !px-3" onClick={onFinish}>
            End spoken review
          </Button>
        </div>
      </div>
    </div>
  );
}
