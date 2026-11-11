"use client";

import { motion } from "motion/react";
import { shortName } from "@/domain/money";
import type { PricedModel, ScoreKind } from "@/domain/types";
import { Plan } from "../plan";
import { HoverNote } from "../ui/HoverNote";
import { EASE_OUT, SLOW } from "../ui/motion";
import { OTHER } from "./labColors";
import { ModelTip } from "./ModelTip";

const TOP = 20;

/** The top models on one benchmark, longest bar first. */
export function RankBars({
  models,
  metric,
  colors,
}: {
  models: PricedModel[];
  metric: ScoreKind;
  colors: Map<string, string>;
}) {
  const ranked = [...models].sort((a, b) => (b.scores[metric] ?? 0) - (a.scores[metric] ?? 0)).slice(0, TOP);
  if (ranked.length === 0) {
    return <p className="py-16 text-center text-sm text-ink-3">No models match these filters.</p>;
  }
  const max = Math.max(100, ...ranked.map((m) => m.scores[metric] ?? 0));
  return (
    <ol className="space-y-px">
      {ranked.map((m, i) => {
        const score = m.scores[metric] ?? 0;
        return (
          <motion.li
            key={m.slug}
            layout="position"
            transition={{ duration: SLOW, ease: EASE_OUT }}
            className="group"
          >
            <HoverNote
              trigger={
                <button
                  type="button"
                  className="grid w-full grid-cols-[2rem_minmax(9rem,16rem)_1fr_3.5rem] items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent group-has-[[data-in-stack]]:bg-surface"
                >
                  <span className="text-ink-3 tabular-nums">{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-ink">{shortName(m.name)}</span>
                    <span className="flex items-center gap-2 text-xs text-ink-3">
                      {m.lab}
                      <Plan.InStack slug={m.slug} />
                    </span>
                  </span>
                  <span className="relative h-2.5 rounded-r bg-transparent">
                    <motion.span
                      className="absolute inset-y-0 left-0 rounded-r-[4px] transition-opacity group-hover:opacity-80"
                      style={{ background: colors.get(m.lab) ?? OTHER }}
                      initial={false}
                      animate={{ width: `${(score / max) * 100}%` }}
                      transition={{ duration: SLOW, ease: EASE_OUT }}
                    />
                  </span>
                  <span className="text-right text-ink tabular-nums">{score.toFixed(1)}</span>
                </button>
              }
            >
              <ModelTip model={m} metric={metric} />
            </HoverNote>
          </motion.li>
        );
      })}
    </ol>
  );
}
