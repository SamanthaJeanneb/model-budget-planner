"use client";

import { Command } from "cmdk";
import { Popover } from "radix-ui";
import { useState, type ReactNode } from "react";
import { Check, Chevron } from "./Select";

type RootProps = {
  /** What the closed trigger shows. */
  display: ReactNode;
  "aria-label": string;
  placeholder: string;
  children: ReactNode;
  className?: string;
  width?: string;
};

/**
 * A searchable picker. Items are children; cmdk filters them by their `keywords`,
 * moves the highlight with arrow keys and on hover.
 */
export function Combobox({
  display,
  placeholder,
  children,
  className = "",
  width = "w-96",
  ...aria
}: RootProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={aria["aria-label"]}
        className={`group inline-flex h-9 items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 text-left text-sm text-ink transition-colors hover:border-ink-3 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent data-[state=open]:border-accent ${className}`}
      >
        <span className="min-w-0 flex-1 truncate">{display}</span>
        <Chevron />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className={`z-50 ${width} overflow-hidden rounded-xl border border-line bg-surface shadow-[0_8px_24px_-8px_rgba(22,24,29,0.18)]`}
        >
          <Command loop onClick={(e) => (e.target as HTMLElement).closest("[cmdk-item]") && setOpen(false)}>
            <Command.Input
              placeholder={placeholder}
              className="h-10 w-full border-b border-line px-3 text-sm outline-none placeholder:text-ink-3"
            />
            <Command.List className="max-h-80 overflow-y-auto p-1">
              <Command.Empty className="px-3 py-6 text-center text-sm text-ink-3">No matches</Command.Empty>
              {children}
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

type ItemProps = {
  value: string;
  keywords: string[];
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
};

export function ComboboxItem({ value, keywords, selected, onSelect, children }: ItemProps) {
  return (
    <Command.Item
      value={value}
      keywords={keywords}
      onSelect={onSelect}
      className="flex cursor-default items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-ink select-none data-[selected=true]:bg-subtle"
    >
      <span className="min-w-0 flex-1">{children}</span>
      <span className={`text-accent ${selected ? "" : "invisible"}`}>
        <Check />
      </span>
    </Command.Item>
  );
}

export function ComboboxGroup({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <Command.Group
      heading={heading}
      className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-ink-3"
    >
      {children}
    </Command.Group>
  );
}
