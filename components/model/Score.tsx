const KIND_LABEL = { intelligence: "Intelligence", coding: "Coding", agentic: "Agentic" } as const;

export function Score({ kind, value }: { kind: keyof typeof KIND_LABEL; value: number }) {
  return (
    <span>
      {KIND_LABEL[kind]} <span className="tabular-nums">{value.toFixed(1)}</span>
    </span>
  );
}
