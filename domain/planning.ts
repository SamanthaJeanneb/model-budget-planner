import { PLAN_FALLBACK_COUNT } from "./rules";
import type { Model } from "./types";

/** Models that can plan: an intelligence score and structured output, best first. */
export function planningModels<M extends Model>(models: M[]): M[] {
  return models
    .filter((m) => m.scores.intelligence !== null && m.structuredOutput)
    .sort((a, b) => (b.scores.intelligence ?? 0) - (a.scores.intelligence ?? 0));
}

/** The chosen planning model followed by the next ones down the list, as routing ids. */
export function planningRoute(models: Model[], chosenId: string): string[] | null {
  const list = planningModels(models);
  const i = list.findIndex((m) => m.id === chosenId);
  if (i === -1) return null;
  return list.slice(i, i + 1 + PLAN_FALLBACK_COUNT).map((m) => m.id);
}

export const PLAN_SYSTEM_PROMPT = [
  "You are a senior engineer writing an implementation plan that coding agents will carry out.",
  "First write `summary`: two or three sentences on the approach, the main technical choices and what done looks like.",
  "Then list 5 to 14 `tasks` in the order they should be done, grouped into 2 to 5 phases",
  "(short phase names such as Foundation, Core features, Interface, Hardening, Launch). Tasks of one phase are consecutive.",
  "Each task has: phase; a short imperative title;",
  "detail: one or two sentences on exactly what to build and how to know it is done;",
  "type: planning (architecture, breaking work down), coding (back end, logic, data), ui (front end, styling),",
  "tests (writing and fixing tests, debugging), review (code or security review), docs (README, guides);",
  "size: small (under 10 agent turns), medium (10 to 49 turns), large (50 or more turns).",
  "Base everything on the user's project; do not invent requirements they did not imply.",
].join("\n");
