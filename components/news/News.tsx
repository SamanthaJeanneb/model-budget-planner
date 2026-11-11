"use client";

import { Rss } from "lucide-react";
import { useState } from "react";
import { formatReleaseDate } from "@/domain/money";
import { isNew, strongestScore } from "@/domain/score";
import type { PricedModel } from "@/domain/types";
import { Segmented, SegmentedItem } from "../ui/Segmented";
import { NewsRow } from "./NewsRow";

const RSS_URL = "https://openrouter.ai/api/v1/models?sort=newest&use_rss=true";
const NEWS_LIMIT = 40;

type Show = "all" | "scored" | "open";

const EMPTY: Record<Show, string> = {
  all: "No new models listed.",
  scored: "None of the newest models have benchmark scores yet. Show all to see them.",
  open: "None of the newest models have open weights. Show all to see them.",
};

/** Newest models, grouped by release day. "Now" is the newest release, so the page renders the same on server and client. */
export function News({ models }: { models: PricedModel[] }) {
  const [show, setShow] = useState<Show>("all");
  const newest = [...models].sort((a, b) => b.created - a.created).slice(0, NEWS_LIMIT);
  const now = newest[0]?.created ?? 0;
  const shown = newest.filter(
    (m) => show === "all" || (show === "scored" ? strongestScore(m) !== null : m.openWeights),
  );
  const days = new Map<string, PricedModel[]>();
  for (const m of shown) {
    const day = formatReleaseDate(m.created);
    days.set(day, [...(days.get(day) ?? []), m]);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented aria-label="Show" value={show} onValueChange={(v) => setShow(v as Show)}>
          <SegmentedItem value="all">All</SegmentedItem>
          <SegmentedItem value="scored">With scores</SegmentedItem>
          <SegmentedItem value="open">Open weights</SegmentedItem>
        </Segmented>
        <a
          href={RSS_URL}
          target="_blank"
          rel="noreferrer"
          className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-ink ring-1 ring-line transition-colors hover:bg-subtle"
        >
          <Rss className="size-3.5 text-ink-3" />
          RSS feed
        </a>
      </div>
      {shown.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-3">{EMPTY[show]}</p>
      ) : (
        [...days].map(([day, list]) => (
          <section key={day} className="relative pl-6">
            <span
              className="absolute top-1.5 left-0 size-2 rounded-full bg-accent ring-4 ring-accent-soft"
              aria-hidden
            />
            <span className="absolute top-5 bottom-0 left-[3.5px] w-px bg-line" aria-hidden />
            <h2 className="mb-2 text-[13px] font-semibold text-ink">
              {day} <span className="font-normal text-ink-3">{list.length}</span>
            </h2>
            <ul className="overflow-hidden rounded-xl ring-1 ring-line [&>li+li]:border-t [&>li+li]:border-line-soft">
              {list.map((m) => (
                <NewsRow key={m.slug} model={m} isNew={isNew(m, now)} models={models} />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
