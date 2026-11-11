import { openCodeFiles, spendingCapCommand } from "@/domain/export";
import type { TaskResult } from "@/domain/types";
import { Export } from "./parts";

type Props = { rows: TaskResult[]; budget: number; workspaceId: string | null };

export function OpenCodeExport({ rows, budget, workspaceId }: Props) {
  return (
    <Export.Body>
      <Export.Note>
        Cost figures come from Claude Code sessions; OpenRouter publishes none for OpenCode.
      </Export.Note>
      <Export.Step title="Add opencode.json to the project root">
        <p>One subagent per task type. Connect OpenRouter first with /connect.</p>
        <Export.Files files={openCodeFiles(rows)} />
      </Export.Step>
      <Export.SpendingCap command={spendingCapCommand(workspaceId, budget)} />
    </Export.Body>
  );
}
