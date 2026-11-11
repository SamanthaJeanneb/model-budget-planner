import type { TaskResult } from "@/domain/types";

/** Validated categorical order (no blue); a seventh model and beyond share grey. */
const PALETTE = ["#6250d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300"];
export const OTHER_MODEL = "#b9b5ae";

/**
 * One colour per model in the stack. Assigned by slug order so a model keeps its colour
 * while the budget moves other tasks around.
 */
export function modelColors(rows: TaskResult[]): Map<string, string> {
  const slugs = [...new Set(rows.flatMap((r) => (r.pick ? [r.pick.model.slug] : [])))].sort();
  return new Map(slugs.map((slug, i) => [slug, PALETTE[i] ?? OTHER_MODEL]));
}
