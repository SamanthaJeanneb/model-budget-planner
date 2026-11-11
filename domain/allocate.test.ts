import { describe, expect, it } from "vitest";
import { allocate, frontier } from "./allocate";
import { flat, input, priced, task } from "./fixtures";
import { requirementPrices } from "./requirements";
import { NO_REQUIREMENTS } from "./rules";

const models = priced([
  flat("cheap/a", 1, 40),
  flat("mid/b", 3, 60, { openWeights: true }),
  flat("qwen/c", 4, 65, { openWeights: true }),
  flat("top/d", 10, 80),
  flat("dominated/e", 5, 50),
]);
const tasks = [task("t1"), task("t2", { type: "planning" }), task("t3", { type: "docs" })];

function slugs(stack: ReturnType<typeof allocate>) {
  return stack.rows.map((r) => r.pick?.model.slug);
}

describe("frontier", () => {
  it("drops models a cheaper model beats", () => {
    const f = frontier(task("x"), models, NO_REQUIREMENTS).map((p) => p.model.slug);
    expect(f).toEqual(["cheap/a", "mid/b", "qwen/c", "top/d"]);
  });
});

describe("allocate", () => {
  it("never spends more than the budget", () => {
    for (const budget of [3, 5, 9, 12, 17, 25]) {
      const s = allocate(input({ tasks, models, budget }));
      expect(s.kind).toBe("fits");
      if (s.kind === "fits") expect(s.typical).toBeLessThanOrEqual(budget);
    }
  });

  it("reports the minimum workable budget when the cheapest stack does not fit", () => {
    const s = allocate(input({ tasks, models, budget: 2 }));
    expect(s).toMatchObject({ kind: "over", minimumBudget: 3 });
  });

  it("matches the no-limit stack at $10k", () => {
    const s = allocate(input({ tasks, models, budget: 10_000 }));
    expect(slugs(s)).toEqual(["top/d", "top/d", "top/d"]);
    expect(s.rows.every((r) => r.pointsGivenUp === 0)).toBe(true);
  });

  it("holds locks and takes their cost off the budget", () => {
    const s = allocate(input({ tasks, models, budget: 14, locks: { t1: "top/d" } }));
    expect(s.rows[0].pick?.model.slug).toBe("top/d");
    expect(s.rows[0].pinned).toBe(true);
    if (s.kind === "fits") expect(s.typical).toBeLessThanOrEqual(14);
  });

  it("applies requirements", () => {
    const s = allocate(
      input({ tasks, models, budget: 10_000, requirements: { ...NO_REQUIREMENTS, openWeightsOnly: true } }),
    );
    expect(slugs(s)).toEqual(["qwen/c", "qwen/c", "qwen/c"]);
    expect(s.rows[0].swapNotes).toEqual([]);
  });

  it("notes when the pick is open-weights or a Chinese lab and the best is not", () => {
    const s = allocate(input({ tasks: [task("t1")], models, budget: 4 }));
    expect(s.rows[0].pick?.model.slug).toBe("qwen/c");
    expect(s.rows[0].swapNotes).toEqual(["open-weights", "chinese-lab"]);
    expect(s.rows[0].pointsGivenUp).toBe(15);
    expect(s.rows[0].dollarsSaved).toBe(6);
  });

  it("warns when the worst case exceeds the budget", () => {
    const spiky = priced([
      flat("a/a", 1, 50, {
        sessionCosts: [{ app: "claude-code", byBucket: { "10-49": 1, "50+": 9 } }],
      }),
    ]);
    const s = allocate(input({ tasks: [task("t1")], models: spiky, budget: 2 }));
    expect(s).toMatchObject({ kind: "fits", worst: 9, worstExceedsBudget: true });
  });

  it("is total: a task with no allowed model gets no pick", () => {
    const s = allocate(
      input({ tasks, models, requirements: { ...NO_REQUIREMENTS, minScore: { coding: 99 } } }),
    );
    expect(s.rows[0].pick).toBeNull();
  });
});

describe("requirementPrices", () => {
  it("prices a requirement as the no-limit stack cost with it minus without it", () => {
    const prices = requirementPrices(
      input({ tasks, models, requirements: { ...NO_REQUIREMENTS, openWeightsOnly: true } }),
    );
    expect(prices.openWeightsOnly).toBe(12 - 30);
  });
});
