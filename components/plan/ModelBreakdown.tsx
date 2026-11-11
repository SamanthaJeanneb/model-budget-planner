"use client";

import { motion } from "motion/react";
import { formatMoney, shortName } from "@/domain/money";
import { spendByModel } from "@/domain/summary";
import { Model } from "../model";
import { HoverNote } from "../ui/HoverNote";
import { EASE_OUT, FIGURE_TWEEN } from "../ui/motion";
import { usePlan } from "./context";
import { modelColors, OTHER_MODEL } from "./modelColors";

/** Who does what: each model's share of the spend, and the tasks it handles. */
export function ModelBreakdown() {
  const { state } = usePlan();
  const shares = spendByModel(state.stack.rows);
  if (shares.length === 0) return null;
  const colors = modelColors(state.stack.rows);
  return (
    <div className="space-y-4">
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-full">
        {shares.map((s) => (
          <HoverNote
            key={s.model.slug}
            trigger={
              <motion.button
                type="button"
                aria-label={`${shortName(s.model.name)}: ${formatMoney(s.typical)}`}
                initial={false}
                animate={{ flexGrow: Math.max(s.share, 0.01) }}
                transition={{ duration: FIGURE_TWEEN, ease: EASE_OUT }}
                style={{ background: colors.get(s.model.slug) ?? OTHER_MODEL, flexBasis: 0 }}
                className="h-full min-w-1 transition-opacity hover:opacity-80"
              />
            }
          >
            <span className="font-medium">{shortName(s.model.name)}</span>: {formatMoney(s.typical)},{" "}
            {Math.round(s.share * 100)}% of spend
          </HoverNote>
        ))}
      </div>
      <ul className="divide-y divide-line-soft overflow-hidden rounded-xl ring-1 ring-line">
        {shares.map((s) => (
          <li
            key={s.model.slug}
            className="grid grid-cols-[minmax(0,1fr)_5rem_4rem] items-center gap-4 px-4 py-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: colors.get(s.model.slug) ?? OTHER_MODEL }}
                  aria-hidden
                />
                <Model.Card model={s.model}>
                  <button type="button" className="truncate text-[13px] font-medium hover:underline">
                    {shortName(s.model.name)}
                  </button>
                </Model.Card>
                <span className="text-xs text-ink-3">
                  {s.rows.length} {s.rows.length === 1 ? "task" : "tasks"}
                </span>
              </div>
              <p className="mt-0.5 truncate pl-[18px] text-xs text-ink-2">
                {s.rows.map((r) => r.task.title).join(" · ")}
              </p>
            </div>
            <span className="text-right text-xs text-ink-3 tabular-nums">{Math.round(s.share * 100)}%</span>
            <span className="text-right text-[13px] font-medium tabular-nums">{formatMoney(s.typical)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
