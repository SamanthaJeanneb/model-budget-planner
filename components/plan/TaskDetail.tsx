"use client";

import { formatMoney, shortName } from "@/domain/money";
import { TASK_SCORE } from "@/domain/rules";
import type { SwapNote, TaskResult } from "@/domain/types";
import { Model } from "../model";

const NOTE_TEXT: Record<SwapNote, string> = {
  "open-weights": "open weights",
  "chinese-lab": "from a Chinese lab",
};

const SOURCE_TEXT = {
  "claude-code": "Measured from Claude Code sessions on OpenRouter.",
  "other-agent": "Measured from another coding agent's sessions; no Claude Code data for this model.",
  "price-scaled": "Estimated: no session data for this model, so a similar model's cost is scaled by price.",
} as const;

function Why({ row }: { row: TaskResult }) {
  const { pick, best, runnerUp } = row;
  if (!pick) return null;
  const kind =
    pick.model.scores[TASK_SCORE[row.task.type]] === null ? "intelligence" : TASK_SCORE[row.task.type];
  const notes = row.swapNotes.map((n) => NOTE_TEXT[n]).join(" and ");
  return (
    <div className="space-y-2 text-ink-2">
      <p>
        Picked on{" "}
        <span className="text-ink">
          <Model.Score kind={kind} value={pick.score} />
        </span>
        {kind !== TASK_SCORE[row.task.type] ? " (no task score, so intelligence is used)" : ""}.
      </p>
      {best && row.pointsGivenUp > 0 ? (
        <p>
          The top allowed model, {shortName(best.model.name)}, scores {row.pointsGivenUp.toFixed(1)} more and
          costs {formatMoney(row.dollarsSaved)} more{notes ? `. This pick is ${notes}` : ""}.
        </p>
      ) : (
        <p>This is the top allowed model for the task.</p>
      )}
      {runnerUp ? (
        <p>
          Runner-up: {shortName(runnerUp.model.name)}, {runnerUp.score.toFixed(1)},{" "}
          {formatMoney(runnerUp.cost.typical)}.
        </p>
      ) : null}
    </div>
  );
}

export function TaskDetail({ row }: { row: TaskResult }) {
  const { pick } = row;
  if (!pick) {
    return (
      <p className="px-4 pb-4 text-[13px] text-ink-2">
        Loosen a requirement on the right to price this task.
      </p>
    );
  }
  return (
    <div className="mx-4 mb-4 grid gap-6 rounded-lg bg-subtle p-4 text-[13px] ring-1 ring-line-soft md:grid-cols-2">
      <div className="space-y-3">
        <Why row={row} />
      </div>
      <div className="space-y-2">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
          <dt className="text-ink-2">Typical</dt>
          <dd className="text-right tabular-nums">{formatMoney(pick.cost.typical)}</dd>
          <dt className="text-ink-2">Worst case</dt>
          <dd className="text-right tabular-nums">
            {formatMoney(pick.cost.worst)}
            {pick.cost.worstIsRuleOfThumb ? <span className="text-ink-3"> (2 × the 50+ median)</span> : null}
          </dd>
        </dl>
        <p className="rounded-lg bg-surface px-3 py-2 font-mono text-xs leading-relaxed text-ink-2 ring-1 ring-line-soft">
          {pick.cost.math}
        </p>
        <p className="text-xs text-ink-3">{SOURCE_TEXT[pick.cost.source]}</p>
      </div>
    </div>
  );
}
