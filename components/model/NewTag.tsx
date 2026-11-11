"use client";

import { HoverCard } from "radix-ui";
import { formatReleaseDate, shortName } from "@/domain/money";
import { newModelBrief } from "@/domain/newModel";
import type { Model } from "@/domain/types";
import { NewBrief } from "./NewBrief";

/** The "New" tag. Hover it for what the model is, what it's best at and what changed. */
export function NewTag({ model, models }: { model: Model; models: Model[] }) {
  const brief = newModelBrief(model, models);
  return (
    <HoverCard.Root openDelay={150} closeDelay={100}>
      <HoverCard.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-5 shrink-0 cursor-help items-center rounded-md bg-accent-soft px-1.5 text-[11px] font-medium text-accent-strong transition-colors hover:bg-accent hover:text-white"
        >
          New
        </button>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={12}
          className="z-50 w-80 rounded-xl border border-line bg-surface p-4 text-[13px] shadow-[0_12px_32px_-12px_rgba(26,26,26,0.25)]"
        >
          <div className="mb-2">
            <p className="font-semibold">{shortName(model.name)}</p>
            <p className="text-xs text-ink-3">
              {model.lab}, released {formatReleaseDate(model.created)}
            </p>
          </div>
          {model.description ? (
            <p className="mb-3 line-clamp-3 text-xs leading-relaxed text-ink-2">{model.description}</p>
          ) : null}
          <NewBrief model={model} brief={brief} />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
