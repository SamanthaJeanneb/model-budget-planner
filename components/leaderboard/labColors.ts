import type { PricedModel } from "@/domain/types";

/** Validated categorical order (no blue); labs past the sixth fold into grey "Other". */
const LAB_PALETTE = ["#6250d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300"];
export const OTHER = "#c4c1bb";

/** Colour per lab, assigned by how many of the shown models each lab has, so it follows the lab, not the rank. */
export function labColors(models: PricedModel[]): Map<string, string> {
  const counts = new Map<string, number>();
  for (const m of models) counts.set(m.lab, (counts.get(m.lab) ?? 0) + 1);
  const ordered = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([lab]) => lab);
  return new Map(ordered.slice(0, LAB_PALETTE.length).map((lab, i) => [lab, LAB_PALETTE[i]]));
}
