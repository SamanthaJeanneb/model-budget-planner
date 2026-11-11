import type { PricedModel, ScoreKind } from "@/domain/types";

export const METRIC_LABEL: Record<ScoreKind, string> = {
  intelligence: "Intelligence",
  coding: "Coding",
  agentic: "Agentic",
};

/** Agent sessions are mostly input, so the price axis weights prompt tokens 90%. */
const PROMPT_SHARE = 0.9;
const PER_MILLION = 1_000_000;

export function blendedPerMillion(m: PricedModel): number {
  return (m.promptPrice * PROMPT_SHARE + m.completionPrice * (1 - PROMPT_SHARE)) * PER_MILLION;
}

export function perMillion(usdPerToken: number): string {
  const v = usdPerToken * PER_MILLION;
  if (v === 0) return "Free";
  return v >= 10 ? `$${v.toFixed(0)}` : `$${v.toFixed(2)}`;
}

export function contextLabel(tokens: number): string {
  if (tokens >= 1_000_000) return `${Number((tokens / 1_000_000).toFixed(1))}M`;
  return `${Math.round(tokens / 1000)}k`;
}

export type Filters = { metric: ScoreKind; labs: string[]; query: string; openOnly: boolean };

export function applyFilters(models: PricedModel[], f: Filters): PricedModel[] {
  const q = f.query.trim().toLowerCase();
  return models.filter(
    (m) =>
      m.scores[f.metric] !== null &&
      (f.labs.length === 0 || f.labs.includes(m.lab)) &&
      (!f.openOnly || m.openWeights) &&
      (q === "" || m.name.toLowerCase().includes(q) || m.id.includes(q)),
  );
}

/** Models no cheaper model matches or beats on the metric, cheapest first. */
export function valueFrontier(models: PricedModel[], metric: ScoreKind): PricedModel[] {
  const sorted = models
    .filter((m) => blendedPerMillion(m) > 0)
    .sort((a, b) => blendedPerMillion(a) - blendedPerMillion(b));
  const kept: PricedModel[] = [];
  for (const m of sorted) {
    const top = kept.at(-1);
    if (!top || (m.scores[metric] ?? 0) > (top.scores[metric] ?? 0)) kept.push(m);
  }
  return kept;
}

export function labsWithCounts(models: PricedModel[]): { lab: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const m of models) counts.set(m.lab, (counts.get(m.lab) ?? 0) + 1);
  return [...counts].map(([lab, count]) => ({ lab, count })).sort((a, b) => b.count - a.count);
}
