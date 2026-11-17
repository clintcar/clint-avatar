import {
  MessageSender,
  type LiveAvatarSessionMessage,
} from "../liveavatar/types";
import {
  requestContextAssessment,
  type ContextRubricAssessment,
} from "./assessTranscript";

const TEAL = { r: 0, g: 106, b: 134 };
const GREEN = { r: 122, g: 154, b: 45 };
const INK = { r: 35, g: 35, b: 35 };
const MUTED = { r: 95, g: 102, b: 107 };
const PAGE_MARGIN = 48;
const PAGE_BOTTOM = 36;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

function formatWhen(value: number | string) {
  return new Date(value).toLocaleString();
}

function senderLabel(sender: MessageSender) {
  return sender === MessageSender.USER ? "You" : "Avatar";
}

function writeList(
  writeWrapped: (
    text: string,
    options?: {
      style?: "normal" | "bold";
      size?: number;
      color?: { r: number; g: number; b: number };
      indent?: number;
      gap?: number;
    },
  ) => void,
  items: string[],
  emptyText: string,
) {
  if (items.length === 0) {
    writeWrapped(emptyText, { size: 10, color: MUTED, indent: 8, gap: 4 });
    return;
  }
  for (const item of items) {
    writeWrapped(`• ${item}`, { size: 10, indent: 8, gap: 2 });
  }
}

export async function buildAssessmentPdf({
  title,
  messages,
  assessment,
}: {
  title: string;
  messages: LiveAvatarSessionMessage[];
  assessment: ContextRubricAssessment;
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
    options: {
      font?: string;
      style?: "normal" | "bold";
      size?: number;
      color?: { r: number; g: number; b: number };
      indent?: number;
      gap?: number;
    } = {},
  ) => {
    const {
      font = "helvetica",
      style = "normal",
      size = 10,
      color = INK,
      indent = 0,
      gap = 4,
    } = options;
    doc.setFont(font, style);
    doc.setFontSize(size);
    doc.setTextColor(color.r, color.g, color.b);
    const lines = doc.splitTextToSize(text, contentWidth - indent) as string[];
    for (const line of lines) {
      ensureSpace(size + 6);
      doc.text(line, PAGE_MARGIN + indent, y);
      y += size + 4;
    }
    y += gap;
  };

  doc.setFillColor(TEAL.r, TEAL.g, TEAL.b);
  doc.rect(0, 0, pageWidth, 10, "F");
  doc.setFillColor(GREEN.r, GREEN.g, GREEN.b);
  doc.rect(0, 10, pageWidth, 4, "F");

  writeWrapped("Centers for Health, Work & Environment", {
    size: 11,
    style: "bold",
    color: MUTED,
    gap: 2,
  });
  writeWrapped("Conversation Assessment Report", {
    size: 20,
    style: "bold",
    gap: 8,
  });
  writeWrapped(title, { size: 12, style: "bold", gap: 2 });
  writeWrapped(assessment.projectTitle, { size: 10, color: MUTED, gap: 2 });
  writeWrapped(`Assessed as ${assessment.avatarName}`, {
    size: 10,
    color: MUTED,
    gap: 2,
  });
  writeWrapped(`Generated ${formatWhen(assessment.generatedAt)}`, {
    size: 9,
    color: MUTED,
    gap: 8,
  });
  writeWrapped(
    "This report applies the avatar Context assessment categories to the actual conversation transcript. It cites learner and avatar statements as evidence. No scores, grades, or ratings are assigned.",
    { size: 9, color: MUTED, gap: 14 },
  );

  if (assessment.emotionalExperience) {
    writeWrapped("How the conversation felt", {
      size: 14,
      style: "bold",
      gap: 8,
    });
    writeWrapped(assessment.emotionalExperience, { size: 10, gap: 14 });
  }

  writeWrapped("Assessment breakdown", {
    size: 14,
    style: "bold",
    gap: 10,
  });

  for (const category of assessment.categories) {
    ensureSpace(36);
    doc.setFillColor(TEAL.r, TEAL.g, TEAL.b);
    doc.rect(PAGE_MARGIN, y - 12, contentWidth, 20, "F");
    doc.setFillColor(GREEN.r, GREEN.g, GREEN.b);
    doc.rect(PAGE_MARGIN, y - 12, 5, 20, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(category.title, PAGE_MARGIN + 10, y);
    y += 16;
    writeWrapped(`Look-fors: ${category.lookFors.join("; ")}`, {
      size: 8,
      color: MUTED,
      gap: 8,
    });
    writeWrapped("Strengths", { size: 10, style: "bold", gap: 4 });
    writeList(
      writeWrapped,
      category.strengths,
      "No strengths captured for this category.",
    );
    y += 6;
    writeWrapped("Opportunities for improvement", {
      size: 10,
      style: "bold",
      gap: 4,
    });
    writeList(
      writeWrapped,
      category.improvements,
      "No improvement notes captured for this category.",
    );
    y += 6;
    writeWrapped("Examples from the interaction", {
      size: 10,
      style: "bold",
      gap: 4,
    });
    writeList(
      writeWrapped,
      category.examples,
      "No specific examples were cited for this category.",
    );
    y += 10;
  }

  writeWrapped("Closing coaching notes", {
    size: 14,
    style: "bold",
    gap: 8,
  });
  for (const closing of assessment.closings) {
    writeWrapped(closing.prompt, { size: 10, style: "bold", gap: 2 });
    writeWrapped(closing.text || "Not provided.", {
      size: 10,
      indent: 8,
      gap: 8,
    });
  }
  y += 6;

  writeWrapped("Conversation transcript", {
    size: 14,
    style: "bold",
    gap: 8,
  });

  if (messages.length === 0) {
    writeWrapped("No messages were captured for this session.", {
      size: 10,
      color: MUTED,
    });
  } else {
    for (const message of messages) {
      writeWrapped(
        `${formatWhen(message.timestamp)} · ${senderLabel(message.sender)}`,
        {
          size: 8,
          style: "bold",
          color: MUTED,
          gap: 1,
        },
      );
      writeWrapped(message.message || "(empty message)", {
        size: 10,
        gap: 10,
      });
    }
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
    doc.text(
      "CHWE Conversation Assessment Report",
      PAGE_MARGIN,
      pageHeight - 18,
    );
    doc.text(
      `Page ${page} of ${pageCount}`,
      pageWidth - PAGE_MARGIN,
      pageHeight - 18,
      { align: "right" },
    );
  }

  return { doc, assessment, filename: assessmentFileName(title) };
}

function assessmentFileName(title: string) {
  const dateStamp = new Date().toISOString().split("T")[0];
  return `chwe-assessment-${slugify(title) || "conversation"}-${dateStamp}.pdf`;
}

export async function downloadAssessmentPdf(args: {
  title: string;
  avatarId: string;
  messages: LiveAvatarSessionMessage[];
}) {
  const assessment = requestContextAssessment({
    scenarioId: args.avatarId,
    messages: args.messages,
  });
  const { doc, filename } = await buildAssessmentPdf({
    title: args.title,
    messages: args.messages,
    assessment,
  });
  doc.save(filename);
  return assessment;
}
