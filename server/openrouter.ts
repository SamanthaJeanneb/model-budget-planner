import "server-only";
import { cacheLife } from "next/cache";
import { z } from "zod";
import { AGENT_APPS, API_TURN_RANGE, POPULAR_TOP_N } from "@/domain/rules";
import type { AgentApp, Model, SessionCost, TurnBucket } from "@/domain/types";

/** The only place that knows OpenRouter's URLs and field names. */
const BASE = "https://openrouter.ai/api/v1";
const SESSION_COST_PAGE = 500;

function apiKey(): string {
  const key = process.env.OPEN_ROUTER_API_KEY;
  if (!key) throw new Error("OPEN_ROUTER_API_KEY is not set");
  return key;
}

async function get<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${apiKey()}` } });
  if (!res.ok) throw new Error(`OpenRouter ${path} returned ${res.status}`);
  return schema.parse(await res.json());
}

const num = z.coerce.number();
const score = z
  .number()
  .nullable()
  .optional()
  .transform((v) => v ?? null);

const RawModel = z.object({
  id: z.string(),
  canonical_slug: z.string(),
  hugging_face_id: z.string().nullable().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  created: z.number(),
  context_length: z.number().nullable(),
  architecture: z.object({ output_modalities: z.array(z.string()) }),
  pricing: z.object({ prompt: num, completion: num }),
  supported_parameters: z.array(z.string()).default([]),
  benchmarks: z
    .object({
      artificial_analysis: z
        .object({ intelligence_index: score, coding_index: score, agentic_index: score })
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
});
type RawModel = z.infer<typeof RawModel>;

const ModelList = z.object({ data: z.array(RawModel) });

const Benchmarks = z.object({
  meta: z.object({ as_of: z.string(), citation: z.string() }),
});

const Classifications = z.object({
  data: z.object({
    as_of: z.string(),
    classifications: z.array(z.object({ tag: z.string(), models: z.array(z.object({ id: z.string() })) })),
  }),
});

const SessionCostPage = z.object({
  data: z.array(
    z.object({
      app_slug: z.string(),
      turn_range: z.string(),
      model_permaslug: z.string(),
      median_session_cost_usd: z.number(),
    }),
  ),
  meta: z.object({ window_days: z.number(), window_end_date: z.string() }),
});

const KeyInfo = z.object({ data: z.object({ workspace_id: z.string().nullable().optional() }) });

/** Routing aliases and variants (":batch", "~latest") duplicate a canonical model. */
function isPrimary(m: RawModel): boolean {
  return (
    !m.id.includes(":") &&
    !m.id.startsWith("~") &&
    !m.id.startsWith("openrouter/") &&
    m.architecture.output_modalities.includes("text") &&
    m.pricing.prompt >= 0 &&
    m.pricing.completion >= 0
  );
}

export type RawCatalog = {
  models: Model[];
  benchmarksAsOf: string;
  benchmarkCitation: string;
  classificationsAsOf: string;
  costWindowDays: number;
  costWindowEnd: string;
  workspaceId: string | null;
  fetchedAt: string;
};

async function sessionCosts() {
  const rows: z.infer<typeof SessionCostPage>["data"] = [];
  let meta: z.infer<typeof SessionCostPage>["meta"] | null = null;
  for (let offset = 0; ; offset += SESSION_COST_PAGE) {
    const page = await get(
      `/datasets/session-cost?limit=${SESSION_COST_PAGE}&offset=${offset}`,
      SessionCostPage,
    );
    rows.push(...page.data);
    meta = page.meta;
    if (page.data.length < SESSION_COST_PAGE) break;
  }
  return { rows, meta };
}

function groupCosts(rows: Awaited<ReturnType<typeof sessionCosts>>["rows"]) {
  const bySlug = new Map<string, SessionCost[]>();
  for (const row of rows) {
    const app = row.app_slug as AgentApp;
    const bucket: TurnBucket | undefined = API_TURN_RANGE[row.turn_range];
    if (!AGENT_APPS.includes(app) || !bucket) continue;
    const list = bySlug.get(row.model_permaslug) ?? [];
    let entry = list.find((c) => c.app === app);
    if (!entry) {
      entry = { app, byBucket: {} };
      list.push(entry);
    }
    entry.byBucket[bucket] = row.median_session_cost_usd;
    bySlug.set(row.model_permaslug, list);
  }
  for (const list of bySlug.values()) {
    list.sort((a, b) => AGENT_APPS.indexOf(a.app) - AGENT_APPS.indexOf(b.app));
  }
  return bySlug;
}

/** The five read endpoints, parsed into domain shapes. Cached for an hour. */
export async function fetchCatalog(): Promise<RawCatalog> {
  "use cache";
  cacheLife("hours");

  const [byThroughput, zdr, benchmarks, classes, costs, key] = await Promise.all([
    get("/models?sort=throughput-high-to-low", ModelList),
    get("/models?zdr=true", ModelList),
    get("/benchmarks?source=artificial-analysis", Benchmarks),
    get("/classifications/task", Classifications),
    sessionCosts(),
    get("/key", KeyInfo),
  ]);

  const zdrSlugs = new Set(zdr.data.map((m) => m.canonical_slug));
  const costBySlug = groupCosts(costs.rows);
  const popular = new Map<string, string[]>();
  for (const c of classes.data.classifications) {
    for (const m of c.models.slice(0, POPULAR_TOP_N)) {
      popular.set(m.id, [...(popular.get(m.id) ?? []), c.tag]);
    }
  }

  const primary = byThroughput.data.filter(isPrimary);
  const seen = new Set<string>();
  const models: Model[] = [];
  primary.forEach((m, rank) => {
    if (seen.has(m.canonical_slug)) return;
    seen.add(m.canonical_slug);
    const aa = m.benchmarks?.artificial_analysis;
    models.push({
      slug: m.canonical_slug,
      id: m.id,
      name: m.name,
      description: m.description ?? "",
      lab: m.id.split("/")[0],
      created: m.created,
      promptPrice: m.pricing.prompt,
      completionPrice: m.pricing.completion,
      contextLength: m.context_length ?? 0,
      openWeights: Boolean(m.hugging_face_id),
      zdr: zdrSlugs.has(m.canonical_slug),
      throughputRank: rank / primary.length,
      structuredOutput:
        m.supported_parameters.includes("structured_outputs") ||
        m.supported_parameters.includes("response_format"),
      scores: {
        intelligence: aa?.intelligence_index ?? null,
        coding: aa?.coding_index ?? null,
        agentic: aa?.agentic_index ?? null,
      },
      sessionCosts: costBySlug.get(m.canonical_slug) ?? [],
      popularFor: popular.get(m.canonical_slug) ?? [],
    });
  });

  return {
    models,
    benchmarksAsOf: benchmarks.meta.as_of,
    benchmarkCitation: benchmarks.meta.citation,
    classificationsAsOf: classes.data.as_of,
    costWindowDays: costs.meta?.window_days ?? 30,
    costWindowEnd: costs.meta?.window_end_date ?? "",
    workspaceId: key.data.workspace_id ?? null,
    fetchedAt: new Date().toISOString(),
  };
}

export type ChatMessage = { role: "system" | "user"; content: string };

/**
 * Streams the planning model's text output. `models` is the pick then its fallbacks.
 * Yields content deltas only; the caller never sees OpenRouter's SSE framing.
 */
export async function* streamStructured(
  models: string[],
  messages: ChatMessage[],
  schema: object,
  signal: AbortSignal,
): AsyncGenerator<string> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    signal,
    headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: models[0],
      models,
      stream: true,
      messages,
      response_format: {
        type: "json_schema",
        json_schema: { name: "plan", strict: true, schema },
      },
      provider: { require_parameters: true },
    }),
  });
  if (!res.ok || !res.body) throw new Error(`OpenRouter chat returned ${res.status}`);

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") return;
      const delta = parseDelta(data);
      if (delta) yield delta;
    }
  }
}

const Chunk = z.object({
  choices: z.array(z.object({ delta: z.object({ content: z.string().nullable().optional() }) })),
});

function parseDelta(data: string): string | null {
  try {
    const parsed = Chunk.safeParse(JSON.parse(data));
    return parsed.success ? (parsed.data.choices[0]?.delta.content ?? null) : null;
  } catch {
    return null;
  }
}
