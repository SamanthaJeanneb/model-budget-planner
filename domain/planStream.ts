import { TASK_TYPES } from "./rules";
import type { Task, TaskSize, TaskType } from "./types";

const SIZES: TaskSize[] = ["small", "medium", "large"];

/** Phase for tasks that arrive or are added without one. */
export const DEFAULT_PHASE = "Tasks";

/** The plan's summary once its string has been written in full, else null. */
export function extractSummary(partial: string): string | null {
  const match = /"summary"\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(partial);
  if (!match) return null;
  try {
    return (JSON.parse(`"${match[1]}"`) as string).trim();
  } catch {
    return null;
  }
}

/** JSON Schema the planning model must follow. */
export const PLAN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "tasks"],
  properties: {
    summary: { type: "string" },
    tasks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["phase", "title", "detail", "type", "size"],
        properties: {
          phase: { type: "string" },
          title: { type: "string" },
          detail: { type: "string" },
          type: { type: "string", enum: TASK_TYPES },
          size: { type: "string", enum: SIZES },
        },
      },
    },
  },
} as const;

function toTask(value: unknown, index: number): Task | null {
  if (typeof value !== "object" || value === null) return null;
  const { title, type, size, detail, phase } = value as Record<string, unknown>;
  if (typeof title !== "string" || title.trim() === "") return null;
  if (!TASK_TYPES.includes(type as TaskType)) return null;
  if (!SIZES.includes(size as TaskSize)) return null;
  return {
    id: `t${index + 1}`,
    title: title.trim(),
    detail: typeof detail === "string" ? detail.trim() : "",
    phase: typeof phase === "string" && phase.trim() ? phase.trim() : DEFAULT_PHASE,
    type: type as TaskType,
    size: size as TaskSize,
  };
}

/**
 * Every complete task object in a partial `{"summary":…,"tasks":[{…},{…` string.
 * Lets the server forward tasks one at a time while the model is still writing.
 */
export function extractTasks(partial: string): Task[] {
  const key = partial.search(/"tasks"\s*:/);
  if (key === -1) return [];
  const start = partial.indexOf("[", key);
  if (start === -1) return [];
  const tasks: Task[] = [];
  let depth = 0;
  let inString = false;
  let escaped = false;
  let objectStart = -1;
  for (let i = start + 1; i < partial.length; i++) {
    const ch = partial[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") {
      if (depth === 0) objectStart = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && objectStart !== -1) {
        const task = parseObject(partial.slice(objectStart, i + 1), tasks.length);
        if (task) tasks.push(task);
        objectStart = -1;
      }
    } else if (ch === "]" && depth === 0) break;
  }
  return tasks;
}

function parseObject(text: string, index: number): Task | null {
  try {
    return toTask(JSON.parse(text), index);
  } catch {
    return null;
  }
}
