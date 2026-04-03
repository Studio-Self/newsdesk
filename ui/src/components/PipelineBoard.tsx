import { useQuery } from "@tanstack/react-query";
import { storiesApi } from "@/api/stories";
import { useNewsroom } from "@/context/NewsroomContext";
import { queryKeys } from "@/lib/queryKeys";
import { STORY_STAGES, STAGE_LABELS } from "@newsdesk/shared";
import type { Story, StoryStage } from "@newsdesk/shared";
import { StoryCard } from "./StoryCard";
import { Skeleton } from "./ui/skeleton";

const VISIBLE_STAGES: StoryStage[] = ["pitch", "assigned", "drafting", "fact_check", "copy_edit", "review", "ready", "published"];

const STAGE_COLORS: Record<string, string> = {
  pitch: "bg-indigo-500",
  assigned: "bg-violet-500",
  drafting: "bg-blue-500",
  fact_check: "bg-amber-500",
  copy_edit: "bg-emerald-500",
  review: "bg-rose-500",
  ready: "bg-cyan-500",
  published: "bg-green-500",
};

export function PipelineBoard() {
  const { selectedNewsroomId } = useNewsroom();

  const { data: stories = [], isLoading } = useQuery({
    queryKey: queryKeys.stories.list(selectedNewsroomId!),
    queryFn: () => storiesApi.list(selectedNewsroomId!),
    enabled: !!selectedNewsroomId,
  });

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {VISIBLE_STAGES.map((stage) => (
          <div key={stage} className="w-72 shrink-0">
            <Skeleton className="h-8 w-full mb-3" />
            <Skeleton className="h-24 w-full mb-2" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  const stageGroups = new Map<string, Story[]>();
  for (const stage of VISIBLE_STAGES) {
    stageGroups.set(stage, []);
  }
  for (const story of stories) {
    const group = stageGroups.get(story.stage);
    if (group) group.push(story);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {VISIBLE_STAGES.map((stage) => {
        const stageStories = stageGroups.get(stage) ?? [];
        return (
          <div key={stage} className="w-72 shrink-0">
            <div className="mb-3 flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${STAGE_COLORS[stage] ?? "bg-gray-500"}`} />
              <h3 className="text-sm font-medium">{STAGE_LABELS[stage]}</h3>
              <span className="text-xs text-muted-foreground">({stageStories.length})</span>
            </div>
            <div className="space-y-2">
              {stageStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
              {stageStories.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No stories
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
