"use client";

import type { TaskResult } from "@/domain/types";
import { HoverNote } from "../ui/HoverNote";
import { ArrowDown, ArrowUp, Lock, LockOpen, Trash2 } from "lucide-react";
import { usePlan } from "./context";

const ICON_BUTTON =
  "inline-flex size-6 items-center justify-center rounded-lg transition-colors hover:bg-line-soft focus-visible:outline-2 focus-visible:outline-accent";

/** Lock the model on a task, or remove the task. */
export function RowActions({ row, locked }: { row: TaskResult; locked: boolean }) {
  const { actions } = usePlan();
  const pick = row.pick;
  return (
    <div className="flex justify-end gap-0.5">
      <button
        type="button"
        aria-label="Move up"
        onClick={() => actions.moveTask(row.task.id, -1)}
        className={`${ICON_BUTTON} text-ink-3 opacity-0 group-hover:opacity-100 hover:text-ink focus-visible:opacity-100`}
      >
        <ArrowUp className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label="Move down"
        onClick={() => actions.moveTask(row.task.id, 1)}
        className={`${ICON_BUTTON} text-ink-3 opacity-0 group-hover:opacity-100 hover:text-ink focus-visible:opacity-100`}
      >
        <ArrowDown className="size-3.5" />
      </button>
      {locked ? (
        <HoverNote
          trigger={
            <button
              type="button"
              aria-label="Unlock model"
              onClick={() => actions.unlock(row.task.id)}
              className={`${ICON_BUTTON} text-accent`}
            >
              <Lock className="size-3.5" />
            </button>
          }
        >
          Locked. The budget won&apos;t change this model.
        </HoverNote>
      ) : pick ? (
        <HoverNote
          trigger={
            <button
              type="button"
              aria-label="Lock model"
              onClick={() => actions.lock(row.task.id, pick.model.slug)}
              className={`${ICON_BUTTON} text-ink-3 opacity-0 group-hover:opacity-100 hover:text-ink focus-visible:opacity-100`}
            >
              <LockOpen className="size-3.5" />
            </button>
          }
        >
          Keep this model when the budget moves
        </HoverNote>
      ) : null}
      <HoverNote
        trigger={
          <button
            type="button"
            aria-label="Remove task"
            onClick={() => actions.removeTask(row.task.id)}
            className={`${ICON_BUTTON} text-ink-3 opacity-0 group-hover:opacity-100 hover:text-bad focus-visible:opacity-100`}
          >
            <Trash2 className="size-3.5" />
          </button>
        }
      >
        Remove task
      </HoverNote>
    </div>
  );
}
