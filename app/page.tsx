import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { getCatalog } from "@/server/catalog";

async function Planner() {
  const catalog = await getCatalog();
  return <AppShell catalog={catalog} />;
}

function Loading() {
  return (
    <div className="flex h-screen p-2">
      <div className="w-60 shrink-0" />
      <div className="flex flex-1 items-center justify-center rounded-2xl bg-surface text-sm text-ink-3 ring-1 ring-line">
        Loading models, scores and costs…
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Planner />
    </Suspense>
  );
}
