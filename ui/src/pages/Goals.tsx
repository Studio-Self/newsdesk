import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { goalsApi } from "@/api/goals";
import { useNewsroom } from "@/context/NewsroomContext";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Target } from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  achieved: "bg-blue-100 text-blue-800",
  paused: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export function Goals() {
  const { selectedNewsroomId } = useNewsroom();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { data: goals = [] } = useQuery({
    queryKey: queryKeys.goals.list(selectedNewsroomId!),
    queryFn: () => goalsApi.list(selectedNewsroomId!),
    enabled: !!selectedNewsroomId,
  });

  const createMutation = useMutation({
    mutationFn: () => goalsApi.create(selectedNewsroomId!, { title, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.list(selectedNewsroomId!) });
      setShowCreate(false);
      setTitle("");
      setDescription("");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editorial Goals</h1>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader><CardTitle>Create Goal</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Goal title (e.g., Increase investigative coverage 40%)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate()} disabled={!title}>Create</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {goals.map((goal) => (
          <Link key={goal.id} to={`/goals/${goal.id}`}>
            <Card className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">{goal.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={STATUS_COLORS[goal.status]}>{goal.status}</Badge>
                    <span className="text-sm text-muted-foreground">{goal.progressPct}%</span>
                  </div>
                </div>
                {goal.description && <p className="mt-1 text-sm text-muted-foreground">{goal.description}</p>}
                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${goal.progressPct}%` }} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {goals.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">No goals yet. Set editorial goals to align your newsroom.</p>
      )}
    </div>
  );
}
