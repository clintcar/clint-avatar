import type { LiveAvatarSessionMessage } from "../liveavatar/types";
import { MessageSender } from "../liveavatar/types";
import { RUBRIC } from "./rubric";

export async function downloadReport(messages: LiveAvatarSessionMessage[], notes: string, topic: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  let y = 110;
  const margin = 44;
  const usable = doc.internal.pageSize.getWidth() - margin * 2;
  const write = (value: string, size = 10, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(value, usable) as string[];
    const height = lines.length * (size + 5) + 9;
    if (y + height > 750) { doc.addPage(); y = 48; }
    doc.text(lines, margin, y);
    y += height;
  };
  doc.setFillColor(17, 17, 17);
  doc.rect(0, 0, 612, 78, "F");
  doc.setFillColor(207, 184, 124);
  doc.rect(0, 78, 612, 5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("Ella | MicroTeach Assessment Report", margin, 45);
  doc.setTextColor(28, 28, 28);
  write(`Topic: ${topic || "Not provided"}`, 13, true);
  write(`Generated: ${new Date().toLocaleString()}`);
  write("Formative practice only. These rubric descriptions are not official scores. Ella cannot see shared slides or verify course attendance.");
  write("Course rubric", 14, true);
  for (const section of RUBRIC) {
    write(section.title, 11, true);
    for (const [score, description] of section.levels) write(`${score}: ${description}`);
    write("Rating: Not Assessed (faculty review required)");
  }
  write("Practice notes", 14, true);
  write(notes || "No notes entered.");
  write("Conversation transcript and Ella's verbal feedback", 14, true);
  for (const message of messages) {
    const who = message.sender === MessageSender.USER ? "Learner" : "Ella";
    write(`${who}: ${message.message}`);
  }
  doc.save(`ella-microteach-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
