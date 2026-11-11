import type { Task } from "@/domain/types";
import type { PlanError } from "./reducer";

type Event =
  | { type: "summary"; text: string }
  | { type: "task"; task: Task }
  | { type: "done" }
  | { type: "error"; code: PlanError };

type Handlers = { onSummary: (text: string) => void; onTask: (task: Task) => void };

/** Calls our own /api/plan and hands over the summary and each task as their lines arrive. */
export async function streamPlan(
  brief: string,
  model: string,
  { onSummary, onTask }: Handlers,
): Promise<PlanError | null> {
  const res = await fetch("/api/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brief, model }),
  }).catch(() => null);
  if (!res) return "failed";
  if (!res.ok || !res.body) {
    const body = (await res.json().catch(() => null)) as { error?: PlanError } | null;
    return body?.error ?? "failed";
  }
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line) as Event;
      if (event.type === "summary") onSummary(event.text);
      if (event.type === "task") {
        got++;
        onTask(event.task);
      }
      if (event.type === "error") return event.code;
    }
  }
  return got > 0 ? null : "no-tasks";
}
