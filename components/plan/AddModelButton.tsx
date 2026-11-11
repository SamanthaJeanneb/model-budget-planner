"use client";

import { shortName } from "@/domain/money";
import { TASK_LABEL } from "@/domain/rules";
import { scoreFor } from "@/domain/score";
import { Button } from "../ui/Button";
import { PopoverContent, PopoverRoot, PopoverTrigger } from "../ui/Popover";
import { usePlan } from "./context";

/** Puts a model on one task of the stack; allocation re-runs around it. */
export function AddModelButton({ slug }: { slug: string }) {
  const { state, actions, meta } = usePlan();
  const model = meta.catalog.models.find((m) => m.slug === slug);
  const usable = state.tasks.filter(
    (t) => model && scoreFor(model, t.type) !== null && model.cost[t.size].kind === "known",
  );
  if (!model || usable.length === 0) {
    return (
      <Button variant="quiet" disabled>
        {state.tasks.length === 0 ? "Add to stack" : "No score yet"}
      </Button>
    );
  }
  return (
    <PopoverRoot>
      <PopoverTrigger asChild>
        <Button variant="quiet">Add to stack</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="mb-2 text-ink-2">Use {shortName(model.name)} for</p>
        <ul className="space-y-0.5">
          {usable.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => actions.choose(t.id, slug)}
                className="w-full truncate rounded px-2 py-1 text-left hover:bg-line-soft"
              >
                {t.title} <span className="text-ink-2">· {TASK_LABEL[t.type]}</span>
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </PopoverRoot>
  );
}
