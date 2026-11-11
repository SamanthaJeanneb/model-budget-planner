import { shortName } from "@/domain/money";
import type { NewModelBrief } from "@/domain/newModel";
import type { Model } from "@/domain/types";
import { Price } from "./Price";
import { ScoreBar } from "./ScoreBar";

const KIND = { intelligence: "Intelligence", coding: "Coding", agentic: "Agentic" } as const;

function signed(n: number) {
  return `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(1)}`;
}

function priceChange(ratio: number) {
  if (Math.abs(ratio - 1) < 0.05) return "Same price";
  return ratio < 1 ? `${Math.round((1 - ratio) * 100)}% cheaper` : `${ratio.toFixed(1)}× the price`;
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line-soft py-2.5 first:border-t-0 first:pt-0 last:pb-0">
      <p className="mb-1.5 text-xs font-medium text-ink-3">{title}</p>
      {children}
    </div>
  );
}

/** The body of the "New" hover card. */
export function NewBrief({ model, brief }: { model: Model; brief: NewModelBrief }) {
  return (
    <div>
      <Block title="Best at">
        {brief.ranks.length === 0 ? (
          <p className="text-ink-3">Not benchmarked yet</p>
        ) : (
          <ul className="space-y-1">
            {brief.ranks.map((r) => (
              <li key={r.kind} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-2">
                <span>{KIND[r.kind]}</span>
                <ScoreBar value={r.value} className="w-full" />
                <span className="text-xs text-ink-2 tabular-nums">
                  {r.value.toFixed(1)}, #{r.rank} of {r.of}
                </span>
              </li>
            ))}
          </ul>
        )}
        {brief.popularFor.length > 0 ? (
          <p className="mt-2 text-xs text-ink-2">Most used for {brief.popularFor.join(", ").toLowerCase()}</p>
        ) : null}
      </Block>
      {brief.previous ? (
        <Block title={`New since ${shortName(brief.previous.model.name)}`}>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {brief.previous.deltas.map((d) => (
              <li key={d.kind}>
                <span className="font-medium tabular-nums">{signed(d.delta)}</span>{" "}
                <span className="text-ink-2">{KIND[d.kind].toLowerCase()}</span>
              </li>
            ))}
            {brief.previous.priceRatio !== null ? (
              <li className="text-ink-2">{priceChange(brief.previous.priceRatio)}</li>
            ) : null}
          </ul>
        </Block>
      ) : (
        <Block title="New since">
          <p className="text-xs text-ink-2">First scored model from {model.lab} in the catalogue</p>
        </Block>
      )}
      <Block title="Price per M tokens, in / out">
        <p className="text-xs">
          <Price model={model} />
        </p>
      </Block>
    </div>
  );
}
