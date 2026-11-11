"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import { formatMoney } from "@/domain/money";
import { EASE_OUT, FIGURE_TWEEN } from "./motion";

/** A dollar figure that tweens to its new value. */
export function Money({ value, className = "" }: { value: number; className?: string }) {
  const shown = useMotionValue(value);
  const text = useTransform(shown, (v) => formatMoney(v));
  useEffect(() => {
    const controls = animate(shown, value, { duration: FIGURE_TWEEN, ease: EASE_OUT });
    return () => controls.stop();
  }, [shown, value]);
  return <motion.span className={`tabular-nums ${className}`}>{text}</motion.span>;
}
