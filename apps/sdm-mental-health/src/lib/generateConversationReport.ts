import type { Patient } from "../../app/lib/patients";
import { assessConversation } from "./assessConversation";
import {
  MessageSender,
  type LiveAvatarSessionMessage,
} from "../liveavatar/types";

const GOLD = { r: 207, g: 184, b: 124 };
const INK = { r: 34, g: 34, b: 34 };
const MUTED = { r: 85, g: 85, b: 85 };
const PAGE_MARGIN = 48;
const PAGE_BOTTOM = 36;

function excerpt(text: string, max = 220) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) {
    return clean;
  }
  return `${clean.slice(0, max).trim()}...`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export async function downloadConversationReport({
  patient,
  messages,
  notes,
}: {
  patient: Patient;
  messages: LiveAvatarSessionMessage[];
  notes: string;
}) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  let y = PAGE_MARGIN;

  const ensureSpace = (needed: number) => {
    if (y + needed <= pageHeight - PAGE_BOTTOM) {
      return;
    }
    doc.addPage();
    y = PAGE_MARGIN;
  };

  const writeWrapped = (
    text: string,
    options?: {
      style?: "normal" | "bold";
      size?: number;
      color?: { r: number; g: number; b: number };
      gap?: number;
    },
  ) => {
    const size = options?.size ?? 11;
    const color = options?.color ?? INK;
    doc.setFont("helvetica", options?.style ?? "normal");
    doc.setFontSize(size);
    doc.setTextColor(color.r, color.g, color.b);
    const lines = doc.splitTextToSize(text, contentWidth) as string[];
    const blockHeight = lines.length * (size + 3);
    ensureSpace(blockHeight + (options?.gap ?? 8));
    doc.text(lines, PAGE_MARGIN, y);
    y += blockHeight + (options?.gap ?? 8);
  };

  doc.setFillColor(17, 17, 17);
  doc.rect(0, 0, pageWidth, 78, "F");
  doc.setFillColor(GOLD.r, GOLD.g, GOLD.b);
  doc.rect(0, 78, pageWidth, 5, "F");
  doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("CU SCHOOL OF DENTAL MEDICINE", PAGE_MARGIN, 32);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("Conversation Assessment Report", PAGE_MARGIN, 56);
  y = 108;

  writeWrapped(patient.name, { style: "bold", size: 16, gap: 4 });
  writeWrapped(patient.summary, { size: 11, color: MUTED, gap: 12 });
  const assessment = assessConversation(patient, messages, notes);
  writeWrapped("Provisional automated score: " + assessment.total + "/" + assessment.max, { style: "bold", size: 14, gap: 6 });
  writeWrapped(assessment.caveat, { size: 10, color: MUTED, gap: 14 });
  writeWrapped("Rubric score breakdown", { style: "bold", size: 13, gap: 8 });
  for (const section of assessment.sections) {
    writeWrapped(section.title + ": " + section.score + "/" + section.max, { style: "bold", size: 11, gap: 3 });
    writeWrapped(section.rationale, { size: 10, color: MUTED, gap: 8 });
  }

  writeWrapped("Observed in this conversation", {
    style: "bold",
    size: 13,
    gap: 8,
  });

  for (const item of assessment.observations) {
    writeWrapped(`${item.observed ? "Observed" : "Not observed"} — ${item.label}`, { style: "bold", size: 11, gap: 3 });
    writeWrapped(item.evidence ? `Learner: "${excerpt(item.evidence)}"` : "No matching learner question found before the debrief.", { size: 10, color: MUTED, gap: 8 });
  }

  writeWrapped("Case rubric", { style: "bold", size: 13, gap: 8 });
  for (const section of patient.rubric) {
    writeWrapped(section.title, { style: "bold", size: 11, gap: 4 });
    for (const level of section.levels) {
      writeWrapped(`${level.score} — ${level.text}`, {
        size: 10,
        color: MUTED,
        gap: 4,
      });
    }
  }

  writeWrapped("Case Notes", { style: "bold", size: 13, gap: 8 });
  writeWrapped(notes.trim() ? notes.trim() : "No case notes were entered.", {
    size: 11,
    gap: 14,
  });

  writeWrapped("Transcript", { style: "bold", size: 13, gap: 8 });
  if (messages.length === 0) {
    writeWrapped("No messages were captured.", { size: 10, color: MUTED });
  } else {
    for (const message of messages) {
      const who =
        message.sender === MessageSender.USER ? "Learner" : patient.name;
      const when = new Date(message.timestamp).toLocaleString();
      writeWrapped(`${who} · ${when}`, {
        style: "bold",
        size: 10,
        gap: 2,
      });
      writeWrapped(message.message, { size: 10, gap: 8 });
    }
  }

  doc.save(
    `${slugify(patient.name)}-conversation-assessment-${new Date().toISOString().split("T")[0]}.pdf`,
  );
}
