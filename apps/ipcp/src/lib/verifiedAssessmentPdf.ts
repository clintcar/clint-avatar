import { statusLabels } from "../../app/lib/rubric";
import type { VerifiedReport } from "./verifiedAssessment";

const BLACK = [24, 24, 24] as const,
  GOLD = [207, 184, 124] as const,
  INK = [35, 35, 35] as const,
  MUTED = [95, 102, 107] as const,
  PALE = [244, 246, 246] as const;
const clean = (s: string) =>
  String(s ?? "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/·/g, "-")
    .replace(/[^\x20-\x7e\n]/g, " ");
export async function downloadVerifiedReport(report: VerifiedReport) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const left = 18,
    right = 192,
    bottom = 275;
  let y = 25;
  const color = (c: readonly [number, number, number]) =>
    doc.setTextColor(c[0], c[1], c[2]);
  const fill = (c: readonly [number, number, number]) =>
    doc.setFillColor(c[0], c[1], c[2]);
  const page = () => {
    doc.addPage();
    y = 23;
  };
  const space = (h: number) => {
    if (y + h > bottom) page();
  };
  const txt = (
    s: string,
    size = 9,
    width = 173,
    indent = left,
    tint: readonly [number, number, number] = INK,
    spacing = 1.45,
  ) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    color(tint);
    const lines = doc.splitTextToSize(clean(s), width) as string[];
    for (const line of lines) {
      space(size * 0.3528 * spacing + 1);
      doc.text(line, indent, y);
      y += size * 0.3528 * spacing;
    }
    y += 2.5;
  };
  const head = (label: string, size = 13) => {
    space(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    color(BLACK);
    doc.text(clean(label), left, y);
    y += 9;
  };
  fill(BLACK);
  doc.rect(0, 0, 210, 16, "F");
  fill(GOLD);
  doc.rect(0, 16, 210, 1.7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  color([255, 255, 255]);
  doc.text("CU ANSCHUTZ MEDICAL CAMPUS", left, 10.5);
  head("Conversation Assessment Report", 17);
  txt(report.projectTitle, 11, 171, left, BLACK);
  txt("Scenario: " + report.avatarName, 10);
  txt(
    "Generated: " + new Date(report.generatedAt).toLocaleString(),
    8,
    172,
    left,
    MUTED,
  );
  fill(PALE);
  doc.roundedRect(left, y - 3, 174, 19, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  color(BLACK);
  doc.text(
    report.complete
      ? "All assessment categories verified"
      : "PARTIAL ASSESSMENT - some categories were not verified",
    left + 5,
    y + 4,
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  color(MUTED);
  doc.text(
    report.categories.filter((c) => c.result).length +
      " of " +
      report.categories.length +
      " rubric categories assessed",
    left + 5,
    y + 11,
  );
  y += 23;
  txt(
    "Formative I-SBAR feedback. Evidence is checked against the original learner transcript.",
    9,
    173,
    left,
    MUTED,
  );
  head("Rubric assessment", 14);
  let group = "";
  for (const c of report.categories) {
    if (c.group !== group) {
      space(42);
      group = c.group;
      head(group, 12);
    }
    space(23);
    fill(BLACK);
    doc.roundedRect(left, y - 6, 174, 12, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.4);
    color([255, 255, 255]);
    const label = c.id.toUpperCase() + ". " + c.title;
    const row = doc.splitTextToSize(clean(label), 128) as string[];
    if (row.length > 1) {
      doc.text(row[0] ?? "", left + 4, y + 0.7);
      doc.text(row[1] ?? "", left + 4, y + 4.1);
    } else doc.text(label, left + 4, y + 1);
    const status = c.result ? statusLabels[c.result.status].toUpperCase() : "NOT REVIEWED";
    doc.setFontSize(7);
    doc.text(status, right - 4, y + 1, { align: "right" });
    y += 12;
    txt(c.lookFors.join(" "), 8, 169, left + 2, MUTED, 1.35);
    if (!c.result) {
      txt(
        "Assessment unavailable. No evidence or conclusion has been assigned for this category.",
        9,
        169,
        left + 2,
        MUTED,
      );
      y += 3;
      continue;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    color(BLACK);
    space(7);
    doc.text("Strength", left + 2, y);
    y += 5;
    txt(c.result.strength, 9.2, 166, left + 2);
    for (const e of c.result.evidence) {
      const sourceLabel = e.turnId + " · Learner: ";
      const quote = sourceLabel + '"' + e.quote + '"';
      const lines = doc.splitTextToSize(clean(quote), 154) as string[];
      const h = Math.max(13, lines.length * 4.4 + 9);
      space(h + 3);
      fill(PALE);
      doc.roundedRect(left + 2, y - 3, 170, h, 1.5, 1.5, "F");
      fill(GOLD);
      doc.rect(left + 2, y - 3, 1.5, h, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      color(INK);
      doc.text(lines, left + 7, y + 3);
      y += h + 2;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    color(BLACK);
    space(7);
    doc.text("Opportunity for improvement", left + 2, y);
    y += 5;
    txt(c.result.improvement, 9.2, 167, left + 2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    color(BLACK);
    space(7);
    doc.text("Next practice step", left + 2, y);
    y += 5;
    txt(c.result.nextStep, 9.2, 167, left + 2);
    y += 4;
  }
  head("Assessment limitations", 12);
  for (const item of report.limitations)
    txt("- " + item, 8.4, 170, left, MUTED);
  page();
  head("Conversation transcript", 15);
  txt(
    "The assessment uses learner wording, not hypothetical or suggested responses.",
    8.5,
    172,
    left,
    MUTED,
  );
  for (const t of report.transcript) {
    const label = t.role === "user" ? "LEARNER" : "AVATAR";
    space(18);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    color(BLACK);
    doc.text(t.id + "  " + label, left, y);
    y += 5;
    txt(t.text, 8.8, 170, left + 2);
  }
  const pages = doc.getNumberOfPages();
  for (let n = 1; n <= pages; n++) {
    doc.setPage(n);
    fill(GOLD);
    doc.rect(left, 282, 174, 0.6, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    color(MUTED);
    doc.text("CU ANSCHUTZ  /  INTERPROFESSIONAL COLLABORATIVE PRACTICE", left, 290);
    doc.text(n + " / " + pages, right, 290, { align: "right" });
  }
  doc.save("IPCP-" + report.scenarioId + "-verified-assessment.pdf");
}
