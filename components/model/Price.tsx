import type { Model } from "@/domain/types";

const PER_MILLION = 1_000_000;

function perMillion(usdPerToken: number): string {
  const v = usdPerToken * PER_MILLION;
  return v >= 10 ? `$${v.toFixed(0)}` : `$${v.toFixed(2)}`;
}

/** Prompt and completion price per million tokens. */
export function Price({ model }: { model: Model }) {
  return (
    <span className="tabular-nums">
      {perMillion(model.promptPrice)} / {perMillion(model.completionPrice)}
    </span>
  );
}
