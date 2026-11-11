"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex h-screen p-2">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl bg-surface text-sm ring-1 ring-line">
        <p className="text-ink-2">Couldn&apos;t load model data from OpenRouter.</p>
        <button
          type="button"
          onClick={reset}
          className="h-8 rounded-lg bg-ink px-3 font-medium text-white hover:bg-ink/85"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
