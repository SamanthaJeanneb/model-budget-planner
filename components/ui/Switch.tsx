"use client";

import { Switch as RadixSwitch } from "radix-ui";
import type { ReactNode } from "react";

type Props = { checked: boolean; onCheckedChange: (v: boolean) => void; children: ReactNode };

export function Switch({ checked, onCheckedChange, children }: Props) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-ink">
      <span className="min-w-0">{children}</span>
      <RadixSwitch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="relative h-5 w-8 shrink-0 rounded-full bg-line transition-colors hover:bg-ink-3/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent data-[state=checked]:bg-accent"
      >
        <RadixSwitch.Thumb className="block size-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-3.5" />
      </RadixSwitch.Root>
    </label>
  );
}
