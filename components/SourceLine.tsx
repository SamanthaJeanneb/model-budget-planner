import type { ReactNode } from "react";
import { formatShortDate } from "@/domain/money";

/** The CC BY 4.0 attribution each page must show. */
export function SourceLine({ asOf, children }: { asOf: string; children: ReactNode }) {
  return (
    <p className="text-xs text-ink-3">
      {children} as of {formatShortDate(asOf)} {asOf.slice(0, 4)}. CC BY 4.0.
    </p>
  );
}
