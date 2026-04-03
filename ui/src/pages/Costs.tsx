import { useQuery } from "@tanstack/react-query";
import { costsApi } from "@/api/costs";
import { useNewsroom } from "@/context/NewsroomContext";
import { queryKeys } from "@/lib/queryKeys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { formatCents } from "@/lib/utils";
import { timeAgo } from "@/lib/timeAgo";
import { DollarSign, BarChart3 } from "lucide-react";

export function Costs() {
  const { selectedNewsroomId } = useNewsroom();

  const { data: totals } = useQuery({
    queryKey: [...queryKeys.costs(selectedNewsroomId!), "totals"],
    queryFn: () => costsApi.totals(selectedNewsroomId!),
    enabled: !!selectedNewsroomId,
  });

  const { data: events = [] } = useQuery({
    queryKey: queryKeys.costs(selectedNewsroomId!),
    queryFn: () => costsApi.list(selectedNewsroomId!),
    enabled: !!selectedNewsroomId,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cost Analytics</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          label="Total Spend"
          value={formatCents(totals?.totalCents ?? 0)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <MetricCard
          label="Avg Cost Per Article"
          value={formatCents(totals?.avgCostPerArticleCents ?? 0)}
          icon={<BarChart3 className="h-5 w-5" />}
        />
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Cost Events</CardTitle></CardHeader>
        <CardContent>
          {events.length > 0 ? (
            <div className="space-y-2">
              {events.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm">{e.description ?? "Cost event"}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(e.createdAt)}</p>
                  </div>
                  <span className="text-sm font-mono">{formatCents(e.amountCents)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No cost events yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
