"use client";

import { Slider as RadixSlider } from "radix-ui";

type Props = {
  value: number;
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number) => void;
  "aria-label": string;
};

export function Slider({ value, onValueChange, ...props }: Props) {
  return (
    <RadixSlider.Root
      className="relative flex h-5 w-full touch-none items-center select-none"
      value={[value]}
      onValueChange={([v]) => onValueChange(v)}
      {...props}
    >
      <RadixSlider.Track className="relative h-1 grow rounded-full bg-line-soft">
        <RadixSlider.Range className="absolute h-full rounded-full bg-accent" />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        aria-label={props["aria-label"]}
        className="block size-4 rounded-full bg-white shadow-[0_1px_3px_rgba(26,26,26,0.25)] ring-1 ring-line transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
    </RadixSlider.Root>
  );
}
