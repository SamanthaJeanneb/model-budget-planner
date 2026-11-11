"use client";

import { Tooltip } from "radix-ui";
import type { ReactNode } from "react";

/** A small note that opens on hover or focus. */
export function HoverNote({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
  return (
    <Tooltip.Provider delayDuration={150}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{trigger}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={4}
            className="z-50 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs text-ink-2 shadow-[0_8px_24px_-8px_rgba(26,26,26,0.2)]"
          >
            {children}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
