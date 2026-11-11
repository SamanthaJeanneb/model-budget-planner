import { describe, expect, it } from "vitest";
import { taskCost } from "./cost";
import { model, WINDOW } from "./fixtures";

const opus = model("anthropic/opus", {
  name: "Anthropic: Claude Opus 5.5",
  promptPrice: 0.000004,
  completionPrice: 0.00002,
  sessionCosts: [{ app: "claude-code", byBucket: { "2-9": 0.4, "10-49": 1.32, "50+": 5 } }],
});

describe("taskCost", () => {
  it("uses the task's bucket and the next one up", () => {
    const c = taskCost(opus, "medium", [opus], WINDOW);
    expect(c).toMatchObject({ kind: "known", typical: 1.32, worst: 5, source: "claude-code" });
  });

  it("writes the math line", () => {
    const c = taskCost(opus, "medium", [opus], WINDOW);
    expect(c.kind === "known" && c.math).toBe(
      "medium → 10–49 turns → Claude Code median for Claude Opus 5.5 = $1.32 (30 days to 1 Nov)",
    );
  });

  it("doubles the 50+ median for large tasks and flags it", () => {
    const c = taskCost(opus, "large", [opus], WINDOW);
    expect(c).toMatchObject({ typical: 5, worst: 10, worstIsRuleOfThumb: true });
  });

  it("falls back to another agent's row", () => {
    const codexOnly = model("openai/x", {
      sessionCosts: [{ app: "codex", byBucket: { "2-9": 0.1, "10-49": 0.3 } }],
    });
    expect(taskCost(codexOnly, "small", [codexOnly], WINDOW)).toMatchObject({
      typical: 0.1,
      worst: 0.3,
      source: "other-agent",
    });
  });

  it("scales a reference model by price when there is no row", () => {
    const half = model("x/half", { promptPrice: 0.000002, completionPrice: 0.00001 });
    const c = taskCost(half, "medium", [opus, half], WINDOW);
    expect(c.kind).toBe("known");
    if (c.kind !== "known") return;
    expect(c.source).toBe("price-scaled");
    expect(c.typical).toBeCloseTo(0.66);
    expect(c.math).toContain("price ratio 0.50");
  });

  it("returns unknown when nothing can be priced", () => {
    const lone = model("x/lone");
    expect(taskCost(lone, "small", [lone], WINDOW)).toEqual({ kind: "unknown" });
  });
});
