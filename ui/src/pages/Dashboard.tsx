import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/dashboard";
import { activityApi } from "@/api/activity";
import { useNewsroom } from "@/context/NewsroomContext";
import { queryKeys } from "@/lib/queryKeys";
import { formatCents } from "@/lib/utils";
import { MetricCard } from "@/components/MetricCard";
import { ActivityRow } from "@/components/ActivityRow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { STORY_STAGES, STAGE_LABELS } from "@newsdesk/shared";
import { Newspaper, Users, ShieldCheck, DollarSign, Star, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const STAGE_COLORS: Record<string, string> = {
  pitch: "bg-indigo-500",
  assigned: "bg-violet-500",
  drafting: "bg-blue-500",
  fact_check: "bg-amber-500",
  copy_edit: "bg-emerald-500",
  review: "bg-rose-500",
  ready: "bg-cyan-500",
  published: "bg-green-500",
  killed: "bg-gray-500",
};

export function Dashboard() {
  const { selectedNewsroomId } = useNewsroom();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: queryKeys.dashboard(selectedNewsroomId!),
    queryFn: () => dashboardApi.summary(selectedNewsroomId!),
    enabled: !!selectedNewsroomId,
    refetchInterval: 10000,
  });

  const { data: activity } = useQuery({
    queryKey: queryKeys.activity(selectedNewsroomId!),
    queryFn: () => activityApi.list(selectedNewsroomId!, 10),
    enabled: !!selectedNewsroomId,
    refetchInterval: 10000,
  });

  if (!selectedNewsroomId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Welcome to Newsdesk</h2>
          <p className="mt-2 text-muted-foreground">Create a newsroom to get started.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Newsroom Command Center</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard
          label="Published Today"
          value={dashboard?.storiesPublishedToday ?? 0}
          icon={<Newspaper className="h-5 w-5" />}
        />
        <MetricCard
          label="Active Agents"
          value={`${dashboard?.activeAgents ?? 0}/${dashboard?.totalAgents ?? 0}`}
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          label="Pending Approvals"
          value={dashboard?.pendingApprovals ?? 0}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <MetricCard
          label="Total Spend"
          value={formatCents(dashboard?.totalCostCents ?? 0)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <MetricCard
          label="Avg Cost/Article"
          value={formatCents(dashboard?.avgCostPerArticleCents ?? 0)}
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <MetricCard
          label="Quality Score"
          value={dashboard?.avgQualityScore ?? 0}
          icon={<Star className="h-5 w-5" />}
        />
      </div>

      {/* Pipeline Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Story Pipeline</CardTitle>
            <Link to="/pipeline" className="text-sm text-primary hover:underline">
              View Pipeline
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {STORY_STAGES.filter((s) => s !== "killed").map((stage) => {
              const count = dashboard?.pipelineCounts?.[stage] ?? 0;
              return (
                <div key={stage} className="flex-1 text-center">
                  <div className={`mx-auto mb-1 h-8 rounded ${STAGE_COLORS[stage]}`} style={{ opacity: count > 0 ? 1 : 0.2 }}>
                    <span className="flex h-full items-center justify-center text-xs font-bold text-white">
                      {count}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{STAGE_LABELS[stage]}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Link to="/activity" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {activity && activity.length > 0 ? (
            <div>
              {activity.map((entry) => (
                <ActivityRow key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No activity yet. Create a story to get started.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
