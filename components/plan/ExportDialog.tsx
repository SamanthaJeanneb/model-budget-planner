"use client";

import { ClaudeCodeExport } from "../export/ClaudeCodeExport";
import { ClineExport } from "../export/ClineExport";
import { OpenCodeExport } from "../export/OpenCodeExport";
import { Button } from "../ui/Button";
import { DialogContent, DialogRoot, DialogTrigger } from "../ui/Dialog";
import { Tabs } from "../ui/Tabs";
import { usePlan } from "./context";

export function ExportDialog() {
  const { state, meta } = usePlan();
  const rows = state.stack.rows;
  const props = { rows, budget: state.budget, workspaceId: meta.catalog.workspaceId };
  return (
    <DialogRoot>
      <DialogTrigger asChild>
        <Button
          className="w-full"
          variant="primary"
          disabled={rows.every((r) => !r.pick) || state.status === "planning"}
        >
          Export stack
        </Button>
      </DialogTrigger>
      <DialogContent title="Export">
        <Tabs.Root defaultValue="claude-code">
          <Tabs.List>
            <Tabs.Trigger value="claude-code">Claude Code</Tabs.Trigger>
            <Tabs.Trigger value="cline">Cline</Tabs.Trigger>
            <Tabs.Trigger value="opencode">OpenCode</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="claude-code">
            <ClaudeCodeExport {...props} />
          </Tabs.Content>
          <Tabs.Content value="cline">
            <ClineExport {...props} />
          </Tabs.Content>
          <Tabs.Content value="opencode">
            <OpenCodeExport {...props} />
          </Tabs.Content>
        </Tabs.Root>
      </DialogContent>
    </DialogRoot>
  );
}
