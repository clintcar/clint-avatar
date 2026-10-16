import React, { useEffect, useRef } from "react";
import { useChatHistory } from "../liveavatar/useChatHistory";
import { MessageSender } from "../liveavatar/types";
import { Button } from "./ui/Button";

export const MessageHistory: React.FC = () => {
  const messages = useChatHistory();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || messages.length === 0) return;

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  const handleExportLog = () => {
    if (messages.length === 0) {
      return;
    }

    const formattedMessages = messages.map((message) => {
      const date = new Date(message.timestamp);
      const dateStr = date.toLocaleString();
      const sender = message.sender === MessageSender.USER ? "You" : "Avatar";
      return `[${dateStr}] ${sender}: ${message.message}`;
    });

    const content = formattedMessages.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chat-log-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex w-full flex-col gap-3 border border-[#d8d5cc] bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6b5a2f]">
          Session record
        </p>
        <h3 className="mt-1 text-xl font-black text-black">
          Conversation transcript
        </h3>
      </div>
      <div
        ref={containerRef}
        className="flex max-h-[180px] w-full flex-col gap-2 overflow-y-auto border border-zinc-200 bg-[#f5f4f0] px-3 py-3"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4">
            No messages yet
          </p>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.timestamp}-${index}`}
              className={`flex flex-col gap-1 w-[50%] ${
                message.sender === MessageSender.USER
                  ? "self-end items-end"
                  : "self-start items-start"
              }`}
            >
              <p className="text-xs text-zinc-500">
                {message.sender === MessageSender.AVATAR ? "Avatar" : "You"}
              </p>
              <p className="bg-white px-3 py-2 text-sm text-black shadow-sm">
                {message.message}
              </p>
            </div>
          ))
        )}
      </div>
      <div className="flex flex-row justify-end">
        <Button
          onClick={handleExportLog}
          disabled={messages.length === 0}
          className="text-xs"
        >
          Export Chat Log
        </Button>
      </div>
    </div>
  );
};
