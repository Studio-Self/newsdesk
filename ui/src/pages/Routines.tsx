import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { routinesApi } from "@/api/routines";
import { useNewsroom } from "@/context/NewsroomContext";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Power, PowerOff } from "lucide-react";

export function Routines() {
  const { selectedNewsroomId } = useNewsroom();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [schedule, setSchedule] = useState("0 8 * * *");
  const [action, setAction] = useState("generate_briefing");

  const { data: routines = [] } = useQuery({
    queryKey: queryKeys.routines.list(selectedNewsroomId!),
    queryFn: () => routinesApi.list(selectedNewsroomId!),
    enabled: !!selectedNewsroomId,
  });

  const createMutation = useMutation({
    mutationFn: () => routinesApi.create(selectedNewsroomId!, { name, description, schedule, action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.list(selectedNewsroomId!) });
      setShowCreate(false);
      setName("");
      setDescription("");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => routinesApi.update(id, { enabled } as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.routines.list(selectedNewsroomId!) }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Routines</h1>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4" />
          New Routine
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader><CardTitle>Create Routine</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Routine name (e.g., Morning Briefing)" value={name} onChange={(e) => setName(e.target.value)} />
            <Textarea placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input placeholder="Cron schedule (e.g., 0 8 * * *)" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
            <Input placeholder="Action (e.g., generate_briefing)" value={action} onChange={(e) => setAction(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate()} disabled={!name || !schedule || !action}>Create</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {routines.map((routine) => (
          <Card key={routine.id}>
            <CardContent className="flex items-center gap-3 p-4">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{routine.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{routine.schedule} · {routine.action}</p>
                {routine.lastRunAt && <p className="text-xs text-muted-foreground">Last run: {new Date(routine.lastRunAt).toLocaleString()}</p>}
              </div>
              <Badge variant={routine.enabled ? "default" : "outline"}>
                {routine.enabled ? "Enabled" : "Disabled"}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toggleMutation.mutate({ id: routine.id, enabled: !routine.enabled })}
              >
                {routine.enabled ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {routines.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">No routines yet. Schedule automated editorial tasks.</p>
      )}
    </div>
  );
}
