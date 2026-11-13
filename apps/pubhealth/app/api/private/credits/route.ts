// Only serve balances on Vercel's deployment-specific hostname, which is
// protected by Vercel Authentication for this project. Public aliases get 404.
export const dynamic = "force-dynamic";

function reply(body: object, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export async function GET(request: Request) {
  const deploymentHost = process.env.VERCEL_URL;
  const hostname = new URL(request.url).hostname;
  const host = request.headers.get("host")?.split(":")[0];
  if (
    process.env.VERCEL_ENV !== "production" ||
    !deploymentHost ||
    !deploymentHost.endsWith(".vercel.app") ||
    hostname !== deploymentHost ||
    host !== deploymentHost
  ) {
    return reply({ error: "Not found" }, 404);
  }

  const key = process.env.LIVEAVATAR_API_KEY;
  if (!key) return reply({ error: "Credit monitoring is not configured" }, 503);

  try {
    const response = await fetch("https://api.liveavatar.com/v1/users/credits", {
      headers: { "X-API-KEY": key, Accept: "application/json" },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      console.error("LiveAvatar credit balance request failed", response.status);
      return reply({ error: "Balance provider unavailable" }, 502);
    }
    const payload = await response.json();
    const raw = payload?.data?.credits_left;
    if (
      payload?.code !== 100 ||
      typeof raw !== "string" ||
      !/^[+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw) ||
      !Number.isFinite(Number(raw)) ||
      Number(raw) < 0
    ) {
      console.error("LiveAvatar returned an invalid credit balance");
      return reply({
        error: "Invalid balance response",
        schema: {
          code: typeof payload?.code === "number" ? payload.code : null,
          top_keys: payload && typeof payload === "object" ? Object.keys(payload) : [],
          data_keys: payload?.data && typeof payload.data === "object" ? Object.keys(payload.data) : [],
          balance_type: typeof raw,
          numeric_balance: typeof raw === "number" && Number.isFinite(raw) ? raw : null,
        },
      }, 502);
    }
    return reply({
      provider: "LiveAvatar",
      credits_left: raw,
      checked_at: new Date().toISOString(),
    });
  } catch {
    console.error("LiveAvatar credit balance request could not complete");
    return reply({ error: "Balance provider unavailable" }, 502);
  }
}
