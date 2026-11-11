import "server-only";
import { cacheLife } from "next/cache";
import { priceModels } from "@/domain/cost";
import type { Catalog } from "@/domain/types";
import { fetchCatalog } from "./openrouter";

/** How many of the newest models stay in the catalogue even without scores, for News. */
const NEWS_COUNT = 40;

/** Models with scores and costs, plus the newest models for News. */
export async function getCatalog(): Promise<Catalog> {
  "use cache";
  cacheLife("hours");

  const raw = await fetchCatalog();
  const newest = new Set(
    [...raw.models]
      .sort((a, b) => b.created - a.created)
      .slice(0, NEWS_COUNT)
      .map((m) => m.slug),
  );
  const scored = (m: (typeof raw.models)[number]) =>
    m.scores.intelligence !== null || m.scores.coding !== null || m.scores.agentic !== null;
  const window = { days: raw.costWindowDays, end: raw.costWindowEnd };
  const priced = priceModels(raw.models, window).filter((m) => scored(m) || newest.has(m.slug));

  return {
    models: priced,
    benchmarksAsOf: raw.benchmarksAsOf,
    benchmarkCitation: raw.benchmarkCitation,
    costWindowDays: raw.costWindowDays,
    costWindowEnd: raw.costWindowEnd,
    classificationsAsOf: raw.classificationsAsOf,
    modelsAsOf: raw.fetchedAt,
    workspaceId: raw.workspaceId,
  };
}
