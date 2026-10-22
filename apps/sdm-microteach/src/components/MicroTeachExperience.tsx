"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConnectionQuality, SessionState } from "@heygen/liveavatar-web-sdk";
import {
  LiveAvatarContextProvider, useAvatarActions, useChatHistory,
  useSession, useTextChat, useVoiceChat
} from "../liveavatar";
import type { LiveAvatarSessionMessage } from "../liveavatar/types";
import { MessageSender } from "../liveavatar/types";
import { RUBRIC } from "../lib/rubric";
import { downloadReport } from "../lib/downloadReport";

type Mode = "active" | "silent";
type Tab = "guidelines" | "rubric" | "preparation" | "notes";

function Dashboard({ tab, setTab, notes, setNotes }: {
  tab: Tab; setTab: (t: Tab) => void; notes: string; setNotes: (s: string) => void;
}) {
  const tabs: Tab[] = ["guidelines", "rubric", "preparation", "notes"];
  return <aside className="overflow-hidden rounded-xl bg-[#111827] text-[#e5eaf2]">
    <div className="px-4 py-4"><h3 className="m-0 text-base font-bold">MicroTeach Learning Dashboard</h3><p className="mt-1 text-xs text-[#aeb5c4]">DSOR 5341 · Guidelines and course rubric</p></div>
    <div className="grid grid-cols-4 border-y border-[#313d52]" role="tablist" aria-label="Learning dashboard tabs">
      {tabs.map(t => <button key={t} role="tab" aria-selected={t === tab} onClick={() => setTab(t)} className={`px-1 py-3 text-xs capitalize ${t === tab ? "bg-[#354158] text-white" : "text-[#aeb5c4] hover:bg-[#263247]"}`}>{t}</button>)}
    </div>
    <div className="space-y-3 p-4 text-sm">
      {tab === "guidelines" && <>
        <Info title="20-minute independent MicroTeach">Present a focused, evidence-based topic in approximately 20 minutes. Make your content meaningful to learners; PowerPoint slides are optional.</Info>
        <Info title="Expectations"><ul className="list-disc space-y-1 pl-5"><li>Set clear learning objectives.</li><li>Use references and discuss the relevant literature.</li><li>Organize content for clarity and retention.</li><li>Design learner interaction—not only responses to Ella's questions.</li><li>Summarize and identify useful next steps.</li></ul></Info>
        <Info title="Visual limitations">Ella cannot see shared screens, slide decks, charts, diagrams, or gestures. Describe important visuals aloud. She should never invent unseen information or penalize the mere absence of screen access.</Info>
        <Info title="Listening choices">Active mode allows brief questions and participation. Silent mode instructs Ella not to interrupt. You may switch during the rehearsal.</Info>
      </>}
      {tab === "rubric" && <>
        <Info title="Rating scale">3 = Excellent (A) · 2 = Met Expectations (B) · 0 = Critical Error (F). There is no 1-point score. Use Not Assessed when evidence is insufficient.</Info>
        {RUBRIC.map((section, i) => <Info key={section.title} title={`${i + 1}. ${section.title}`}>
          {section.levels.map(([score, description]) => <p className="mb-2" key={score}><span className="font-bold text-[#e1cc92]">{score}:</span> {description}</p>)}
          {i === 3 && <p className="italic text-[#aeb5c4]">Attendance and peer feedback records are not available to Ella. Normally Not Assessed.</p>}
        </Info>)}
      </>}
      {tab === "preparation" && <>
        <Info title="Practice sequence"><ol className="list-decimal space-y-2 pl-5"><li>Choose an active or silent listener.</li><li>Tell Ella your teaching topic when she asks.</li><li>Present your lesson, describing important visuals.</li><li>Switch listening modes as needed.</li><li>Ask Ella to enter assessment mode for feedback.</li><li>Download your conversation report.</li></ol></Info>
        <Info title="Preparation checklist">{["Learning objective", "Literature and references", "Student interaction", "Verbal visual descriptions", "Conclusion and next steps"].map(s => <label className="mb-2 flex items-center gap-2" key={s}><input type="checkbox" className="accent-[#cfb87c]"/>{s}</label>)}</Info>
      </>}
      {tab === "notes" && <Info title="Practice notes"><p className="mb-2 text-xs text-[#aeb5c4]">Included in the downloaded report. Kept in this tab only.</p><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Teaching goals, feedback, next steps..." className="min-h-52 w-full rounded-md border border-[#47536a] bg-[#0b1220] p-3 text-white outline-none focus:border-[#cfb87c]"/></Info>}
    </div>
  </aside>;
}

function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-lg border border-[#354159] p-3.5"><h4 className="mb-2 font-bold text-white">{title}</h4><div className="leading-relaxed text-[#c6cedb]">{children}</div></section>;
}

function LiveElla({ token, mode, onEnded, onMessages }: {
  token: string; mode: Mode; onEnded: () => void; onMessages: (m: LiveAvatarSessionMessage[]) => void;
}) {
  return <LiveAvatarContextProvider sessionAccessToken={token}>
    <LiveSession mode={mode} onEnded={onEnded} onMessages={onMessages}/>
  </LiveAvatarContextProvider>;
}

function LiveSession({ mode, onEnded, onMessages }: {
  mode: Mode; onEnded: () => void; onMessages: (m: LiveAvatarSessionMessage[]) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);
  const previousMode = useRef<Mode>(mode);
  const messages = useChatHistory();
  const { sessionState, isStreamReady, startSession, stopSession, attachElement, connectionQuality } = useSession();
  const { start, stop, isActive, isMuted, mute, unmute, isAvatarTalking } = useVoiceChat();
  const { sendMessage } = useTextChat("FULL");
  const { interrupt } = useAvatarActions("FULL");

  useEffect(() => { onMessages(messages); }, [messages, onMessages]);
  useEffect(() => {
    if (sessionState === SessionState.INACTIVE && !hasStarted.current) {
      hasStarted.current = true;
      void (async () => { await startSession(); await start(); })().catch(console.error);
    }
  }, [sessionState, startSession, start]);
  useEffect(() => {
    if (sessionState === SessionState.DISCONNECTED) onEnded();
  }, [sessionState, onEnded]);
  useEffect(() => {
    if (isStreamReady && videoRef.current) {
      attachElement(videoRef.current);
      void videoRef.current.play().catch(console.error);
    }
  }, [isStreamReady, attachElement]);
  useEffect(() => {
    if (previousMode.current === mode || sessionState !== SessionState.CONNECTED) return;
    previousMode.current = mode;
    if (mode === "silent") {
      void interrupt();
      void sendMessage("Switch to SILENT LISTENER mode now. Do not speak, ask questions, or interrupt until I explicitly switch modes or request assessment feedback.");
    } else {
      void sendMessage("Switch to ACTIVE LEARNER mode now. You may participate with brief relevant questions while I teach.");
    }
  }, [mode, sessionState, interrupt, sendMessage]);
  const end = async () => { if (isActive) stop(); await stopSession(); onEnded(); };
  const connected = sessionState === SessionState.CONNECTED;
  return <div className="rounded-xl border border-sdm-line bg-white overflow-hidden">
    <div className="border-b bg-[#eceff1] px-4 py-3 font-bold">Ella · Live practice</div>
    <div className="p-3.5"><div ref={stageRef} className="relative aspect-video rounded-md bg-[#101416] overflow-hidden">
      <video ref={videoRef} autoPlay playsInline className="h-full w-full object-contain"/>
      <span className="absolute left-3 top-3 rounded bg-black/70 px-2 py-1 text-xs text-white">{connected ? (isAvatarTalking ? "Ella speaking" : "Connected") : "Connecting..."}</span>
      {connected && <button className="absolute bottom-3 right-3 rounded bg-black/75 px-3 py-2 text-xs text-white" onClick={() => document.fullscreenElement ? void document.exitFullscreen() : void stageRef.current?.requestFullscreen()}>Full screen</button>}
    </div>
    <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
      <button onClick={() => isMuted ? void unmute() : void mute()} className="rounded border px-3 py-2 text-sm">{isMuted ? "Unmute microphone" : "Mute microphone"}</button>
      <button onClick={() => void sendMessage("Please stop the role-play and enter assessment mode. Give evidence-based formative feedback for the MicroTeach rubric, distinguishing observed and unobserved criteria. Remind me to download the report.")} className="rounded border px-3 py-2 text-sm" disabled={!connected}>Request assessment</button>
      <button onClick={() => void end()} className="rounded bg-[#a33a32] px-4 py-2 text-sm font-bold text-white">Stop Chat</button>
    </div><p className="mt-2 text-center text-xs text-sdm-muted">{connectionQuality !== ConnectionQuality.UNKNOWN ? `Connection: ${connectionQuality}` : ""}</p></div>
  </div>;
}

export function MicroTeachExperience() {
  const [mode, setMode] = useState<Mode>("active");
  const [tab, setTab] = useState<Tab>("guidelines");
  const [token, setToken] = useState("");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [messages, setMessages] = useState<LiveAvatarSessionMessage[]>([]);
  const [seconds, setSeconds] = useState(1200);
  const startedAt = useRef<number | null>(null);
  const onEnded = useCallback(() => { setToken(""); startedAt.current = null; }, []);
  const onMessages = useCallback((m: LiveAvatarSessionMessage[]) => { if (m.length) setMessages(m); }, []);
  useEffect(() => {
    if (!token) return;
    startedAt.current = Date.now();
    const timer = window.setInterval(() => setSeconds(Math.max(0, 1200 - Math.floor((Date.now() - (startedAt.current ?? Date.now())) / 1000))), 1000);
    return () => window.clearInterval(timer);
  }, [token]);
  const start = async () => {
    setError(""); setStarting(true); setMessages([]); setSeconds(1200);
    try {
      const res = await fetch("/api/start-session", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.session_token) throw new Error(data.error || "Unable to start Ella.");
      setToken(data.session_token);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to start session."); }
    finally { setStarting(false); }
  };
  const downloadLog = () => {
    const log = messages.map(m => `[${new Date(m.timestamp).toLocaleString()}] ${m.sender === MessageSender.USER ? "Learner" : "Ella"}: ${m.message}`).join("\n");
    const url = URL.createObjectURL(new Blob([log], { type: "text/plain" }));
    const a = document.createElement("a"); a.href = url; a.download = "ella-microteach-transcript.txt"; a.click(); URL.revokeObjectURL(url);
  };
  return <div className="sdm-shell py-8 pb-16">
    <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#777]">AI-assisted practice</p>
    <h2 className="text-[27px] font-semibold">Meet Ella, your MicroTeach practice partner</h2>
    <p className="mt-2 max-w-[49rem] text-sdm-muted">Rehearse your teaching session with an active learner or a silent listener. Review the assignment guidelines and course rubric alongside your practice.</p>
    <div className="mt-5 max-w-[49rem] border-l-4 border-sdm-gold bg-white px-4 py-3 text-sm"><strong>Before you begin</strong><p className="mt-1 text-sdm-muted">Ella cannot see your shared screen or slides. Describe important visuals aloud. Switch listening modes whenever you like. This is formative practice, not an official course grade.</p></div>
    <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(380px,1fr)]"><div>
      <div className="mb-4 flex flex-wrap items-center gap-3"><div role="group" aria-label="Choose listening mode" className="inline-flex overflow-hidden rounded-lg border border-sdm-line">
        {(["active", "silent"] as const).map(value => <button key={value} aria-pressed={mode === value} onClick={() => setMode(value)} className={`px-4 py-2.5 text-sm font-semibold ${mode === value ? "bg-sdm-black text-white" : "bg-white"}`}>{value === "active" ? "Active learner" : "Silent listener"}</button>)}
      </div><span className="ml-auto font-mono text-xl font-bold tabular-nums">{Math.floor(seconds / 60).toString().padStart(2, "0")}:{(seconds % 60).toString().padStart(2, "0")}</span></div>
      <p className="mb-3 text-xs text-sdm-muted">{mode === "active" ? "Ella may ask short relevant questions." : "Ella is instructed not to interrupt your presentation."} Mode changes during a live session are sent to Ella as conversational instructions.</p>
      {!token ? <div className="overflow-hidden rounded-xl border border-sdm-line bg-white"><div className="bg-[#eceff1] px-4 py-3 font-bold">Ella · MicroTeach Practice</div><div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-[#415364] to-[#14202d]"><div className="grid h-36 w-36 place-items-center rounded-full border-[6px] border-[#ffffff30] bg-[#cdb273] font-serif text-[82px] text-black">E</div></div><div className="p-4"><label className="block text-sm font-semibold">Topic (optional)</label><input className="mt-1 w-full rounded-md border border-sdm-line px-3 py-2" value={topic} onChange={e => setTopic(e.target.value)} placeholder="What are you teaching today?"/>{error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}<div className="mt-3 flex justify-center"><button disabled={starting} onClick={() => void start()} className="rounded-md bg-sdm-black px-5 py-2.5 font-bold text-white disabled:opacity-50">{starting ? "Connecting..." : "Start Chat"}</button></div></div></div> : <LiveElla token={token} mode={mode} onEnded={onEnded} onMessages={onMessages}/>}
      <section className="mt-4 overflow-hidden rounded-xl border border-sdm-line bg-white"><div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3"><h3 className="font-bold">Transcript & Assessment Report</h3><div className="flex gap-2"><button disabled={!messages.length} onClick={downloadLog} className="rounded border px-3 py-2 text-xs disabled:opacity-40">Export Log</button><button disabled={!messages.length} onClick={() => void downloadReport(messages, notes, topic)} className="rounded bg-sdm-black px-3 py-2 text-xs text-white disabled:opacity-40">Create Assessment Report</button></div></div><div className="max-h-[350px] min-h-[170px] space-y-3 overflow-y-auto bg-sdm-soft p-4">{!messages.length ? <p className="py-8 text-center text-sm text-sdm-muted">No messages yet. Start Chat to begin.</p> : messages.map((m, i) => <div key={`${m.timestamp}-${i}`} className={`max-w-[90%] ${m.sender === MessageSender.USER ? "ml-auto text-right" : ""}`}><p className="text-xs text-sdm-muted">{m.sender === MessageSender.USER ? "Learner" : "Ella"}</p><p className="whitespace-pre-wrap rounded-md border bg-white px-3 py-2 text-left text-sm">{m.message}</p></div>)}</div></section>
    </div><Dashboard tab={tab} setTab={setTab} notes={notes} setNotes={setNotes}/></div>
  </div>;
}
