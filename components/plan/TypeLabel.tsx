import { TASK_LABEL } from "@/domain/rules";
import type { TaskType } from "@/domain/types";

/** Static class names so Tailwind can see them. */
export const TYPE_BG: Record<TaskType, string> = {
  planning: "bg-t-planning",
  coding: "bg-t-coding",
  ui: "bg-t-ui",
  tests: "bg-t-tests",
  review: "bg-t-review",
  docs: "bg-t-docs",
};

export function TypeDot({ type }: { type: TaskType }) {
  return <span className={`inline-block size-2 shrink-0 rounded-full ${TYPE_BG[type]}`} aria-hidden />;
}

export function TypeLabel({ type }: { type: TaskType }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <TypeDot type={type} />
      {TASK_LABEL[type]}
    </span>
  );
}
