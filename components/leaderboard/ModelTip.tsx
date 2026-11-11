import { shortName } from "@/domain/money";
import type { PricedModel, ScoreKind } from "@/domain/types";
import { Tip, TipRow } from "../chart/Tip";
import { contextLabel, METRIC_LABEL, perMillion } from "./data";

/** Everything a reader wants on hover over one model's mark. */
export function ModelTip({ model, metric }: { model: PricedModel; metric: ScoreKind }) {
  return (
    <Tip title={shortName(model.name)}>
      <TipRow label="Lab">{model.lab}</TipRow>
      {(["intelligence", "coding", "agentic"] as const).map((k) => (
        <TipRow key={k} label={METRIC_LABEL[k]}>
          <span className={k === metric ? "font-medium" : ""}>{model.scores[k]?.toFixed(1) ?? "—"}</span>
        </TipRow>
      ))}
      <TipRow label="Price per M in / out">
        {perMillion(model.promptPrice)} / {perMillion(model.completionPrice)}
      </TipRow>
      <TipRow label="Context">{contextLabel(model.contextLength)} tokens</TipRow>
      <TipRow label="Weights">{model.openWeights ? "Open" : "Closed"}</TipRow>
    </Tip>
  );
}
