"use client";

import { formatMoney } from "@/domain/money";
import { BUDGET_MAX, BUDGET_MIN, BUDGET_PRESETS } from "@/domain/rules";
import { Slider } from "../ui/Slider";
import { usePlan } from "./context";
import { BudgetInput } from "./BudgetInput";

const LOG_MIN = Math.log10(BUDGET_MIN);
const LOG_MAX = Math.log10(BUDGET_MAX);
const TICKS = [1, 10, 100, 1000, 10_000];

/** Rounds to a figure people type: $1.25, $14, $380, $2,400. */
export function niceBudget(usd: number): number {
  if (usd < 10) return Math.round(usd * 4) / 4;
  if (usd < 100) return Math.round(usd);
  if (usd < 1000) return Math.round(usd / 10) * 10;
  return Math.round(usd / 100) * 100;
}

function tickLabel(usd: number) {
  return usd >= 1000 ? `$${usd / 1000}k` : `$${usd}`;
}

function position(usd: number) {
  return ((Math.log10(usd) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100;
}

/** Budget: a typed figure, a log-scale slider, presets, and a jump to the top stack. */
export function Budget() {
  const { state, actions } = usePlan();
  const top = state.topStackCost;
  const hasTasks = state.tasks.length > 0;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <BudgetInput />
        <div className="flex flex-wrap gap-1.5">
          {BUDGET_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => actions.setBudget(p)}
              aria-pressed={state.budget === p}
              className="h-7 rounded-lg px-2.5 text-[13px] text-ink-2 tabular-nums ring-1 ring-line transition-colors hover:bg-subtle hover:text-ink aria-pressed:bg-ink aria-pressed:text-white aria-pressed:ring-ink"
            >
              ${p}
            </button>
          ))}
        </div>
      </div>
      <div className="relative pb-5">
        <Slider
          aria-label="Budget"
          min={LOG_MIN}
          max={LOG_MAX}
          step={0.005}
          value={Math.log10(state.budget)}
          onValueChange={(v) => actions.setBudget(niceBudget(10 ** v))}
        />
        {TICKS.map((t) => (
          <span
            key={t}
            className="absolute bottom-0 -translate-x-1/2 text-xs text-ink-3 tabular-nums"
            style={{ left: `${position(t)}%` }}
          >
            {tickLabel(t)}
          </span>
        ))}
        {hasTasks && top > 0 && top <= BUDGET_MAX ? (
          <span
            className="absolute top-0 h-5 w-px bg-ink-3/60"
            style={{ left: `${position(Math.max(top, BUDGET_MIN))}%` }}
            title={`Top stack: ${formatMoney(top)}`}
          />
        ) : null}
      </div>
      {hasTasks && top > 0 && Math.abs(top - state.budget) > 0.005 ? (
        <p className="flex flex-wrap items-center gap-x-2 text-[13px] text-ink-2">
          Best stack costs <span className="font-medium text-ink tabular-nums">{formatMoney(top)}</span>
          <button
            type="button"
            onClick={() => actions.setBudget(Math.ceil(top * 100) / 100)}
            className="rounded-md px-1.5 py-0.5 font-medium text-accent transition-colors hover:bg-accent-soft"
          >
            Use as budget
          </button>
        </p>
      ) : null}
    </div>
  );
}
