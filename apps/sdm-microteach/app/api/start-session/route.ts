import { API_URL } from "../secrets";

const AVATAR_ID = "9f24d264-7b00-4335-819e-a39e7b37d25f";
const CONTEXT_ID = "8b85e618-a8bd-44b6-9db7-24f1498bed55";

export async function POST() {
  const key = process.env.LIVEAVATAR_API_KEY;
  if (!key) {
    return Response.json({ error: "LiveAvatar is not configured. Add LIVEAVATAR_API_KEY in Vercel settings." }, { status: 503 });
  }
  try {
    const response = await fetch(`${API_URL}/v1/sessions/token`, {
      method: "POST",
      headers: { "X-API-KEY": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "FULL",
        avatar_id: AVATAR_ID,
        avatar_persona: { context_id: CONTEXT_ID, language: "en" },
        video_settings: { quality: "high", encoding: "H264" },
        max_session_duration: 1800,
        interactivity_type: "CONVERSATIONAL"
      }),
      cache: "no-store"
    });
    const result = await response.json();
    if (!response.ok || !result?.data?.session_token) {
      const message = result?.message || result?.error?.message || result?.data?.[0]?.message || "LiveAvatar could not start the session.";
      return Response.json({ error: String(message) }, { status: response.status || 502 });
    }
    return Response.json({ session_token: result.data.session_token, session_id: result.data.session_id }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Unable to reach LiveAvatar. Please try again." }, { status: 502 });
  }
}
