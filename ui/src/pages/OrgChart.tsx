import { useQuery } from "@tanstack/react-query";
import { agentsApi } from "@/api/agents";
import { useNewsroom } from "@/context/NewsroomContext";
import { queryKeys } from "@/lib/queryKeys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { ROLE_LABELS } from "@newsdesk/shared";
import type { AgentRole } from "@newsdesk/shared";

const ROLE_ORDER: AgentRole[] = ["editor", "reporter", "fact_checker", "copy_editor", "publisher", "social_editor"];

export function OrgChart() {
  const { selectedNewsroomId } = useNewsroom();

  const { data: agents = [] } = useQuery({
    queryKey: queryKeys.agents.list(selectedNewsroomId!),
    queryFn: () => agentsApi.list(selectedNewsroomId!),
    enabled: !!selectedNewsroomId,
  });

  const grouped = ROLE_ORDER.map((role) => ({
    role,
    label: ROLE_LABELS[role],
    agents: agents.filter((a) => a.role === role),
  })).filter((g) => g.agents.length > 0);

  const editors = grouped.find((g) => g.role === "editor");
  const others = grouped.filter((g) => g.role !== "editor");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Newsroom Org Chart</h1>

      {editors && editors.agents.length > 0 && (
        <div className="flex justify-center">
          <Card className="w-64">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="font-medium">{editors.label}</p>
              {editors.agents.map((a) => (
                <div key={a.id} className="mt-2">
                  <p className="text-sm font-medium">{a.name}</p>
                  <Badge variant={a.status === "working" ? "default" : "outline"} className="text-xs">{a.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {editors && others.length > 0 && (
        <div className="flex justify-center">
          <div className="w-px h-8 bg-border" />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {others.map((group) => (
          <Card key={group.role}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{group.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {group.agents.map((a) => (
                <div key={a.id} className="flex items-center justify-between">
                  <span className="text-sm">{a.name}</span>
                  <Badge variant={a.status === "working" ? "default" : "outline"} className="text-xs">{a.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {agents.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">No agents yet. Add agents to build your newsroom organization.</p>
      )}
    </div>
  );
}
