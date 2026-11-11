/** The one easing curve and the durations every animation uses. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const FAST = 0.15;
export const BASE = 0.2;
export const SLOW = 0.25;
export const FIGURE_TWEEN = 0.3;
export const STAGGER = 0.03;

export const layoutSpring = { type: "spring", stiffness: 500, damping: 40, mass: 1 } as const;

export const fadeRise = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
  transition: { duration: BASE, ease: EASE_OUT },
} as const;
