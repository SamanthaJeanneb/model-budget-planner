import { formatShortDate } from "@/domain/money";

/** Where the numbers come from and how fresh they are. */
export function DataStatus({ asOf }: { asOf: string }) {
  return (
    <a
      href="https://openrouter.ai/rankings"
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors hover:bg-black/[0.04]"
    >
      <span className="size-2 rounded-full bg-[#1baf7a] ring-4 ring-[#1baf7a]/15" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-ink-2">OpenRouter data</span>
        <span className="block text-xs text-ink-3">Updated {formatShortDate(asOf)}</span>
      </span>
    </a>
  );
}
