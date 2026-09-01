"use client";

import { useEffect, useRef, useState } from "react";
import { useChatHistory } from "../liveavatar/useChatHistory";
import {
  MessageSender,
  type LiveAvatarSessionMessage,
} from "../liveavatar/types";
import { downloadAssessmentPdf } from "../lib/generateAssessmentPdf";
import { Button } from "./ui/Button";

function formatMessagesForExport(messages: LiveAvatarSessionMessage[]) {
  return messages.map((message) => {
    const dateStr = new Date(message.timestamp).toLocaleString();
    const sender = message.sender === MessageSender.USER ? "You" : "Avatar";
    return `[${dateStr}] ${sender}: ${message.message}`;
  });
}

export function TranscriptPanel({
  messages,
  compact = false,
  title,
  scenarioId,
}: {
  messages: LiveAvatarSessionMessage[];
  compact?: boolean;
  title: string;
  scenarioId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || messages.length === 0) return;
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  const handleExportLog = () => {
    if (messages.length === 0) return;

    const content = formatMessagesForExport(messages).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `conversation-transcript-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGeneratePdf = async () => {
    if (messages.length === 0 || isGeneratingPdf) {
      return;
    }

    setIsGeneratingPdf(true);
    setPdfError(null);
    try {
      await downloadAssessmentPdf({
        title,
        avatarId: scenarioId,
        messages,
      });
    } catch (error) {
      setPdfError(
        error instanceof Error
          ? error.message
          : "Unable to generate the assessment PDF.",
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <aside
      className={`w-full rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col ${
        compact ? "min-h-0 h-full" : "min-h-[420px]"
      }`}
    >
      <div className="px-4 py-3 border-b border-zinc-800 flex items-start justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Transcript</h2>
          {!compact && (
            <p className="text-xs text-zinc-400 mt-1">
              Conversation log for this session.
            </p>
          )}
          {pdfError && <p className="text-xs text-red-300 mt-1">{pdfError}</p>}
        </div>
        <div className="flex flex-col gap-2 shrink-0 max-w-[220px]">
          <Button
            onClick={handleExportLog}
            disabled={messages.length === 0}
            className="text-xs !px-3"
          >
            {compact ? "Export Log" : "Export Chat Log"}
          </Button>
          <Button
            onClick={() => void handleGeneratePdf()}
            disabled={messages.length === 0 || isGeneratingPdf}
            className="text-xs !px-3 whitespace-normal leading-tight text-center"
          >
            {isGeneratingPdf
              ? "Generating report..."
              : "Conversation Assessment Report"}
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`flex-1 overflow-y-auto p-4 space-y-3 ${
          compact ? "min-h-[200px]" : "min-h-[320px] max-h-[calc(100vh-220px)]"
        }`}
      >
        {messages.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-8">
            No messages yet. Click Start Chat to begin the conversation.
          </p>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.timestamp}-${index}`}
              className={`flex flex-col gap-1 max-w-[90%] ${
                message.sender === MessageSender.USER
                  ? "self-end items-end ml-auto"
                  : "self-start items-start"
              }`}
            >
              <p className="text-xs text-zinc-500">
                {new Date(message.timestamp).toLocaleString()} ·{" "}
                {message.sender === MessageSender.AVATAR ? "Avatar" : "You"}
              </p>
              <p className="text-sm text-zinc-100 bg-zinc-800 px-3 py-2 rounded-lg whitespace-pre-wrap">
                {message.message}
              </p>
            </div>
          ))
        )}
      </div>
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
    />
  );
}
