import { isChineseLab, meetsModelRequirements, scoreFor } from "./score";
import type {
  AllocationInput,
  Pick,
  PricedModel,
  Requirements,
  Stack,
  SwapNote,
  Task,
  TaskResult,
} from "./types";

/** Float slack so a stack that costs exactly the budget still fits. */
const EPSILON = 1e-9;

function pickFor(model: PricedModel, task: Task): Pick | null {
  const score = scoreFor(model, task.type);
  const cost = model.cost[task.size];
  if (score === null || cost.kind !== "known") return null;
  return { model, score, cost };
}

/** Allowed models for a task that no cheaper model matches or beats, cheapest first. */
export function frontier(task: Task, models: PricedModel[], r: Requirements): Pick[] {
  const minScore = r.minScore[task.type] ?? 0;
  const picks = models
    .filter((m) => meetsModelRequirements(m, r))
    .map((m) => pickFor(m, task))
    .filter((p): p is Pick => p !== null && p.score >= minScore)
    .sort((a, b) => a.cost.typical - b.cost.typical || b.score - a.score);
  const kept: Pick[] = [];
  for (const p of picks) {
    const top = kept.at(-1);
    if (!top || p.score > top.score) kept.push(p);
  }
  return kept;
}

function swapNotes(pick: Pick, best: Pick): SwapNote[] {
  if (pick.model.slug === best.model.slug) return [];
  const notes: SwapNote[] = [];
  if (pick.model.openWeights && !best.model.openWeights) notes.push("open-weights");
  if (isChineseLab(pick.model) && !isChineseLab(best.model)) notes.push("chinese-lab");
  return notes;
}

type Slot = { task: Task; options: Pick[]; index: number; locked: Pick | null };

function lockedPick(task: Task, input: AllocationInput): Pick | null {
  const slug = input.locks[task.id];
  const model = slug ? input.models.find((m) => m.slug === slug) : undefined;
  return model ? pickFor(model, task) : null;
}

function current(slot: Slot): Pick | null {
  return slot.locked ?? slot.options[slot.index] ?? null;
}

/** Repeatedly take the upgrade with the most points per extra dollar that still fits. */
function upgrade(slots: Slot[], budget: number, spent: number): void {
  for (;;) {
    let best: { slot: Slot; to: number; extra: number; ratio: number } | null = null;
    for (const slot of slots) {
      if (slot.locked) continue;
      const from = slot.options[slot.index];
      if (!from) continue;
      for (let to = slot.index + 1; to < slot.options.length; to++) {
        const next = slot.options[to];
        const extra = next.cost.typical - from.cost.typical;
        if (spent + extra > budget + EPSILON) continue;
        const ratio = (next.score - from.score) / Math.max(extra, EPSILON);
        if (!best || ratio > best.ratio || (ratio === best.ratio && extra < best.extra))
          best = { slot, to, extra, ratio };
      }
    }
    if (!best) return;
    best.slot.index = best.to;
    spent += best.extra;
  }
}

function toResult(slot: Slot): TaskResult {
  const pick = current(slot);
  const best = slot.options.at(-1) ?? null;
  const i = pick ? slot.options.findIndex((o) => o.model.slug === pick.model.slug) : -1;
  const runnerUp = i === -1 ? (best ?? null) : (slot.options[i + 1] ?? slot.options[i - 1] ?? null);
  const gap = pick && best && best.score > pick.score;
  return {
    task: slot.task,
    pick,
    runnerUp: runnerUp && runnerUp.model.slug !== pick?.model.slug ? runnerUp : null,
    best,
    pointsGivenUp: gap ? best.score - pick.score : 0,
    dollarsSaved: gap ? best.cost.typical - pick.cost.typical : 0,
    swapNotes: pick && best ? swapNotes(pick, best) : [],
    pinned: slot.locked !== null,
    options: slot.options,
  };
}

function sum(slots: Slot[], key: "typical" | "worst"): number {
  return slots.reduce((total, s) => total + (current(s)?.cost[key] ?? 0), 0);
}

export function allocate(input: AllocationInput): Stack {
  const slots: Slot[] = input.tasks.map((task) => ({
    task,
    options: frontier(task, input.models, input.requirements),
    index: 0,
    locked: lockedPick(task, input),
  }));

  const floor = sum(slots, "typical");
  if (floor > input.budget + EPSILON) {
    return {
      kind: "over",
      rows: slots.map(toResult),
      minimumBudget: floor,
      budget: input.budget,
    };
  }

  upgrade(slots, input.budget, floor);
  const worst = sum(slots, "worst");
  return {
    kind: "fits",
    rows: slots.map(toResult),
    typical: sum(slots, "typical"),
    worst,
    budget: input.budget,
    worstExceedsBudget: worst > input.budget + EPSILON,
  };
}

export function stackTotal(stack: Stack): number {
  return stack.kind === "fits" ? stack.typical : stack.minimumBudget;
}
