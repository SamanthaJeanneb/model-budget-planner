"use client";

import { ChevronDown, Lock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { shortName } from "@/domain/money";
import { isNew } from "@/domain/score";
import type { TaskResult } from "@/domain/types";
import { Model } from "../model";
import { Money } from "../ui/Money";
import { BASE, EASE_OUT, layoutSpring, STAGGER } from "../ui/motion";
import { usePlan } from "./context";
import { InlineArea } from "./InlineArea";
import { InlineText } from "./InlineText";
import { modelColors, OTHER_MODEL } from "./modelColors";
import { RowActions } from "./RowActions";
import { SizeField, TypeField } from "./TaskFields";
import { TaskDetail } from "./TaskDetail";

/** One task in the plan review: what it is, who does it, what it costs. Everything edits in place. */
export function TaskCard({ row, index }: { row: TaskResult; index: number }) {
  const [open, setOpen] = useState(false);
  const { state, actions, meta } = usePlan();
  const id = row.task.id;
  const locked = state.locked.includes(id);
  const color = row.pick
    ? (modelColors(state.stack.rows).get(row.pick.model.slug) ?? OTHER_MODEL)
    : OTHER_MODEL;
  return (
    <motion.li
      layout="position"
      transition={{
        layout: layoutSpring,
        duration: BASE,
        ease: EASE_OUT,
        delay: Math.min(index, 12) * STAGGER,
      }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="group border-b border-line-soft last:border-b-0"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_15rem_5rem] gap-x-5 px-4 py-3.5 max-md:grid-cols-1 max-md:gap-y-3">
        <div className="min-w-0">
          <InlineText
            aria-label="Task title"
            value={row.task.title}
            onCommit={(title) => actions.updateTask(id, { title })}
            className="h-7 text-[14px] font-medium"
          />
          <InlineArea
            aria-label="Task detail"
            value={row.task.detail}
            placeholder="Add what this covers and how you'll know it's done"
            onCommit={(detail) => actions.updateTask(id, { detail })}
            className="text-[13px] text-ink-2"
          />
          <div className="mt-1.5 flex flex-wrap items-center gap-1 text-xs">
            <TypeField value={row.task.type} onChange={(type) => actions.updateTask(id, { type })} />
            <SizeField value={row.task.size} onChange={(size) => actions.updateTask(id, { size })} />
            {row.pick ? (
              <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                className="flex h-6 items-center gap-1 rounded px-1.5 text-ink-2 hover:bg-line-soft hover:text-ink"
              >
                Why this model
                <ChevronDown className={`size-3 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
            ) : null}
          </div>
        </div>
        <div className="min-w-0 space-y-2">
          {!row.pick ? (
            <p className="pt-1 text-[13px] text-bad">No model meets the requirements</p>
          ) : locked ? (
            <p className="flex h-9 items-center gap-2 rounded-lg bg-subtle px-3 text-[13px] ring-1 ring-line-soft">
              <span className="size-2 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
              <span className="min-w-0 flex-1 truncate">{shortName(row.pick.model.name)}</span>
              <Lock className="size-3.5 text-ink-3" />
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <span className="size-2 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
              <Model.Picker
                options={row.options}
                current={row.pick}
                chosen={state.choices[id] ?? null}
                onChange={(slug) => actions.choose(id, slug)}
              />
            </div>
          )}
          {row.pick ? (
            <div className="flex items-center gap-2 pl-4 text-xs text-ink-3">
              {isNew(row.pick.model, meta.nowSeconds) ? (
                <Model.NewTag model={row.pick.model} models={meta.catalog.models} />
              ) : null}
              <Model.ScoreBar value={row.pick.score} best={row.best?.score} className="w-20" />
              <span className="tabular-nums">
                {row.pick.score.toFixed(0)}
                {row.pointsGivenUp > 0 ? ` of ${row.best?.score.toFixed(0)}` : ""}
              </span>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {row.pick ? (
            <Money value={row.pick.cost.typical} className="pt-1.5 text-[14px] font-medium" />
          ) : (
            "—"
          )}
          <RowActions row={row} locked={locked} />
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: BASE, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <TaskDetail row={row} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.li>
  );
}
