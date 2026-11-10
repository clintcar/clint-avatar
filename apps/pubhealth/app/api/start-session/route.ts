import { cookies } from "next/headers";
import { createHmac } from "node:crypto";
import { PUBHEALTH_AVATARS } from "../../lib/pubhealthAvatars";
import { API_KEY, API_URL, AVATAR_ID, CONTEXT_ID, LANGUAGE } from "../secrets";

export async function POST(request: Request) {
  let session_token = "";
  let session_id = "";
  try {
    const body = await request.json().catch(() => ({}));
    const scenario = PUBHEALTH_AVATARS.find((entry) => entry.id === body.scenario_id);
    if (!scenario || body.avatar_id !== scenario.avatarId || body.context_id !== scenario.contextId) {
      return new Response(JSON.stringify({error:"Choose a valid Public Health scenario."}),{status:400});
    }
    const avatarId = scenario.avatarId;
    const language = body.language || LANGUAGE;
    const emotion = body.emotion;
    const contextId = scenario.contextId;

    const avatarPersona: {
      context_id: string;
      language: string;
      emotion?: string;
    } = {
      context_id: contextId,
      language: language,
    };

    if (emotion) {
      avatarPersona.emotion = emotion;
    }

    const res = await fetch(`${API_URL}/v1/sessions/token`, {
      method: "POST",
      headers: {
        "X-API-KEY": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "FULL",
        avatar_id: avatarId,
        avatar_persona: avatarPersona,
      }),
    });
    if (!res.ok) {
      const resp = await res.json();
      const errorMessage =
        resp.data[0].message ?? "Failed to retrieve session token";
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: res.status,
      });
    }
    const data = await res.json();

    session_token = data.data.session_token;
    session_id = data.data.session_id;
    const secret=process.env.SESSION_SIGNING_SECRET||API_KEY;
    const payload=Buffer.from(JSON.stringify({sessionId:session_id,scenarioId:scenario.id,expires:Date.now()+3*60*60*1000})).toString("base64url");
    const signature=createHmac("sha256",secret).update(payload).digest("base64url");
    (await cookies()).set("ph_review_session",payload+"."+signature,{httpOnly:true,sameSite:"strict",secure:process.env.NODE_ENV==="production",path:"/",maxAge:10800});
  } catch (error) {
    console.error("Error retrieving session token:", error);
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
