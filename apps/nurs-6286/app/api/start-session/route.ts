import { AVATAR_PRESETS } from "../../../src/components/avatarPresets";
import { API_KEY, API_URL, AVATAR_ID, CONTEXT_ID, LANGUAGE } from "../secrets";

const MIN_VOICE_SPEED = { elevenLabs: 0.8, fish: 0.8, cartesia: 0.6 };
type VoiceProvider = keyof typeof MIN_VOICE_SPEED;

async function getVoiceOverride(avatarId: string, requestedSpeed: number) {
  const options = {
    headers: { "X-API-KEY": API_KEY },
    signal: AbortSignal.timeout(3000),
  };
  const avatarResponse = await fetch(`${API_URL}/v1/avatars/${avatarId}`, options);
  if (!avatarResponse.ok) return;

  const avatar = await avatarResponse.json();
  const voiceId = avatar.data?.default_voice?.id;
  if (!voiceId) return;

  const voiceResponse = await fetch(
    `${API_URL}/v1/voices/${encodeURIComponent(voiceId)}`,
    options,
  );
  if (!voiceResponse.ok) return;

  const voice = await voiceResponse.json();
  const engines: VoiceProvider[] = voice.data?.voice_engines ?? [];
  const provider = engines.includes("cartesia")
    ? "cartesia"
    : engines.find((engine) => Object.hasOwn(MIN_VOICE_SPEED, engine));
  if (!provider) return;

  return {
    voice_id: voiceId,
    voice_settings: {
      provider,
      speed: Math.max(requestedSpeed, MIN_VOICE_SPEED[provider]),
    },
  };
}

export async function POST(request: Request) {
  let session_token = "";
  let session_id = "";
  try {
    const body = await request.json().catch(() => ({}));
    const avatarId = body.avatar_id || AVATAR_ID;
    const language = body.language || LANGUAGE;
    const emotion = body.emotion;
    const contextId = body.context_id || CONTEXT_ID;
    const requestedSpeed = AVATAR_PRESETS.find(
      (preset) => preset.avatarId === avatarId,
    )?.voiceSpeed;
    let voiceOverride;
    if (requestedSpeed !== undefined) {
      voiceOverride = await getVoiceOverride(avatarId, requestedSpeed).catch(
        () => undefined,
      );
      if (!voiceOverride) {
        console.warn("Unable to resolve LiveAvatar voice settings for", avatarId);
      }
    }

    const avatarPersona = {
      context_id: contextId,
      language,
      ...(emotion && { emotion }),
      ...voiceOverride,
    };

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
      const resp = await res.json().catch(() => null);
      const errorMessage =
        resp?.data?.[0]?.message ??
        resp?.detail?.[0]?.msg ??
        resp?.message ??
        "Failed to retrieve session token";
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: res.status,
      });
    }
    const data = await res.json();

    session_token = data.data.session_token;
    session_id = data.data.session_id;
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
