import { shortName } from "@/domain/money";
import { strongestScore } from "@/domain/score";
import type { PricedModel } from "@/domain/types";
import { ScoreBar } from "../chart/ScoreBar";
import { contextLabel, METRIC_LABEL, perMillion } from "../leaderboard/data";
import { Model } from "../model";
import { Plan } from "../plan";

function Tag({ children }: { children: string }) {
  return (
    <span className="inline-flex h-5 items-center rounded px-1.5 text-xs font-medium text-ink-2 ring-1 ring-line ring-inset">
      {children}
    </span>
  );
}

/** One released model: what it is, how it scores, what it costs, and a way into the stack. */
export function NewsRow({
  model,
  isNew,
  models,
}: {
  model: PricedModel;
  isNew: boolean;
  models: PricedModel[];
}) {
  const best = strongestScore(model);
  const tag = !isNew && model.openWeights ? "Open weights" : null;
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_11rem_8rem_4rem_auto] items-center gap-4 px-4 py-3 hover:bg-subtle has-[[data-in-stack]]:bg-accent-soft max-md:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        <p className="flex items-center gap-2">
          <span className="truncate text-[13px] font-medium text-ink">{shortName(model.name)}</span>
          {isNew ? <Model.NewTag model={model} models={models} /> : tag ? <Tag>{tag}</Tag> : null}
        </p>
        <p className="truncate text-xs text-ink-3">{model.lab}</p>
      </div>
      <div className="max-md:hidden">
        {best ? (
          <span className="flex flex-col">
            <ScoreBar value={best.value} />
            <span className="text-xs text-ink-3">{METRIC_LABEL[best.kind]}</span>
          </span>
        ) : (
          <span className="text-sm text-ink-3">Not benchmarked yet</span>
        )}
      </div>
      <div className="text-right text-sm text-ink-2 tabular-nums max-md:hidden">
        {perMillion(model.promptPrice)} / {perMillion(model.completionPrice)}
        <span className="block text-xs text-ink-3">per M in / out</span>
      </div>
      <div className="text-right text-sm text-ink-2 tabular-nums max-md:hidden">
        {contextLabel(model.contextLength)}
        <span className="block text-xs text-ink-3">context</span>
      </div>
      <div className="flex items-center justify-end gap-3">
        <Plan.InStack slug={model.slug} />
        <Plan.AddModelButton slug={model.slug} />
      </div>
    </li>
  );
}
