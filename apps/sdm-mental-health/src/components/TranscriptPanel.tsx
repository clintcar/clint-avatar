"use client";

import { useEffect, useRef, useState } from "react";
import type { Patient } from "../../app/lib/patients";
import {
  MessageSender,
  type LiveAvatarSessionMessage,
} from "../liveavatar/types";
import { downloadConversationReport } from "../lib/generateConversationReport";
import { Button } from "./ui/Button";

function formatMessagesForExport(
  patientName: string,
  messages: LiveAvatarSessionMessage[],
) {
  return messages.map((message) => {
    const dateStr = new Date(message.timestamp).toLocaleString();
    const sender =
      message.sender === MessageSender.USER ? "Learner" : patientName;
    return `[${dateStr}] ${sender}: ${message.message}`;
  });
}

export function TranscriptPanel({
  patient,
  messages,
  notes,
}: {
  patient: Patient;
  messages: LiveAvatarSessionMessage[];
  notes: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || messages.length === 0) {
      return;
    }
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  const handleExportLog = () => {
    if (messages.length === 0) {
      return;
    }
    const content = formatMessagesForExport(patient.name, messages).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${patient.id}-conversation-transcript-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReport = async () => {
    if (messages.length === 0 || isGenerating) {
      return;
    }
    setIsGenerating(true);
    setReportError(null);
    try {
      await downloadConversationReport({ patient, messages, notes });
    } catch (error) {
      setReportError(
        error instanceof Error
          ? error.message
          : "Unable to generate the assessment report.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="mt-4 flex min-h-[280px] flex-col overflow-hidden rounded-xl border border-sdm-line bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-sdm-line bg-white px-4 py-3.5">
        <div>
          <h2 className="text-[0.95rem] font-bold text-sdm-ink">Transcript</h2>
          {reportError && (
            <p className="mt-1 text-xs text-[#a33a32]">{reportError}</p>
          )}
        </div>
        <div className="flex max-w-[220px] shrink-0 flex-col gap-2">
          <Button
            onClick={handleExportLog}
            disabled={messages.length === 0}
            className="px-3 text-xs"
          >
            Export Log
          </Button>
          <Button
            onClick={() => void handleReport()}
            disabled={messages.length === 0 || isGenerating}
            className="whitespace-normal px-3 text-center text-xs leading-tight"
          >
            {isGenerating
              ? "Generating report..."
              : "Conversation Assessment Report"}
          </Button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex max-h-[420px] flex-1 flex-col gap-3 overflow-y-auto bg-sdm-soft p-4"
      >
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-sdm-muted">
            No messages yet. Click Start Chat to begin the conversation.
          </p>
        ) : (
          messages.map((message, index) => {
            const fromLearner = message.sender === MessageSender.USER;
            return (
              <div
                key={`${message.timestamp}-${index}`}
                className={`flex max-w-[90%] flex-col gap-1 ${
                  fromLearner ? "ml-auto items-end self-end" : "items-start"
                }`}
              >
                <p className="text-xs text-sdm-muted">
                  {new Date(message.timestamp).toLocaleString()} ·{" "}
                  {fromLearner ? "Learner" : patient.name}
                </p>
                <p
                  className={`whitespace-pre-wrap rounded px-3 py-2 text-sm ${
                    fromLearner
                      ? "bg-sdm-black text-white"
                      : "border border-sdm-line bg-white text-sdm-ink"
                  }`}
                >
                  {message.message}
                </p>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
