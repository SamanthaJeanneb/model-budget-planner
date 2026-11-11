"use client";

import { motion } from "motion/react";
import { Popover as RadixPopover } from "radix-ui";
import type { ReactNode } from "react";
import { BASE, EASE_OUT } from "./motion";

export const PopoverRoot = RadixPopover.Root;
export const PopoverTrigger = RadixPopover.Trigger;

export function PopoverContent({ children }: { children: ReactNode }) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content sideOffset={6} align="start" asChild>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: BASE, ease: EASE_OUT }}
          className="z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-lg border border-line bg-white p-3 text-sm shadow-lg"
        >
          {children}
        </motion.div>
      </RadixPopover.Content>
    </RadixPopover.Portal>
  );
}
