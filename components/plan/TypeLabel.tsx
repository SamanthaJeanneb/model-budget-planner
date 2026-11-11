import { TASK_LABEL } from "@/domain/rules";
import type { TaskType } from "@/domain/types";

export function TypeLabel({ type }: { type: TaskType }) {
  return <span>{TASK_LABEL[type]}</span>;
}
