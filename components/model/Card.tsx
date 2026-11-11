"use client";

import { HoverCard } from "radix-ui";
import type { ReactNode } from "react";
import { formatReleaseDate, shortName } from "@/domain/money";
import type { Model } from "@/domain/types";
import { Price } from "./Price";
import { ScoreBar } from "./ScoreBar";

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-2">{label}</dt>
      <dd className="flex items-center gap-2 tabular-nums">{children}</dd>
    </div>
  );
}

function ScoreFact({ label, value }: { label: string; value: number | null }) {
  return (
    <Fact label={label}>
      {value === null ? (
        <span className="text-ink-3">No score</span>
      ) : (
        <>
          <ScoreBar value={value} className="w-16" />
          <span className="w-8 text-right">{value.toFixed(1)}</span>
        </>
      )}
    </Fact>
  );
}

function contextLabel(tokens: number) {
  return tokens >= 1_000_000 ? `${(tokens / 1_000_000).toFixed(1)}M` : `${Math.round(tokens / 1000)}k`;
}

/** Hover a model's name to see what it is. */
export function Card({ model, children }: { model: Model; children: ReactNode }) {
  return (
    <HoverCard.Root openDelay={250} closeDelay={80}>
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          side="bottom"
          align="start"
          sideOffset={6}
          className="z-50 w-72 rounded-lg border border-line bg-surface p-4 text-sm shadow-[0_8px_24px_-8px_rgba(22,24,29,0.18)]"
        >
          <p className="font-medium">{shortName(model.name)}</p>
          <p className="mb-3 truncate text-xs text-ink-3">{model.id}</p>
          <dl className="space-y-1.5">
            <ScoreFact label="Intelligence" value={model.scores.intelligence} />
            <ScoreFact label="Coding" value={model.scores.coding} />
            <ScoreFact label="Agentic" value={model.scores.agentic} />
            <div className="my-2 border-t border-line-soft" />
            <Fact label="Price per M tokens">
              <Price model={model} />
            </Fact>
            <Fact label="Context">{contextLabel(model.contextLength)} tokens</Fact>
            <Fact label="Released">{formatReleaseDate(model.created)}</Fact>
            <Fact label="Weights">{model.openWeights ? "Open" : "Closed"}</Fact>
            <Fact label="Zero data retention">{model.zdr ? "Available" : "No"}</Fact>
          </dl>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
