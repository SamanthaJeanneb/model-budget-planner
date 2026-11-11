import { CHINESE_LABS, FAST_FRACTION, NEW_WINDOW_DAYS, TASK_SCORE } from "./rules";
import type { Model, Requirements, ScoreKind, TaskType } from "./types";

/** The task's own score, falling back to intelligence when it is missing. */
export function scoreFor(model: Model, type: TaskType): number | null {
  return model.scores[TASK_SCORE[type]] ?? model.scores.intelligence;
}

export function strongestScore(model: Model): { kind: ScoreKind; value: number } | null {
  let best: { kind: ScoreKind; value: number } | null = null;
  for (const kind of ["intelligence", "coding", "agentic"] as const) {
    const value = model.scores[kind];
    if (value !== null && (!best || value > best.value)) best = { kind, value };
  }
  return best;
}

export function isNew(model: Model, nowSeconds: number): boolean {
  return nowSeconds - model.created <= NEW_WINDOW_DAYS * 86_400;
}

export function isChineseLab(model: Model): boolean {
  return CHINESE_LABS.includes(model.lab);
}

/** Requirements that apply to the model regardless of task. */
export function meetsModelRequirements(model: Model, r: Requirements): boolean {
  if (r.openWeightsOnly && !model.openWeights) return false;
  if (r.excludeLabs.includes(model.lab)) return false;
  if (r.zdrOnly && !model.zdr) return false;
  if (model.contextLength < r.minContext) return false;
  if (r.fastOnly && (model.throughputRank === null || model.throughputRank >= FAST_FRACTION)) return false;
  return true;
}
