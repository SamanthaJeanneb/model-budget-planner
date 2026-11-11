"use client";

import { motion } from "motion/react";
import { Tabs as RadixTabs } from "radix-ui";
import { createContext, useContext, useId, useState, useSyncExternalStore, type ReactNode } from "react";
import { fadeRise, layoutSpring } from "./motion";

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function readHash() {
  return window.location.hash.slice(1);
}

/** `switched` is true once the user has changed tab; only then do pages fade in. */
const Active = createContext({ value: "", id: "", switched: false });

function Root({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  const id = useId();
  const [switched, setSwitched] = useState(false);
  const change = (next: string) => {
    setSwitched(true);
    onChange(next);
  };
  return (
    <Active.Provider value={{ value, id, switched }}>
      <RadixTabs.Root value={value} onValueChange={change}>
        {children}
      </RadixTabs.Root>
    </Active.Provider>
  );
}

export function TabsRoot({ defaultValue, children }: { defaultValue: string; children: ReactNode }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <Root value={value} onChange={setValue}>
      {children}
    </Root>
  );
}

/** Page-level tabs: the URL hash (#news) picks the opening tab, and a click updates it. */
export function HashTabsRoot({ defaultValue, children }: { defaultValue: string; children: ReactNode }) {
  const hash = useSyncExternalStore(subscribeHash, readHash, () => "");
  const [picked, setPicked] = useState<string | null>(null);
  const change = (next: string) => {
    setPicked(next);
    history.replaceState(null, "", next === defaultValue ? " " : `#${next}`);
  };
  return (
    <Root value={picked ?? (hash || defaultValue)} onChange={change}>
      {children}
    </Root>
  );
}

export function TabsList({ children }: { children: ReactNode }) {
  return <RadixTabs.List className="flex gap-6 border-b border-line">{children}</RadixTabs.List>;
}

export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  const tabs = useContext(Active);
  const active = tabs.value === value;
  return (
    <RadixTabs.Trigger
      value={value}
      className="relative pb-2.5 text-sm font-medium text-ink-2 transition-colors hover:text-ink focus-visible:outline-none data-[state=active]:text-ink"
    >
      {children}
      {active ? (
        <motion.span
          layoutId={`${tabs.id}-underline`}
          transition={layoutSpring}
          className="absolute inset-x-0 -bottom-px h-0.5 bg-accent"
        />
      ) : null}
    </RadixTabs.Trigger>
  );
}

export function TabsContent({ value, children }: { value: string; children: ReactNode }) {
  return (
    <RadixTabs.Content value={value} className="focus-visible:outline-none">
      <FadeOnSwitch>{children}</FadeOnSwitch>
    </RadixTabs.Content>
  );
}

/** A sidebar navigation item: icon and label, tinted when active. */
export function TabsNavItem({
  value,
  icon,
  children,
}: {
  value: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <RadixTabs.Trigger
      value={value}
      className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] text-ink-2 transition-colors hover:bg-black/[0.04] hover:text-ink focus-visible:outline-2 focus-visible:outline-accent data-[state=active]:bg-accent-soft data-[state=active]:font-medium data-[state=active]:text-ink [&_svg]:size-4 [&_svg]:text-ink-3 data-[state=active]:[&_svg]:text-accent"
    >
      {icon}
      {children}
    </RadixTabs.Trigger>
  );
}

export function TabsNavList({ children }: { children: ReactNode }) {
  return (
    <RadixTabs.List aria-orientation="vertical" className="flex flex-col gap-0.5">
      {children}
    </RadixTabs.List>
  );
}

/** A page: fills the white surface and scrolls on its own. */
export function TabsPage({ value, children }: { value: string; children: ReactNode }) {
  return (
    <RadixTabs.Content value={value} className="h-full focus-visible:outline-none">
      <FadeOnSwitch className="h-full">{children}</FadeOnSwitch>
    </RadixTabs.Content>
  );
}

/** Fades a page in after a tab switch; the first render shows at once, so server HTML is never invisible. */
function FadeOnSwitch({ className, children }: { className?: string; children: ReactNode }) {
  const { switched } = useContext(Active);
  return (
    <motion.div {...fadeRise} initial={switched ? fadeRise.initial : false} className={className}>
      {children}
    </motion.div>
  );
}
