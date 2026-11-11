"use client";

import { motion } from "motion/react";
import { Dialog as RadixDialog } from "radix-ui";
import type { ReactNode } from "react";
import { BASE, EASE_OUT } from "./motion";

export const DialogRoot = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

export function DialogContent({ title, children }: { title: string; children: ReactNode }) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-40 bg-ink/20" />
      <RadixDialog.Content asChild aria-describedby={undefined}>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: BASE, ease: EASE_OUT }}
          className="fixed top-[8vh] left-1/2 z-50 max-h-[84vh] w-[min(760px,92vw)] -translate-x-1/2 overflow-y-auto rounded-xl border border-line bg-white p-6 shadow-xl"
        >
          <div className="mb-4 flex items-baseline justify-between">
            <RadixDialog.Title className="text-base font-medium">{title}</RadixDialog.Title>
            <RadixDialog.Close className="text-sm text-ink-2 hover:text-ink">Close</RadixDialog.Close>
          </div>
          {children}
        </motion.div>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
