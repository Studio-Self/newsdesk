import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { approvalsApi } from "@/api/approvals";
import { storiesApi } from "@/api/stories";
import { queryKeys } from "@/lib/queryKeys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/timeAgo";
import type { Approval } from "@newsdesk/shared";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function Approvals() {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data: approvals = [] } = useQuery({
    queryKey: queryKeys.approvals.list(),
    queryFn: () => approvalsApi.list(),
  });

  const decideMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      approvalsApi.decide(id, { status, decidedBy: "human", decisionNotes: notes[id] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals.list() });
    },
  });

  const pending = approvals.filter((a) => a.status === "pending");
  const decided = approvals.filter((a) => a.status !== "pending");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editorial Approvals</h1>

      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Pending Review ({pending.length})</h2>
          {pending.map((approval) => (
            <Card key={approval.id} className="border-primary/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Story approval at stage: {approval.stage}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(approval.createdAt)}</p>
                  </div>
                  <Badge variant="outline">pending</Badge>
                </div>
                <Input
                  placeholder="Notes (optional)..."
                  value={notes[approval.id] ?? ""}
                  onChange={(e) => setNotes({ ...notes, [approval.id]: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => decideMutation.mutate({ id: approval.id, status: "approved" })}
                    disabled={decideMutation.isPending}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => decideMutation.mutate({ id: approval.id, status: "rejected" })}
                    disabled={decideMutation.isPending}
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pending.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No stories awaiting approval.
          </CardContent>
        </Card>
      )}

      {decided.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">History</h2>
          {decided.map((approval) => (
            <Card key={approval.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex-1">
                  <p className="text-sm">Stage: {approval.stage}</p>
                  {approval.decisionNotes && <p className="text-xs text-muted-foreground">{approval.decisionNotes}</p>}
                </div>
                <Badge variant={approval.status === "approved" ? "default" : "destructive"}>
                  {approval.status}
                </Badge>
                <span className="text-xs text-muted-foreground">{timeAgo(approval.decidedAt ?? approval.createdAt)}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
