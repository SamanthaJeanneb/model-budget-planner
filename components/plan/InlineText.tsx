"use client";

import { useState } from "react";

type Props = {
  value: string;
  onCommit: (value: string) => void;
  "aria-label": string;
  placeholder?: string;
  className?: string;
};

/** Text that reads as text and edits in place; commits on blur or Enter, Escape cancels. */
export function InlineText({ value, onCommit, placeholder, className = "", ...aria }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    if (draft !== null && draft.trim() && draft.trim() !== value) onCommit(draft.trim());
    setDraft(null);
  };
  return (
    <input
      aria-label={aria["aria-label"]}
      value={draft ?? value}
      placeholder={placeholder}
      onFocus={() => setDraft(value)}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          setDraft(null);
          requestAnimationFrame(() => e.currentTarget?.blur());
        }
      }}
      className={`-mx-1.5 w-full min-w-0 rounded-md bg-transparent px-1.5 outline-none hover:bg-subtle focus:bg-surface focus:ring-1 focus:ring-line ${className}`}
    />
  );
}
