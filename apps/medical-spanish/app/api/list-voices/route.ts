import { API_KEY, API_URL } from "../secrets";

const PAGE_SIZE = 100;

/**
 * Proxies LiveAvatar List Voices API and fetches all pages so you get
 * every voice, not just the first 20.
 * @see https://docs.liveavatar.com/reference/list_voices_v1_voices_get
 */
const headers = {
  "X-API-KEY": API_KEY,
  "Content-Type": "application/json",
} as const;

export async function GET() {
  try {
    const allVoices: unknown[] = [];
    let offset = 0;
    let hasMore = true;
    let usePagination = true;

    while (hasMore) {
      const url = usePagination
        ? `${API_URL}/v1/voices?limit=${PAGE_SIZE}&offset=${offset}`
        : `${API_URL}/v1/voices`;
      const res = await fetch(url, { method: "GET", headers });

      if (!res.ok) {
        if (usePagination && offset === 0) {
          usePagination = false;
          const fallback = await fetch(`${API_URL}/v1/voices`, {
            method: "GET",
            headers,
          });
          if (!fallback.ok) {
            const text = await fallback.text();
            return new Response(
              JSON.stringify({ error: "LiveAvatar API error", details: text }),
              {
                status: fallback.status,
                headers: { "Content-Type": "application/json" },
              },
            );
          }
          const data = await fallback.json();
          const list = Array.isArray(data) ? data : (data?.data ?? []);
          allVoices.push(...(Array.isArray(list) ? list : []));
        } else {
          const text = await res.text();
          return new Response(
            JSON.stringify({ error: "LiveAvatar API error", details: text }),
            {
              status: res.status,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
        hasMore = false;
        continue;
      }

      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : (data?.data ?? data?.voices ?? data?.results ?? []);
      const items = Array.isArray(list) ? list : [];
      allVoices.push(...items);

      if (!usePagination || items.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        offset += PAGE_SIZE;
      }
    }

    return new Response(JSON.stringify({ data: allVoices }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error listing voices:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
