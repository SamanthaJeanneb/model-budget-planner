import { allocate, stackTotal } from "./allocate";
import { NO_REQUIREMENTS } from "./rules";
import type { AllocationInput, Requirements, TaskType } from "./types";

export type RequirementKey =
  `minScore:${TaskType}` | "openWeightsOnly" | "excludeLabs" | "zdrOnly" | "minContext" | "fastOnly";

/** The requirements with one of them switched off. */
function without(r: Requirements, key: RequirementKey): Requirements {
  if (key.startsWith("minScore:")) {
    const type = key.slice("minScore:".length) as TaskType;
    const minScore = { ...r.minScore };
    delete minScore[type];
    return { ...r, minScore };
  }
  switch (key) {
    case "openWeightsOnly":
      return { ...r, openWeightsOnly: false };
    case "excludeLabs":
      return { ...r, excludeLabs: [] };
    case "zdrOnly":
      return { ...r, zdrOnly: false };
    case "minContext":
      return { ...r, minContext: 0 };
    case "fastOnly":
      return { ...r, fastOnly: false };
  }
  return r;
}

export function activeRequirements(r: Requirements): RequirementKey[] {
  const keys: RequirementKey[] = [];
  for (const [type, value] of Object.entries(r.minScore)) {
    if (value !== undefined && value > 0) keys.push(`minScore:${type as TaskType}`);
  }
  if (r.openWeightsOnly) keys.push("openWeightsOnly");
  if (r.excludeLabs.length > 0) keys.push("excludeLabs");
  if (r.zdrOnly) keys.push("zdrOnly");
  if (r.minContext > NO_REQUIREMENTS.minContext) keys.push("minContext");
  if (r.fastOnly) keys.push("fastOnly");
  return keys;
}

/**
 * For each active requirement: stack cost with it minus stack cost without it.
 * Measured on the no-budget-limit stack; under a budget both stacks spend up to the cap,
 * so the difference would hide in score instead of dollars.
 */
export function requirementPrices(input: AllocationInput): Partial<Record<RequirementKey, number>> {
  const unlimited = { ...input, budget: Number.POSITIVE_INFINITY };
  const withAll = stackTotal(allocate(unlimited));
  const prices: Partial<Record<RequirementKey, number>> = {};
  for (const key of activeRequirements(input.requirements)) {
    const relaxed = allocate({ ...unlimited, requirements: without(input.requirements, key) });
    prices[key] = withAll - stackTotal(relaxed);
  }
  return prices;
}
