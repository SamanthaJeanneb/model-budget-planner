import type { Catalog } from "@/domain/types";
import { News } from "../news/News";
import { PageTitle } from "../shell/PageTitle";
import { SourceLine } from "../SourceLine";

export function NewsPage({ catalog }: { catalog: Catalog }) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[900px] space-y-8 px-10 py-10 max-md:px-5">
        <PageTitle title="New models" />
        <News models={catalog.models} />
        <SourceLine asOf={catalog.modelsAsOf}>Source: OpenRouter models API</SourceLine>
      </div>
    </div>
  );
}
