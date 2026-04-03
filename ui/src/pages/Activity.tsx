import { useQuery } from "@tanstack/react-query";
import { activityApi } from "@/api/activity";
import { useNewsroom } from "@/context/NewsroomContext";
import { queryKeys } from "@/lib/queryKeys";
import { ActivityRow } from "@/components/ActivityRow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Activity() {
  const { selectedNewsroomId } = useNewsroom();

  const { data: activity = [] } = useQuery({
    queryKey: queryKeys.activity(selectedNewsroomId!),
    queryFn: () => activityApi.list(selectedNewsroomId!, 100),
    enabled: !!selectedNewsroomId,
    refetchInterval: 5000,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Activity Feed</h1>

      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          {activity.length > 0 ? (
            activity.map((entry) => <ActivityRow key={entry.id} entry={entry} />)
          ) : (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
