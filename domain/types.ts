export type ScoreKind = "intelligence" | "coding" | "agentic";
export type TaskType = "planning" | "coding" | "ui" | "tests" | "review" | "docs";
export type TaskSize = "small" | "medium" | "large";
export type TurnBucket = "1" | "2-9" | "10-49" | "50+";
export type AgentApp = "claude-code" | "codex" | "hermes-agent" | "kilo-code";

export type Scores = Record<ScoreKind, number | null>;

/** Median session cost in USD per turn bucket, for one agent app. */
export type SessionCost = {
  app: AgentApp;
  byBucket: Partial<Record<TurnBucket, number>>;
};

export type Model = {
  /** Canonical permaslug, e.g. anthropic/claude-opus-5.5-20260921. The join key. */
  slug: string;
  /** Routing id, e.g. anthropic/claude-opus-5.5. What configs and requests use. */
  id: string;
  name: string;
  /** OpenRouter's short description of the model. */
  description: string;
  lab: string;
  /** Unix seconds. */
  created: number;
  /** USD per token. */
  promptPrice: number;
  completionPrice: number;
  contextLength: number;
  openWeights: boolean;
  zdr: boolean;
  /** Fraction 0–1 of the catalogue ranked faster than this model; null when unranked. */
  throughputRank: number | null;
  structuredOutput: boolean;
  scores: Scores;
  /** One entry per agent app that has data, Claude Code first. */
  sessionCosts: SessionCost[];
  /** Task tags this model is among the most used for. */
  popularFor: string[];
};

/** A model with its cost per task size worked out once, when the catalogue loads. */
export type PricedModel = Model & { cost: Record<TaskSize, CostRange> };

export type Catalog = {
  models: PricedModel[];
  benchmarksAsOf: string;
  benchmarkCitation: string;
  costWindowDays: number;
  costWindowEnd: string;
  classificationsAsOf: string;
  modelsAsOf: string;
  workspaceId: string | null;
};

export type Task = {
  id: string;
  title: string;
  /** What the task covers and when it is done. */
  detail: string;
  /** The phase of the plan the task belongs to, e.g. "Foundation". */
  phase: string;
  type: TaskType;
  size: TaskSize;
};

export type Requirements = {
  minScore: Partial<Record<TaskType, number>>;
  openWeightsOnly: boolean;
  excludeLabs: string[];
  zdrOnly: boolean;
  minContext: number;
  fastOnly: boolean;
};

/** Task id → model slug the user picked or locked. */
export type Locks = Record<string, string>;

export type CostSource = "claude-code" | "other-agent" | "price-scaled";

export type CostRange =
  | {
      kind: "known";
      typical: number;
      worst: number;
      source: CostSource;
      math: string;
      worstIsRuleOfThumb: boolean;
    }
  | { kind: "unknown" };

export type Pick = {
  model: PricedModel;
  score: number;
  cost: Extract<CostRange, { kind: "known" }>;
};

export type SwapNote = "open-weights" | "chinese-lab";

export type TaskResult = {
  task: Task;
  pick: Pick | null;
  runnerUp: Pick | null;
  /** The pick with no budget limit. */
  best: Pick | null;
  pointsGivenUp: number;
  dollarsSaved: number;
  swapNotes: SwapNote[];
  /** The model was fixed by the user (swap or lock), not chosen by the allocator. */
  pinned: boolean;
  /** Every model this task may use, cheapest first. */
  options: Pick[];
};

export type Stack =
  | {
      kind: "fits";
      rows: TaskResult[];
      typical: number;
      worst: number;
      budget: number;
      worstExceedsBudget: boolean;
    }
  | { kind: "over"; rows: TaskResult[]; minimumBudget: number; budget: number };

export type AllocationInput = {
  tasks: Task[];
  models: PricedModel[];
  budget: number;
  requirements: Requirements;
  locks: Locks;
};
