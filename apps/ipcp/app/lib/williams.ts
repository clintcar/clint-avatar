import "server-only";
import { API_URL } from "../api/secrets";

type Entry = { id: string; name: string; status?: string; is_expired?: boolean };

const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const names = new Set(["dr sherly williams", "doctor sherly williams", "sherly williams", "dr williams", "dr sherly williams ipcp", "ipcp dr williams", "ipcp dr sherly williams"]);

async function resolveId(resource: "avatars" | "contexts", override: string | undefined, key: string) {
  if (override) return override;
  const matches: Entry[] = [];
  for (let page = 1; page <= 10; page++) {
    const response = await fetch(`${API_URL}/v1/${resource}?page=${page}&page_size=100`, {
      headers: { "X-API-KEY": key },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 300 },
    });
    if (!response.ok) throw Error("LiveAvatar could not look up the Dr. Williams profile.");
    const { data } = await response.json() as { data: { results: Entry[]; next: string | null } };
    matches.push(...data.results.filter((entry) =>
      names.has(normalize(entry.name)) &&
      (resource === "contexts" || (entry.status === "ACTIVE" && !entry.is_expired)),
    ));
    if (!data.next) break;
    if (page === 10) throw Error("Configure the Dr. Williams SDK IDs for this LiveAvatar account.");
  }
  if (matches.length !== 1) throw Error(
    resource === "avatars"
      ? "Set IPCP_WILLIAMS_AVATAR_ID to the Dr. Williams SDK avatar ID."
      : "Set IPCP_WILLIAMS_CONTEXT_ID to the Dr. Williams SDK context ID.",
  );
  return matches[0]!.id;
}

export async function getWilliamsAvatarId() {
  const key = process.env.LIVEAVATAR_API_KEY;
  if (!key) throw Error("This preview needs a LiveAvatar API key before a conversation can start.");
  return resolveId("avatars", process.env.IPCP_WILLIAMS_AVATAR_ID, key);
}

export async function getWilliamsSessionConfig() {
  const key = process.env.LIVEAVATAR_API_KEY;
  if (!key) throw Error("This preview needs a LiveAvatar API key before a conversation can start.");
  const [avatarId, contextId] = await Promise.all([
    getWilliamsAvatarId(),
    resolveId("contexts", process.env.IPCP_WILLIAMS_CONTEXT_ID, key),
  ]);
  return { avatarId, contextId, key };
}
