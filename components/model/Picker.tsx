"use client";

import { formatMoney, shortName } from "@/domain/money";
import type { Pick } from "@/domain/types";
import { Combobox, ComboboxGroup, ComboboxItem } from "../ui/Combobox";
import { ScoreBar } from "./ScoreBar";

type Props = {
  options: Pick[];
  /** The model on the task now. */
  current: Pick;
  /** The slug the user chose, or null when the allocator chose. */
  chosen: string | null;
  onChange: (slug: string | null) => void;
};

function Option({ pick }: { pick: Pick }) {
  return (
    <span className="flex items-center gap-3">
      <span className="min-w-0 flex-1 truncate">{shortName(pick.model.name)}</span>
      <ScoreBar value={pick.score} className="w-14" />
      <span className="w-8 text-right text-ink-2 tabular-nums">{pick.score.toFixed(0)}</span>
      <span className="w-14 text-right tabular-nums">{formatMoney(pick.cost.typical)}</span>
    </span>
  );
}

/** Swap the model on one task. Lists every model worth considering, best first. */
export function Picker({ options, current, chosen, onChange }: Props) {
  const list = options.some((o) => o.model.slug === current.model.slug) ? options : [...options, current];
  return (
    <Combobox
      aria-label="Model"
      placeholder="Search models"
      className="w-full"
      width="w-[26rem]"
      display={
        <span className="flex items-center gap-2">
          {shortName(current.model.name)}
          <span className="text-ink-3">{chosen ? "Your pick" : "Best for budget"}</span>
        </span>
      }
    >
      <ComboboxItem
        value="auto"
        keywords={["best", "budget", "auto"]}
        selected={chosen === null}
        onSelect={() => onChange(null)}
      >
        Best for budget
        <span className="block text-xs text-ink-3">Let the allocator choose as the budget changes</span>
      </ComboboxItem>
      <ComboboxGroup heading="Score · typical cost for this task">
        {[...list]
          .sort((a, b) => b.score - a.score)
          .map((o) => (
            <ComboboxItem
              key={o.model.slug}
              value={o.model.slug}
              keywords={[o.model.name, o.model.lab]}
              selected={chosen === o.model.slug}
              onSelect={() => onChange(o.model.slug)}
            >
              <Option pick={o} />
            </ComboboxItem>
          ))}
      </ComboboxGroup>
    </Combobox>
  );
}
