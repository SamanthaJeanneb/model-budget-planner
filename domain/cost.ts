import { formatMoney, formatShortDate, shortName } from "./money";
import { APP_LABEL, BLENDED_PROMPT_SHARE, BUCKET_LABEL, LARGE_WORST_MULTIPLIER, SIZE_BUCKETS } from "./rules";
import type { CostRange, Model, PricedModel, SessionCost, TaskSize, TurnBucket } from "./types";

export type CostWindow = { days: number; end: string };

type Found = { row: SessionCost; typical: number; worstBase: number };

function blendedPrice(m: Model): number {
  return m.promptPrice * BLENDED_PROMPT_SHARE + m.completionPrice * (1 - BLENDED_PROMPT_SHARE);
}

function lookup(row: SessionCost, size: TaskSize): Found | null {
  const { typical, worst } = SIZE_BUCKETS[size];
  const t = row.byBucket[typical];
  const w = row.byBucket[worst];
  if (t === undefined || w === undefined) return null;
  return { row, typical: t, worstBase: w };
}

function firstRow(m: Model, size: TaskSize, app?: SessionCost["app"]): Found | null {
  for (const row of m.sessionCosts) {
    if (app && row.app !== app) continue;
    const found = lookup(row, size);
    if (found) return found;
  }
  return null;
}

/** The Claude Code model with the nearest blended price, measured on a log scale. */
function nearestReference(m: Model, size: TaskSize, models: Model[]) {
  const price = blendedPrice(m);
  let best: { model: Model; found: Found; distance: number } | null = null;
  for (const ref of models) {
    const refPrice = blendedPrice(ref);
    if (refPrice <= 0 || ref.slug === m.slug) continue;
    const found = firstRow(ref, size, "claude-code");
    if (!found) continue;
    const distance = price > 0 ? Math.abs(Math.log(price / refPrice)) : refPrice;
    if (!best || distance < best.distance) best = { model: ref, found, distance };
  }
  return best;
}

function worstOf(size: TaskSize, worstBase: number): number {
  return size === "large" ? worstBase * LARGE_WORST_MULTIPLIER : worstBase;
}

function mathLine(
  size: TaskSize,
  bucket: TurnBucket,
  app: SessionCost["app"],
  modelName: string,
  median: number,
  window: CostWindow,
  scale?: number,
): string {
  const head = `${size} → ${BUCKET_LABEL[bucket]} → ${APP_LABEL[app]} median for ${shortName(modelName)} = ${formatMoney(median)}`;
  const scaled =
    scale === undefined ? "" : ` × price ratio ${scale.toFixed(2)} = ${formatMoney(median * scale)}`;
  return `${head}${scaled} (${window.days} days to ${formatShortDate(window.end)})`;
}

/** Typical and worst-case cost of one task of this size on this model. */
export function taskCost(model: Model, size: TaskSize, models: Model[], window: CostWindow): CostRange {
  const bucket = SIZE_BUCKETS[size].typical;
  const worstIsRuleOfThumb = size === "large";

  const own = firstRow(model, size, "claude-code") ?? firstRow(model, size);
  if (own) {
    return {
      kind: "known",
      typical: own.typical,
      worst: worstOf(size, own.worstBase),
      source: own.row.app === "claude-code" ? "claude-code" : "other-agent",
      math: mathLine(size, bucket, own.row.app, model.name, own.typical, window),
      worstIsRuleOfThumb,
    };
  }

  const ref = nearestReference(model, size, models);
  if (!ref) return { kind: "unknown" };
  const scale = blendedPrice(model) / blendedPrice(ref.model);
  return {
    kind: "known",
    typical: ref.found.typical * scale,
    worst: worstOf(size, ref.found.worstBase) * scale,
    source: "price-scaled",
    math: mathLine(size, bucket, "claude-code", ref.model.name, ref.found.typical, window, scale),
    worstIsRuleOfThumb,
  };
}

/** Work out every model's cost for each task size once. */
export function priceModels(models: Model[], window: CostWindow): PricedModel[] {
  return models.map((m) => ({
    ...m,
    cost: {
      small: taskCost(m, "small", models, window),
      medium: taskCost(m, "medium", models, window),
      large: taskCost(m, "large", models, window),
    },
  }));
}
