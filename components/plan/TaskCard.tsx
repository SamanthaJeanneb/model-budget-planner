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
import { RowActions } from "./RowActions";
import { SizeField, TypeField } from "./TaskFields";
import { TaskDetail } from "./TaskDetail";

/** One task in the plan review: what it is, who does it, what it costs. Everything edits in place. */
export function TaskCard({ row, index }: { row: TaskResult; index: number }) {
  const [open, setOpen] = useState(false);
  const { state, actions, meta } = usePlan();
  const id = row.task.id;
  const locked = state.locked.includes(id);
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
      <div className="grid grid-cols-[minmax(0,1fr)_14rem] gap-x-6 px-4 py-4 max-md:grid-cols-1 max-md:gap-y-3">
        <div className="min-w-0">
          <InlineText
            aria-label="Task title"
            value={row.task.title}
            onCommit={(title) => actions.updateTask(id, { title })}
            className="h-7 text-[15px] font-semibold"
          />
          <InlineArea
            aria-label="Task detail"
            value={row.task.detail}
            placeholder="Add what this covers and how you'll know it's done"
            onCommit={(detail) => actions.updateTask(id, { detail })}
            className="mt-0.5 text-[14px] text-ink"
          />
          <div className="mt-2 flex flex-wrap items-center gap-1 text-[13px]">
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
                <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
            ) : null}
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            {row.pick ? (
              <Money value={row.pick.cost.typical} className="text-[15px] font-semibold" />
            ) : (
              <span className="text-[14px] text-bad">No model fits</span>
            )}
            <RowActions row={row} locked={locked} />
          </div>
          {!row.pick ? null : locked ? (
            <p className="flex h-9 items-center gap-2 rounded-lg bg-subtle px-3 text-[14px] ring-1 ring-line-soft">
              <span className="min-w-0 flex-1 truncate">{shortName(row.pick.model.name)}</span>
              <Lock className="size-3.5 text-ink-2" />
            </p>
          ) : (
            <Model.Picker
              options={row.options}
              current={row.pick}
              chosen={state.choices[id] ?? null}
              onChange={(slug) => actions.choose(id, slug)}
            />
          )}
          {row.pick && isNew(row.pick.model, meta.nowSeconds) ? (
            <div>
              <Model.NewTag model={row.pick.model} models={meta.catalog.models} />
            </div>
          ) : null}
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
