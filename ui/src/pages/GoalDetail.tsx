import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { goalsApi } from "@/api/goals";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [editProgress, setEditProgress] = useState<number | null>(null);

  const { data: goal, isLoading } = useQuery({
    queryKey: queryKeys.goals.detail(id!),
    queryFn: () => goalsApi.get(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => goalsApi.update(id!, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.detail(id!) });
    },
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!goal) return <p className="text-muted-foreground">Goal not found</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{goal.title}</h1>
        <div className="flex gap-2 mt-2">
          <Badge>{goal.status}</Badge>
          <span className="text-sm text-muted-foreground">{goal.progressPct}% complete</span>
          {goal.targetDate && <span className="text-sm text-muted-foreground">Target: {new Date(goal.targetDate).toLocaleDateString()}</span>}
        </div>
      </div>

      {goal.description && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm">{goal.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Progress</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${goal.progressPct}%` }} />
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={100}
              value={editProgress ?? goal.progressPct}
              onChange={(e) => setEditProgress(parseInt(e.target.value) || 0)}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">%</span>
            <Button size="sm" onClick={() => { updateMutation.mutate({ progressPct: editProgress ?? goal.progressPct }); setEditProgress(null); }}>
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Status</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {["active", "achieved", "paused", "cancelled"].map((s) => (
              <Button key={s} size="sm" variant={goal.status === s ? "default" : "outline"} onClick={() => updateMutation.mutate({ status: s })} disabled={goal.status === s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
