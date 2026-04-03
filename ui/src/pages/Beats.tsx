import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { beatsApi } from "@/api/beats";
import { useNewsroom } from "@/context/NewsroomContext";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Radio } from "lucide-react";

export function Beats() {
  const { selectedNewsroomId } = useNewsroom();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: beats = [] } = useQuery({
    queryKey: queryKeys.beats.list(selectedNewsroomId!),
    queryFn: () => beatsApi.list(selectedNewsroomId!),
    enabled: !!selectedNewsroomId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      beatsApi.create(selectedNewsroomId!, {
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.beats.list(selectedNewsroomId!) });
      setShowCreate(false);
      setName("");
      setDescription("");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Beats</h1>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4" />
          New Beat
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader><CardTitle>Create Beat</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Beat name (e.g., Politics, Tech)" value={name} onChange={(e) => setName(e.target.value)} />
            <Textarea placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate()} disabled={!name}>Create</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {beats.map((beat) => (
          <Card key={beat.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-primary" />
                <h3 className="font-medium">{beat.name}</h3>
              </div>
              {beat.description && <p className="mt-1 text-sm text-muted-foreground">{beat.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {beats.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">No beats yet. Create beats to organize your coverage.</p>
      )}
    </div>
  );
}
