"use client";

import { CHINESE_LABS } from "@/domain/rules";
import { Combobox, ComboboxGroup, ComboboxItem } from "../ui/Combobox";

type Props = { labs: string[]; value: string[]; onChange: (labs: string[]) => void };

function toggle(list: string[], lab: string) {
  return list.includes(lab) ? list.filter((l) => l !== lab) : [...list, lab];
}

/** Pick labs to leave out, with the Chinese labs preset on top. */
export function ExcludeLabs({ labs, value, onChange }: Props) {
  const preset = CHINESE_LABS.every((lab) => value.includes(lab));
  const display =
    value.length === 0
      ? "None"
      : preset && value.length === CHINESE_LABS.length
        ? "Chinese labs"
        : `${value.length} labs excluded`;
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="whitespace-nowrap">Exclude labs</span>
      <Combobox
        aria-label="Exclude labs"
        placeholder="Search labs"
        display={display}
        className="h-8 w-36 shrink-0"
        width="w-64"
      >
        <ComboboxGroup heading="Presets">
          <ComboboxItem
            value="preset-chinese"
            keywords={["chinese", "china", ...CHINESE_LABS]}
            selected={preset}
            onSelect={() =>
              onChange(
                preset
                  ? value.filter((l) => !CHINESE_LABS.includes(l))
                  : [...new Set([...value, ...CHINESE_LABS])],
              )
            }
          >
            Chinese labs <span className="text-ink-3">({CHINESE_LABS.length})</span>
          </ComboboxItem>
          {value.length > 0 ? (
            <ComboboxItem
              value="clear"
              keywords={["clear", "none"]}
              selected={false}
              onSelect={() => onChange([])}
            >
              Clear all
            </ComboboxItem>
          ) : null}
        </ComboboxGroup>
        <ComboboxGroup heading="Labs">
          {labs.map((lab) => (
            <ComboboxItem
              key={lab}
              value={lab}
              keywords={[lab]}
              selected={value.includes(lab)}
              onSelect={() => onChange(toggle(value, lab))}
            >
              {lab}
            </ComboboxItem>
          ))}
        </ComboboxGroup>
      </Combobox>
    </div>
  );
}
