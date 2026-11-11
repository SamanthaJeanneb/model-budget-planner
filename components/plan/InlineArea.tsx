"use client";

import { useLayoutEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onCommit: (value: string) => void;
  "aria-label": string;
  placeholder: string;
  className?: string;
};

/** A paragraph that edits in place and grows to fit its text; commits on blur. */
export function InlineArea({ value, onCommit, placeholder, className = "", ...aria }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const shown = draft ?? value;
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [shown]);
  return (
    <textarea
      ref={ref}
      aria-label={aria["aria-label"]}
      value={shown}
      rows={1}
      placeholder={placeholder}
      onFocus={() => setDraft(value)}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (draft !== null && draft.trim() !== value) onCommit(draft.trim());
        setDraft(null);
      }}
      className={`-mx-1.5 block w-full resize-none overflow-hidden rounded-md bg-transparent px-1.5 py-0.5 leading-relaxed outline-none placeholder:text-ink-3 hover:bg-subtle focus:bg-surface focus:ring-1 focus:ring-line ${className}`}
    />
  );
}
