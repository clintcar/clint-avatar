"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getContextAssessment } from "../../app/lib/pubhealthContexts";
import { useChatHistory } from "../liveavatar/useChatHistory";
import {
  MessageSender,
  type LiveAvatarSessionMessage,
} from "../liveavatar/types";
import {
  generateVerifiedAssessment,
  createReviewAttempt,
  type ReviewProgress,
  type VerifiedCategory,
  type VerifiedReport,
} from "../lib/verifiedAssessment";
import { downloadVerifiedReport } from "../lib/verifiedAssessmentPdf";
import { Button } from "./ui/Button";

function transcriptText(messages: LiveAvatarSessionMessage[]) {
  return messages
    .map(
      (m) =>
        `[${new Date(m.timestamp).toLocaleString()}] ${m.sender === MessageSender.USER ? "You" : "Avatar"}: ${m.message}`,
    )
    .join("\n");
}

export function TranscriptPanel({
  messages,
  compact = false,
  scenarioId,
  live = false,
  reviewTrigger = 0,
  onReportReady,
  onSpokenRequested,
}: {
  messages: LiveAvatarSessionMessage[];
  compact?: boolean;
  title: string;
  scenarioId: string;
  live?: boolean;
  reviewTrigger?: number;
  onReportReady?: (report: VerifiedReport) => void;
  onSpokenRequested?: () => void;
}) {
  const spec = getContextAssessment(scenarioId);
  const [report, setReport] = useState<VerifiedReport | null>(null);
  const [items, setItems] = useState<Record<string, VerifiedCategory>>({});
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<ReviewProgress>({
    phase: "preparing",
    categoryId: null,
    completed: 0,
    total: spec?.categories.length ?? 0,
  });
  const [elapsed, setElapsed] = useState(0);
  const [, setErrorVersion] = useState(0);
  const attempt = useRef({ ...createReviewAttempt(), scenarioId });
  const [error, setError] = useState("");
  const abort = useRef<AbortController | null>(null);

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);
  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => {
    if (!busy) return;
    const started = Date.now();
    setElapsed(0);
    const interval = window.setInterval(
      () => setElapsed(Math.floor((Date.now() - started) / 1000)),
      1000,
    );
    return () => window.clearInterval(interval);
  }, [busy]);

  const begin = useCallback(async () => {
    if (live || busy || !messages.length) return;
    const controller = new AbortController();
    abort.current = controller;
    setBusy(true);
    setReport(null);
    setError("");
    setProgress({
      phase: "preparing",
      categoryId: null,
      completed: Object.keys(attempt.current.verified).length,
      total: spec?.categories.length ?? 0,
    });
    try {
      const result = await generateVerifiedAssessment(
        attempt.current,
        controller.signal,
        setProgress,
        (item) =>
          setItems((previous) => ({ ...previous, [item.categoryId]: item })),
      );
      if (result) {
        setReport(result);
        onReportReady?.(result);
      }
      setErrorVersion((v) => v + 1);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "The LiveAvatar assessment could not be completed.",
      );
    } finally {
      setBusy(false);
      abort.current = null;
      setErrorVersion((v) => v + 1);
    }
  }, [busy, live, messages, onReportReady, spec?.categories.length]);

  // Review generation is manual. Ending a conversation must never trigger it.
  void reviewTrigger;

  const downloadTranscript = () => {
    const blob = new Blob([transcriptText(messages)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `public-health-conversation-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <aside
      className={`w-full min-w-0 rounded-[4px] border border-chwe-line bg-white flex flex-col ${compact ? "min-h-[470px]" : "min-h-[500px]"}`}
    >
      <header className="px-4 py-3 border-b border-chwe-line bg-chwe-soft">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-chwe-ink">
            Conversation &amp; assessment
          </h3>
          <span className="text-[11px] text-chwe-muted">
            {spec?.categories.length ?? 0} qualitative categories
          </span>
        </div>
        <p className="text-xs text-chwe-muted mt-1">
          The transcript and the scenario rubric remain available throughout the
          practice.
        </p>
      </header>
      <section
        aria-label="Conversation transcript"
        className="border-b border-chwe-line"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-2">
          <h4 className="text-xs font-bold uppercase tracking-wide text-chwe-blue">
            Transcript
          </h4>
          <Button
            onClick={downloadTranscript}
            disabled={!messages.length}
            className="text-xs !px-2 !py-1"
          >
            Export
          </Button>
        </div>
        <div
          ref={listRef}
          className="h-[170px] overflow-y-auto bg-chwe-soft px-3 py-2 space-y-2"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            <p className="text-sm text-chwe-muted py-4 text-center">
              Your conversation will appear here.
            </p>
          ) : (
            messages.map((m, i) => (
              <div
                key={m.id || i}
                className={`text-xs p-2 rounded ${m.sender === MessageSender.USER ? "bg-[#e8f3f1]" : "bg-white border border-chwe-line"}`}
              >
                <strong className="block text-chwe-blue mb-1">
                  {m.sender === MessageSender.USER ? "You" : "Avatar"}
                </strong>
                <p className="whitespace-pre-wrap text-chwe-ink">{m.message}</p>
              </div>
            ))
          )}
        </div>
      </section>
      <section
        aria-label="Scenario assessment rubric"
        className="flex-1 min-h-0"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-chwe-line">
          <h4 className="text-xs font-bold uppercase tracking-wide text-chwe-blue">
            Assessment categories
          </h4>
          <span className="text-xs text-chwe-muted">
            {Object.keys(items).length ||
              report?.categories.filter((c) => c.result).length ||
              0}{" "}
            / {spec?.categories.length ?? 0} verified
          </span>
        </div>
        {busy && (
          <div
            className="px-4 py-3 border-b border-chwe-line bg-[#eef5f6]"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-3 text-sm font-semibold text-chwe-blue">
              <svg
                className="w-5 h-5 shrink-0 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeOpacity=".2"
                />
                <path
                  d="M12 3a9 9 0 0 1 9 9"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <span>
                {progress.phase === "preparing"
                  ? "Preparing the transcript review"
                  : progress.phase === "verifying"
                    ? "Preparing the assessment report"
                    : `Analyzing: ${spec?.categories.find((c) => c.id === progress.categoryId)?.title ?? progress.categoryId ?? "Transcript evidence"}`}
              </span>
            </div>
            <div
              className="mt-2 w-full h-2 bg-white border border-chwe-line rounded-full overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={progress.total || 1}
              aria-valuenow={progress.completed}
              aria-label="Categories verified"
            >
              <div
                className="h-full bg-[#36738C] transition-all duration-300"
                style={{
                  width: `${progress.total ? Math.round((100 * progress.completed) / progress.total) : 0}%`,
                }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-chwe-muted">
              <span>
                {progress.completed} of {progress.total} categories verified
              </span>
              <span>
                Elapsed {String(Math.floor(elapsed / 60)).padStart(2, "0")}:
                {String(elapsed % 60).padStart(2, "0")}
              </span>
            </div>
          </div>
        )}
        {error && (
          <p className="px-4 py-2 text-xs text-[#a33a32]" role="alert">
            {error}
          </p>
        )}
        <div className="max-h-[440px] overflow-y-auto divide-y divide-chwe-line">
          {spec?.categories.map((category, i) => {
            const finding =
              report?.categories.find((c) => c.id === category.id)?.result ??
              items[category.id];
            return (
              <article key={category.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <h5 className="text-sm font-bold text-chwe-ink">
                    {i + 1}. {category.title}
                  </h5>
                  <span className="text-[10px] font-bold uppercase text-chwe-muted text-right shrink-0">
                    {finding
                      ? finding.status.replaceAll("_", " ")
                      : attempt.current.errors[category.id]
                        ? "Review error"
                        : busy
                          ? "Pending"
                          : "Not reviewed"}
                  </span>
                </div>
                {!finding ? (
                  <div>
                    <p className="text-xs text-chwe-muted mt-1">
                      Look-fors: {category.lookFors.join(" · ")}
                    </p>
                    {attempt.current.errors[category.id] && (
                      <p className="text-xs text-[#a33a32] mt-1">
                        Assessment error: {attempt.current.errors[category.id]}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 space-y-2 text-xs text-chwe-ink">
                    <p>
                      <strong>Strength:</strong> {finding.strength}
                    </p>
                    {finding.evidence.map((e, j) => (
                      <blockquote
                        key={`${e.turnId}-${j}`}
                        className="border-l-[3px] border-chwe-green bg-chwe-soft px-3 py-2"
                      >
                        “{e.quote}”
                        {e.role === "avatar" && (
                          <span className="block text-chwe-muted mt-1">
                            Avatar response
                          </span>
                        )}
                      </blockquote>
                    ))}
                    <p>
                      <strong>Improvement:</strong> {finding.improvement}
                    </p>
                    <p>
                      <strong>Next step:</strong> {finding.nextStep}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
      <footer className="px-4 py-3 flex flex-wrap gap-2 border-t border-chwe-line bg-chwe-soft">
        {!live &&
          messages.length > 0 &&
          !busy &&
          (!report || !report.complete) && (
            <Button onClick={() => void begin()} className="text-xs !px-3">
              {Object.keys(attempt.current.verified).length
                ? "Review Unfinished Categories"
                : "Generate Assessment"}
            </Button>
          )}
        {busy && (
          <Button
            onClick={() => abort.current?.abort()}
            className="text-xs !px-3"
          >
            Cancel review
          </Button>
        )}
        {report && (
          <Button
            onClick={() => void downloadVerifiedReport(report)}
            className="text-xs !px-3"
          >
            Download CHWE PDF
          </Button>
        )}
        {report && onSpokenRequested && (
          <Button onClick={onSpokenRequested} className="text-xs !px-3">
            Hear Spoken Feedback
          </Button>
        )}
        {live && (
          <p className="text-xs text-chwe-muted">
            Select <strong>End Conversation</strong> beneath the avatar when
            finished.
          </p>
        )}
        {report && !report.complete && (
          <p className="text-xs text-[#a33a32]">
            Review incomplete —{" "}
            {report.categories.filter((c) => c.result).length} of{" "}
            {report.categories.length} categories verified. Select Review
            Unfinished Categories to try only unresolved items. Missing
            categories reflect a technical assessment problem, not learner
            performance.
          </p>
        )}
      </footer>
    </aside>
  );
}

export function ClinicalDashboard({
  compact = false,
  title = "Conversation",
  scenarioId = "",
  onMessagesChange,
}: {
  compact?: boolean;
  title?: string;
  scenarioId?: string;
  onMessagesChange?: (messages: LiveAvatarSessionMessage[]) => void;
}) {
  const messages = useChatHistory();
  useEffect(() => {
    onMessagesChange?.(messages);
  }, [messages, onMessagesChange]);
  return (
    <TranscriptPanel
      messages={messages}
      compact={compact}
      title={title}
      scenarioId={scenarioId}
      live
    />
  );
}
