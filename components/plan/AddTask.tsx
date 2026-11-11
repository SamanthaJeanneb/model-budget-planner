"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import type { TaskSize, TaskType } from "@/domain/types";
import { Button } from "../ui/Button";
import { usePlan } from "./context";
import { SizeField, TypeField } from "./TaskFields";

/** Add a task to one phase by hand. */
export function AddTask({ phase }: { phase: string }) {
  const { actions } = usePlan();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>("coding");
  const [size, setSize] = useState<TaskSize>("medium");
  const add = () => {
    if (!title.trim()) return;
    actions.addTask({ title: title.trim(), detail: "", phase, type, size });
    setTitle("");
  };
  return (
    <form
      className="flex flex-wrap items-center gap-2 px-4 py-2"
      onSubmit={(e) => {
        e.preventDefault();
        add();
      }}
    >
      <Plus className="size-4 text-ink-3" />
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={`Add a task to ${phase}`}
        aria-label={`New task in ${phase}`}
        className="h-8 min-w-48 flex-1 bg-transparent text-[13px] outline-none placeholder:text-ink-3"
      />
      {title ? (
        <>
          <TypeField value={type} onChange={setType} variant="default" />
          <SizeField value={size} onChange={setSize} variant="default" />
          <Button type="submit">Add</Button>
        </>
      ) : null}
    </form>
  );
}
