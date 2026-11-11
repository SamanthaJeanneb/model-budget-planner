"use client";

import { motion } from "motion/react";
import { shortName } from "@/domain/money";
import type { PricedModel, ScoreKind } from "@/domain/types";
import { formatPriceTick, linear, linearTicks, log, logTicks } from "../chart/scale";
import { useWidth } from "../chart/useWidth";
import { Plan } from "../plan";
import { HoverNote } from "../ui/HoverNote";
import { EASE_OUT, SLOW } from "../ui/motion";
import { blendedPerMillion, METRIC_LABEL, valueFrontier } from "./data";
import { ModelTip } from "./ModelTip";

const HEIGHT = 420;
const M = { top: 16, right: 24, bottom: 44, left: 44 };
const LABELLED = 6;

type Props = { models: PricedModel[]; metric: ScoreKind };

/** Score against price, one dot per model, with the best-value frontier drawn through it. */
export function Scatter({ models, metric }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>(900);
  const priced = models.filter((m) => blendedPerMillion(m) > 0);
  if (priced.length === 0) return <Empty />;

  const prices = priced.map(blendedPerMillion);
  const scores = priced.map((m) => m.scores[metric] ?? 0);
  const xDomain: [number, number] = [Math.min(...prices) / 1.4, Math.max(...prices) * 1.4];
  const yDomain: [number, number] = [
    Math.max(0, Math.floor((Math.min(...scores) - 4) / 10) * 10),
    Math.min(100, Math.ceil((Math.max(...scores) + 4) / 10) * 10),
  ];
  const x = log(xDomain, [M.left, width - M.right]);
  const y = linear(yDomain, [HEIGHT - M.bottom, M.top]);
  const frontier = valueFrontier(priced, metric);
  const first = frontier.at(0);
  const taken: Box[] = first
    ? [
        labelBox(
          x(blendedPerMillion(first)) - 14,
          y(first.scores[metric] ?? 0) - 12,
          "Best value frontier",
          false,
        ),
      ]
    : [];
  const top = new Set<string>();
  for (const m of [...priced].sort((a, b) => (b.scores[metric] ?? 0) - (a.scores[metric] ?? 0))) {
    if (top.size >= LABELLED) break;
    const cx = x(blendedPerMillion(m));
    const box = labelBox(cx, y(m.scores[metric] ?? 0), shortName(m.name), cx > width - 180);
    if (taken.some((t) => overlaps(t, box))) continue;
    taken.push(box);
    top.add(m.slug);
  }
  const path = frontier
    .map((m, i) => {
      const px = x(blendedPerMillion(m));
      const py = y(m.scores[metric] ?? 0);
      return i === 0 ? `M${px} ${py}` : `H${px} V${py}`;
    })
    .join(" ");

  return (
    <div ref={ref} className="relative w-full" style={{ height: HEIGHT }}>
      <svg width={width} height={HEIGHT} className="absolute inset-0" aria-hidden>
        {linearTicks(yDomain, 5).map((t) => (
          <g key={`y${t}`}>
            <line x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} className="stroke-line-soft" />
            <text
              x={M.left - 8}
              y={y(t)}
              dy="0.32em"
              textAnchor="end"
              className="fill-ink-3 text-[11px] tabular-nums"
            >
              {t}
            </text>
          </g>
        ))}
        {logTicks(xDomain).map((t) => (
          <g key={`x${t}`}>
            <line x1={x(t)} x2={x(t)} y1={M.top} y2={HEIGHT - M.bottom} className="stroke-line-soft" />
            <text
              x={x(t)}
              y={HEIGHT - M.bottom + 16}
              textAnchor="middle"
              className="fill-ink-3 text-[11px] tabular-nums"
            >
              {formatPriceTick(t)}
            </text>
          </g>
        ))}
        <line
          x1={M.left}
          x2={width - M.right}
          y1={HEIGHT - M.bottom}
          y2={HEIGHT - M.bottom}
          className="stroke-line"
        />
        <path d={path} fill="none" className="stroke-ink-3" strokeWidth={2} strokeDasharray="4 3" />
        {first ? (
          <text
            x={x(blendedPerMillion(first))}
            y={y(first.scores[metric] ?? 0) - 12}
            textAnchor="start"
            className="fill-ink-2 text-[11px]"
          >
            Best value frontier
          </text>
        ) : null}
        <text
          x={(M.left + width - M.right) / 2}
          y={HEIGHT - 6}
          textAnchor="middle"
          className="fill-ink-2 text-xs"
        >
          Price per million tokens, 90% input (log scale)
        </text>
        <text
          transform={`translate(12 ${(M.top + HEIGHT - M.bottom) / 2}) rotate(-90)`}
          textAnchor="middle"
          className="fill-ink-2 text-xs"
        >
          {METRIC_LABEL[metric]} score
        </text>
      </svg>
      {priced.map((m) => {
        const cx = x(blendedPerMillion(m));
        const cy = y(m.scores[metric] ?? 0);
        const flip = cx > width - 180;
        return (
          <motion.div
            key={m.slug}
            className="group absolute top-0 left-0"
            initial={false}
            animate={{ x: cx - 10, y: cy - 10 }}
            transition={{ duration: SLOW, ease: EASE_OUT }}
          >
            <HoverNote
              trigger={
                <button
                  type="button"
                  aria-label={shortName(m.name)}
                  className="flex size-5 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <span
                    className={`size-2 rounded-full ring-2 ring-subtle transition-transform group-hover:scale-150 group-has-[[data-in-stack]]:size-2.5 group-has-[[data-in-stack]]:ring-4 group-has-[[data-in-stack]]:ring-ink/15 ${m.openWeights ? "bg-open" : "bg-accent"}`}
                  />
                </button>
              }
            >
              <ModelTip model={m} metric={metric} />
            </HoverNote>
            <span
              className={`pointer-events-none absolute top-0.5 rounded bg-surface/85 px-1 text-xs whitespace-nowrap text-ink-2 group-has-[[data-in-stack]]:block group-has-[[data-in-stack]]:font-medium group-has-[[data-in-stack]]:text-ink ${flip ? "right-6" : "left-6"} ${top.has(m.slug) ? "block" : "hidden"} [&_[data-in-stack]]:sr-only`}
            >
              {shortName(m.name)}
              <Plan.InStack slug={m.slug} />
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

type Box = { x1: number; x2: number; y1: number; y2: number };

/** Rough box a label takes up beside its dot, to keep labels from landing on each other. */
function labelBox(cx: number, cy: number, text: string, flip: boolean): Box {
  const w = text.length * 6.4 + 8;
  const x1 = flip ? cx - 14 - w : cx + 14;
  return { x1, x2: x1 + w, y1: cy - 9, y2: cy + 9 };
}

function overlaps(a: Box, b: Box) {
  return a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;
}

function Empty() {
  return (
    <p className="py-16 text-center text-sm text-ink-3">
      No priced models match these filters. Clear a filter to see more.
    </p>
  );
}
