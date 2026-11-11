"use client";

import { motion } from "motion/react";
import { formatMoney, shortName } from "@/domain/money";
import { spendByModel } from "@/domain/summary";
import { Model } from "../model";
import { EASE_OUT, FIGURE_TWEEN } from "../ui/motion";
import { usePlan } from "./context";

/** Who does what: each model, the tasks it handles, and what it costs. */
export function ModelBreakdown() {
  const { state } = usePlan();
  const shares = spendByModel(state.stack.rows);
  if (shares.length === 0) return null;
  return (
    <ul className="divide-y divide-line-soft overflow-hidden rounded-xl ring-1 ring-line">
      {shares.map((s) => (
        <li key={s.model.slug} className="px-4 py-4">
          <div className="flex items-baseline justify-between gap-4">
            <Model.Card model={s.model}>
              <button type="button" className="truncate text-[15px] font-semibold hover:underline">
                {shortName(s.model.name)}
              </button>
            </Model.Card>
            <span className="text-[15px] font-semibold tabular-nums">{formatMoney(s.typical)}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line-soft">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={false}
              animate={{ width: `${Math.max(s.share * 100, 1)}%` }}
              transition={{ duration: FIGURE_TWEEN, ease: EASE_OUT }}
            />
          </div>
          <ul className="mt-3 space-y-1 text-[14px] text-ink">
            {s.rows.map((r) => (
              <li key={r.task.id}>{r.task.title}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
