import { claudeCodeFiles, spendingCapCommand } from "@/domain/export";
import type { TaskResult } from "@/domain/types";
import { Export } from "./parts";

type Props = { rows: TaskResult[]; budget: number; workspaceId: string | null };

export function ClaudeCodeExport({ rows, budget, workspaceId }: Props) {
  return (
    <Export.Body>
      <Export.Note>
        OpenRouter only guarantees Claude Code with Anthropic models. Other models in this stack may not
        handle every tool call.
      </Export.Note>
      <Export.Step title="Add these files to the project">
        <p>
          Each task type gets a helper agent set to its model. Put your OpenRouter key in settings.local.json.
        </p>
        <Export.Files files={claudeCodeFiles(rows)} />
      </Export.Step>
      <Export.SpendingCap command={spendingCapCommand(workspaceId, budget)} />
    </Export.Body>
  );
}
