import { CONTEXT_OPTIONS } from "@/domain/rules";
import { Select, SelectItem } from "../ui/Select";

function label(tokens: number): string {
  if (tokens === 0) return "Any";
  return tokens >= 1_000_000 ? `${tokens / 1_000_000}M tokens` : `${tokens / 1000}k tokens`;
}

export function ContextLength({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="whitespace-nowrap">Min. context</span>
      <Select
        aria-label="Minimum context"
        value={String(value)}
        onValueChange={(v) => onChange(Number(v))}
        display={label(value)}
        className="w-28 shrink-0"
      >
        {CONTEXT_OPTIONS.map((t) => (
          <SelectItem key={t} value={String(t)}>
            {label(t)}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
