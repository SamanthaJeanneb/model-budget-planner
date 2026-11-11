import type { ReactNode } from "react";
import { Select, SelectItem } from "../ui/Select";

const LEVELS = [0, 30, 40, 50, 55, 60, 70];

type Props = {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  children: ReactNode;
};

/** A floor on the score a task's model must reach. */
export function MinScore({ value, onChange, children }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="min-w-0">{children}</span>
      <Select
        aria-label="Minimum score"
        value={String(value ?? 0)}
        onValueChange={(v) => onChange(v === "0" ? undefined : Number(v))}
        display={value ? `At least ${value}` : "Any score"}
        className="w-28 shrink-0"
      >
        {LEVELS.map((l) => (
          <SelectItem key={l} value={String(l)}>
            {l === 0 ? "Any score" : `At least ${l}`}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
