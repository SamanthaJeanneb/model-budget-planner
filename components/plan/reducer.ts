import { DEFAULT_BUDGET, NO_REQUIREMENTS } from "@/domain/rules";
import type { Locks, Requirements, Task } from "@/domain/types";

export type PlanError = "invalid-brief" | "unknown-model" | "no-tasks" | "failed";

export type PlanState = {
  brief: string;
  planningModel: string;
  status: "idle" | "planning" | "error";
  error: PlanError | null;
  /** The planning model's summary of the approach; editable. */
  summary: string;
  tasks: Task[];
  budget: number;
  requirements: Requirements;
  /** Task id → model slug the user picked. Locked tasks are also listed in `locked`. */
  choices: Locks;
  locked: string[];
};

export type PlanAction =
  | { type: "reset" }
  | { type: "brief"; brief: string }
  | { type: "planningModel"; id: string }
  | { type: "planStart" }
  | { type: "planSummary"; text: string }
  | { type: "planTask"; task: Task }
  | { type: "summary"; text: string }
  | { type: "moveTask"; id: string; by: -1 | 1 }
  | { type: "renamePhase"; from: string; to: string }
  | { type: "planDone" }
  | { type: "planFail"; error: PlanError }
  | { type: "addTask"; task: Task }
  | { type: "updateTask"; id: string; patch: Partial<Omit<Task, "id">> }
  | { type: "removeTask"; id: string }
  | { type: "budget"; budget: number }
  | { type: "requirements"; patch: Partial<Requirements> }
  | { type: "choose"; taskId: string; slug: string | null }
  | { type: "lock"; taskId: string; slug: string }
  | { type: "unlock"; taskId: string };

export function initialState(planningModel: string): PlanState {
  return {
    brief: "",
    planningModel,
    status: "idle",
    error: null,
    summary: "",
    tasks: [],
    budget: DEFAULT_BUDGET,
    requirements: NO_REQUIREMENTS,
    choices: {},
    locked: [],
  };
}

function withoutKey(locks: Locks, key: string): Locks {
  const next = { ...locks };
  delete next[key];
  return next;
}

/** Swap a task with its neighbour in the same phase. */
function moveWithinPhase(tasks: Task[], id: string, by: -1 | 1): Task[] {
  const i = tasks.findIndex((t) => t.id === id);
  if (i === -1) return tasks;
  let j = i + by;
  while (j >= 0 && j < tasks.length && tasks[j].phase !== tasks[i].phase) j += by;
  if (j < 0 || j >= tasks.length) return tasks;
  const next = [...tasks];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** Insert a new task after the last task of its phase, or at the end. */
function insertInPhase(tasks: Task[], task: Task): Task[] {
  const last = tasks.map((t) => t.phase).lastIndexOf(task.phase);
  if (last === -1) return [...tasks, task];
  return [...tasks.slice(0, last + 1), task, ...tasks.slice(last + 1)];
}

export function reducer(state: PlanState, action: PlanAction): PlanState {
  switch (action.type) {
    case "reset":
      return { ...initialState(state.planningModel), budget: state.budget, requirements: state.requirements };
    case "brief":
      return { ...state, brief: action.brief };
    case "planningModel":
      return { ...state, planningModel: action.id };
    case "planStart":
      return { ...state, status: "planning", error: null, summary: "", tasks: [], choices: {}, locked: [] };
    case "planSummary":
    case "summary":
      return { ...state, summary: action.text };
    case "moveTask":
      return { ...state, tasks: moveWithinPhase(state.tasks, action.id, action.by) };
    case "renamePhase":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.phase === action.from ? { ...t, phase: action.to } : t)),
      };
    case "planTask":
      return { ...state, tasks: [...state.tasks, action.task] };
    case "planDone":
      return { ...state, status: "idle" };
    case "planFail":
      return { ...state, status: "error", error: action.error };
    case "addTask":
      return { ...state, tasks: insertInPhase(state.tasks, action.task) };
    case "updateTask":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t)),
      };
    case "removeTask":
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.id),
        choices: withoutKey(state.choices, action.id),
        locked: state.locked.filter((id) => id !== action.id),
      };
    case "budget":
      return { ...state, budget: action.budget };
    case "requirements":
      return { ...state, requirements: { ...state.requirements, ...action.patch } };
    case "choose":
      return {
        ...state,
        choices:
          action.slug === null
            ? withoutKey(state.choices, action.taskId)
            : { ...state.choices, [action.taskId]: action.slug },
      };
    case "lock":
      return {
        ...state,
        choices: { ...state.choices, [action.taskId]: action.slug },
        locked: [...state.locked.filter((id) => id !== action.taskId), action.taskId],
      };
    case "unlock":
      return {
        ...state,
        choices: withoutKey(state.choices, action.taskId),
        locked: state.locked.filter((id) => id !== action.taskId),
      };
  }
}
