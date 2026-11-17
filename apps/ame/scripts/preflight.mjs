// AME-specific source preflight; run with: node apps/ame/scripts/preflight.mjs
import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(root, p), "utf8");
const avatars = read("app/lib/pubhealthAvatars.ts");
const rubric = read("app/lib/pubhealthContexts.ts");
const assessor = read("app/api/verified-assessment/route.ts");
const pdf = read("src/lib/verifiedAssessmentPdf.ts");
const vercel = JSON.parse(read("vercel.json"));
for (const [name, avatarId, contextId] of [
  ["Alex Rivera", "05eee471-f9f7-481f-ada6-4e12b2ee0e6d", "12a506d7-f11e-4c13-acb6-3aa70388991e"],
  ["Morgan Zhang", "87dff365-543d-46a5-9f5a-524da44675ab", "aab5ea07-2025-4605-98da-4e2816d170b0"],
  ["Lina Morales", "3ccd1378-1126-4197-9fff-a607af83726a", "087c93e8-9e27-48d6-b541-bc47e6a8a613"],
  ["Chris Okafor", "01a97c47-56f7-4b0e-bf82-8449c02a5a71", "51b08ea3-6b5c-4c06-908c-d5434d5742e8"],
]) for (const value of [name, avatarId, contextId]) assert.ok(avatars.includes(value), "Missing avatar configuration: " + value);
const titles = [
  "Offering learner opportunity to reflect before feedback",
  "Maintaining a respectful manner",
  "Using an appropriate communication style",
  "Focusing on specific behavior",
  "Giving constructive feedback",
  "Ending with an action plan",
  "Limiting feedback to manageable points",
  "Allotting appropriate time",
  "Verifying understanding",
];
for (const title of titles) assert.ok(rubric.includes(title), "Missing AME criterion: " + title);
assert.equal(new Set(titles).size, 9);
assert.ok(assessor.includes('citations.some((c) => c.role !== "user")'), "Missing educator-only evidence verification");
assert.ok(assessor.includes('typeof v.score !== "number"'), "Missing strict score validation");
assert.ok(assessor.includes('performanceBand'), "Missing performance bands");
assert.ok(pdf.includes("report.transcript"), "PDF missing transcript");
assert.ok(pdf.includes("report.totalScore"), "PDF missing score");
assert.ok(vercel.buildCommand.includes("--filter=ame"), "Vercel builds wrong app");
for (const obsolete of ["src/lib/assessFromContext.ts", "src/lib/assessTranscript.ts", "src/lib/generateAssessmentPdf.ts", "app/api/assess-conversation/route.ts"]) assert.ok(!existsSync(resolve(root, obsolete)), "Legacy Public Health assessment remains: " + obsolete);
console.log("AME preflight checks passed (4 avatars, 9 criteria, scoring, evidence, PDF, build target, legacy cleanup).");
