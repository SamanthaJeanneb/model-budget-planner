import type { Catalog } from "@/domain/types";
import { Plan } from "../plan";
import { Section } from "../shell/Section";
import { SourceLine } from "../SourceLine";

export function PlanPage({ catalog }: { catalog: Catalog }) {
  return (
    <div className="flex h-full max-lg:flex-col">
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[800px] space-y-12 px-10 py-10 max-md:px-5">
          <Plan.Project />
          <Section title="Budget">
            <Plan.Budget />
          </Section>
          <Plan.Review />
          <SourceLine asOf={catalog.costWindowEnd}>
            Costs: OpenRouter session-cost dataset, Claude Code medians over {catalog.costWindowDays} days,
          </SourceLine>
        </div>
      </div>
      <aside className="w-[20rem] shrink-0 space-y-10 overflow-y-auto border-l border-line px-7 py-10 max-lg:w-full max-lg:border-t max-lg:border-l-0">
        <Plan.Summary />
        <Plan.ExportDialog />
        <Plan.Requirements />
      </aside>
    </div>
  );
}
