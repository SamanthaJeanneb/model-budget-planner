"use client";

import { useState } from "react";

type Props = {
  value: string;
  onCommit: (value: string) => void;
  "aria-label": string;
  placeholder: string;
  rows?: number;
  className?: string;
};

/** A paragraph that edits in place; commits on blur. */
export function InlineArea({ value, onCommit, placeholder, rows = 2, className = "", ...aria }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <textarea
      aria-label={aria["aria-label"]}
      value={draft ?? value}
      rows={rows}
      placeholder={placeholder}
      onFocus={() => setDraft(value)}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (draft !== null && draft.trim() !== value) onCommit(draft.trim());
        setDraft(null);
      }}
      className={`-mx-1.5 block w-full resize-none rounded-md bg-transparent px-1.5 py-0.5 leading-relaxed outline-none placeholder:text-ink-3 hover:bg-subtle focus:bg-surface focus:ring-1 focus:ring-line ${className}`}
    />
  );
}
