import { clineExport, spendingCapCommand } from "@/domain/export";
import { shortName } from "@/domain/money";
import type { TaskResult } from "@/domain/types";
import { Export } from "./parts";

type Props = { rows: TaskResult[]; budget: number; workspaceId: string | null };

export function ClineExport({ rows, budget, workspaceId }: Props) {
  const cline = clineExport(rows);
  if (!cline)
    return (
      <Export.Body>
        <Export.Note>Plan some tasks first.</Export.Note>
      </Export.Body>
    );
  return (
    <Export.Body>
      <Export.Note>
        Cost figures come from Claude Code sessions; OpenRouter publishes none for Cline.
      </Export.Note>
      <Export.Step title="Set the models in Cline">
        <p>In Cline settings, choose OpenRouter as the API provider, then:</p>
        <dl className="grid grid-cols-[8rem_1fr] gap-y-1">
          <dt className="text-ink-2">Plan mode</dt>
          <dd>
            {shortName(cline.planModel.name)} <span className="font-mono text-xs">{cline.planModel.id}</span>
          </dd>
          <dt className="text-ink-2">Act mode</dt>
          <dd>
            {shortName(cline.actModel.name)} <span className="font-mono text-xs">{cline.actModel.id}</span>
          </dd>
        </dl>
      </Export.Step>
      <Export.Step title="Add the task list">
        <Export.Files files={cline.files} />
      </Export.Step>
      <Export.SpendingCap command={spendingCapCommand(workspaceId, budget)} />
    </Export.Body>
  );
}
