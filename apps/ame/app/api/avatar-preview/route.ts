import { PUBHEALTH_AVATARS } from "../../lib/pubhealthAvatars";
import { API_KEY, API_URL } from "../secrets";

export async function GET(request: Request) {
  const avatarId = new URL(request.url).searchParams.get("avatar_id");
  if (!PUBHEALTH_AVATARS.some((avatar) => avatar.avatarId === avatarId)) {
    return new Response("Unknown avatar", { status: 404 });
  }

  try {
    const response = await fetch(
      `${API_URL}/v1/avatars/${encodeURIComponent(avatarId!)}`,
      {
        headers: { "X-API-KEY": API_KEY },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!response.ok) {
      return new Response("Avatar preview unavailable", { status: 502 });
    }
    const avatar = await response.json();
    const previewUrl = avatar.data?.preview_url;
    if (typeof previewUrl !== "string" || new URL(previewUrl).protocol !== "https:") {
      return new Response("Avatar preview unavailable", { status: 502 });
    }
    return new Response(null, {
      status: 307,
      headers: {
        Location: previewUrl,
        "Cache-Control": "public, max-age=300, s-maxage=3600",
      },
    });
  } catch {
    return new Response("Avatar preview unavailable", { status: 502 });
  }
}
