import type { Catalog } from "@/domain/types";
import { Leaderboard } from "../leaderboard/Leaderboard";
import { PageTitle } from "../shell/PageTitle";
import { SourceLine } from "../SourceLine";

export function BenchmarksPage({ catalog }: { catalog: Catalog }) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[1100px] space-y-8 px-10 py-10 max-md:px-5">
        <PageTitle title="Benchmarks" />
        <Leaderboard models={catalog.models} />
        <SourceLine asOf={catalog.benchmarksAsOf}>{catalog.benchmarkCitation}</SourceLine>
      </div>
    </div>
  );
}
