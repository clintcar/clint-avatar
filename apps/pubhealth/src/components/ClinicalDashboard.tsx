"use client";

import { useEffect, useRef } from "react";
import { useChatHistory } from "../liveavatar/useChatHistory";
import {
  MessageSender,
  type LiveAvatarSessionMessage,
} from "../liveavatar/types";
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
}: {
  messages: LiveAvatarSessionMessage[];
  compact?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <aside
      className={`w-full rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col ${
        compact ? "min-h-0 h-full" : "min-h-[420px]"
      }`}
    >
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Transcript</h2>
          {!compact && (
            <p className="text-xs text-zinc-400 mt-1">
              Conversation log for this session.
            </p>
          )}
        </div>
        <Button
          onClick={handleExportLog}
          disabled={messages.length === 0}
          className="text-xs shrink-0"
        >
          Export Chat Log
        </Button>
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

export function ClinicalDashboard({ compact = false }: { compact?: boolean }) {
  const messages = useChatHistory();
  return <TranscriptPanel messages={messages} compact={compact} />;
}
