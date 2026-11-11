import { ChartScatter, Newspaper, Wallet } from "lucide-react";
import type { Catalog } from "@/domain/types";
import { BenchmarksPage } from "./pages/BenchmarksPage";
import { NewsPage } from "./pages/NewsPage";
import { PlanPage } from "./pages/PlanPage";
import { Plan } from "./plan";
import { Brand } from "./shell/Brand";
import { DataStatus } from "./shell/DataStatus";
import { Tabs } from "./ui/Tabs";

export function AppShell({ catalog }: { catalog: Catalog }) {
  return (
    <Plan.Provider catalog={catalog}>
      <Tabs.HashRoot defaultValue="plan">
        <div className="flex h-screen gap-2 p-2 max-md:h-auto max-md:flex-col">
          <aside className="flex w-60 shrink-0 flex-col gap-6 px-2 pt-3 pb-2 max-md:w-full">
            <Brand />
            <Plan.NewPlanButton />
            <Tabs.NavList>
              <Tabs.NavItem value="plan" icon={<Wallet />}>
                Plan
              </Tabs.NavItem>
              <Tabs.NavItem value="benchmarks" icon={<ChartScatter />}>
                Benchmarks
              </Tabs.NavItem>
              <Tabs.NavItem value="news" icon={<Newspaper />}>
                New models
              </Tabs.NavItem>
            </Tabs.NavList>
            <div className="min-h-0 flex-1 overflow-y-auto max-md:hidden">
              <Plan.StackList />
            </div>
            <DataStatus asOf={catalog.modelsAsOf} />
          </aside>
          <main className="min-w-0 flex-1 overflow-hidden rounded-2xl bg-surface shadow-[0_1px_3px_rgba(26,26,26,0.06)] ring-1 ring-line">
            <Tabs.Page value="plan">
              <PlanPage catalog={catalog} />
            </Tabs.Page>
            <Tabs.Page value="benchmarks">
              <BenchmarksPage catalog={catalog} />
            </Tabs.Page>
            <Tabs.Page value="news">
              <NewsPage catalog={catalog} />
            </Tabs.Page>
          </main>
        </div>
      </Tabs.HashRoot>
    </Plan.Provider>
  );
}
