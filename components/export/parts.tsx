import type { ReactNode } from "react";
import type { ExportFile } from "@/domain/export";
import { CodeBlock } from "../ui/CodeBlock";

function Files({ files }: { files: ExportFile[] }) {
  return (
    <div className="space-y-4">
      {files.map((f) => (
        <CodeBlock key={f.path} label={f.path} content={f.content} />
      ))}
    </div>
  );
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="space-y-2 text-sm text-ink-2">{children}</div>
    </section>
  );
}

function SpendingCap({ command }: { command: string }) {
  return (
    <Step title="Set the spending cap">
      <p>
        Run this with an OpenRouter management key. Project keys can&apos;t set budgets.{" "}
        <a
          className="underline decoration-ink-3 underline-offset-2 hover:decoration-ink-2"
          href="https://openrouter.ai/docs/guides/features/workspaces/workspace-budgets"
          target="_blank"
          rel="noreferrer"
        >
          Workspace budgets
        </a>
      </p>
      <CodeBlock label="Terminal" content={command} />
    </Step>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p className="text-sm text-ink-2">{children}</p>;
}

function Body({ children }: { children: ReactNode }) {
  return <div className="space-y-6 pt-5">{children}</div>;
}

export const Export = { Body, Files, Step, SpendingCap, Note };
