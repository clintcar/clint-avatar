import { API_KEY, API_URL } from "../secrets";

export async function GET(request: Request) {
  const avatarId = new URL(request.url).searchParams.get("avatarId");

  if (!avatarId) {
    return Response.json({ error: "Avatar ID is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${API_URL}/v1/avatars/${encodeURIComponent(avatarId)}`,
      {
        headers: {
          "X-API-KEY": API_KEY,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return Response.json(
        { error: "Unable to load avatar preview" },
        { status: response.status },
      );
    }

    const result = await response.json();
    const previewUrl = result?.data?.preview_url;

    if (!previewUrl) {
      return Response.json(
        { error: "No preview is available for this avatar" },
        { status: 404 },
      );
    }

    return Response.json({ previewUrl });
  } catch (error) {
    console.error("Error retrieving avatar preview:", error);
    return Response.json(
      { error: "Unable to load avatar preview" },
      { status: 500 },
    );
  }
}
