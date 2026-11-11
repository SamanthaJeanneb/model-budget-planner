"use client";

import { Plus } from "lucide-react";
import { usePlan } from "./context";

/** Clears the project and its tasks; keeps the budget and requirements. */
export function NewPlanButton() {
  const { state, actions } = usePlan();
  const empty = state.tasks.length === 0 && state.brief === "";
  return (
    <button
      type="button"
      onClick={actions.reset}
      disabled={empty}
      className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-surface text-[13px] font-medium text-ink shadow-[0_1px_2px_rgba(26,26,26,0.06)] ring-1 ring-line transition-colors hover:bg-subtle disabled:text-ink-3 disabled:shadow-none"
    >
      <Plus className="size-4" />
      New plan
    </button>
  );
}
