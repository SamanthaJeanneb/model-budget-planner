import type { ComponentProps } from "react";

const styles = {
  primary: "bg-ink text-white hover:bg-ink/85 disabled:bg-ink/25",
  quiet: "text-ink-2 hover:bg-subtle hover:text-ink disabled:text-ink-3",
  outline: "bg-surface text-ink ring-1 ring-line ring-inset hover:bg-subtle disabled:text-ink-3",
};

type Props = ComponentProps<"button"> & { variant?: keyof typeof styles };

export function Button({ variant = "outline", className = "", ...props }: Props) {
  return (
    <button
      type="button"
      className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-[13px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
