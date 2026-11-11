"use client";

import { AnimatePresence, motion } from "motion/react";
import { shortName } from "@/domain/money";
import type { Model } from "@/domain/types";
import { BASE, EASE_OUT } from "../ui/motion";

/** The model's name; a change of model cross-fades in place. */
export function Name({ model }: { model: Model }) {
  return (
    <span className="relative inline-grid">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={model.slug}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: BASE, ease: EASE_OUT }}
          className="col-start-1 row-start-1 truncate"
          title={model.id}
        >
          {shortName(model.name)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
