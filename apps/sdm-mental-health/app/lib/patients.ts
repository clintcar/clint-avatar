export type ChartImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type DashboardItem = {
  id: string;
  label: string;
  summary: string;
  points: string[];
  urgency: "normal" | "attention" | "critical";
  images?: ChartImage[];
};

export type RubricLevel = {
  score: string;
  text: string;
};

export type RubricSection = {
  title: string;
  levels: RubricLevel[];
};

export type PatientId = "jessica" | "greg";

export type Patient = {
  id: PatientId;
  name: string;
  summary: string;
  avatarId: string;
  contextId: string;
  previewImage: string;
  projectLabel: string;
  notesPrompt: string;
  notesKey: string;
  sections: Record<string, DashboardItem[]>;
  rubric: RubricSection[];
};

function chartSections(patientId: PatientId, name: string) {
  return {
    odontogram: [
      {
        id: "odontogram",
        label: "Odontogram",
        summary: "Odontogram chart",
        points: [],
        urgency: "normal" as const,
        images: [
          {
            src: `/charts/${patientId}-odontogram.png`,
            alt: `${name} odontogram`,
          },
        ],
      },
    ],
    vitality: [
      {
        id: "vitality",
        label: "Vitality Testing",
        summary: "To be determined",
        points: ["Vitality testing: to be determined."],
        urgency: "normal" as const,
      },
    ],
    periodontal: [
      {
        id: "periodontal",
        label: "Periodontal",
        summary: "Maxillary and mandibular periodontal chart",
        points: [],
        urgency: "normal" as const,
        images: [
          {
            src: `/charts/${patientId}-perio-1-16.png`,
            alt: `${name} periodontal chart, teeth 1 through 16`,
            caption: "Teeth 1–16",
          },
          {
            src: `/charts/${patientId}-perio-17-32.png`,
            alt: `${name} periodontal chart, teeth 17 through 32`,
            caption: "Teeth 17–32",
          },
        ],
      },
    ],
  };
}

const JESSICA_RUBRIC: RubricSection[] = [
  {
    title: "Behavioral Health Screening and Clinical Judgement — 4 points",
    levels: [
      {
        score: "4",
        text: "Appropriately administers PHQ-2; correctly scores PHQ-2; correctly interprets the negative screening result; recognizes PHQ-9 is not indicated; demonstrates sound clinical judgement.",
      },
      {
        score: "3",
        text: "Administers and scores PHQ-2 appropriately with minor uncertainty regarding interpretation.",
      },
      {
        score: "2",
        text: "Incomplete screening or errors in scoring or interpretation.",
      },
      {
        score: "0",
        text: "Critical error: fails to administer PHQ-2, incorrectly identifies the patient as requiring PHQ-9, or incorrectly identifies the patient as needing behavioral health referral.",
      },
    ],
  },
  {
    title: "Communication and Person-Centered Care — 3 points",
    levels: [
      {
        score: "3",
        text: "Explains the rationale for screening clearly; uses empathetic language; keeps the interview focused; responds appropriately to the patient’s anxiety and impatience.",
      },
      {
        score: "2",
        text: "Respectful and understandable communication with limited explanation or rapport building.",
      },
      {
        score: "1",
        text: "Communication is limited in clarity, empathy, or focus.",
      },
      {
        score: "0",
        text: "Critical error: dismissive or ineffective communication.",
      },
    ],
  },
  {
    title: "Referral, Documentation and Case Management — 3 points",
    levels: [
      {
        score: "3",
        text: "Documents the PHQ-2 score; documents interpretation of the negative screen, including no indication for PHQ-9 and no indication for behavioral health referral; documents the continued dental treatment plan.",
      },
      {
        score: "2",
        text: "Documentation is present but incomplete or lacks one component of the negative-screen interpretation or continued treatment plan.",
      },
      {
        score: "1",
        text: "Minimal or substantially incomplete documentation.",
      },
      {
        score: "0",
        text: "Critical error: no PHQ-2 documentation, documents a need for PHQ-9 despite the negative screen, or documents an inappropriate behavioral health referral recommendation.",
      },
    ],
  },
];

const GREG_RUBRIC: RubricSection[] = [
  {
    title: "Behavioral Health Screening and Clinical Judgement — 4 points",
    levels: [
      {
        score: "4",
        text: "Identifies behavioral health red flags; administers PHQ-2 and recognizes a positive result; administers PHQ-9 and correctly interprets it; explores suicidal ideation with additional questions; appropriately determines urgency of referral.",
      },
      {
        score: "3",
        text: "Completes PHQ-2 and PHQ-9, identifies depression concerns, and performs limited suicide-risk follow-up.",
      },
      {
        score: "2",
        text: "Incomplete screening, important follow-up questions missed, or limited interpretation of results.",
      },
      {
        score: "0",
        text: "Critical error: screening not administered appropriately, positive findings not recognized, or suicidal ideation concern missed.",
      },
    ],
  },
  {
    title: "Communication and Person-Centered Care — 3 points",
    levels: [
      {
        score: "3",
        text: "Demonstrates empathy; uses non-stigmatizing language; explains rationale for screening; maintains rapport; discusses referral collaboratively.",
      },
      {
        score: "2",
        text: "Respectful communication with adequate explanation and counseling, but no explicit empathetic statements.",
      },
      {
        score: "1",
        text: "Communication lacks empathy or clarity.",
      },
      {
        score: "0",
        text: "Critical error: dismissive, judgmental, or ineffective communication.",
      },
    ],
  },
  {
    title: "Referral, Documentation and Case Management — 3 points",
    levels: [
      {
        score: "3",
        text: "Initiates appropriate behavioral health referral and documents PHQ-2 score, PHQ-9 score, suicidal ideation response, referral recommendation, and follow-up plan including communication with the primary care provider.",
      },
      {
        score: "2",
        text: "Referral completed with partial documentation — approximately 3 of the 5 documentation components.",
      },
      {
        score: "1",
        text: "Referral discussed but documentation is incomplete — approximately 1 or 2 components.",
      },
      {
        score: "0",
        text: "Critical error: no referral despite indicated need, or documentation is missing.",
      },
    ],
  },
];

export function findPatient(id: string): Patient | undefined {
  return PATIENTS.find((patient) => patient.id === id);
}

export const PATIENTS: Patient[] = [
  {
    id: "jessica",
    name: "Jessica",
    summary: "Practice mental health screening with a patient.",
    avatarId: "073b60a9-89a8-45aa-8902-c358f64d2852",
    contextId: "570af2fa-b81c-4db4-abc9-b3b517740bba",
    previewImage:
      "https://files2.heygen.ai/avatar/v3/b1ff5edbf96242e6ac9469227df40924_55360/preview_target.webp",
    projectLabel: "Project: PHQ-2 / PHQ-9  |  Jessica",
    notesPrompt:
      "Use this space to document screening score(s), referral recommendation, and follow-up plan.",
    notesKey: "jessica-phq-notes",
    rubric: JESSICA_RUBRIC,
    sections: {
      vitals: [
        {
          id: "vitals-today",
          label: "Today's Visit",
          summary:
            "Blood pressure 135/95; pulse 84; respiratory rate 16; temperature 98.4°F; oxygen saturation 98%",
          points: [
            "Blood pressure: 135/95 millimeters of mercury.",
            "Pulse: 84 beats per minute.",
            "Respiratory rate: 16 breaths per minute.",
            "Temperature: 98.4 degrees Fahrenheit.",
            "Oxygen saturation: 98 percent.",
          ],
          urgency: "attention",
        },
        {
          id: "vitals-last",
          label: "Last Visit",
          summary:
            "Blood pressure 132/88; pulse 80; respiratory rate 16; temperature 98.5°F; oxygen saturation 98%",
          points: [
            "Blood pressure: 132/88 millimeters of mercury.",
            "Pulse: 80 beats per minute.",
            "Respiratory rate: 16 breaths per minute.",
            "Temperature: 98.5 degrees Fahrenheit.",
            "Oxygen saturation: 98 percent.",
          ],
          urgency: "normal",
        },
      ],
      documents: [
        {
          id: "pmh",
          label: "Past Medical History",
          summary:
            "Mild hypertension, seasonal allergies, chronic intermittent tension headaches, gastrointestinal discomfort",
          points: [
            "Mild hypertension.",
            "Seasonal allergies.",
            "Chronic intermittent tension headaches.",
            "Ongoing gastrointestinal discomfort under evaluation by the primary care provider.",
          ],
          urgency: "attention",
        },
        {
          id: "meds",
          label: "Medication Reconciliation",
          summary:
            "Hydrochlorothiazide; over-the-counter allergy medication as needed",
          points: [
            "Hydrochlorothiazide.",
            "Over-the-counter allergy medication as needed.",
          ],
          urgency: "normal",
        },
        {
          id: "allergies",
          label: "Allergies",
          summary: "Seasonal allergies",
          points: ["Seasonal allergies."],
          urgency: "normal",
        },
      ],
      ...chartSections("jessica", "Jessica"),
    },
  },
  {
    id: "greg",
    name: "Greg",
    summary:
      "Practice patient interviewing and mental health assessment using the PHQ-2 and PHQ-9.",
    avatarId: "0930fd59-c8ad-434d-ad53-b391a1768720",
    contextId: "d568b5fd-ff39-4e4a-aa45-62d06812af0d",
    previewImage:
      "https://files2.heygen.ai/avatar/v3/e20ac0c902184ff793e75ae4e139b7dc_45600/preview_target.webp",
    projectLabel: "Project: PHQ-2 / PHQ-9  |  Greg",
    notesPrompt:
      "Use this space to document screening score(s), referral recommendation, and follow-up plan.",
    notesKey: "greg-phq-notes",
    rubric: GREG_RUBRIC,
    sections: {
      vitals: [
        {
          id: "vitals-today",
          label: "Today's Visit",
          summary:
            "Blood pressure 136/90; pulse 96; respiratory rate 18; temperature 98.6°F; oxygen saturation 97%",
          points: [
            "Blood pressure: 136/90 millimeters of mercury.",
            "Pulse: 96 beats per minute.",
            "Respiratory rate: 18 breaths per minute.",
            "Temperature: 98.6 degrees Fahrenheit.",
            "Oxygen saturation: 97 percent.",
          ],
          urgency: "attention",
        },
        {
          id: "vitals-last",
          label: "Last Visit",
          summary:
            "Blood pressure 122/85; pulse 76; respiratory rate 14; temperature 98.6°F; oxygen saturation 98%",
          points: [
            "Blood pressure: 122/85 millimeters of mercury.",
            "Pulse: 76 beats per minute.",
            "Respiratory rate: 14 breaths per minute.",
            "Temperature: 98.6 degrees Fahrenheit.",
            "Oxygen saturation: 98 percent.",
          ],
          urgency: "normal",
        },
      ],
      documents: [
        {
          id: "pmh",
          label: "Past Medical History",
          summary:
            "Type 2 diabetes, hypertension, hyperlipidemia, chronic back pain, gastrointestinal discomfort",
          points: [
            "Type 2 diabetes.",
            "Hypertension.",
            "Hyperlipidemia.",
            "Chronic back pain.",
            "Ongoing gastrointestinal discomfort.",
          ],
          urgency: "attention",
        },
        {
          id: "meds",
          label: "Medication Reconciliation",
          summary: "Metformin, Lisinopril, Atorvastatin",
          points: ["Metformin.", "Lisinopril.", "Atorvastatin."],
          urgency: "normal",
        },
        {
          id: "allergies",
          label: "Allergies",
          summary: "No known drug allergies",
          points: ["No known drug allergies."],
          urgency: "normal",
        },
      ],
      ...chartSections("greg", "Greg"),
    },
  },
];

export const DASHBOARD_TABS = [
  { id: "vitals", label: "Vitals" },
  { id: "documents", label: "Documents" },
  { id: "periodontal", label: "Periodontal" },
  { id: "odontogram", label: "Odontogram" },
  { id: "vitality", label: "Vitality Testing" },
  { id: "notes", label: "Notes" },
] as const;

export type DashboardTabId = (typeof DASHBOARD_TABS)[number]["id"];
