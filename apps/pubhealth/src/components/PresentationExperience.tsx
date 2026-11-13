"use client";
import { useEffect, useRef, useState } from "react";
import { PRESENTATION_SCENARIOS } from "../../app/lib/presentationScenarios";
import { PubHealthAvatarSection } from "./PubHealthAvatarSession";
import { ExploreQr } from "./ExploreQr";

export function PresentationExperience({
  scenario,
}: {
  scenario: (typeof PRESENTATION_SCENARIOS)[number];
}) {
  const [showQr, setShowQr] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showBriefing, setShowBriefing] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [theater, setTheater] = useState(false);
  const workspace = useRef<HTMLDivElement>(null);
  const avatar = scenario.avatar;
  useEffect(() => {
    const sync = () => setFullscreen(!!document.fullscreenElement);
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTheater(false);
    };
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  async function toggleFullscreen() {
    if (theater) {
      setTheater(false);
      return;
    }
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    setShowBriefing(false);
    try {
      if (!workspace.current?.requestFullscreen)
        throw Error("Fullscreen API unavailable");
      await workspace.current.requestFullscreen();
    } catch {
      // Embedded browsers may deny native fullscreen; keep a usable presentation view.
      setTheater(true);
    }
  }
  return (
    <div className="presentation-page">
      <div className="presentation-top chwe-shell">
        <a href="/">← All conversations</a>
        <span>ColoradoSPH Research Exchange · Live demonstration</span>
        <button
          className="present-button secondary"
          onClick={() => setShowQr(true)}
        >
          Explore · QR code
        </button>
      </div>
      <div
        ref={workspace}
        className={`presentation-workspace ${theater ? "theater" : ""} ${showTranscript ? "with-transcript" : "without-transcript"}`}
      >
        <div className="presentation-heading">
          <div>
            <p className="event-eyebrow">
              0{scenario.number} / 04 · {scenario.role}
            </p>
            <h1>{avatar.name}</h1>
            <p>{scenario.audience}</p>
          </div>
          <div className="presentation-tools">
            <button
              className="present-button secondary"
              aria-pressed={showBriefing}
              onClick={() => setShowBriefing(!showBriefing)}
            >
              {showBriefing ? "Hide" : "Show"} briefing
            </button>
            <button
              className="present-button secondary"
              aria-pressed={showTranscript}
              onClick={() => setShowTranscript(!showTranscript)}
            >
              {showTranscript ? "Hide" : "Show"} transcript &amp; rubric
            </button>
            <button
              className="present-button"
              onClick={() => void toggleFullscreen()}
            >
              {fullscreen || theater ? "Exit full screen" : "Full screen"}
            </button>
          </div>
        </div>
        {showBriefing && (
          <div className="presentation-briefing">
            <div>
              <p className="event-eyebrow">Your conversation</p>
              <p>{scenario.task}</p>
              <details>
                <summary>Try an opening</summary>
                <p>“{scenario.opening}”</p>
              </details>
            </div>
            <div>
              <p className="event-eyebrow">For the audience</p>
              <p>{scenario.watch}</p>
              <span>Notice one effective moment and one opportunity.</span>
            </div>
          </div>
        )}
        <PubHealthAvatarSection
          {...avatar}
          scenarioId={avatar.id}
          presentation
        />
        <p className="presenter-hint">
          End the conversation, then select Generate Assessment. Keep this tab
          open while you move to another avatar.
        </p>
      </div>
      <nav
        className="presentation-switch chwe-shell"
        aria-label="Other avatar presentations"
      >
        {PRESENTATION_SCENARIOS.map((entry) => (
          <a
            key={entry.slug}
            href={`/present/${entry.slug}`}
            target="_blank"
            rel="noreferrer"
            aria-current={entry.slug === scenario.slug ? "page" : undefined}
          >
            {entry.avatar.name}
            <span>{entry.role} ↗</span>
          </a>
        ))}
      </nav>
      {showQr && <ExploreQr onClose={() => setShowQr(false)} />}
    </div>
  );
}
