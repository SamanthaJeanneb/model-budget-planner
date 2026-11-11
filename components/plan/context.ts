"use client";

import { createContext, useContext } from "react";
import type { RequirementKey } from "@/domain/requirements";
import type { Catalog, Requirements, Stack, Task } from "@/domain/types";
import type { PlanState } from "./reducer";

export type PlanContextValue = {
  state: PlanState & {
    stack: Stack;
    prices: Partial<Record<RequirementKey, number>>;
    topStackCost: number;
  };
  actions: {
    reset: () => void;
    setBrief: (brief: string) => void;
    setPlanningModel: (id: string) => void;
    plan: () => Promise<void>;
    setBudget: (budget: number) => void;
    addTask: (task: Omit<Task, "id">) => void;
    updateTask: (id: string, patch: Partial<Omit<Task, "id">>) => void;
    removeTask: (id: string) => void;
    moveTask: (id: string, by: -1 | 1) => void;
    renamePhase: (from: string, to: string) => void;
    setSummary: (text: string) => void;
    setRequirements: (patch: Partial<Requirements>) => void;
    choose: (taskId: string, slug: string | null) => void;
    lock: (taskId: string, slug: string) => void;
    unlock: (taskId: string) => void;
  };
  meta: { catalog: Catalog; nowSeconds: number };
};

export const PlanContext = createContext<PlanContextValue | null>(null);

/** For parts of the plan family only. */
export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("Plan parts must be rendered inside Plan.Provider");
  return ctx;
}
