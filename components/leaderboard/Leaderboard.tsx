"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { PricedModel } from "@/domain/types";
import { Frame } from "../chart/Frame";
import { Legend } from "../chart/Legend";
import { labColors, OTHER } from "./labColors";
import { BASE, EASE_OUT } from "../ui/motion";
import { applyFilters, labsWithCounts, METRIC_LABEL, type Filters } from "./data";
import { FilterBar } from "./FilterBar";
import { RankBars } from "./RankBars";
import { Scatter } from "./Scatter";
import { ScoreTable } from "./ScoreTable";

const START: Filters = { metric: "intelligence", labs: [], query: "", openOnly: false };

export function Leaderboard({ models }: { models: PricedModel[] }) {
  const [filters, setFilters] = useState(START);
  const [tableOpen, setTableOpen] = useState(false);
  const shown = applyFilters(models, filters);
  const label = METRIC_LABEL[filters.metric];
  const colors = labColors(shown);
  const labLegend = [...colors].map(([lab, color]) => ({ label: lab, color }));
  return (
    <div className="space-y-6">
      <FilterBar
        filters={filters}
        labs={labsWithCounts(models)}
        onChange={(patch) => setFilters({ ...filters, ...patch })}
      />
      <Frame
        title={`${label} score against price`}
        note={
          <Legend
            items={[
              { label: "Closed weights", color: "var(--color-accent)" },
              { label: "Open weights", color: "var(--color-open)" },
            ]}
          />
        }
      >
        <Scatter models={shown} metric={filters.metric} />
      </Frame>
      <Frame
        title={`Top 20 by ${label.toLowerCase()} score`}
        note={<Legend items={[...labLegend, { label: "Other", color: OTHER }]} />}
      >
        <RankBars models={shown} metric={filters.metric} colors={colors} />
      </Frame>
      <section className="space-y-3">
        <button
          type="button"
          onClick={() => setTableOpen(!tableOpen)}
          aria-expanded={tableOpen}
          className="h-8 rounded-lg px-3 text-[13px] font-medium text-ink ring-1 ring-line transition-colors hover:bg-subtle"
        >
          {tableOpen ? "Hide table" : `Show all ${shown.length} as a table`}
        </button>
        <AnimatePresence initial={false}>
          {tableOpen ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: BASE, ease: EASE_OUT }}
              className="overflow-hidden"
            >
              <ScoreTable key={filters.metric} models={shown} metric={filters.metric} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>
    </div>
  );
}
