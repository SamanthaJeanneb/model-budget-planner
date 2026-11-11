"use client";

import { TASK_SCORE, TASK_TYPES } from "@/domain/rules";
import { meetsModelRequirements } from "@/domain/score";
import { Requirement } from "../requirements";
import { Switch } from "../ui/Switch";
import { usePlan } from "./context";
import { TypeLabel } from "./TypeLabel";

/** The requirements panel. Each active one shows what it adds to the top stack's cost. */
export function Requirements() {
  const { state, actions, meta } = usePlan();
  const r = state.requirements;
  const p = state.prices;
  const set = actions.setRequirements;
  const models = meta.catalog.models;
  const allowed = models.filter((m) => meetsModelRequirements(m, r)).length;
  const labs = [...new Set(models.map((m) => m.lab))].sort();
  const types = TASK_TYPES.filter((t) => state.tasks.some((task) => task.type === t));
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-[13px] font-semibold">Requirements</h2>
        <span className="text-xs text-ink-3 tabular-nums">
          {allowed} of {models.length} models
        </span>
      </div>
      <Requirement.Row price={p.openWeightsOnly}>
        <Switch checked={r.openWeightsOnly} onCheckedChange={(v) => set({ openWeightsOnly: v })}>
          Open weights only
        </Switch>
      </Requirement.Row>
      <Requirement.Row price={p.zdrOnly}>
        <Switch checked={r.zdrOnly} onCheckedChange={(v) => set({ zdrOnly: v })}>
          Zero data retention
        </Switch>
      </Requirement.Row>
      <Requirement.Row price={p.fastOnly}>
        <Switch checked={r.fastOnly} onCheckedChange={(v) => set({ fastOnly: v })}>
          Fastest third only
        </Switch>
      </Requirement.Row>
      <Requirement.Row price={p.minContext}>
        <Requirement.ContextLength value={r.minContext} onChange={(v) => set({ minContext: v })} />
      </Requirement.Row>
      <Requirement.Row price={p.excludeLabs}>
        <Requirement.ExcludeLabs
          labs={labs}
          value={r.excludeLabs}
          onChange={(v) => set({ excludeLabs: v })}
        />
      </Requirement.Row>
      {types.length > 0 ? <h3 className="mt-6 mb-1 text-[13px] font-semibold">Minimum scores</h3> : null}
      {types.map((type) => (
        <Requirement.Row key={type} price={p[`minScore:${type}`]}>
          <Requirement.MinScore
            value={r.minScore[type]}
            onChange={(v) => set({ minScore: { ...r.minScore, [type]: v } })}
          >
            <span className="flex flex-col">
              <TypeLabel type={type} />
              <span className="pl-3.5 text-xs text-ink-3 capitalize">{TASK_SCORE[type]}</span>
            </span>
          </Requirement.MinScore>
        </Requirement.Row>
      ))}
    </section>
  );
}
