"use client";

import { Select as RadixSelect } from "radix-ui";
import type { ReactNode } from "react";

type RootProps = {
  value: string;
  onValueChange: (value: string) => void;
  "aria-label": string;
  children: ReactNode;
  /** What the closed trigger shows. */
  display: ReactNode;
  className?: string;
  variant?: keyof typeof TRIGGER;
};

const TRIGGER = {
  default:
    "h-8 rounded-lg border border-line bg-surface px-2.5 hover:border-ink-3 data-[state=open]:border-accent",
  ghost:
    "-ml-1.5 h-6 rounded px-1.5 text-ink-2 hover:bg-line-soft hover:text-ink data-[state=open]:bg-line-soft",
};

/** A custom select: keyboard, hover and check states, styled to match. */
export function Select({
  value,
  onValueChange,
  display,
  children,
  className = "",
  variant = "default",
  ...aria
}: RootProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange}>
      <RadixSelect.Trigger
        aria-label={aria["aria-label"]}
        className={`group inline-flex items-center justify-between gap-1.5 text-sm text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent ${TRIGGER[variant]} ${className}`}
      >
        <span className="truncate">{display}</span>
        <Chevron />
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-80 min-w-(--radix-select-trigger-width) overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-[0_8px_24px_-8px_rgba(22,24,29,0.18)]"
        >
          <RadixSelect.Viewport>{children}</RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

export function SelectItem({ value, children }: { value: string; children: ReactNode }) {
  return (
    <RadixSelect.Item
      value={value}
      className="relative flex h-8 cursor-default items-center rounded-lg pr-8 pl-2.5 text-sm text-ink outline-none select-none data-highlighted:bg-subtle data-[state=checked]:font-medium"
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className="absolute right-2.5 text-accent">
        <Check />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
}

export function Chevron() {
  return (
    <svg
      viewBox="0 0 12 12"
      className="size-3 shrink-0 text-ink-3 transition-transform group-data-[state=open]:rotate-180"
      aria-hidden
    >
      <path d="M3 4.5 6 7.5l3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function Check() {
  return (
    <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
      <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
