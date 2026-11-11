"use client";

import { useState } from "react";
import { BUDGET_MAX, BUDGET_MIN } from "@/domain/rules";
import { usePlan } from "./context";

/** The budget as a figure you can type. Commits on blur or Enter. */
export function BudgetInput() {
  const { state, actions } = usePlan();
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    const n = Number((draft ?? "").replace(/[$,\s]/g, ""));
    if (Number.isFinite(n) && n > 0) actions.setBudget(Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, n)));
    setDraft(null);
  };
  const shown = draft ?? state.budget.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return (
    <label className="flex items-baseline text-[32px] leading-none font-semibold tracking-tight tabular-nums">
      <span className="text-ink-3">$</span>
      <input
        aria-label="Budget in dollars"
        value={shown}
        size={Math.max(2, shown.length)}
        onFocus={(e) => {
          setDraft(String(state.budget));
          requestAnimationFrame(() => e.target.select());
        }}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="rounded-lg bg-transparent px-0.5 outline-none hover:bg-subtle focus:bg-subtle focus:ring-1 focus:ring-line"
      />
    </label>
  );
}
