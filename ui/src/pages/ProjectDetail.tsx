import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/api/projects";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery({
    queryKey: queryKeys.projects.detail(id!),
    queryFn: () => projectsApi.get(id!),
    enabled: !!id,
  });

  const { data: linkedGoals = [] } = useQuery({
    queryKey: ["projects", id, "goals"],
    queryFn: () => projectsApi.listGoals(id!),
    enabled: !!id,
  });

  const { data: linkedStories = [] } = useQuery({
    queryKey: ["projects", id, "stories"],
    queryFn: () => projectsApi.listStories(id!),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => projectsApi.update(id!, { status } as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id!) }),
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!project) return <p className="text-muted-foreground">Project not found</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{project.title}</h1>
        <div className="flex gap-2 mt-2">
          <Badge>{project.status}</Badge>
          <span className="text-sm text-muted-foreground">/{project.slug}</span>
        </div>
      </div>

      {project.description && (
        <Card>
          <CardContent className="p-4"><p className="text-sm">{project.description}</p></CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Status</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {["active", "completed", "on_hold", "archived"].map((s) => (
              <Button key={s} size="sm" variant={project.status === s ? "default" : "outline"} onClick={() => statusMutation.mutate(s)} disabled={project.status === s}>
                {s.replace("_", " ")}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Linked Goals ({linkedGoals.length})</CardTitle></CardHeader>
          <CardContent>
            {linkedGoals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No goals linked yet.</p>
            ) : (
              <ul className="space-y-1">{linkedGoals.map((g) => <li key={g.id} className="text-sm">Goal: {g.goalId}</li>)}</ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Linked Stories ({linkedStories.length})</CardTitle></CardHeader>
          <CardContent>
            {linkedStories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No stories linked yet.</p>
            ) : (
              <ul className="space-y-1">{linkedStories.map((s) => <li key={s.id} className="text-sm">Story: {s.storyId}</li>)}</ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
