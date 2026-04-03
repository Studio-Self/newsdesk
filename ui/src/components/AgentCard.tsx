import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import type { Agent } from "@newsdesk/shared";
import { ROLE_LABELS } from "@newsdesk/shared";
import { Link } from "react-router-dom";

const STATUS_COLORS: Record<string, string> = {
  idle: "bg-gray-500",
  working: "bg-green-500 animate-pulse",
  paused: "bg-amber-500",
  error: "bg-red-500",
};

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link
      to={`/agents/${agent.id}`}
      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary/50 transition-colors"
    >
      <div className="text-2xl">{agent.icon ?? "🤖"}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium truncate">{agent.name}</h4>
          <div className={cn("h-2 w-2 rounded-full", STATUS_COLORS[agent.status])} />
        </div>
        <p className="text-xs text-muted-foreground">{ROLE_LABELS[agent.role] ?? agent.role}</p>
        {agent.title && <p className="text-xs text-muted-foreground">{agent.title}</p>}
      </div>
      <Badge variant="secondary" className="text-[10px]">
        {agent.status}
      </Badge>
    </Link>
  );
}
