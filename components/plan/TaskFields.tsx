"use client";

import { TASK_TYPES } from "@/domain/rules";
import type { TaskSize, TaskType } from "@/domain/types";
import { Select, SelectItem } from "../ui/Select";
import { TypeLabel } from "./TypeLabel";

const SIZES: { value: TaskSize; hint: string }[] = [
  { value: "small", hint: "2–9 turns" },
  { value: "medium", hint: "10–49 turns" },
  { value: "large", hint: "50+ turns" },
];

type FieldProps<T> = { value: T; onChange: (v: T) => void; variant?: "default" | "ghost" };

export function TypeField({ value, onChange, variant = "ghost" }: FieldProps<TaskType>) {
  return (
    <Select
      aria-label="Task type"
      variant={variant}
      value={value}
      onValueChange={(v) => onChange(v as TaskType)}
      display={<TypeLabel type={value} />}
    >
      {TASK_TYPES.map((t) => (
        <SelectItem key={t} value={t}>
          <TypeLabel type={t} />
        </SelectItem>
      ))}
    </Select>
  );
}

export function SizeField({ value, onChange, variant = "ghost" }: FieldProps<TaskSize>) {
  return (
    <Select
      aria-label="Task size"
      variant={variant}
      value={value}
      onValueChange={(v) => onChange(v as TaskSize)}
      display={<span className="capitalize">{value}</span>}
    >
      {SIZES.map((s) => (
        <SelectItem key={s.value} value={s.value}>
          <span className="capitalize">{s.value}</span> <span className="text-ink-3">{s.hint}</span>
        </SelectItem>
      ))}
    </Select>
  );
}
