/** Dollars above $10 round to the dollar; below, to the cent. */
export function formatMoney(usd: number): string {
  if (!Number.isFinite(usd)) return "—";
  const digits = Math.abs(usd) >= 10 ? 0 : 2;
  return usd.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** "2026-11-01" → "1 Nov". */
export function formatShortDate(isoDate: string): string {
  const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  const month = new Date(Date.UTC(y, m - 1, d)).toLocaleString("en-GB", {
    month: "short",
    timeZone: "UTC",
  });
  return `${d} ${month}`;
}

/** "Anthropic: Claude Opus 5.5" → "Claude Opus 5.5". */
export function shortName(name: string): string {
  const i = name.indexOf(": ");
  return i === -1 ? name : name.slice(i + 2);
}

/** Unix seconds → "9 Nov 2026". */
export function formatReleaseDate(createdSeconds: number): string {
  return new Date(createdSeconds * 1000).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
