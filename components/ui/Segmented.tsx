"use client";

import { motion } from "motion/react";
import { ToggleGroup } from "radix-ui";
import { createContext, useContext, useId, type ReactNode } from "react";
import { layoutSpring } from "./motion";

const Ctx = createContext({ value: "", id: "" });

type Props = { value: string; onValueChange: (v: string) => void; "aria-label": string; children: ReactNode };

/** A segmented control: one of a few options, the selection slides between them. */
export function Segmented({ value, onValueChange, children, ...aria }: Props) {
  const id = useId();
  return (
    <Ctx.Provider value={{ value, id }}>
      <ToggleGroup.Root
        type="single"
        value={value}
        onValueChange={(v) => v && onValueChange(v)}
        aria-label={aria["aria-label"]}
        className="inline-flex rounded-lg bg-line-soft p-0.5"
      >
        {children}
      </ToggleGroup.Root>
    </Ctx.Provider>
  );
}

export function SegmentedItem({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useContext(Ctx);
  const on = ctx.value === value;
  return (
    <ToggleGroup.Item
      value={value}
      className="relative h-7 rounded-[5px] px-3 text-sm text-ink-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-accent data-[state=on]:text-ink"
    >
      {on ? (
        <motion.span
          layoutId={`${ctx.id}-seg`}
          transition={layoutSpring}
          className="absolute inset-0 rounded-[5px] bg-surface shadow-[0_1px_2px_rgba(22,24,29,0.08)] ring-1 ring-line"
        />
      ) : null}
      <span className="relative">{children}</span>
    </ToggleGroup.Item>
  );
}
