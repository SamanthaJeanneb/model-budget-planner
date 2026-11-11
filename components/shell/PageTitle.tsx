import type { ReactNode } from "react";

/** A page's title with its controls on the right. */
export function PageTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}
