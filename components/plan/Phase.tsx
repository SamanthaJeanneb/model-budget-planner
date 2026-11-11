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
      <header className="flex items-center gap-3 border-b border-line bg-subtle px-4 py-2.5">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-surface text-xs font-medium text-ink-2 tabular-nums ring-1 ring-line">
          {number}
        </span>
        <div className="min-w-0 flex-1">
          <InlineText
            aria-label="Phase name"
            value={phase}
            onCommit={(to) => actions.renamePhase(phase, to)}
            className="h-7 text-[13px] font-semibold"
          />
        </div>
        <span className="text-xs text-ink-3 tabular-nums">
          {rows.length} {rows.length === 1 ? "task" : "tasks"}
        </span>
        <span className="w-16 text-right text-[13px] font-medium tabular-nums">{formatMoney(typical)}</span>
      </header>
      <ol>
        {rows.map((row, i) => (
          <TaskCard key={row.task.id} row={row} index={offset + i} />
        ))}
      </ol>
      <div className="border-t border-line-soft bg-subtle/50">
        <AddTask phase={phase} />
      </div>
    </section>
  );
}
