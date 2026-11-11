"use client";

import { formatMoney, shortName } from "@/domain/money";
import type { PricedModel } from "@/domain/types";
import { usePlan } from "./context";

/** The models the stack uses, with what each costs across its tasks. */
export function StackList() {
  const { state } = usePlan();
  const byModel = new Map<string, { model: PricedModel; cost: number; tasks: number }>();
  for (const row of state.stack.rows) {
    if (!row.pick) continue;
    const e = byModel.get(row.pick.model.slug) ?? { model: row.pick.model, cost: 0, tasks: 0 };
    e.cost += row.pick.cost.typical;
    e.tasks += 1;
    byModel.set(row.pick.model.slug, e);
  }
  const list = [...byModel.values()].sort((a, b) => b.cost - a.cost);
  return (
    <div className="min-h-0">
      <p className="mb-1.5 px-2.5 text-[13px] font-medium text-ink-2">Your stack</p>
      {list.length === 0 ? (
        <p className="px-2.5 text-[13px] text-ink-2">No models yet</p>
      ) : (
        <ul className="space-y-0.5">
          {list.map((e) => (
            <li key={e.model.slug} className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px]">
              <span className="min-w-0 flex-1 truncate text-ink">{shortName(e.model.name)}</span>
              <span className="text-ink-2 tabular-nums">{formatMoney(e.cost)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
