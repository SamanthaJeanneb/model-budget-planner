import { describe, expect, it } from "vitest";
import { allocate } from "./allocate";
import { claudeCodeFiles, clineExport, openCodeFiles, spendingCapCommand } from "./export";
import { flat, input, priced, task } from "./fixtures";
import { extractSummary, extractTasks } from "./planStream";

const models = priced([flat("cheap/a", 1, 40), flat("top/d", 10, 80)]);
const rows = allocate(
  input({
    tasks: [task("t1", { type: "planning", title: "Plan" }), task("t2", { title: "Build" })],
    models,
    budget: 11,
  }),
).rows;

describe("exports", () => {
  it("groups the CLAUDE.md task list by phase", () => {
    const md = claudeCodeFiles(rows).find((f) => f.path === "CLAUDE.md")?.content ?? "";
    expect(md).toContain("### Build");
  });

  it("writes one Claude Code helper per task type with a full model id", () => {
    const files = claudeCodeFiles(rows);
    expect(files.map((f) => f.path)).toEqual([
      ".claude/agents/planning.md",
      ".claude/agents/coding.md",
      ".claude/settings.local.json",
      "CLAUDE.md",
    ]);
    expect(files[0].content).toMatch(/^---\nname: planning\n/);
    const settings = JSON.parse(files[2].content);
    expect(settings.env.ANTHROPIC_BASE_URL).toBe("https://openrouter.ai/api");
  });

  it("maps Cline plan and act modes", () => {
    const cline = clineExport(rows);
    expect(cline?.files[0].path).toBe(".clinerules/plan.md");
    expect(cline?.planModel.slug).toBeDefined();
  });

  it("writes an OpenCode config with one agent per type", () => {
    const config = JSON.parse(openCodeFiles(rows)[0].content);
    expect(Object.keys(config.agents)).toEqual(["planning", "coding"]);
    expect(config.agents.coding.model).toMatch(/^openrouter\//);
  });

  it("builds the spending-cap command", () => {
    expect(spendingCapCommand("ws-1", 20)).toContain("/workspaces/ws-1/budgets/lifetime");
  });
});

describe("extractTasks", () => {
  it("returns only complete task objects from a partial stream", () => {
    const partial =
      '{"summary": "Use [Next.js] {and} Postgres.", "tasks": [{"phase": "Core", "title": "A {x}", "detail": "Do A.", "type": "coding", "size": "small"}, {"title": "B", "ty';
    expect(extractTasks(partial)).toEqual([
      { id: "t1", title: "A {x}", detail: "Do A.", phase: "Core", type: "coding", size: "small" },
    ]);
  });

  it("reads the summary once it is complete", () => {
    expect(extractSummary('{"summary": "Use \\"Next\\" and Postgres.", "tas')).toBe(
      'Use "Next" and Postgres.',
    );
    expect(extractSummary('{"summary": "Use Ne')).toBeNull();
  });

  it("skips objects that fail the schema", () => {
    const text =
      '{"tasks":[{"title":"A","type":"cooking","size":"small"},{"title":"B","type":"docs","size":"large"}]}';
    expect(extractTasks(text).map((t) => t.title)).toEqual(["B"]);
  });
});
