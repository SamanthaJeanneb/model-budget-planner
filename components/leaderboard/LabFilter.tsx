"use client";

import { Combobox, ComboboxItem } from "../ui/Combobox";

type Props = { labs: { lab: string; count: number }[]; value: string[]; onChange: (labs: string[]) => void };

/** Pick any number of labs; none picked means all labs. */
export function LabFilter({ labs, value, onChange }: Props) {
  const display = value.length === 0 ? "All labs" : value.length === 1 ? value[0] : `${value.length} labs`;
  const toggle = (lab: string) =>
    onChange(value.includes(lab) ? value.filter((l) => l !== lab) : [...value, lab]);
  return (
    <Combobox aria-label="Labs" placeholder="Find a lab" display={display} className="w-40" width="w-64">
      <ComboboxItem
        value="__all"
        keywords={["all"]}
        selected={value.length === 0}
        onSelect={() => onChange([])}
      >
        All labs
      </ComboboxItem>
      {labs.map(({ lab, count }) => (
        <ComboboxItem
          key={lab}
          value={lab}
          keywords={[lab]}
          selected={value.includes(lab)}
          onSelect={() => toggle(lab)}
        >
          <span className="flex justify-between gap-3">
            {lab}
            <span className="text-ink-3 tabular-nums">{count}</span>
          </span>
        </ComboboxItem>
      ))}
    </Combobox>
  );
}
