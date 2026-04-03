import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { agentsApi } from "@/api/agents";
import { queryKeys } from "@/lib/queryKeys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_LABELS } from "@newsdesk/shared";
import { formatCents } from "@/lib/utils";
import { timeAgo } from "@/lib/timeAgo";

export function AgentDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: agent, isLoading } = useQuery({
    queryKey: queryKeys.agents.detail(id!),
    queryFn: () => agentsApi.get(id!),
    enabled: !!id,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!agent) return <p className="text-muted-foreground">Agent not found.</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <span className="text-4xl">{agent.icon ?? "🤖"}</span>
        <div>
          <h1 className="text-2xl font-bold">{agent.name}</h1>
          <p className="text-muted-foreground">{ROLE_LABELS[agent.role]} {agent.title ? `\u2014 ${agent.title}` : ""}</p>
        </div>
        <Badge className="ml-auto">{agent.status}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Budget</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCents(agent.spentMonthlyCents)}</p>
            <p className="text-xs text-muted-foreground">of {formatCents(agent.budgetMonthlyCents)} monthly budget</p>
            {agent.budgetMonthlyCents > 0 && (
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, (agent.spentMonthlyCents / agent.budgetMonthlyCents) * 100)}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Status</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm">Adapter: <span className="font-mono">{agent.adapterType}</span></p>
            {agent.lastHeartbeatAt && (
              <p className="text-sm text-muted-foreground">Last active: {timeAgo(agent.lastHeartbeatAt)}</p>
            )}
            <p className="text-sm text-muted-foreground">Created: {timeAgo(agent.createdAt)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
