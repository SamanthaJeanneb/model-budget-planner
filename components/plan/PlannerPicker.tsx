"use client";

import { shortName } from "@/domain/money";
import { planningModels } from "@/domain/planning";
import { Model } from "../model";
import { Combobox, ComboboxGroup, ComboboxItem } from "../ui/Combobox";
import { usePlan } from "./context";

/** Which model splits the project into tasks. */
export function PlannerPicker() {
  const { state, actions, meta } = usePlan();
  const planners = planningModels(meta.catalog.models);
  const current = planners.find((m) => m.id === state.planningModel);
  return (
    <Combobox
      aria-label="Planning model"
      placeholder="Search planning models"
      className="h-8 w-auto max-w-72 border-transparent bg-subtle ring-0"
      display={
        <span className="flex items-center gap-2">
          <span className="text-ink-3">Planned by</span>
          {current ? shortName(current.name) : "Choose a model"}
        </span>
      }
    >
      <ComboboxGroup heading="Intelligence · price per M tokens in / out">
        {planners.map((m) => (
          <ComboboxItem
            key={m.slug}
            value={m.id}
            keywords={[m.name, m.lab]}
            selected={m.id === state.planningModel}
            onSelect={() => actions.setPlanningModel(m.id)}
          >
            <span className="flex items-center gap-3">
              <span className="min-w-0 flex-1 truncate">{shortName(m.name)}</span>
              <Model.ScoreBar value={m.scores.intelligence ?? 0} className="w-14" />
              <span className="w-8 text-right text-ink-2 tabular-nums">
                {m.scores.intelligence?.toFixed(0)}
              </span>
              <span className="w-24 text-right text-xs text-ink-2">
                <Model.Price model={m} />
              </span>
            </span>
          </ComboboxItem>
        ))}
      </ComboboxGroup>
    </Combobox>
  );
}
