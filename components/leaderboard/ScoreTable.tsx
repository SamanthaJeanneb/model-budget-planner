"use client";

import { useState } from "react";
import { shortName } from "@/domain/money";
import type { PricedModel, ScoreKind } from "@/domain/types";
import { Plan } from "../plan";
import { contextLabel, perMillion } from "./data";
import { SortHeader } from "./SortHeader";

function ScoreCell({ value }: { value: number | null }) {
  return (
    <td className="py-2.5 pr-4 text-right tabular-nums">
      {value === null ? <span className="text-ink-3">—</span> : value.toFixed(1)}
    </td>
  );
}

/** The same data as the charts, as a sortable table. */
export function ScoreTable({ models, metric }: { models: PricedModel[]; metric: ScoreKind }) {
  const [sortBy, setSortBy] = useState<ScoreKind>(metric);
  const rows = [...models].sort((a, b) => (b.scores[sortBy] ?? -1) - (a.scores[sortBy] ?? -1));
  const header = { active: sortBy, onSort: setSortBy };
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-ink-3">
            <th className="w-10 py-2 font-normal">#</th>
            <th className="py-2 font-normal">Model</th>
            <SortHeader kind="intelligence" {...header}>
              Intelligence
            </SortHeader>
            <SortHeader kind="coding" {...header}>
              Coding
            </SortHeader>
            <SortHeader kind="agentic" {...header}>
              Agentic
            </SortHeader>
            <th className="w-32 py-2 pr-4 text-right font-normal">$ per M in / out</th>
            <th className="w-20 py-2 pr-4 text-right font-normal">Context</th>
            <th className="w-32 py-2 font-normal" />
          </tr>
        </thead>
        <tbody>
          {rows.map((m, i) => (
            <tr
              key={m.slug}
              className="border-b border-line-soft hover:bg-subtle has-[[data-in-stack]]:bg-accent-soft"
            >
              <td className="py-2.5 text-ink-3 tabular-nums">{i + 1}</td>
              <td className="py-2.5 pr-4">
                <span className="block truncate text-ink">{shortName(m.name)}</span>
                <span className="text-xs text-ink-3">{m.lab}</span>
              </td>
              <ScoreCell value={m.scores.intelligence} />
              <ScoreCell value={m.scores.coding} />
              <ScoreCell value={m.scores.agentic} />
              <td className="py-2.5 pr-4 text-right text-ink-2 tabular-nums">
                {perMillion(m.promptPrice)} / {perMillion(m.completionPrice)}
              </td>
              <td className="py-2.5 pr-4 text-right text-ink-2 tabular-nums">
                {contextLabel(m.contextLength)}
              </td>
              <td className="py-2.5">
                <Plan.InStack slug={m.slug} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
