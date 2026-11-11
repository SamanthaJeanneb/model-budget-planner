import { describe, expect, it } from "vitest";
import { model } from "./fixtures";
import { newModelBrief, tagLabel } from "./newModel";

const old = model("acme/one", { created: 100, scores: { intelligence: 50, coding: 40, agentic: null } });
const fresh = model("acme/two", {
  created: 200,
  promptPrice: 0.0000005,
  completionPrice: 0.0000025,
  scores: { intelligence: 58, coding: 61, agentic: null },
  popularFor: ["code:frontend_ui"],
});
const rival = model("other/x", { created: 150, scores: { intelligence: 70, coding: 30, agentic: 20 } });

describe("newModelBrief", () => {
  const brief = newModelBrief(fresh, [old, fresh, rival]);

  it("ranks the model on each benchmark it has, strongest first", () => {
    expect(brief.ranks.map((r) => [r.kind, r.rank, r.of])).toEqual([
      ["coding", 1, 3],
      ["intelligence", 2, 3],
    ]);
  });

  it("compares with the same lab's previous scored release", () => {
    expect(brief.previous?.model.slug).toBe("acme/one");
    expect(brief.previous?.deltas).toEqual([
      { kind: "intelligence", delta: 8 },
      { kind: "coding", delta: 21 },
    ]);
    expect(brief.previous?.priceRatio).toBeCloseTo(0.5);
  });

  it("labels popular tags in plain words", () => {
    expect(brief.popularFor).toEqual(["Frontend UI"]);
    expect(tagLabel("agent:multi_step_planning")).toBe("Multi step planning");
  });

  it("has no previous release for a lab's first model", () => {
    expect(newModelBrief(old, [old, fresh]).previous).toBeNull();
  });
});
