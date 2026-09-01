import { getContextAssessment } from "../../lib/pubhealthContexts";
import { assessConversationAgainstContext } from "../../../src/lib/assessFromContext";
import type { LiveAvatarSessionMessage } from "../../../src/liveavatar/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const scenarioId = String(body.scenarioId ?? "");
    const messages = (body.messages ?? []) as LiveAvatarSessionMessage[];
    const spec = getContextAssessment(scenarioId);

    if (!spec) {
      return Response.json(
        { error: "This conversation's Context rubric is not loaded yet." },
        { status: 400 },
      );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "A conversation transcript is required." },
        { status: 400 },
      );
    }

    return Response.json(assessConversationAgainstContext(spec, messages));
  } catch (error) {
    console.error("Error assessing conversation:", error);
    return Response.json(
      { error: "Unable to assess this conversation with the Context rubric." },
      { status: 500 },
    );
  }
}
