import { allocate, stackTotal } from "./allocate";
import type { AllocationInput, PricedModel, TaskResult } from "./types";

/** What the best allowed stack costs with no budget limit. */
export function topStackCost(input: AllocationInput): number {
  return stackTotal(allocate({ ...input, budget: Number.POSITIVE_INFINITY }));
}

/** Distinct models the stack uses. */
export function modelCount(rows: TaskResult[]): number {
  return new Set(rows.flatMap((r) => (r.pick ? [r.pick.model.slug] : []))).size;
}

export type ModelShare = {
  model: PricedModel;
  rows: TaskResult[];
  typical: number;
  worst: number;
  /** Fraction of the stack's typical spend. */
  share: number;
};

/** Which model handles which tasks, and its part of the spend; biggest spender first. */
export function spendByModel(rows: TaskResult[]): ModelShare[] {
  const map = new Map<string, ModelShare>();
  for (const row of rows) {
    if (!row.pick) continue;
    const e = map.get(row.pick.model.slug) ?? {
      model: row.pick.model,
      rows: [],
      typical: 0,
      worst: 0,
      share: 0,
    };
    e.rows.push(row);
    e.typical += row.pick.cost.typical;
    e.worst += row.pick.cost.worst;
    map.set(row.pick.model.slug, e);
  }
  const list = [...map.values()];
  const total = list.reduce((s, e) => s + e.typical, 0);
  for (const e of list) e.share = total > 0 ? e.typical / total : 0;
  return list.sort((a, b) => b.typical - a.typical);
}

/** Phases in the order their first task appears. */
export function phasesOf(rows: TaskResult[]): { phase: string; rows: TaskResult[]; typical: number }[] {
  const order = [...new Set(rows.map((r) => r.task.phase))];
  return order.map((phase) => {
    const own = rows.filter((r) => r.task.phase === phase);
    return { phase, rows: own, typical: own.reduce((s, r) => s + (r.pick?.cost.typical ?? 0), 0) };
  });
}
