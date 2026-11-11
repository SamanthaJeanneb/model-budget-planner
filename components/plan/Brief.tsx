"use client";

import { ArrowUp } from "lucide-react";
import { usePlan } from "./context";
import { PlannerPicker } from "./PlannerPicker";
import type { PlanError } from "./reducer";

const ERROR_TEXT: Record<PlanError, string> = {
  "invalid-brief": "Describe the project in at least 10 characters.",
  "unknown-model": "That model can't plan. Pick another.",
  "no-tasks": "The planning model returned no tasks. Try again or pick another model.",
  failed: "Planning failed. Try again or pick another model.",
};

const EXAMPLES = [
  "Habit tracker with streaks and reminders, Next.js and Postgres",
  "Go CLI that syncs a folder to S3 with resumable uploads",
  "Stripe subscriptions and a billing page for a Rails app",
];

export function Brief() {
  const { state, actions } = usePlan();
  const planning = state.status === "planning";
  const ready = state.brief.trim().length >= 10 && !planning;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) void actions.plan();
      }}
    >
      <label htmlFor="brief" className="mb-4 block text-xl font-semibold tracking-tight">
        What are you building?
      </label>
      <div className="rounded-xl bg-surface shadow-[0_1px_2px_rgba(26,26,26,0.05)] ring-1 ring-line transition-shadow focus-within:ring-ink-3">
        <textarea
          id="brief"
          rows={3}
          value={state.brief}
          onChange={(e) => actions.setBrief(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && ready) void actions.plan();
          }}
          placeholder="Describe the project, its stack and what done looks like"
          className="block w-full resize-none rounded-t-xl bg-transparent px-4 pt-3.5 text-[14px] leading-relaxed outline-none placeholder:text-ink-3"
        />
        <div className="flex items-center justify-between gap-3 px-2.5 pt-1 pb-2.5">
          <PlannerPicker />
          <button
            type="submit"
            disabled={!ready}
            aria-label={planning ? "Planning" : "Plan tasks"}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-ink pr-2 pl-3 text-[13px] font-medium text-white transition-colors hover:bg-ink/85 disabled:bg-line disabled:text-ink-3"
          >
            {planning ? "Planning…" : state.tasks.length > 0 ? "Plan again" : "Plan tasks"}
            <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
      {state.error ? <p className="mt-2 text-[13px] text-bad">{ERROR_TEXT[state.error]}</p> : null}
      {state.brief === "" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => actions.setBrief(ex)}
              className="h-7 rounded-lg bg-subtle px-2.5 text-xs text-ink-2 ring-1 ring-line-soft transition-colors hover:text-ink hover:ring-line"
            >
              {ex}
            </button>
          ))}
        </div>
      ) : null}
    </form>
  );
}
