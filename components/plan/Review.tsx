"use client";

import { DEFAULT_PHASE } from "@/domain/planStream";
import { phasesOf } from "@/domain/summary";
import { AddTask } from "./AddTask";
import { usePlan } from "./context";
import { InlineArea } from "./InlineArea";
import { ModelBreakdown } from "./ModelBreakdown";
import { Phase } from "./Phase";

function Heading({ children }: { children: string }) {
  return <h2 className="mb-3 text-[15px] font-semibold">{children}</h2>;
}

/** The plan to review and edit: the approach, who does what, then each phase's tasks. */
export function Review() {
  const { state, actions } = usePlan();
  const rows = state.stack.rows;
  const planning = state.status === "planning";

  if (rows.length === 0 && !planning) {
    return (
      <section className="overflow-hidden rounded-xl ring-1 ring-line">
        <div className="px-6 py-10 text-center">
          <p className="text-[15px] font-medium">No plan yet</p>
          <p className="mt-1 text-[14px] text-ink-2">Describe the project above, or add a task.</p>
        </div>
        <div className="border-t border-line-soft">
          <AddTask phase={DEFAULT_PHASE} />
        </div>
      </section>
    );
  }

  const phases = phasesOf(rows);
  // Each phase's first row index, so the stagger runs across the whole plan.
  const offsets = phases.map((_, i) => phases.slice(0, i).reduce((n, p) => n + p.rows.length, 0));
  return (
    <div className="space-y-12">
      <section>
        <Heading>Approach</Heading>
        {state.summary || !planning ? (
          <InlineArea
            aria-label="Plan summary"
            value={state.summary}
            placeholder="Add a summary of the approach"
            onCommit={actions.setSummary}
            className="text-[15px] text-ink"
          />
        ) : (
          <p className="text-[15px] text-ink-2">Writing the approach…</p>
        )}
      </section>
      <section>
        <Heading>Who does what</Heading>
        <ModelBreakdown />
      </section>
      <section>
        <Heading>Tasks</Heading>
        <div className="space-y-5">
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
          {planning ? <p className="px-1 text-[14px] text-ink-2">Writing more tasks…</p> : null}
        </div>
      </section>
    </div>
  );
}
