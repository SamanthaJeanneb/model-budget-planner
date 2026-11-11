import "server-only";
import { PLAN_SCHEMA, extractSummary, extractTasks } from "@/domain/planStream";
import { PLAN_SYSTEM_PROMPT, planningRoute } from "@/domain/planning";
import type { Task } from "@/domain/types";
import { getCatalog } from "./catalog";
import { streamStructured } from "./openrouter";

export type PlanEvent =
  | { type: "summary"; text: string }
  | { type: "task"; task: Task }
  | { type: "done"; count: number }
  | { type: "error"; code: "no-tasks" | "failed" };

/** Streams the task list as newline-delimited JSON, one task per line as each completes. */
export async function planStream(
  brief: string,
  modelId: string,
  signal: AbortSignal,
): Promise<ReadableStream<Uint8Array> | null> {
  const catalog = await getCatalog();
  const route = planningRoute(catalog.models, modelId);
  if (!route) return null;

  const encoder = new TextEncoder();
  const line = (e: PlanEvent) => encoder.encode(`${JSON.stringify(e)}\n`);

  return new ReadableStream({
    async start(controller) {
      let text = "";
      let sent = 0;
      let summarySent = false;
      try {
        const messages = [
          { role: "system" as const, content: PLAN_SYSTEM_PROMPT },
          { role: "user" as const, content: brief },
        ];
        for await (const delta of streamStructured(route, messages, PLAN_SCHEMA, signal)) {
          text += delta;
          if (!summarySent) {
            const summary = extractSummary(text);
            if (summary !== null) {
              controller.enqueue(line({ type: "summary", text: summary }));
              summarySent = true;
            }
          }
          const tasks = extractTasks(text);
          for (; sent < tasks.length; sent++) controller.enqueue(line({ type: "task", task: tasks[sent] }));
        }
        controller.enqueue(
          sent > 0 ? line({ type: "done", count: sent }) : line({ type: "error", code: "no-tasks" }),
        );
      } catch {
        controller.enqueue(line({ type: "error", code: "failed" }));
      }
      controller.close();
    },
  });
}
