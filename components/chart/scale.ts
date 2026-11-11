export type Scale = { (v: number): number; domain: [number, number]; range: [number, number] };

export function linear(domain: [number, number], range: [number, number]): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const f = (v: number) => (d1 === d0 ? r0 : r0 + ((v - d0) / (d1 - d0)) * (r1 - r0));
  return Object.assign(f, { domain, range });
}

export function log(domain: [number, number], range: [number, number]): Scale {
  const inner = linear([Math.log10(domain[0]), Math.log10(domain[1])], range);
  const f = (v: number) => inner(Math.log10(v));
  return Object.assign(f, { domain, range });
}

/** Round linear ticks at a step of 1, 2, 5 or 10 × a power of ten. */
export function linearTicks([lo, hi]: [number, number], count: number): number[] {
  const raw = (hi - lo) / Math.max(count, 1);
  const pow = 10 ** Math.floor(Math.log10(raw || 1));
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? pow * 10;
  const ticks: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) ticks.push(Number(v.toFixed(6)));
  return ticks;
}

/** 1, 2, 5 × powers of ten inside the domain. */
export function logTicks([lo, hi]: [number, number]): number[] {
  const ticks: number[] = [];
  for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++) {
    for (const m of [1, 2, 5]) {
      const v = m * 10 ** e;
      if (v >= lo && v <= hi) ticks.push(v);
    }
  }
  return ticks;
}

/** "$0.05", "$1", "$20" */
export function formatPriceTick(v: number): string {
  if (v >= 1) return `$${Number(v.toFixed(0))}`;
  return `$${Number(v.toPrecision(1))}`;
}
