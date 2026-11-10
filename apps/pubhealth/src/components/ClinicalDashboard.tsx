"use client";

import { useEffect, useRef, useState } from "react";
import { useChatHistory } from "../liveavatar/useChatHistory";
import {
  MessageSender,
  type LiveAvatarSessionMessage,
} from "../liveavatar/types";
import {generateVerifiedAssessment,type VerifiedReport} from "../lib/verifiedAssessment";
import {downloadVerifiedReport} from "../lib/verifiedAssessmentPdf";
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
  live = false,
}: {
  messages: LiveAvatarSessionMessage[];
  compact?: boolean;
  title: string;
  scenarioId: string;
  live?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [assessment,setAssessment] = useState<VerifiedReport|null>(null);
  const [reviewProgress,setReviewProgress] = useState("");
  const abortRef=useRef<AbortController|null>(null);
  useEffect(()=>()=>abortRef.current?.abort(),[]);

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
    if (messages.length === 0 || isGeneratingPdf || live) return;
    setIsGeneratingPdf(true);setPdfError(null);setReviewProgress("Preparing assessor");setAssessment(null);
    const controller=new AbortController();abortRef.current=controller;
    try {
      const result=await generateVerifiedAssessment((index,total,label)=>setReviewProgress(`Reviewing ${index} of ${total}: ${label}`),controller.signal);
      setAssessment(result);setReviewProgress(result.complete?"Assessment complete":"Partial assessment — some categories need review");
    } catch (error) {setPdfError(error instanceof Error?error.message:"Unable to verify the conversation assessment.");}
    finally {abortRef.current=null;setIsGeneratingPdf(false);}
  };

  return (
    <aside
      className={`w-full overflow-hidden rounded-[4px] border border-chwe-line bg-chwe-soft flex flex-col ${
        compact ? "min-h-0 h-full" : "min-h-[420px]"
      }`}
    >
      <div className="px-[18px] py-3.5 border-b border-chwe-line bg-white flex items-start justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-[0.95rem] font-bold text-chwe-ink">Transcript</h2>
          {!compact && (
            <p className="text-xs text-chwe-muted mt-1">
              Conversation log for this session.
            </p>
          )}
          {pdfError && (
            <p className="text-xs text-[#a33a32] mt-1">{pdfError}</p>
          )}
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
            disabled={messages.length === 0 || isGeneratingPdf || live}
            className="text-xs !px-3 whitespace-normal leading-tight text-center"
          >
            {isGeneratingPdf
              ? "Analyzing transcript..."
              : "Generate verified assessment"}
          </Button>
          {assessment&&<Button className="text-xs !px-3" onClick={()=>void downloadVerifiedReport(assessment)}>Download PDF report</Button>}
        </div>
      </div>
      {live&&<p className="m-0 px-4 py-2 bg-chwe-soft text-xs text-chwe-muted">End the conversation to generate a verified assessment from the saved transcript.</p>}
      {isGeneratingPdf&&<div className="px-4 py-3 text-sm text-chwe-blue bg-white border-b border-chwe-line" role="status">{reviewProgress}</div>}
      {assessment&&<section aria-label="Verified rubric assessment" className="bg-white px-4 py-4 border-b border-chwe-line max-h-[520px] overflow-y-auto">
        <h3 className="font-bold text-chwe-blue text-base">Transcript-verified feedback</h3>
        <p className="text-xs text-chwe-muted mb-3">{assessment.categories.filter(c=>c.result).length} of {assessment.categories.length} categories verified · Qualitative feedback, not numeric grading.</p>
        <div className="space-y-3">{assessment.categories.map(category=><article key={category.id} className="border border-chwe-line rounded-[4px] p-3">
          <div className="flex items-start justify-between gap-2 mb-2"><h4 className="text-sm font-bold text-chwe-ink">{category.title}</h4><span className="text-[10px] uppercase font-bold text-chwe-green-dark">{category.result?.status.replaceAll("_"," ")||"Not reviewed"}</span></div>
          {category.result?<><p className="text-xs mb-2"><strong>Strength:</strong> {category.result.strength}</p>
            {category.result.evidence.map(e=><blockquote key={e.turnId} className="border-l-[3px] border-chwe-green bg-chwe-soft px-3 py-2 mb-2 text-xs">“{e.quote}” <span className="block text-chwe-muted mt-1">Exact learner quote · {e.turnId}</span></blockquote>)}
            <p className="text-xs mb-2"><strong>Opportunity:</strong> {category.result.improvement}</p>
            <p className="text-xs"><strong>Next step:</strong> {category.result.nextStep}</p></>:<p className="text-xs text-chwe-muted">Not reviewed. No conclusion or evidence assigned.</p>}
        </article>)}</div>
      </section>}

      <div
        ref={containerRef}
        className={`flex-1 overflow-y-auto p-4 space-y-3 bg-chwe-soft ${
          compact ? "min-h-[200px]" : "min-h-[320px] max-h-[calc(100vh-220px)]"
        }`}
      >
        {messages.length === 0 ? (
          <p className="text-sm text-chwe-muted text-center py-8">
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
              <p className="text-xs text-chwe-muted">
                {new Date(message.timestamp).toLocaleString()} ·{" "}
                {message.sender === MessageSender.AVATAR ? "Avatar" : "You"}
              </p>
              <p
                className={`text-sm px-3 py-2 rounded-[4px] whitespace-pre-wrap ${
                  message.sender === MessageSender.USER
                    ? "bg-chwe-blue text-white"
                    : "bg-white text-chwe-ink border border-chwe-line"
                }`}
              >
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
      live
      compact={compact}
      title={title}
      scenarioId={scenarioId}
    />
  );
}
