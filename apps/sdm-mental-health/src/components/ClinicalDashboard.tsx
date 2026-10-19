"use client";

import { useEffect, useState } from "react";
import {
  DASHBOARD_TABS,
  type DashboardTabId,
  type Patient,
} from "../../app/lib/patients";

export function ClinicalDashboard({
  patient,
  onNotesChange,
}: {
  patient: Patient;
  onNotesChange: (notes: string) => void;
}) {
  const [tab, setTab] = useState<DashboardTabId>("vitals");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState(() => {
    try {
      return localStorage.getItem(patient.notesKey) || "";
    } catch {
      return "";
    }
  });
  const [savedLabel, setSavedLabel] = useState("Save Notes");

  useEffect(() => {
    try {
      localStorage.setItem(patient.notesKey, notes);
    } catch {
      // Private browsing can block storage. The report still uses the live notes.
    }
    onNotesChange(notes);
  }, [notes, onNotesChange, patient.notesKey]);

  const saveNotes = () => {
    try {
      localStorage.setItem(patient.notesKey, notes);
    } catch {
      return;
    }
    setSavedLabel("Saved");
    window.setTimeout(() => setSavedLabel("Save Notes"), 1000);
  };

  return (
    <aside className="overflow-hidden rounded-xl border border-[#1f2937] bg-sdm-panel text-white lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
      <div className="border-b border-[#374151] px-3.5 py-3">
        <div className="text-sm font-extrabold">Clinical Dashboard</div>
        <div className="mt-1.5 text-xs text-[#9ca3af]">
          {patient.projectLabel}
        </div>
      </div>
      <div className="flex flex-wrap border-b border-[#1f2937]" role="tablist">
        {DASHBOARD_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`min-w-[88px] flex-1 border-r border-[#1f2937] px-2.5 py-2 text-[11px] ${
              tab === item.id
                ? "bg-[#374151] text-white"
                : "bg-sdm-panel text-[#9ca3af]"
            }`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="p-3.5">
        {tab === "notes" && (
          <div className="rounded-[10px] border border-[#374151] bg-sdm-panel2 p-3">
            <div className="text-[13px] font-bold">Case Notes</div>
            <p className="mt-1 text-[11px] leading-snug text-[#9ca3af]">
              {patient.notesPrompt} Notes save automatically and are added to
              the Conversation Assessment Report before the transcript.
            </p>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={12}
              placeholder="Enter case notes..."
              className="mt-2.5 w-full rounded-lg border border-[#374151] bg-sdm-panel px-2.5 py-2 text-xs text-white"
            />
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={saveNotes}
                className="rounded-lg border border-[#374151] bg-[#374151] px-3 py-1.5 text-xs text-white"
              >
                {savedLabel}
              </button>
            </div>
          </div>
        )}

        {tab !== "notes" && (
          <div>
            {(patient.sections[tab] ?? []).map((item) => {
              const shown = Boolean(revealed[item.id]);
              return (
                <article
                  key={item.id}
                  className={`mb-2.5 rounded-[10px] border bg-sdm-panel2 p-3 ${
                    item.urgency === "attention"
                      ? "border-amber-500/60"
                      : item.urgency === "critical"
                        ? "border-red-500/60"
                        : "border-[#374151]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div>
                      <div className="text-[13px] font-bold">{item.label}</div>
                      <div className="mt-1 text-xs text-[#9ca3af]">
                        {shown
                          ? item.summary
                          : "Values hidden until requested."}
                      </div>
                    </div>
                    {shown ? (
                      <div className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-300">
                        Revealed
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="rounded-lg border border-[#374151] bg-[#374151] px-2.5 py-1.5 text-xs text-white"
                        onClick={() =>
                          setRevealed((current) => ({
                            ...current,
                            [item.id]: true,
                          }))
                        }
                      >
                        Request
                      </button>
                    )}
                  </div>
                  {shown && item.images && item.images.length > 0 && (
                    <div className="mt-2.5 space-y-3">
                      {item.images.map((image) => (
                        <div key={image.src}>
                          <div className="mb-1.5 flex items-center justify-between gap-2">
                            {image.caption ? (
                              <span className="text-[11px] text-[#9ca3af]">
                                {image.caption}
                              </span>
                            ) : (
                              <span />
                            )}
                            <a
                              href={image.src}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg border border-[#374151] bg-[#374151] px-2.5 py-1.5 text-xs text-white hover:bg-[#4b5563]"
                            >
                              Open in new tab
                            </a>
                          </div>
                          <div className="overflow-x-auto rounded-lg bg-white p-1">
                            <img
                              src={image.src}
                              alt={image.alt}
                              className="h-auto w-[900px] max-w-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {shown && item.points.length > 0 && (
                    <ul className="mt-2.5 list-disc rounded-[10px] border border-[#374151] bg-sdm-panel px-3 py-2.5 pl-7 text-xs leading-normal text-[#e5e7eb]">
                      {item.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
