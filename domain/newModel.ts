import { BLENDED_PROMPT_SHARE } from "./rules";
import type { Model, ScoreKind } from "./types";

const KINDS: ScoreKind[] = ["intelligence", "coding", "agentic"];

/** Words that read better in capitals than in sentence case. */
const TAG_WORDS: Record<string, string> = {
  ui: "UI",
  qa: "Q&A",
  sql: "SQL",
  devops: "DevOps",
  impl: "implementation",
};

/** "code:frontend_ui" → "Frontend UI". */
export function tagLabel(tag: string): string {
  const words = (tag.split(":").at(-1) ?? tag).split("_").map((w) => TAG_WORDS[w] ?? w);
  const text = words.join(" ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export type Rank = { kind: ScoreKind; value: number; rank: number; of: number };

export type NewModelBrief = {
  /** Its rank on each benchmark it has a score for, strongest first. */
  ranks: Rank[];
  /** Task tags it is among the most used for. */
  popularFor: string[];
  /** The same lab's previous scored release, and how this one compares. */
  previous: {
    model: Model;
    deltas: { kind: ScoreKind; delta: number }[];
    /** This model's blended price divided by the previous one's; null if either is free. */
    priceRatio: number | null;
  } | null;
};

function blended(m: Model): number {
  return m.promptPrice * BLENDED_PROMPT_SHARE + m.completionPrice * (1 - BLENDED_PROMPT_SHARE);
}

function hasScore(m: Model): boolean {
  return KINDS.some((k) => m.scores[k] !== null);
}

/** What a model is best at and what changed since its lab's last release. */
export function newModelBrief(model: Model, models: Model[]): NewModelBrief {
  const ranks = KINDS.flatMap((kind) => {
    const value = model.scores[kind];
    if (value === null) return [];
    const scored = models.filter((m) => m.scores[kind] !== null);
    const rank = 1 + scored.filter((m) => (m.scores[kind] ?? 0) > value).length;
    return [{ kind, value, rank, of: scored.length }];
  }).sort((a, b) => a.rank / a.of - b.rank / b.of);

  const prev = models
    .filter((m) => m.lab === model.lab && m.created < model.created && m.slug !== model.slug && hasScore(m))
    .sort((a, b) => b.created - a.created)[0];

  const previous = prev
    ? {
        model: prev,
        deltas: KINDS.flatMap((kind) => {
          const a = model.scores[kind];
          const b = prev.scores[kind];
          return a === null || b === null ? [] : [{ kind, delta: a - b }];
        }),
        priceRatio: blended(model) > 0 && blended(prev) > 0 ? blended(model) / blended(prev) : null,
      }
    : null;

  return { ranks, popularFor: model.popularFor.map(tagLabel), previous };
}
