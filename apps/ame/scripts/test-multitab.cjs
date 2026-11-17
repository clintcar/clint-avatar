const fs = require("fs");
const vm = require("vm");
const path = require("path");
const ts = require(process.cwd() + "/node_modules/typescript");
const assert = require("node:assert/strict");
const root = process.cwd() + "/apps/pubhealth";
const jar = new Map();
const transcriptsRead = [];
let tokens = 0,
  contexts = 0;
process.env.SESSION_SIGNING_SECRET = "isolated-test-secret";
process.env.LIVEAVATAR_API_KEY = "isolated-test-api-key";
const turns = [
  {
    role: "user",
    transcript: "Let us listen to your community and understand your concerns.",
    absolute_timestamp: 1000,
  },
  {
    role: "assistant",
    transcript: "Thank you for asking about my concerns.",
    absolute_timestamp: 2000,
  },
];
const mockFetch = async (url, init = {}) => {
  const target = String(url);
  if (target.endsWith("/sessions/token"))
    return Response.json({
      data: {
        session_id: "session-" + ++tokens,
        session_token: "test-token-" + tokens,
      },
    });
  if (target.endsWith("/transcript")) {
    transcriptsRead.push(target.split("/sessions/")[1].split("/")[0]);
    return Response.json({
      data: { session_active: false, transcript_data: turns },
    });
  }
  if (target.endsWith("/contexts") && init.method === "POST")
    return Response.json({ data: { id: "context-" + ++contexts } });
  if (init.method === "DELETE" || target.endsWith("/sessions/stop"))
    return Response.json({ data: {} });
  throw Error("Unexpected network call: " + target);
};
const cache = new Map();
function load(filename) {
  if (!path.extname(filename)) filename += ".ts";
  if (cache.has(filename)) return cache.get(filename);
  const module = { exports: {} };
  const localRequire = (name) => {
    if (name === "next/headers")
      return {
        cookies: async () => ({
          get: (key) =>
            jar.has(key) ? { value: jar.get(key).value } : undefined,
          set: (key, value, options) => jar.set(key, { value, options }),
        }),
      };
    if (name === "next/server")
      return {
        NextResponse: { json: (data, init) => Response.json(data, init) },
      };
    if (name === "../secrets")
      return {
        API_KEY: "isolated-test-api-key",
        API_URL: "https://api.liveavatar.com",
        LANGUAGE: "en",
      };
    if (name.startsWith("."))
      return load(path.resolve(path.dirname(filename), name));
    return require(name);
  };
  const js = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  vm.runInNewContext("(function(require,module,exports){" + js + "\n})", {
    Buffer,
    process,
    Response,
    AbortSignal,
    fetch: mockFetch,
    console,
  })(localRequire, module, module.exports);
  cache.set(filename, module.exports);
  return module.exports;
}
const avatars = load(root + "/app/lib/pubhealthAvatars.ts").PUBHEALTH_AVATARS;
const start = load(root + "/app/api/start-session/route.ts");
const assess = load(root + "/app/api/verified-assessment/route.ts");
const req = (body) => ({
  json: async () => body,
  headers: new Headers({ origin: "https://test.example" }),
  nextUrl: new URL("https://test.example/api/verified-assessment"),
});
async function startAvatar(avatar) {
  const r = await start.POST(
    req({
      scenario_id: avatar.id,
      avatar_id: avatar.avatarId,
      context_id: avatar.contextId,
    }),
  );
  assert.equal(r.status, 200);
}
(async () => {
  await startAvatar(avatars[0]);
  await startAvatar(avatars[1]);
  assert.equal(jar.size, 2, "separate scenario session cookies");
  assert.equal(
    jar.get("ph_review_session_" + avatars[0].id).options.httpOnly,
    true,
  );
  let r = await assess.POST(
    req({ action: "prepare", scenarioId: avatars[0].id }),
  );
  assert.equal(r.status, 200, await r.clone().text());
  const jessica = await r.json();
  assert.equal(
    transcriptsRead.at(-1),
    "session-1",
    "Jessica transcript selected after Henry starts",
  );
  r = await assess.POST(req({ action: "prepare", scenarioId: avatars[1].id }));
  assert.equal(r.status, 200, await r.clone().text());
  assert.equal(
    transcriptsRead.at(-1),
    "session-2",
    "Henry transcript stays separate",
  );
  await startAvatar(avatars[2]);
  await startAvatar(avatars[3]);
  // Existing signed Jessica ticket must still verify after all four tabs have started.
  r = await assess.POST(
    req({
      action: "verify",
      ticket: jessica.ticket,
      categoryId: jessica.categoryIds[0],
      item: {
        assessmentId: jessica.assessmentId,
        categoryId: jessica.categoryIds[0],
        status: "observed",
        strength: "Asked about concerns.",
        improvement: "Make a clear ask.",
        nextStep: "State a specific request.",
        evidence: [{ turnId: "T1", quote: "Let us listen to your community" }],
      },
    }),
  );
  assert.equal(r.status, 200, await r.clone().text());
  assert.equal(transcriptsRead.at(-1), "session-1");
  const verified = await r.json();
  r = await assess.POST(
    req({
      action: "finalize",
      ticket: jessica.ticket,
      receipts: [verified.receipt],
    }),
  );
  assert.equal(r.status, 200, await r.clone().text());
  assert.equal((await r.json()).scenarioId, avatars[0].id);
  // Replacing Jessica's cookie with Henry's signed cookie must be rejected.
  jar.set(
    "ph_review_session_" + avatars[0].id,
    jar.get("ph_review_session_" + avatars[1].id),
  );
  r = await assess.POST(
    req({
      action: "read",
      ticket: jessica.ticket,
      categoryId: jessica.categoryIds[0],
    }),
  );
  assert.equal(r.status, 503);
  assert.match((await r.json()).error, /does not match/);
  console.log(
    "PASS: four scenario cookies isolated; Jessica prepare, verify and finalize survive starting other avatars; mismatched signed session rejected. No live API calls.",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
