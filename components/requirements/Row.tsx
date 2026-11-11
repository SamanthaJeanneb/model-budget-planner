import type { ReactNode } from "react";
import { formatMoney } from "@/domain/money";

function signed(usd: number): string {
  if (Math.abs(usd) < 0.005) return "$0";
  return `${usd > 0 ? "+" : "−"}${formatMoney(Math.abs(usd))}`;
}

/** One requirement: its control, and once active, what it adds to the best stack's cost (shown on hover). */
export function Row({ price, children }: { price?: number; children: ReactNode }) {
  return (
    <div className="flex min-h-11 items-center gap-2 border-b border-line-soft py-2 last:border-b-0">
      <div className="min-w-0 flex-1">{children}</div>
      <span
        className={`w-14 shrink-0 text-right text-xs tabular-nums ${price === undefined ? "text-transparent" : price > 0.005 ? "text-warn" : "text-ink-2"}`}
      >
        {price === undefined ? "–" : signed(price)}
      </span>
    </div>
  );
}
