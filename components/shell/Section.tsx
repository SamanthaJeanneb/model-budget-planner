import type { ReactNode } from "react";

/** A titled block on a page. */
export function Section({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="text-[13px] font-semibold">{title}</h2>
        {aside ? <div className="text-[13px] text-ink-3">{aside}</div> : null}
      </div>
      {children}
    </section>
  );
}
