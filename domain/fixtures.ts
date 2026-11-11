import { priceModels } from "./cost";
import { NO_REQUIREMENTS } from "./rules";
import type { AllocationInput, Model, PricedModel, Task } from "./types";

/** Test-only builders. */
export function model(slug: string, over: Partial<Model> = {}): Model {
  return {
    slug,
    id: slug,
    name: `Lab: ${slug}`,
    description: "",
    lab: slug.split("/")[0],
    created: 0,
    promptPrice: 0.000001,
    completionPrice: 0.000005,
    contextLength: 200_000,
    openWeights: false,
    zdr: true,
    throughputRank: 0.5,
    structuredOutput: true,
    scores: { intelligence: 50, coding: 50, agentic: 50 },
    sessionCosts: [],
    popularFor: [],
    ...over,
  };
}

/** A model whose Claude Code median is `usd` in every bucket. */
export function flat(slug: string, usd: number, score: number, over: Partial<Model> = {}): Model {
  return model(slug, {
    scores: { intelligence: score, coding: score, agentic: score },
    sessionCosts: [{ app: "claude-code", byBucket: { "1": usd, "2-9": usd, "10-49": usd, "50+": usd } }],
    ...over,
  });
}

export const WINDOW = { days: 30, end: "2026-11-01" };

export function priced(models: Model[]): PricedModel[] {
  return priceModels(models, WINDOW);
}

export function task(id: string, over: Partial<Task> = {}): Task {
  return { id, title: id, detail: "", phase: "Build", type: "coding", size: "medium", ...over };
}

export function input(over: Partial<AllocationInput>): AllocationInput {
  return { tasks: [], models: [], budget: 100, requirements: NO_REQUIREMENTS, locks: {}, ...over };
}
