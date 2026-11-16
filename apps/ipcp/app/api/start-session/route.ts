import { cookies } from "next/headers";
import { createHmac } from "node:crypto";
import { SCENARIO_ID } from "../../lib/rubric";
import { getWilliamsSessionConfig } from "../../lib/williams";
import { API_URL, LANGUAGE } from "../secrets";

export async function POST(request: Request) {
  let session_token = "";
  let session_id = "";
  try {
    const body = await request.json().catch(() => ({}));
    if (request.headers.get("origin") !== new URL(request.url).origin ||
        body.scenario_id !== SCENARIO_ID) {
      return Response.json({ error: "Open the Dr. Williams handoff from this website." }, { status: 400 });
    }
    const { avatarId, contextId, key } = await getWilliamsSessionConfig();
    const avatarPersona = { context_id: contextId, language: LANGUAGE };

    const res = await fetch(`${API_URL}/v1/sessions/token`, {
      method: "POST",
      headers: {
        "X-API-KEY": key,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(12000),
      body: JSON.stringify({
        mode: "FULL",
        avatar_id: avatarId,
        avatar_persona: avatarPersona,
      }),
    });
    if (!res.ok) {
      const resp = await res.json();
      const errorMessage =
        resp?.data?.[0]?.message ??
        resp?.message ??
        resp?.error?.message ??
        `Failed to retrieve session token (HTTP ${res.status})`;
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: res.status,
      });
    }
    const data = await res.json();
    if (!data?.data?.session_token || !data?.data?.session_id) throw Error("LiveAvatar returned an incomplete session.");

    session_token = data.data.session_token;
    session_id = data.data.session_id;
    const secret = process.env.SESSION_SIGNING_SECRET || key;
    const payload = Buffer.from(
      JSON.stringify({
        sessionId: session_id,
        scenarioId: SCENARIO_ID,
        expires: Date.now() + 3 * 60 * 60 * 1000,
      }),
    ).toString("base64url");
    const signature = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");
    (await cookies()).set(
      `ipcp_review_session_${SCENARIO_ID}`,
      payload + "." + signature,
      {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 10800,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
    });
  }

  if (!session_token) {
    return new Response("Failed to retrieve session token", {
      status: 500,
    });
  }
  return new Response(JSON.stringify({ session_token, session_id }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
