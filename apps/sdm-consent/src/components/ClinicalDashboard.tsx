"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  MessageSender,
  type LiveAvatarSessionMessage,
} from "../liveavatar/types";

type DashboardTab =
  | "vitals"
  | "documents"
  | "imaging"
  | "odontogram"
  | "history"
  | "periodontal"
  | "notes"
  | "debrief";
type DataTab = Exclude<DashboardTab, "notes" | "debrief">;

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
      id: "vitals-today",
      label: "Today's Visit",
      summary: "BP 172/96, HR 108, RR 22, Temp 98.6 F, SpO2 94%",
      details:
        "Current vitals obtained at today's geriatric dental visit prior to consent discussion.",
      mockResponse: {
        headline: "Today's Visit Vitals",
        points: [
          "Blood pressure 172/96 — elevated from prior visit.",
          "Heart rate 108 — tachycardia noted at rest.",
          "SpO2 94% on room air; respiratory rate 22.",
          "Temperature 98.6 F.",
        ],
      },
      urgency: "attention",
    },
    {
      id: "vitals-last-visit",
      label: "Last Visit",
      summary: "BP 158/84, HR 195, RR 22, Temp 98.6 F, SpO2 96%",
      details:
        "Vitals documented at the patient's most recent prior dental visit.",
      mockResponse: {
        headline: "Last Visit Vitals",
        points: [
          "Blood pressure 158/84.",
          "Heart rate 195 — markedly elevated; correlate with rhythm and symptoms.",
          "Respiratory rate 22; SpO2 96%.",
          "Temperature 98.6 F.",
        ],
      },
      urgency: "critical",
    },
  ],
  documents: [
    {
      id: "pmh",
      label: "Past Medical History",
      summary:
        "Cardiovascular, respiratory, and other chronic conditions documented",
      details:
        "Includes hypertension, heart failure, OSA, diabetes, and additional comorbidities relevant to geriatric dental care.",
      mockResponse: {
        headline: "Past Medical History",
        points: [
          "Cardiovascular: benign hypertension, heart failure, heart murmur, hypercholesterolemia, hyperlipidemia.",
          "Respiratory: tracheal stenosis requiring balloon dilation; obstructive sleep apnea (OSA).",
          "Other: diabetes mellitus type 2, osteoarthritis, osteoporosis, depression, restless leg syndrome.",
          "Complex Regional Pain Syndrome — suspected RLE.",
        ],
      },
      urgency: "attention",
    },
    {
      id: "meds",
      label: "Medication Reconciliation",
      summary:
        "Cardiovascular and other active medications on current medication list",
      details:
        "Includes cardiac agents, insulin therapy, analgesics, and medications for mood and GI conditions.",
      mockResponse: {
        headline: "Medication Reconciliation",
        points: [
          "Cardiovascular: atorvastatin, lisinopril, metoprolol succinate, spironolactone, hydrochlorothiazide.",
          "Diabetes: Humalog (insulin lispro, rapid), Lantus Solostar insulin pen.",
          "Other: triazolam, citalopram hydromide, omeprazole, prednisolone, tramadol, acetaminophen.",
        ],
      },
      urgency: "attention",
    },
    {
      id: "allergies",
      label: "Allergies",
      summary: "Penicillin (rash), Ibuprofen (hives)",
      details:
        "Documented medication allergies relevant to antibiotic and analgesic selection during dental treatment.",
      mockResponse: {
        headline: "Allergy Profile",
        points: ["Penicillin: rash.", "Ibuprofen: hives."],
      },
      urgency: "critical",
    },
  ],
  imaging: [
    {
      id: "fmx",
      label: "Full Mouth Series (FMX)",
      summary: "18-image periapical and bitewing series on file",
      details:
        "Full mouth radiographic series obtained 11/5/2025. Multiple restorations visible across the dentition.",
      mockResponse: {
        headline: "Full Mouth Series (FMX)",
        points: [
          "18 periapical and bitewing images arranged in standard FMX layout.",
          "Series dated 11/5/2025.",
          "Several crowns and fixed restorations noted on review.",
        ],
        imageSrc: "/imaging-fmx.png",
        imageAlt: "Full mouth series radiographs",
      },
      urgency: "normal",
    },
    {
      id: "panoramic",
      label: "Panoramic Radiograph",
      summary: "Panoramic view of maxilla and mandible on file",
      details:
        "Panoramic radiograph shows full arch dentition, jaw structures, and TMJ regions.",
      mockResponse: {
        headline: "Panoramic Radiograph",
        points: [
          "Panoramic image available for full-arch review.",
          "Dental restorations visible bilaterally.",
          "Left side marked with L orientation marker.",
        ],
        imageSrc: "/imaging-panoramic.png",
        imageAlt: "Panoramic radiograph",
      },
      urgency: "normal",
    },
    {
      id: "intraoral-photos",
      label: "Intraoral Photographs",
      summary: "Not available",
      details: "Intraoral photographs have not been uploaded for this case.",
      mockResponse: {
        headline: "Intraoral Photographs",
        points: ["Not available."],
      },
      urgency: "normal",
    },
  ],
  odontogram: [
    {
      id: "odontogram-chart",
      label: "Odontogram",
      summary:
        "Universal numbering chart with restorations, missing teeth, and treatment markings",
      details:
        "Dental chart for teeth 1–32 showing existing restorations, missing teeth, watch areas, and planned treatment notation.",
      mockResponse: {
        headline: "Odontogram",
        points: [
          "Missing teeth noted at #1, #16, #17, and #32 (marked M).",
          "Multiple existing restorations across upper and lower arches.",
          "Watch areas (W) documented on several anterior and posterior teeth.",
          "Tooth #23 marked for extraction; implant/pontic symbols at #4, #5, and #14.",
        ],
        imageSrc: "/odontogram.png",
        imageAlt: "Patient odontogram chart",
      },
      urgency: "normal",
    },
  ],
  history: [
    {
      id: "chief-concern",
      label: "Patient Reported Chief Concern",
      summary:
        '"This tooth on the bottom is bothering me and have healthy teeth."',
      details: "Patient-reported chief concern documented at today's visit.",
      mockResponse: {
        headline: "Patient Reported Chief Concern",
        points: [
          '"This tooth on the bottom is bothering me and have healthy teeth."',
        ],
      },
      urgency: "attention",
    },
    {
      id: "last-visit-summary",
      label: "Summary from Last Visit Clinical Note",
      summary:
        "Heavily restored dentition with mandibular caries; stable periodontal status",
      details:
        "Summary from the patient's most recent prior dental visit clinical note.",
      mockResponse: {
        headline: "Summary from Last Visit Clinical Note",
        points: [
          "Heavily restored dentition with generalized moderate and severe caries throughout the mandibular teeth.",
          "Caries also noted at margins of fixed restorations on the maxilla.",
          "Periodontal status stable: probing depths generally less than 4 mm.",
          "Minimal bleeding on probing and minimal to no radiographic bone loss.",
        ],
      },
      urgency: "attention",
    },
    {
      id: "endodontic-testing",
      label: "Today's Endodontic Testing",
      summary:
        "Endodontic testing chart — tooth #18 selected; cold testing completed",
      details:
        "Endodontic testing performed 05/11/2026 with palpation, percussion, cold, and probing results for teeth 18, 19, 20, 21, 30, and 29.",
      mockResponse: {
        headline: "Endodontic Testing Chart",
        points: [
          "Date changed: 05/11/2026. Selected tooth: 18.",
          "Palpation and percussion: (-) no pain for teeth 18, 19, 20, 21, 30, and 29.",
          "Cold: exaggerated (#18), no response (#19), normal (#20, #21, #29), delayed (#30).",
          "Probing (mm): 3 (#18, #19), 2 (#20, #21, #30).",
        ],
        imageSrc: "/history-endodontic-testing.png",
        imageAlt: "Endodontic testing chart",
      },
      urgency: "critical",
    },
  ],
  periodontal: [
    {
      id: "peri-chart",
      label: "Periodontal Charting",
      summary:
        "Adult prophy chart with probing depths, CAL, bleeding, mobility, and PSR summary",
      details:
        "Periodontal charting for upper and lower arches with FGM, probing, CAL, BOP/SUP, furcation, plaque, keratinized tissue, and mobility measurements.",
      mockResponse: {
        headline: "Periodontal (Peri) Charting",
        points: [
          "Entry date: 04/27/2026 — Adult Prophy.",
          "Prior exam on record: 03/12/2026 Adult Prophy.",
          "Number of bleeding points: 0.",
          "Number of teeth with mobility: 6.",
          "Pocket depths ≥ 4 mm: 4.",
          "Plaque index: 0.",
        ],
        imageSrc: "/periodontal-charting.png",
        imageAlt: "Periodontal charting grid",
      },
      urgency: "normal",
    },
  ],
};

const DASHBOARD_TABS: DashboardTab[] = [
  "vitals",
  "documents",
  "imaging",
  "odontogram",
  "history",
  "periodontal",
  "notes",
  "debrief",
];

const TAB_LABELS: Record<DashboardTab, string> = {
  vitals: "Vitals",
  documents: "Documents",
  imaging: "Imaging",
  odontogram: "Odontogram",
  history: "History",
  periodontal: "Periodontal Charting",
  notes: "Notes",
  debrief: "Debrief and Assessment",
};

const NOTES_STORAGE_KEY = "sdm-consent-clinical-notes-by-code";

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
    id: "data-collection",
    label: "Assessment & Diagnostic Data Collection",
    max: 30,
    guidance:
      "Collect, review, and interpret relevant dental and medical information from the clinical dashboard to support safe, evidence-based patient care and treatment planning.",
    subcriteria: [
      {
        label:
          "Review current and previous vital signs before treatment planning",
        points: 6,
      },
      {
        label:
          "Identify relevant medical conditions, medications, and allergies",
        points: 6,
      },
      {
        label: "Address consent and capacity concerns when indicated",
        points: 6,
      },
      {
        label:
          "Gather a complete and patient-centered history of the chief complaint",
        points: 6,
      },
      {
        label:
          "Utilize radiographs, odontogram, periodontal charting, and endodontic testing effectively",
        points: 6,
      },
    ],
  },
  {
    id: "clinical-judgment",
    label: "Clinical Judgment, Consent & Priority Actions",
    max: 40,
    guidance:
      "Demonstrate safe dental decision-making, informed consent practices, and appropriate management of oral-systemic findings before initiating treatment.",
    subcriteria: [
      {
        label:
          "Adjust recommendations based on medical history and clinical findings",
        points: 8,
      },
      {
        label:
          "Demonstrate organized diagnostic reasoning before treatment recommendations",
        points: 8,
      },
      {
        label: "Communicate risks, benefits, and alternatives clearly",
        points: 8,
      },
      {
        label: "Respond professionally to clinical uncertainty or complexity",
        points: 8,
      },
      {
        label:
          "Demonstrate patient-centered communication and shared decision-making",
        points: 8,
      },
    ],
  },
  {
    id: "documentation",
    label: "Documentation, Professionalism & Case Management",
    max: 30,
    guidance:
      "Demonstrate professional communication, accurate dental documentation, and appropriate management of clinical information throughout the patient encounter.",
    subcriteria: [
      {
        label: "Maintain respectful and professional communication",
        points: 6,
      },
      {
        label: "Demonstrate empathy and patient-centered interaction",
        points: 6,
      },
      {
        label: "Use organized charting and appropriate dental terminology",
        points: 6,
      },
      {
        label:
          "Record diagnostic interpretation and treatment recommendations appropriately",
        points: 6,
      },
      {
        label:
          "Demonstrate ethical and professional conduct during complex discussions",
        points: 6,
      },
    ],
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
  const [activeTab, setActiveTab] = useState<DashboardTab>("vitals");
  const [revealedIds, setRevealedIds] = useState<Set<string>>(
    () => new Set(["chief-concern"]),
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
      activeTab === "notes" || activeTab === "debrief"
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
    return `CONSENT-${randomPart}`;
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
    const vitalsHits = ["vitals-today", "vitals-last-visit"].filter((id) =>
      revealedIds.has(id),
    ).length;
    const medicalHits = ["pmh", "meds", "allergies"].filter((id) =>
      revealedIds.has(id),
    ).length;
    const historyHits = ["chief-concern", "last-visit-summary"].filter((id) =>
      revealedIds.has(id),
    ).length;
    const diagnosticHits = [
      "fmx",
      "panoramic",
      "odontogram-chart",
      "peri-chart",
      "endodontic-testing",
    ].filter((id) => revealedIds.has(id)).length;

    const vitalsScore = Math.round((vitalsHits / 2) * 6);
    const medicalScore = Math.round((medicalHits / 3) * 6);
    const consentCapacityScore = Math.round((historyHits / 2) * 6);
    const chiefComplaintScore = revealedIds.has("chief-concern") ? 6 : 0;
    const diagnosticScore = Math.round((diagnosticHits / 5) * 6);

    const dataCollectionScore = Math.min(
      30,
      vitalsScore +
        medicalScore +
        consentCapacityScore +
        chiefComplaintScore +
        diagnosticScore,
    );

    const clinicalInputs = medicalHits + historyHits + diagnosticHits;
    const clinicalJudgmentScore = Math.min(
      40,
      Math.round((clinicalInputs / 10) * 40),
    );

    const hasSavedNotes = Boolean(activeNoteCode);
    const hasAnyChat =
      (loadedChatLog.length > 0 ? loadedChatLog : chatMessages).length > 0;
    const hasNotesDraft = notesDraft.trim().length > 0;
    const documentationScore = Math.min(
      30,
      (hasSavedNotes ? 20 : hasNotesDraft ? 10 : 0) + (hasAnyChat ? 10 : 0),
    );

    const criteria = [
      {
        label: "Assessment & Diagnostic Data Collection",
        earned: dataCollectionScore,
        max: 30,
      },
      {
        label: "Clinical Judgment, Consent & Priority Actions",
        earned: clinicalJudgmentScore,
        max: 40,
      },
      {
        label: "Documentation, Professionalism & Case Management",
        earned: documentationScore,
        max: 30,
      },
    ];

    const score = criteria.reduce((sum, item) => sum + item.earned, 0);

    const strengths: string[] = [];
    const improvements: string[] = [];

    if (dataCollectionScore >= 20) {
      strengths.push(
        "Collected and reviewed key dashboard data across vitals, documents, imaging, and history.",
      );
    } else {
      improvements.push(
        "Review vitals, medical history, diagnostics, and chief complaint before treatment planning.",
      );
    }

    if (clinicalJudgmentScore >= 27) {
      strengths.push(
        "Demonstrated clinical reasoning and patient-centered consent discussion.",
      );
    } else {
      improvements.push(
        "Integrate medical history and diagnostic findings into consent and priority actions.",
      );
    }

    if (documentationScore >= 20) {
      strengths.push(
        "Documented the encounter with professional notes and case artifacts.",
      );
    } else {
      improvements.push(
        "Save timestamped notes and document diagnostic interpretation for faculty debrief.",
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
          Request case data to support shared decision-making and informed
          consent.
        </p>
      </div>

      <div className="flex flex-wrap border-b border-zinc-800">
        {DASHBOARD_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-[88px] px-2 py-2 text-[11px] leading-tight text-center border-r last:border-r-0 border-zinc-800 transition-colors ${
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
              <h3 className="text-sm font-medium text-zinc-100">
                Consent Notes
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Save consent discussion notes with a generated code and load
                them later.
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
                placeholder="Enter code (e.g. CONSENT-ABC123)"
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
              placeholder="Document the consent conversation, patient preferences, and plan..."
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

        {activeTab === "debrief" && (
          <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-zinc-100">
                Consent Debrief and Assessment
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
              Rubric-backed feedback on shared decision-making and informed
              consent skills.
            </p>
            <div className="rounded-md border border-zinc-700 bg-zinc-900/60 p-3 space-y-4">
              <p className="text-xs font-semibold text-zinc-200">
                Rubric Preview
              </p>
              {ASSESSMENT_RUBRIC.map((category) => (
                <div key={category.id} className="space-y-2">
                  <div className="text-xs">
                    <p className="text-zinc-100 font-medium">
                      {category.label} ({category.max} pts)
                    </p>
                    <p className="text-zinc-400 mt-1">{category.guidance}</p>
                  </div>
                  <div className="overflow-x-auto rounded-md border border-zinc-700">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-zinc-700 bg-zinc-950">
                          <th className="px-2 py-2 text-left font-medium text-zinc-300">
                            Criterion
                          </th>
                          <th className="px-2 py-2 text-right font-medium text-zinc-300 w-16">
                            Points
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.subcriteria.map((item) => (
                          <tr
                            key={item.label}
                            className="border-b last:border-b-0 border-zinc-800"
                          >
                            <td className="px-2 py-2 text-zinc-300">
                              {item.label}
                            </td>
                            <td className="px-2 py-2 text-right text-zinc-100">
                              {item.points}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-zinc-950">
                          <td className="px-2 py-2 font-medium text-zinc-100">
                            Total
                          </td>
                          <td className="px-2 py-2 text-right font-medium text-zinc-100">
                            {category.max}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {caseDebrief && (
              <div className="rounded-md border border-zinc-700 bg-zinc-900/60 p-3 space-y-2">
                <p className="text-sm font-semibold text-zinc-100">
                  Debrief Score: {caseDebrief.score}/100
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
