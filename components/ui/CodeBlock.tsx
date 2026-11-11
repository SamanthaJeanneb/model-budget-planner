"use client";

import { useState } from "react";

export function CodeBlock({ label, content }: { label: string; content: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <figure className="border-t border-line pt-3">
      <figcaption className="mb-2 flex items-baseline justify-between text-sm">
        <span className="font-mono text-ink-2">{label}</span>
        <button type="button" onClick={copy} className="text-ink-2 hover:text-ink">
          {copied ? "Copied" : "Copy"}
        </button>
      </figcaption>
      <pre className="overflow-x-auto rounded-md bg-subtle p-3 font-mono ring-1 ring-line-soft text-xs leading-relaxed text-ink">
        {content}
      </pre>
    </figure>
  );
}
