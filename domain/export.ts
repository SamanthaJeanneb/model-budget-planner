import { TASK_LABEL, TASK_TYPES } from "./rules";
import type { PricedModel, TaskResult, TaskType } from "./types";

export type ExportFile = { path: string; content: string };

/** One model per task type: the one used by most of its tasks, then the higher score. */
export function modelsByType(rows: TaskResult[]): Partial<Record<TaskType, PricedModel>> {
  const out: Partial<Record<TaskType, PricedModel>> = {};
  for (const type of TASK_TYPES) {
    const counts = new Map<string, { model: PricedModel; n: number; score: number }>();
    for (const row of rows) {
      if (row.task.type !== type || !row.pick) continue;
      const entry = counts.get(row.pick.model.slug) ?? { model: row.pick.model, n: 0, score: row.pick.score };
      entry.n++;
      counts.set(row.pick.model.slug, entry);
    }
    const best = [...counts.values()].sort((a, b) => b.n - a.n || b.score - a.score)[0];
    if (best) out[type] = best.model;
  }
  return out;
}

/** The plan as Markdown: one heading per phase, each task with its helper and what done means. */
function taskList(rows: TaskResult[]): string {
  const phases = [...new Set(rows.map((r) => r.task.phase))];
  return phases
    .map((phase) => {
      const tasks = rows
        .filter((r) => r.task.phase === phase && r.pick)
        .map((r) => {
          const head = `- [${TASK_LABEL[r.task.type]}] ${r.task.title} (${r.task.size})`;
          return r.task.detail ? `${head}\n  ${r.task.detail}` : head;
        });
      return [`### ${phase}`, "", ...tasks].join("\n");
    })
    .join("\n\n");
}

/** Main model: the planning model, else the model of the first task. */
function mainModel(rows: TaskResult[]): PricedModel | null {
  const byType = modelsByType(rows);
  return byType.planning ?? rows.find((r) => r.pick)?.pick?.model ?? null;
}

function byPriceDesc(rows: TaskResult[]): PricedModel[] {
  const seen = new Map<string, PricedModel>();
  for (const r of rows) if (r.pick) seen.set(r.pick.model.slug, r.pick.model);
  return [...seen.values()].sort((a, b) => b.promptPrice - a.promptPrice);
}

export function claudeCodeFiles(rows: TaskResult[]): ExportFile[] {
  const byType = modelsByType(rows);
  const main = mainModel(rows);
  const ranked = byPriceDesc(rows);
  if (!main || ranked.length === 0) return [];
  const top = ranked[0];
  const middle = ranked[Math.floor(ranked.length / 2)];
  const bottom = ranked[ranked.length - 1];

  const agents = TASK_TYPES.flatMap((type) => {
    const model = byType[type];
    if (!model) return [];
    const titles = rows.filter((r) => r.task.type === type).map((r) => r.task.title);
    const content = [
      "---",
      `name: ${type}`,
      `description: Use for ${TASK_LABEL[type].toLowerCase()} tasks in this project: ${titles.join("; ")}.`,
      `model: ${model.id}`,
      "---",
      "",
      `You handle the ${TASK_LABEL[type].toLowerCase()} tasks in this project's plan (see CLAUDE.md).`,
      "Do the task you are given, keep changes scoped to it, and report what you changed.",
      "",
    ].join("\n");
    return [{ path: `.claude/agents/${type}.md`, content }];
  });

  const settings = {
    model: main.id,
    env: {
      ANTHROPIC_BASE_URL: "https://openrouter.ai/api",
      ANTHROPIC_AUTH_TOKEN: "<your OpenRouter API key>",
      ANTHROPIC_API_KEY: "",
      ANTHROPIC_DEFAULT_FABLE_MODEL: top.id,
      ANTHROPIC_DEFAULT_OPUS_MODEL: top.id,
      ANTHROPIC_DEFAULT_SONNET_MODEL: middle.id,
      ANTHROPIC_DEFAULT_HAIKU_MODEL: bottom.id,
    },
  };

  const claudeMd = [
    "## Plan",
    "",
    taskList(rows),
    "",
    "Hand each task to the matching helper in .claude/agents (planning, coding, ui, tests, review, docs).",
    "",
  ].join("\n");

  return [
    ...agents,
    { path: ".claude/settings.local.json", content: `${JSON.stringify(settings, null, 2)}\n` },
    { path: "CLAUDE.md", content: claudeMd },
  ];
}

export type ClineExport = { planModel: PricedModel; actModel: PricedModel; files: ExportFile[] };

export function clineExport(rows: TaskResult[]): ClineExport | null {
  const byType = modelsByType(rows);
  const planModel = mainModel(rows);
  const actModel = byType.coding ?? byType.ui ?? byType.tests ?? planModel;
  if (!planModel || !actModel) return null;
  const rules = [
    "# Project plan",
    "",
    taskList(rows),
    "",
    "Work through the tasks in order. Plan in Plan mode, then switch to Act mode to make changes.",
    "",
  ].join("\n");
  return { planModel, actModel, files: [{ path: ".clinerules/plan.md", content: rules }] };
}

export function openCodeFiles(rows: TaskResult[]): ExportFile[] {
  const byType = modelsByType(rows);
  const main = mainModel(rows);
  if (!main) return [];
  const agents: Record<string, { description: string; mode: "subagent"; model: string; system: string }> = {};
  for (const type of TASK_TYPES) {
    const model = byType[type];
    if (!model) continue;
    const titles = rows.filter((r) => r.task.type === type).map((r) => r.task.title);
    agents[type] = {
      description: `${TASK_LABEL[type]} tasks: ${titles.join("; ")}`,
      mode: "subagent",
      model: `openrouter/${model.id}`,
      system: `You handle the ${TASK_LABEL[type].toLowerCase()} tasks in this project's plan. Keep changes scoped to the task.`,
    };
  }
  const config = {
    $schema: "https://opencode.ai/config.json",
    model: `openrouter/${main.id}`,
    agents,
  };
  return [{ path: "opencode.json", content: `${JSON.stringify(config, null, 2)}\n` }];
}

/** The one command that sets the spending cap. Needs a management key. */
export function spendingCapCommand(workspaceId: string | null, budget: number): string {
  const workspace = workspaceId ?? "<workspace id>";
  const limit = Math.ceil(budget * 100) / 100;
  return [
    `curl -X PUT "https://openrouter.ai/api/v1/workspaces/${workspace}/budgets/lifetime" \\`,
    `  -H "Authorization: Bearer $OPENROUTER_MANAGEMENT_KEY" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '{"limit_usd": ${limit}}'`,
  ].join("\n");
}
