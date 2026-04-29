"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  MessageSender,
  type LiveAvatarSessionMessage,
} from "../liveavatar/types";

type DashboardTab =
  | "vitals"
  | "labs"
  | "orders"
  | "imaging"
  | "documents"
  | "history"
  | "assessment"
  | "notes";
type DataTab = Exclude<DashboardTab, "notes" | "assessment">;

type ClinicalItem = {
  id: string;
  label: string;
  summary: string;
  details: string;
  mockResponse: {
    headline: string;
    points: string[];
    imageSrc?: string;
    imageAlt?: string;
  };
  urgency?: "normal" | "attention" | "critical";
};

const DASHBOARD_DATA: Record<DataTab, ClinicalItem[]> = {
  vitals: [
    {
      id: "vitals-triage",
      label: "Triage Vitals",
      summary: "BP 162/96, HR 108, RR 22, Temp 37.9 C, SpO2 94%",
      details:
        "Initial bedside vitals show hypertension, tachycardia, and mild tachypnea.",
      mockResponse: {
        headline: "Vitals Snapshot (mock)",
        points: [
          "Blood pressure remains elevated across repeat cuff checks.",
          "Pulse rate is persistently above 100 at rest.",
          "SpO2 improves to 96% with coached deep breathing.",
        ],
        imageSrc: "/mock-vitals-trend.svg",
        imageAlt: "Mock vitals trend card",
      },
      urgency: "attention",
    },
    {
      id: "orthostatic",
      label: "Orthostatic Vitals",
      summary: "Lying 148/88 -> Standing 126/78 with dizziness",
      details:
        "Orthostatic blood pressure drop with symptom reproduction supports volume depletion concern.",
      mockResponse: {
        headline: "Orthostatic Test (mock)",
        points: [
          "Systolic drop of 22 mmHg from supine to standing.",
          "Heart rate increase from 96 to 117 after standing.",
          "Patient reports lightheadedness at minute 2 standing.",
        ],
      },
      urgency: "critical",
    },
  ],
  labs: [
    {
      id: "cbc",
      label: "CBC",
      summary: "WBC 13.2, Hgb 11.1, Platelets 402",
      details:
        "Mild leukocytosis with borderline anemia. Consider infection/inflammation in context.",
      mockResponse: {
        headline: "CBC Result (mock)",
        points: [
          "WBC 13.2 (high), neutrophils 84% with left shift.",
          "Hgb 11.1 and MCV 77 suggest microcytic anemia pattern.",
          "Platelets 402 mildly elevated as a reactive finding.",
        ],
        imageSrc: "/mock-cbc-report.svg",
        imageAlt: "Mock CBC result chart",
      },
      urgency: "attention",
    },
    {
      id: "cmp",
      label: "CMP",
      summary: "Creatinine 1.6, AST/ALT mildly elevated",
      details:
        "Renal function is reduced from baseline and liver enzymes are mildly elevated.",
      mockResponse: {
        headline: "CMP Result (mock)",
        points: [
          "Creatinine 1.6 from baseline 1.2 indicates likely AKI on CKD.",
          "BUN 31 and sodium 132 suggest dehydration component.",
          "AST 54 / ALT 62 show mild transaminitis to trend.",
        ],
        imageSrc: "/mock-cmp-report.svg",
        imageAlt: "Mock CMP panel result",
      },
      urgency: "attention",
    },
    {
      id: "troponin",
      label: "Troponin",
      summary: "0.09 ng/mL (repeat pending)",
      details:
        "Initial troponin slightly above reference. Recommend serial trend and EKG correlation.",
      mockResponse: {
        headline: "Troponin Trend (mock)",
        points: [
          "0 hr: 0.09 ng/mL, 2 hr: 0.12 ng/mL.",
          "Delta is upward but not yet diagnostic alone.",
          "Recommend repeat in 2 hours with ECG comparison.",
        ],
        imageSrc: "/mock-troponin-trend.svg",
        imageAlt: "Mock troponin trend graph",
      },
      urgency: "critical",
    },
  ],
  orders: [
    {
      id: "order-ecg",
      label: "Order ECG",
      summary: "12-lead ECG requested",
      details:
        "ECG is available and shows sinus tachycardia with nonspecific ST-T changes.",
      mockResponse: {
        headline: "ECG Read (mock)",
        points: [
          "Rate 108 bpm, sinus rhythm.",
          "No STEMI pattern identified.",
          "Serial ECG recommended if chest discomfort continues.",
        ],
      },
      urgency: "attention",
    },
    {
      id: "order-fluids",
      label: "Give 1L IV Fluids",
      summary: "Normal saline bolus initiated",
      details:
        "After fluid bolus, standing dizziness improves and heart rate trends downward.",
      mockResponse: {
        headline: "Intervention Response (mock)",
        points: [
          "HR improved from 108 to 96 over 45 minutes.",
          "Orthostatic symptoms less pronounced.",
          "Repeat CMP still advised to reassess renal trend.",
        ],
      },
      urgency: "normal",
    },
    {
      id: "order-cultures",
      label: "Order Blood Cultures",
      summary: "Two sets obtained prior to antibiotics",
      details:
        "Cultures are pending. Early collection supports sepsis rule-out workflow.",
      mockResponse: {
        headline: "Microbiology Status (mock)",
        points: [
          "Two peripheral sets collected appropriately.",
          "No growth at preliminary interval.",
          "Final read pending at 24-48 hours.",
        ],
      },
      urgency: "normal",
    },
  ],
  imaging: [
    {
      id: "cxr",
      label: "Chest X-ray",
      summary: "Mild bibasilar atelectatic changes",
      details:
        "No focal consolidation or pleural effusion. Cardiomediastinal silhouette within normal limits.",
      mockResponse: {
        headline: "Radiology Addendum (mock)",
        points: [
          "Mild bibasilar streaky opacity favors atelectatic change.",
          "No pneumothorax or pleural effusion seen.",
          "No acute osseous abnormality identified.",
        ],
        imageSrc: "/mock-cxr-image.svg",
        imageAlt: "Mock chest x-ray preview",
      },
      urgency: "normal",
    },
    {
      id: "ct-head",
      label: "CT Head (non-contrast)",
      summary: "No acute intracranial hemorrhage",
      details:
        "No acute territorial infarct. Mild chronic microvascular ischemic changes noted.",
      mockResponse: {
        headline: "CT Head Summary (mock)",
        points: [
          "No hemorrhage, mass effect, or midline shift.",
          "Ventricles and cisterns are within expected limits.",
          "Chronic small-vessel changes likely age-related.",
        ],
        imageSrc: "/mock-ct-head-image.svg",
        imageAlt: "Mock CT head axial slices",
      },
      urgency: "normal",
    },
  ],
  documents: [
    {
      id: "pmh",
      label: "Past Medical History",
      summary: "T2DM, HTN, CKD stage 3, hyperlipidemia",
      details:
        "Prior admissions for uncontrolled blood pressure. Last A1c 8.4% from outside record.",
      mockResponse: {
        headline: "PMH Extract (mock)",
        points: [
          "T2DM x11 years with intermittent adherence.",
          "CKD stage 3a with prior nephrology follow-up.",
          "Hypertension with one recent hypertensive urgency visit.",
        ],
        imageSrc: "/mock-history-doc.svg",
        imageAlt: "Mock PMH document preview",
      },
      urgency: "attention",
    },
    {
      id: "meds",
      label: "Medication Reconciliation",
      summary: "Metformin, lisinopril, atorvastatin, aspirin",
      details:
        "Adherence unclear. Patient reports missed doses over the past week due to nausea.",
      mockResponse: {
        headline: "Medication Review (mock)",
        points: [
          "Missed 3-4 doses of lisinopril this week.",
          "Stopped metformin temporarily due to GI upset.",
          "No anticoagulants or insulin reported at triage.",
        ],
      },
      urgency: "attention",
    },
    {
      id: "allergies",
      label: "Allergies",
      summary: "Penicillin (rash), shellfish (hives)",
      details: "No history of anaphylaxis documented in prior charting.",
      mockResponse: {
        headline: "Allergy Profile (mock)",
        points: [
          "Penicillin: delayed maculopapular rash in 2019.",
          "Shellfish: urticaria without airway symptoms.",
          "No recorded contrast allergy in chart.",
        ],
      },
      urgency: "normal",
    },
  ],
  history: [
    {
      id: "triage-note",
      label: "ED Triage Note",
      summary: "3 days fatigue, dizziness, and reduced oral intake",
      details:
        "Triage nurse documented intermittent chest pressure and near-syncope while walking.",
      mockResponse: {
        headline: "Triage Narrative (mock)",
        points: [
          "Symptoms worsened this morning after climbing stairs.",
          "Pain score 4/10, non-radiating pressure-like discomfort.",
          "Orthostatic vitals positive for symptomatic BP drop.",
        ],
      },
      urgency: "critical",
    },
    {
      id: "prior-discharge",
      label: "Prior Discharge Summary",
      summary: "Discharged 2 months ago after hypertensive urgency",
      details:
        "Plan included close PCP follow-up in 1 week, not completed per chart review.",
      mockResponse: {
        headline: "Discharge Note Excerpt (mock)",
        points: [
          "Recommended PCP and nephrology follow-up were missed.",
          "Discharge BP was improved but still above target.",
          "Medication reconciliation discrepancies noted at discharge.",
        ],
        imageSrc: "/mock-discharge-note.svg",
        imageAlt: "Mock discharge note document",
      },
      urgency: "attention",
    },
  ],
};

const TAB_LABELS: Record<DashboardTab, string> = {
  vitals: "Vitals",
  labs: "Labs",
  orders: "Orders",
  imaging: "Imaging",
  documents: "Documents",
  history: "History",
  notes: "Notes",
  assessment: "Assessment",
};

const NOTES_STORAGE_KEY = "demo-clinical-notes-by-code";

type SavedNote = {
  content: string;
  savedAt: string;
  chatLog?: LiveAvatarSessionMessage[];
};

type CaseDebrief = {
  score: number;
  strengths: string[];
  improvements: string[];
  generatedAt: string;
  criteria: Array<{
    label: string;
    earned: number;
    max: number;
  }>;
};

const ASSESSMENT_RUBRIC = [
  {
    id: "data-gathering",
    label: "Data Gathering",
    max: 30,
    guidance:
      "Request key diagnostics across tabs (vitals/labs/imaging/documents).",
  },
  {
    id: "critical-actions",
    label: "Critical Actions",
    max: 40,
    guidance:
      "Complete priority actions like ECG, orthostatics, and supportive intervention.",
  },
  {
    id: "documentation",
    label: "Documentation",
    max: 30,
    guidance: "Capture timestamped notes and save case artifacts for review.",
  },
] as const;

const urgencyClass = (urgency: ClinicalItem["urgency"]) => {
  if (urgency === "critical") return "border-red-500/60";
  if (urgency === "attention") return "border-amber-500/60";
  return "border-zinc-700";
};

export function ClinicalDashboard({
  isSessionActive,
  chatMessages,
}: {
  isSessionActive: boolean;
  chatMessages: LiveAvatarSessionMessage[];
}) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("labs");
  const [revealedIds, setRevealedIds] = useState<Set<string>>(
    () => new Set(["triage-note"]),
  );
  const [notesDraft, setNotesDraft] = useState("");
  const [lookupCode, setLookupCode] = useState("");
  const [activeNoteCode, setActiveNoteCode] = useState<string | null>(null);
  const [notesStatus, setNotesStatus] = useState<string | null>(null);
  const [loadedChatLog, setLoadedChatLog] = useState<
    LiveAvatarSessionMessage[]
  >([]);
  const [caseDebrief, setCaseDebrief] = useState<CaseDebrief | null>(null);

  const items = useMemo(
    () =>
      activeTab === "notes" || activeTab === "assessment"
        ? []
        : DASHBOARD_DATA[activeTab],
    [activeTab],
  );

  const readSavedNotes = (): Record<string, SavedNote> => {
    if (typeof window === "undefined") {
      return {};
    }
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    try {
      return JSON.parse(raw) as Record<string, SavedNote>;
    } catch {
      return {};
    }
  };

  const writeSavedNotes = (notesMap: Record<string, SavedNote>) => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesMap));
    } catch {
      setNotesStatus("Unable to save in this browser context.");
    }
  };

  const createNoteCode = () => {
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `CASE-${randomPart}`;
  };

  const formatTimestamp = (iso: string) => new Date(iso).toLocaleString();

  const revealItem = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const generateCaseDebrief = () => {
    const dataItemsTotal =
      DASHBOARD_DATA.vitals.length +
      DASHBOARD_DATA.labs.length +
      DASHBOARD_DATA.imaging.length +
      DASHBOARD_DATA.documents.length;
    const revealedCount = revealedIds.size;
    const dataGatheringScore = Math.min(
      30,
      Math.round((revealedCount / dataItemsTotal) * 30),
    );

    const criticalActionHits = [
      "order-ecg",
      "orthostatic",
      "order-fluids",
    ].filter((id) => revealedIds.has(id)).length;
    const criticalActionsScore = Math.round((criticalActionHits / 3) * 40);

    const hasSavedNotes = Boolean(activeNoteCode);
    const hasAnyChat =
      (loadedChatLog.length > 0 ? loadedChatLog : chatMessages).length > 0;
    const documentationScore = (hasSavedNotes ? 20 : 0) + (hasAnyChat ? 10 : 0);

    const criteria = [
      { label: "Data Gathering", earned: dataGatheringScore, max: 30 },
      { label: "Critical Actions", earned: criticalActionsScore, max: 40 },
      { label: "Documentation", earned: documentationScore, max: 30 },
    ];

    const score = criteria.reduce((sum, item) => sum + item.earned, 0);

    const strengths: string[] = [];
    const improvements: string[] = [];

    if (dataGatheringScore >= 20) {
      strengths.push("Broad data gathering across multiple clinical domains.");
    } else {
      improvements.push(
        "Request more diagnostics before finalizing assessment.",
      );
    }

    if (criticalActionsScore >= 27) {
      strengths.push("Completed key high-priority clinical actions.");
    } else {
      improvements.push(
        "Prioritize critical actions (ECG, orthostatics, fluid resuscitation).",
      );
    }

    if (hasSavedNotes) {
      strengths.push("Documented notes and preserved case state for review.");
    } else {
      improvements.push(
        "Save timestamped notes and case code for faculty debrief.",
      );
    }

    setCaseDebrief({
      score,
      strengths,
      improvements,
      generatedAt: new Date().toISOString(),
      criteria,
    });
  };

  const saveNotesWithNewCode = () => {
    const trimmed = notesDraft.trim();
    const savedNotes = readSavedNotes();
    const code = createNoteCode();
    const timestampIso = new Date().toISOString();
    const noteBody = trimmed || "(No notes entered)";
    const noteWithTimestamp = `Timestamp: ${formatTimestamp(timestampIso)}\n${noteBody}`;
    savedNotes[code] = {
      content: noteWithTimestamp,
      savedAt: timestampIso,
      chatLog: chatMessages,
    };
    writeSavedNotes(savedNotes);
    setNotesDraft(noteWithTimestamp);
    setLoadedChatLog(chatMessages);
    setActiveNoteCode(code);
    setLookupCode(code);
    setNotesStatus(
      `Saved. Use code ${code} to reload notes and ${chatMessages.length} chat messages later.`,
    );
  };

  const loadNotesByCode = () => {
    const normalized = lookupCode.trim().toUpperCase();
    if (!normalized) {
      setNotesStatus("Enter a code to load notes.");
      return;
    }
    const savedNotes = readSavedNotes();
    const note = savedNotes[normalized];
    if (!note) {
      setNotesStatus(`No notes found for code ${normalized}.`);
      return;
    }
    setNotesDraft(note.content);
    setActiveNoteCode(normalized);
    setLoadedChatLog(note.chatLog || []);
    setNotesStatus(
      `Loaded notes from ${new Date(note.savedAt).toLocaleString()}.`,
    );
  };

  return (
    <aside className="w-full rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-100">
          Clinical Dashboard
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Simulate additional patient data beyond conversation.
        </p>
      </div>

      <div className="grid grid-cols-8 border-b border-zinc-800">
        {(Object.keys(TAB_LABELS) as DashboardTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-2 py-2 text-xs border-r last:border-r-0 border-zinc-800 transition-colors ${
              activeTab === tab
                ? "bg-zinc-700 text-zinc-100"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      <div className="p-4 flex flex-col gap-3">
        {!isSessionActive && (
          <div className="rounded-md border border-zinc-700 bg-zinc-800 p-3 text-xs text-zinc-300">
            Preview mode is active. You can request mock data before starting
            the avatar session.
          </div>
        )}

        {activeTab === "notes" && (
          <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-3 space-y-3">
            <div>
              <h3 className="text-sm font-medium text-zinc-100">Case Notes</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Save notes with a generated code and load them later.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={saveNotesWithNewCode}
                className="text-xs px-3 py-2 rounded-md bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
              >
                Save and Generate Code
              </button>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="text"
                value={lookupCode}
                onChange={(event) => setLookupCode(event.target.value)}
                placeholder="Enter code (e.g. CASE-ABC123)"
                className="flex-1 min-w-[200px] rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 px-3 py-2 text-xs focus:outline-none focus:border-zinc-500"
              />
              <button
                type="button"
                onClick={loadNotesByCode}
                className="text-xs px-3 py-2 rounded-md bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
              >
                Load by Code
              </button>
            </div>
            <div className="rounded-md border border-zinc-700 bg-zinc-900/60 p-3">
              <p className="text-xs text-zinc-400 mb-1">Generated code</p>
              <p className="text-sm text-emerald-300 font-mono">
                {activeNoteCode || "No code generated yet"}
              </p>
            </div>
            <textarea
              value={notesDraft}
              onChange={(event) => setNotesDraft(event.target.value)}
              rows={8}
              placeholder="Type your patient notes here..."
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-500"
            />
            {notesStatus && (
              <p className="text-xs text-zinc-300">{notesStatus}</p>
            )}
            {activeNoteCode && (
              <p className="text-xs text-zinc-400">
                Last saved timestamp:{" "}
                {formatTimestamp(
                  readSavedNotes()[activeNoteCode]?.savedAt ||
                    new Date().toISOString(),
                )}
              </p>
            )}
            <div className="rounded-md border border-zinc-700 bg-zinc-900/60 p-3">
              <h4 className="text-xs font-semibold text-zinc-100">
                Chat Log Linked to Code
              </h4>
              <p className="text-xs text-zinc-400 mt-1">
                This transcript snapshot is saved and loaded with the same code.
              </p>
              <div className="mt-3 max-h-[220px] overflow-y-auto space-y-2 rounded-md bg-zinc-950 border border-zinc-800 p-2">
                {(loadedChatLog.length > 0 ? loadedChatLog : chatMessages)
                  .length === 0 ? (
                  <p className="text-xs text-zinc-500">
                    No chat messages available yet.
                  </p>
                ) : (
                  (loadedChatLog.length > 0 ? loadedChatLog : chatMessages).map(
                    (message, index) => (
                      <div
                        key={`${message.timestamp}-${index}`}
                        className="text-xs text-zinc-300"
                      >
                        [{new Date(message.timestamp).toLocaleString()}]{" "}
                        {message.sender === MessageSender.USER
                          ? "You"
                          : "Avatar"}
                        : {message.message}
                      </div>
                    ),
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {items.map((item) => {
          const isRevealed = revealedIds.has(item.id);
          return (
            <article
              key={item.id}
              className={`rounded-lg border bg-zinc-950 p-3 ${urgencyClass(
                item.urgency,
              )}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium text-zinc-100">
                    {item.label}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {!isRevealed
                      ? "Values hidden until requested."
                      : item.summary}
                  </p>
                </div>
                {!isRevealed ? (
                  <button
                    type="button"
                    onClick={() => revealItem(item.id)}
                    className="text-xs px-2 py-1 rounded-md bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
                  >
                    Request
                  </button>
                ) : (
                  <span className="text-[11px] px-2 py-1 rounded-md bg-emerald-900/40 text-emerald-300 border border-emerald-700/40">
                    Revealed
                  </span>
                )}
              </div>

              {isRevealed && (
                <div className="mt-3 space-y-3">
                  <p className="text-xs text-zinc-300 leading-5">
                    {item.details}
                  </p>
                  <div className="rounded-md border border-zinc-700 bg-zinc-900/60 p-3">
                    <p className="text-xs font-semibold text-zinc-100">
                      {item.mockResponse.headline}
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-zinc-300">
                      {item.mockResponse.points.map((point) => (
                        <li key={point}>- {point}</li>
                      ))}
                    </ul>
                  </div>
                  {item.mockResponse.imageSrc && (
                    <div className="rounded-md border border-zinc-700 overflow-hidden bg-zinc-900">
                      <Image
                        src={item.mockResponse.imageSrc}
                        alt={
                          item.mockResponse.imageAlt || "Mock clinical artifact"
                        }
                        width={560}
                        height={320}
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}

        {activeTab === "assessment" && (
          <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-zinc-100">
                Debrief and Assessment
              </h3>
              <button
                type="button"
                onClick={generateCaseDebrief}
                className="text-xs px-3 py-2 rounded-md bg-emerald-700 text-white hover:bg-emerald-600"
              >
                Generate Debrief
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              Rubric-backed feedback with score, strengths, and weaknesses.
            </p>
            <div className="rounded-md border border-zinc-700 bg-zinc-900/60 p-3 space-y-2">
              <p className="text-xs font-semibold text-zinc-200">
                Rubric Preview
              </p>
              {ASSESSMENT_RUBRIC.map((criterion) => (
                <div key={criterion.id} className="text-xs">
                  <p className="text-zinc-100">
                    {criterion.label} ({criterion.max} pts)
                  </p>
                  <p className="text-zinc-400">{criterion.guidance}</p>
                </div>
              ))}
            </div>

            {caseDebrief && (
              <div className="rounded-md border border-zinc-700 bg-zinc-900/60 p-3 space-y-2">
                <p className="text-sm font-semibold text-zinc-100">
                  Case Debrief Score: {caseDebrief.score}/100
                </p>
                <p className="text-xs text-zinc-400">
                  Generated {formatTimestamp(caseDebrief.generatedAt)}
                </p>
                <div>
                  <p className="text-xs font-semibold text-zinc-100">
                    Assessment Breakdown
                  </p>
                  {caseDebrief.criteria.map((criterion) => (
                    <p key={criterion.label} className="text-xs text-zinc-300">
                      - {criterion.label}: {criterion.earned}/{criterion.max}
                    </p>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-300">
                    Strengths
                  </p>
                  {caseDebrief.strengths.length === 0 ? (
                    <p className="text-xs text-zinc-400">
                      No strengths captured yet.
                    </p>
                  ) : (
                    caseDebrief.strengths.map((item) => (
                      <p key={item} className="text-xs text-zinc-300">
                        - {item}
                      </p>
                    ))
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-300">
                    Improve next time
                  </p>
                  {caseDebrief.improvements.length === 0 ? (
                    <p className="text-xs text-zinc-400">
                      No major gaps detected.
                    </p>
                  ) : (
                    caseDebrief.improvements.map((item) => (
                      <p key={item} className="text-xs text-zinc-300">
                        - {item}
                      </p>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
