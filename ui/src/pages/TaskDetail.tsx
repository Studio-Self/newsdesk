import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "@/api/tasks";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TASK_STATUS_LABELS, TASK_TYPE_LABELS } from "@newsdesk/shared";
import type { TaskStatus } from "@newsdesk/shared";

export function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [commentBody, setCommentBody] = useState("");

  const { data: task, isLoading } = useQuery({
    queryKey: queryKeys.tasks.detail(id!),
    queryFn: () => tasksApi.get(id!),
    enabled: !!id,
  });

  const { data: comments = [] } = useQuery({
    queryKey: queryKeys.tasks.comments(id!),
    queryFn: () => tasksApi.listComments(id!),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => tasksApi.update(id!, { status } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id!) });
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => tasksApi.addComment(id!, { body: commentBody }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.comments(id!) });
      setCommentBody("");
    },
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!task) return <p className="text-muted-foreground">Task not found</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{task.title}</h1>
        <div className="flex gap-2 mt-2">
          <Badge>{TASK_STATUS_LABELS[task.status as TaskStatus]}</Badge>
          <Badge variant="outline">{TASK_TYPE_LABELS[task.type as keyof typeof TASK_TYPE_LABELS]}</Badge>
          <Badge variant="outline">{task.priority}</Badge>
        </div>
      </div>

      {task.description && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm">{task.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        {["open", "in_progress", "completed", "cancelled"].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={task.status === s ? "default" : "outline"}
            onClick={() => statusMutation.mutate(s)}
            disabled={task.status === s}
          >
            {TASK_STATUS_LABELS[s as TaskStatus]}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Comments ({comments.length})</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="border-b pb-3 last:border-0">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{c.authorName ?? "System"}</span>
                <span>{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm">{c.body}</p>
            </div>
          ))}

          <div className="space-y-2 pt-2">
            <Textarea placeholder="Add a comment..." value={commentBody} onChange={(e) => setCommentBody(e.target.value)} />
            <Button size="sm" onClick={() => commentMutation.mutate()} disabled={!commentBody}>
              Add Comment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
