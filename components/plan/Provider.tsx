"use client";

import { useReducer, type ReactNode } from "react";
import { allocate } from "@/domain/allocate";
import { planningModels } from "@/domain/planning";
import { requirementPrices } from "@/domain/requirements";
import { topStackCost } from "@/domain/summary";
import type { Catalog } from "@/domain/types";
import { PlanContext, type PlanContextValue } from "./context";
import { initialState, reducer } from "./reducer";
import { streamPlan } from "./streamPlan";

export function Provider({ catalog, children }: { catalog: Catalog; children: ReactNode }) {
  const defaultPlanner = planningModels(catalog.models)[0]?.id ?? "";
  const [state, dispatch] = useReducer(reducer, defaultPlanner, initialState);

  const input = {
    tasks: state.tasks,
    models: catalog.models,
    budget: state.budget,
    requirements: state.requirements,
    locks: state.choices,
  };
  // Derived during render, never stored.
  const stack = allocate(input);
  const prices = requirementPrices(input);

  const value: PlanContextValue = {
    state: { ...state, stack, prices, topStackCost: topStackCost(input) },
    actions: {
      reset: () => dispatch({ type: "reset" }),
      setBrief: (brief) => dispatch({ type: "brief", brief }),
      setPlanningModel: (id) => dispatch({ type: "planningModel", id }),
      plan: async () => {
        dispatch({ type: "planStart" });
        const error = await streamPlan(state.brief, state.planningModel, {
          onSummary: (text) => dispatch({ type: "planSummary", text }),
          onTask: (task) => dispatch({ type: "planTask", task }),
        });
        dispatch(error ? { type: "planFail", error } : { type: "planDone" });
      },
      setBudget: (budget) => dispatch({ type: "budget", budget }),
      addTask: (task) => dispatch({ type: "addTask", task: { ...task, id: crypto.randomUUID() } }),
      updateTask: (id, patch) => dispatch({ type: "updateTask", id, patch }),
      removeTask: (id) => dispatch({ type: "removeTask", id }),
      moveTask: (id, by) => dispatch({ type: "moveTask", id, by }),
      renamePhase: (from, to) => dispatch({ type: "renamePhase", from, to }),
      setSummary: (text) => dispatch({ type: "summary", text }),
      setRequirements: (patch) => dispatch({ type: "requirements", patch }),
      choose: (taskId, slug) => dispatch({ type: "choose", taskId, slug }),
      lock: (taskId, slug) => dispatch({ type: "lock", taskId, slug }),
      unlock: (taskId) => dispatch({ type: "unlock", taskId }),
    },
    meta: { catalog, nowSeconds: Math.floor(Date.parse(catalog.modelsAsOf) / 1000) },
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
