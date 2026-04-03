import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storiesApi } from "@/api/stories";
import { useNewsroom } from "@/context/NewsroomContext";
import { queryKeys } from "@/lib/queryKeys";
import { StoryCard } from "@/components/StoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STORY_STAGES, STAGE_LABELS, STORY_PRIORITIES } from "@newsdesk/shared";
import type { StoryStage } from "@newsdesk/shared";
import { Plus } from "lucide-react";

export function Stories() {
  const { selectedNewsroomId } = useNewsroom();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [filterStage, setFilterStage] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");

  const { data: stories = [], isLoading } = useQuery({
    queryKey: queryKeys.stories.list(selectedNewsroomId!),
    queryFn: () => storiesApi.list(selectedNewsroomId!),
    enabled: !!selectedNewsroomId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      storiesApi.create(selectedNewsroomId!, { title, description, priority }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stories.list(selectedNewsroomId!) });
      setShowCreate(false);
      setTitle("");
      setDescription("");
      setPriority("normal");
    },
  });

  const filtered = filterStage ? stories.filter((s) => s.stage === filterStage) : stories;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stories</h1>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4" />
          Pitch Story
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Pitch a New Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Story title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Brief description..." value={description} onChange={(e) => setDescription(e.target.value)} />
            <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              {STORY_PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate()} disabled={!title || createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Story"}
              </Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Button variant={filterStage === "" ? "default" : "ghost"} size="sm" onClick={() => setFilterStage("")}>
          All ({stories.length})
        </Button>
        {STORY_STAGES.filter((s) => s !== "killed").map((stage) => {
          const count = stories.filter((s) => s.stage === stage).length;
          if (count === 0) return null;
          return (
            <Button
              key={stage}
              variant={filterStage === stage ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterStage(stage)}
            >
              {STAGE_LABELS[stage]} ({count})
            </Button>
          );
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>

      {filtered.length === 0 && !isLoading && (
        <p className="text-center text-sm text-muted-foreground py-8">No stories found.</p>
      )}
    </div>
  );
}
