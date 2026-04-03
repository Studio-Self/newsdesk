import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agentsApi } from "@/api/agents";
import { useNewsroom } from "@/context/NewsroomContext";
import { queryKeys } from "@/lib/queryKeys";
import { AgentCard } from "@/components/AgentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AGENT_ROLES, ROLE_LABELS } from "@newsdesk/shared";
import type { AgentRole } from "@newsdesk/shared";
import { Plus } from "lucide-react";

export function Agents() {
  const { selectedNewsroomId } = useNewsroom();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<AgentRole>("reporter");
  const [title, setTitle] = useState("");

  const { data: agents = [] } = useQuery({
    queryKey: queryKeys.agents.list(selectedNewsroomId!),
    queryFn: () => agentsApi.list(selectedNewsroomId!),
    enabled: !!selectedNewsroomId,
  });

  const createMutation = useMutation({
    mutationFn: () => agentsApi.create(selectedNewsroomId!, { name, role, title: title || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.list(selectedNewsroomId!) });
      setShowCreate(false);
      setName("");
      setTitle("");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agents</h1>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4" />
          Hire Agent
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader><CardTitle>Hire a New Agent</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Agent name" value={name} onChange={(e) => setName(e.target.value)} />
            <Select value={role} onChange={(e) => setRole(e.target.value as AgentRole)}>
              {AGENT_ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </Select>
            <Input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate()} disabled={!name || createMutation.isPending}>
                {createMutation.isPending ? "Hiring..." : "Hire Agent"}
              </Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {agents.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">No agents yet. Hire your first agent to get started.</p>
      )}
    </div>
  );
}
