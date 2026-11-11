import { describe, expect, it } from "vitest";
import { allocate } from "./allocate";
import { flat, input, priced, task } from "./fixtures";
import { phasesOf, spendByModel, topStackCost } from "./summary";

const models = priced([flat("cheap/a", 1, 40), flat("top/d", 10, 80)]);
const tasks = [task("t1", { type: "docs" }), task("t2"), task("t3")];

describe("summary", () => {
  it("prices the no-limit stack", () => {
    expect(topStackCost(input({ tasks, models, budget: 3 }))).toBe(30);
  });

  it("splits spend by model with shares that add to one", () => {
    const rows = allocate(input({ tasks, models, budget: 12 })).rows;
    const shares = spendByModel(rows);
    expect(shares[0].model.slug).toBe("top/d");
    expect(shares.reduce((s, e) => s + e.share, 0)).toBeCloseTo(1);
  });

  it("keeps phases in first-appearance order", () => {
    const phased = [task("a", { phase: "Two" }), task("b", { phase: "One" }), task("c", { phase: "Two" })];
    const rows = allocate(input({ tasks: phased, models, budget: 3 })).rows;
    expect(phasesOf(rows).map((p) => [p.phase, p.rows.length])).toEqual([
      ["Two", 2],
      ["One", 1],
    ]);
  });
});
