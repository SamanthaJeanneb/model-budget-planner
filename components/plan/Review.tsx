"use client";

import { ListChecks } from "lucide-react";
import { DEFAULT_PHASE } from "@/domain/planStream";
import { phasesOf } from "@/domain/summary";
import { AddTask } from "./AddTask";
import { usePlan } from "./context";
import { InlineArea } from "./InlineArea";
import { ModelBreakdown } from "./ModelBreakdown";
import { Phase } from "./Phase";

function Heading({ children, aside }: { children: string; aside?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="text-[13px] font-semibold">{children}</h2>
      {aside ? <span className="text-xs text-ink-3">{aside}</span> : null}
    </div>
  );
}

/** The plan to review and edit: the approach, who does what, then each phase's tasks. */
export function Review() {
  const { state, actions } = usePlan();
  const rows = state.stack.rows;
  const planning = state.status === "planning";

  if (rows.length === 0 && !planning) {
    return (
      <section className="overflow-hidden rounded-xl ring-1 ring-line">
        <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
          <span className="flex size-9 items-center justify-center rounded-lg bg-subtle ring-1 ring-line-soft">
            <ListChecks className="size-4 text-ink-3" />
          </span>
          <p className="text-[13px] font-medium">No plan yet</p>
          <p className="text-[13px] text-ink-3">Describe the project above, or start with a task.</p>
        </div>
        <div className="border-t border-line-soft bg-subtle/50">
          <AddTask phase={DEFAULT_PHASE} />
        </div>
      </section>
    );
  }

  const phases = phasesOf(rows);
  // Each phase's first row index, so the stagger runs across the whole plan.
  const offsets = phases.map((_, i) => phases.slice(0, i).reduce((n, p) => n + p.rows.length, 0));
  return (
    <div className="space-y-10">
      <section>
        <Heading aside={planning ? "Writing…" : undefined}>Approach</Heading>
        {state.summary || !planning ? (
          <InlineArea
            aria-label="Plan summary"
            value={state.summary}
            rows={3}
            placeholder="Add a summary of the approach"
            onCommit={actions.setSummary}
            className="text-[14px] text-ink"
          />
        ) : (
          <p className="text-[13px] text-ink-3">The planning model is writing the approach.</p>
        )}
      </section>
      <section>
        <Heading>Who does what</Heading>
        <ModelBreakdown />
      </section>
      <section className="space-y-4">
        <Heading aside={`${rows.length} tasks in ${phases.length} phases`}>Plan</Heading>
        {phases.map((p, i) => (
          <Phase
            key={p.phase}
            number={i + 1}
            phase={p.phase}
            rows={p.rows}
            typical={p.typical}
            offset={offsets[i]}
          />
        ))}
        {planning ? (
          <p className="flex items-center gap-2 px-1 text-[13px] text-ink-2">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            More tasks are on the way.
          </p>
        ) : null}
      </section>
    </div>
  );
}
