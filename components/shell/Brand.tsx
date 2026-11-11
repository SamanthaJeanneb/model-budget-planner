/** The product mark: three rising bars, one per budget step. */
export function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2.5">
      <span className="flex size-7 items-center justify-center rounded-lg bg-ink">
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
          <rect x="2.5" y="9" width="2.5" height="4.5" rx="1" fill="white" opacity="0.55" />
          <rect x="6.75" y="6" width="2.5" height="7.5" rx="1" fill="white" opacity="0.8" />
          <rect x="11" y="2.5" width="2.5" height="11" rx="1" fill="white" />
        </svg>
      </span>
      <span className="text-[14px] font-semibold tracking-tight">Model Budget</span>
    </div>
  );
}
