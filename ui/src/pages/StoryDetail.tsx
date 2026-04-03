import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storiesApi } from "@/api/stories";
import { approvalsApi } from "@/api/approvals";
import { queryKeys } from "@/lib/queryKeys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { STAGE_LABELS, STAGE_TRANSITIONS } from "@newsdesk/shared";
import type { StoryStage } from "@newsdesk/shared";
import { timeAgo } from "@/lib/timeAgo";
import { formatCents } from "@/lib/utils";

export function StoryDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: story, isLoading } = useQuery({
    queryKey: queryKeys.stories.detail(id!),
    queryFn: () => storiesApi.get(id!),
    enabled: !!id,
  });

  const { data: stages = [] } = useQuery({
    queryKey: queryKeys.stories.stages(id!),
    queryFn: () => storiesApi.getStages(id!),
    enabled: !!id,
  });

  const transitionMutation = useMutation({
    mutationFn: (stage: string) => storiesApi.transition(id!, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stories.detail(id!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stories.stages(id!) });
    },
  });

  const approvalMutation = useMutation({
    mutationFn: () => approvalsApi.create({ storyId: id!, stage: story!.stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals.list() });
    },
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!story) return <p className="text-muted-foreground">Story not found.</p>;

  const currentStage = story.stage as StoryStage;
  const nextStages = STAGE_TRANSITIONS[currentStage] ?? [];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{story.title}</h1>
          <Badge>{STAGE_LABELS[story.stage] ?? story.stage}</Badge>
          <Badge variant="outline">{story.priority}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Created {timeAgo(story.createdAt)} &middot; Cost: {formatCents(story.costTotalCents)}
          {story.wordCount ? ` \u00b7 ${story.wordCount} words` : ""}
        </p>
      </div>

      {/* Stage transitions */}
      {nextStages.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Advance Story</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            {nextStages.map((stage) => (
              <Button
                key={stage}
                size="sm"
                variant={stage === "killed" ? "destructive" : "default"}
                onClick={() => transitionMutation.mutate(stage)}
                disabled={transitionMutation.isPending}
              >
                {STAGE_LABELS[stage]}
              </Button>
            ))}
            {currentStage === "copy_edit" && (
              <Button size="sm" variant="secondary" onClick={() => approvalMutation.mutate()}>
                Request Approval
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {story.description && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Brief</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{story.description}</p></CardContent>
        </Card>
      )}

      {/* Body */}
      {story.body && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Draft</CardTitle></CardHeader>
          <CardContent><p className="text-sm whitespace-pre-wrap">{story.body}</p></CardContent>
        </Card>
      )}

      {/* Headline Options */}
      {story.headlineOptions && story.headlineOptions.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Headline Options</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {story.headlineOptions.map((h, i) => (
                <li key={i} className="text-sm">{i + 1}. {h}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Stage History */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Pipeline History</CardTitle></CardHeader>
        <CardContent>
          {stages.length > 0 ? (
            <div className="space-y-2">
              {stages.map((s) => (
                <div key={s.id} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{timeAgo(s.createdAt)}</span>
                  {s.fromStage && <Badge variant="outline" className="text-[10px]">{s.fromStage}</Badge>}
                  <span className="text-muted-foreground">&rarr;</span>
                  <Badge className="text-[10px]">{s.toStage}</Badge>
                  {s.notes && <span className="text-xs text-muted-foreground">- {s.notes}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No stage transitions yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
