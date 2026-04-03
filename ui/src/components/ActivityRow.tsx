import type { ActivityLogEntry } from "@newsdesk/shared";
import { timeAgo } from "@/lib/timeAgo";

const TYPE_LABELS: Record<string, string> = {
  story_created: "New story pitched",
  stage_changed: "Story stage changed",
  agent_started: "Agent started working",
  agent_completed: "Agent completed work",
  approval_requested: "Approval requested",
  approval_decided: "Approval decided",
};

export function ActivityRow({ entry }: { entry: ActivityLogEntry }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm">{TYPE_LABELS[entry.type] ?? entry.type}</p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{timeAgo(entry.createdAt)}</span>
    </div>
  );
}
