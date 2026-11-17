import type { LiveAvatarSessionMessage } from "../liveavatar/types";
import { getContextAssessment } from "../../app/lib/pubhealthContexts";
import { assessConversationAgainstContext } from "./assessFromContext";

export type AssessmentCategoryResult = {
  id: string;
  title: string;
  lookFors: string[];
  strengths: string[];
  improvements: string[];
  examples: string[];
};

export type AssessmentClosingResult = {
  id: string;
  prompt: string;
  text: string;
};

export type ContextRubricAssessment = {
  scenarioId: string;
  avatarName: string;
  projectTitle: string;
  generatedAt: string;
  emotionalExperience: string;
  categories: AssessmentCategoryResult[];
  closings: AssessmentClosingResult[];
  source: "context-rubric";
};

export function requestContextAssessment({
  scenarioId,
  messages,
}: {
  scenarioId: string;
  messages: LiveAvatarSessionMessage[];
}): ContextRubricAssessment {
  const spec = getContextAssessment(scenarioId);
  if (!spec) {
    throw new Error("This conversation's Context rubric is not loaded yet.");
  }
  if (messages.length === 0) {
    throw new Error("A conversation transcript is required.");
  }
  return assessConversationAgainstContext(spec, messages);
}
