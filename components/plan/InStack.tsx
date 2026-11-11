"use client";

import { usePlan } from "./context";

/** Marks a model that the current stack uses. Rows style themselves with :has([data-in-stack]). */
export function InStack({ slug }: { slug: string }) {
  const { state } = usePlan();
  const used = state.stack.rows.filter((r) => r.pick?.model.slug === slug).length;
  if (used === 0) return null;
  return (
    <span data-in-stack className="text-xs font-medium text-accent">
      In stack · {used} {used === 1 ? "task" : "tasks"}
    </span>
  );
}
