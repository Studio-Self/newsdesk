import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "@/api/tasks";
import { useNewsroom } from "@/context/NewsroomContext";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2, Circle, Clock, AlertCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { TASK_STATUS_LABELS, TASK_TYPE_LABELS } from "@newsdesk/shared";
import type { TaskStatus } from "@newsdesk/shared";

const STATUS_ICONS: Record<string, typeof Circle> = {
  open: Circle,
  in_progress: Clock,
  blocked: AlertCircle,
  completed: CheckCircle2,
  cancelled: XCircle,
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  blocked: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export function Tasks() {
  const { selectedNewsroomId } = useNewsroom();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const { data: tasks = [] } = useQuery({
    queryKey: queryKeys.tasks.list(selectedNewsroomId!),
    queryFn: () => tasksApi.list(selectedNewsroomId!, filterStatus ? { status: filterStatus } : undefined),
    enabled: !!selectedNewsroomId,
  });

  const createMutation = useMutation({
    mutationFn: () => tasksApi.create(selectedNewsroomId!, { title, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.list(selectedNewsroomId!) });
      setShowCreate(false);
      setTitle("");
      setDescription("");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editorial Tasks</h1>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="flex gap-2">
        {["", "open", "in_progress", "completed"].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filterStatus === s ? "default" : "outline"}
            onClick={() => setFilterStatus(s)}
          >
            {s ? TASK_STATUS_LABELS[s as TaskStatus] : "All"}
          </Button>
        ))}
      </div>

      {showCreate && (
        <Card>
          <CardHeader><CardTitle>Create Task</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate()} disabled={!title}>Create</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {tasks.map((task) => {
          const Icon = STATUS_ICONS[task.status] ?? Circle;
          return (
            <Link key={task.id} to={`/tasks/${task.id}`}>
              <Card className="hover:bg-accent/50 transition-colors">
                <CardContent className="flex items-center gap-3 p-4">
                  <Icon className="h-4 w-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{task.title}</p>
                    {task.description && <p className="text-sm text-muted-foreground truncate">{task.description}</p>}
                  </div>
                  <Badge className={STATUS_COLORS[task.status]}>{TASK_STATUS_LABELS[task.status as TaskStatus]}</Badge>
                  <Badge variant="outline">{TASK_TYPE_LABELS[task.type as keyof typeof TASK_TYPE_LABELS]}</Badge>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {tasks.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">No tasks yet. Create tasks to track editorial work.</p>
      )}
    </div>
  );
}
