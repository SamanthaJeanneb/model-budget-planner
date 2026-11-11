"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { shortName } from "@/domain/money";
import { Brief } from "./Brief";
import { usePlan } from "./context";

/** The project brief: the full composer before a plan exists, a one-line summary after. */
export function Project() {
  const { state, meta } = usePlan();
  const [editing, setEditing] = useState(false);
  const hasPlan = state.tasks.length > 0 || state.status === "planning";
  if (!hasPlan || editing) return <Brief />;
  const planner = meta.catalog.models.find((m) => m.id === state.planningModel);
  return (
    <div className="flex items-start gap-4">
      <div className="min-w-0 flex-1">
        <p className="mb-1.5 text-[14px] text-ink-2">
          {state.status === "planning" ? "Planning with" : "Planned by"}{" "}
          {planner ? shortName(planner.name) : "the planning model"}
        </p>
        <h1 className="text-xl font-semibold tracking-tight">
          {state.brief || "Untitled project"}
        </h1>
      </div>
      <button
        type="button"
        onClick={() => setEditing(true)}
        disabled={state.status === "planning"}
        className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium ring-1 ring-line transition-colors hover:bg-subtle disabled:text-ink-3"
      >
        <Pencil className="size-3.5" />
        Edit brief
      </button>
    </div>
  );
}
