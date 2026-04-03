import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assignmentsApi } from "@/api/assignments";
import { useNewsroom } from "@/context/NewsroomContext";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/timeAgo";
import { Plus } from "lucide-react";

export function Assignments() {
  const { selectedNewsroomId } = useNewsroom();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { data: assignments = [] } = useQuery({
    queryKey: queryKeys.assignments.list(selectedNewsroomId!),
    queryFn: () => assignmentsApi.list(selectedNewsroomId!),
    enabled: !!selectedNewsroomId,
  });

  const createMutation = useMutation({
    mutationFn: () => assignmentsApi.create(selectedNewsroomId!, { title, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.list(selectedNewsroomId!) });
      setShowCreate(false);
      setTitle("");
      setDescription("");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assignments</h1>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4" />
          New Assignment
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader><CardTitle>Create Assignment</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Assignment title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Details..." value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate()} disabled={!title}>Create</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {assignments.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex-1">
                <h3 className="text-sm font-medium">{a.title}</h3>
                {a.description && <p className="text-xs text-muted-foreground">{a.description}</p>}
              </div>
              <Badge variant="secondary">{a.status}</Badge>
              <span className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {assignments.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">No assignments yet.</p>
      )}
    </div>
  );
}
