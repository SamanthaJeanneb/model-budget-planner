"use client";

import { formatMoney } from "@/domain/money";
import type { TaskResult } from "@/domain/types";
import { AddTask } from "./AddTask";
import { usePlan } from "./context";
import { InlineText } from "./InlineText";
import { TaskCard } from "./TaskCard";

type Props = { phase: string; number: number; rows: TaskResult[]; typical: number; offset: number };

/** One phase of the plan: an editable name, its subtotal, its tasks in order. */
export function Phase({ phase, number, rows, typical, offset }: Props) {
  const { actions } = usePlan();
  return (
    <section className="overflow-hidden rounded-xl ring-1 ring-line">
      <header className="flex items-center gap-2 border-b border-line bg-subtle px-4 py-3">
        <span className="text-[15px] font-semibold text-ink-2 tabular-nums">{number}.</span>
        <div className="min-w-0 flex-1">
          <InlineText
            aria-label="Phase name"
            value={phase}
            onCommit={(to) => actions.renamePhase(phase, to)}
            className="h-7 text-[15px] font-semibold"
          />
        </div>
        <span className="text-[15px] font-semibold tabular-nums">{formatMoney(typical)}</span>
      </header>
      <ol>
        {rows.map((row, i) => (
          <TaskCard key={row.task.id} row={row} index={offset + i} />
        ))}
      </ol>
      <div className="border-t border-line-soft">
        <AddTask phase={phase} />
      </div>
    </section>
  );
}
