"use client";

import type { ScoreKind } from "@/domain/types";
import { Segmented, SegmentedItem } from "../ui/Segmented";
import { Switch } from "../ui/Switch";
import type { Filters } from "./data";
import { LabFilter } from "./LabFilter";

type Props = {
  filters: Filters;
  labs: { lab: string; count: number }[];
  onChange: (patch: Partial<Filters>) => void;
};

/** Every filter in one row above the charts. */
export function FilterBar({ filters, labs, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Segmented
        aria-label="Benchmark"
        value={filters.metric}
        onValueChange={(v) => onChange({ metric: v as ScoreKind })}
      >
        <SegmentedItem value="intelligence">Intelligence</SegmentedItem>
        <SegmentedItem value="coding">Coding</SegmentedItem>
        <SegmentedItem value="agentic">Agentic</SegmentedItem>
      </Segmented>
      <LabFilter labs={labs} value={filters.labs} onChange={(l) => onChange({ labs: l })} />
      <label className="relative">
        <span className="sr-only">Search models</span>
        <svg
          viewBox="0 0 16 16"
          className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-ink-3"
          aria-hidden
        >
          <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <input
          value={filters.query}
          onChange={(e) => onChange({ query: e.target.value })}
          placeholder="Search models"
          className="h-9 w-52 rounded-lg border border-line bg-surface pr-3 pl-8 text-sm placeholder:text-ink-3 hover:border-ink-3 focus-visible:border-accent focus-visible:outline-none"
        />
      </label>
      <div className="ml-auto w-44">
        <Switch checked={filters.openOnly} onCheckedChange={(v) => onChange({ openOnly: v })}>
          Open weights only
        </Switch>
      </div>
    </div>
  );
}
