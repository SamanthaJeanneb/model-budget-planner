"use client";

import { formatMoney } from "@/domain/money";
import { modelCount } from "@/domain/summary";
import type { ReactNode } from "react";
import { Money } from "../ui/Money";
import { usePlan } from "./context";

function Figure({ label, children, tone = "" }: { label: string; children: ReactNode; tone?: string }) {
  return (
    <div>
      <dd className={`text-[26px] leading-tight font-medium tracking-tight tabular-nums ${tone}`}>
        {children}
      </dd>
      <dt className="mt-0.5 text-xs text-ink-3">{label}</dt>
    </div>
  );
}

/** The four numbers that matter, at a glance. */
export function Summary() {
  const { state } = usePlan();
  const { stack } = state;
  const typical = stack.kind === "fits" ? stack.typical : stack.minimumBudget;
  const worst = stack.kind === "fits" ? stack.worst : null;
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
      <Figure
        label={stack.kind === "over" ? "Cheapest possible" : "Typical spend"}
        tone={stack.kind === "over" ? "text-bad" : ""}
      >
        {state.tasks.length ? <Money value={typical} /> : "—"}
      </Figure>
      <Figure label="Budget">{formatMoney(state.budget)}</Figure>
      <Figure label="Worst case" tone={worst !== null && worst > state.budget ? "text-warn" : ""}>
        {worst === null || !state.tasks.length ? "—" : <Money value={worst} />}
      </Figure>
      <Figure label="Models">{modelCount(stack.rows)}</Figure>
    </dl>
  );
}
