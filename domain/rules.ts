import type { AgentApp, Requirements, ScoreKind, TaskSize, TaskType, TurnBucket } from "./types";

export const TASK_TYPES: TaskType[] = ["planning", "coding", "ui", "tests", "review", "docs"];

export const TASK_LABEL: Record<TaskType, string> = {
  planning: "Planning",
  coding: "Coding",
  ui: "UI",
  tests: "Tests",
  review: "Review",
  docs: "Docs",
};

/** The score each task type is picked on. */
export const TASK_SCORE: Record<TaskType, ScoreKind> = {
  planning: "intelligence",
  coding: "coding",
  ui: "coding",
  tests: "agentic",
  review: "intelligence",
  docs: "intelligence",
};

/** The classification tag behind the "Popular" badge. */
export const TASK_POPULAR_TAG: Record<TaskType, string> = {
  planning: "agent:multi_step_planning",
  coding: "code:general_impl",
  ui: "code:frontend_ui",
  tests: "code:debugging",
  review: "code:review_security",
  docs: "content_writing",
};

/** Task size → turn bucket for the typical cost, and for the worst case. */
export const SIZE_BUCKETS: Record<TaskSize, { typical: TurnBucket; worst: TurnBucket }> = {
  small: { typical: "2-9", worst: "10-49" },
  medium: { typical: "10-49", worst: "50+" },
  large: { typical: "50+", worst: "50+" },
};

/** Large tasks have no bucket above 50+, so the worst case is this multiple of it. */
export const LARGE_WORST_MULTIPLIER = 2;

export const BUCKET_LABEL: Record<TurnBucket, string> = {
  "1": "1 turn",
  "2-9": "2–9 turns",
  "10-49": "10–49 turns",
  "50+": "50+ turns",
};

export const API_TURN_RANGE: Record<string, TurnBucket> = {
  "1-turn": "1",
  "2-9-turns": "2-9",
  "10-49-turns": "10-49",
  "50-plus-turns": "50+",
};

export const AGENT_APPS: AgentApp[] = ["claude-code", "codex", "hermes-agent", "kilo-code"];

export const APP_LABEL: Record<AgentApp, string> = {
  "claude-code": "Claude Code",
  codex: "Codex",
  "hermes-agent": "Hermes Agent",
  "kilo-code": "Kilo Code",
};

/** Agent sessions are mostly input; blended price weights prompt tokens this much. */
export const BLENDED_PROMPT_SHARE = 0.9;

export const CHINESE_LABS = [
  "qwen",
  "deepseek",
  "z-ai",
  "moonshotai",
  "baidu",
  "tencent",
  "bytedance-seed",
  "minimax",
  "xiaomi",
  "stepfun",
  "inclusionai",
];

/** A model counts as new for this many days after release. */
export const NEW_WINDOW_DAYS = 14;

/** "Fast only" keeps models in this top fraction of the throughput ranking. */
export const FAST_FRACTION = 1 / 3;

export const BUDGET_MIN = 1;
export const BUDGET_MAX = 10_000;
export const DEFAULT_BUDGET = 20;

export const CONTEXT_OPTIONS = [0, 128_000, 200_000, 400_000, 1_000_000];

export const NO_REQUIREMENTS: Requirements = {
  minScore: {},
  openWeightsOnly: false,
  excludeLabs: [],
  zdrOnly: false,
  minContext: 0,
  fastOnly: false,
};

/** Fallback models sent with each planning request after the pick. */
export const PLAN_FALLBACK_COUNT = 2;

/** A model is "popular" for a tag when it is in that tag's top N by usage. */
export const POPULAR_TOP_N = 5;

/** Budget presets offered as one-click values. */
export const BUDGET_PRESETS = [5, 20, 50, 100, 500];
