import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "@/api/documents";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState("");

  const { data: doc, isLoading } = useQuery({
    queryKey: queryKeys.documents.detail(id!),
    queryFn: () => documentsApi.get(id!),
    enabled: !!id,
  });

  const { data: revisions = [] } = useQuery({
    queryKey: ["documents", id, "revisions"],
    queryFn: () => documentsApi.listRevisions(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: () => documentsApi.update(id!, { body: editBody, changeNotes: "Updated via editor" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.detail(id!) });
      queryClient.invalidateQueries({ queryKey: ["documents", id, "revisions"] });
      setEditing(false);
    },
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!doc) return <p className="text-muted-foreground">Document not found</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{doc.title}</h1>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline">{doc.category.replace(/_/g, " ")}</Badge>
          <span className="text-sm text-muted-foreground">Rev {doc.currentRevision}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Content</CardTitle>
            {!editing && (
              <Button size="sm" variant="outline" onClick={() => { setEditBody(doc.body); setEditing(true); }}>
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-3">
              <Textarea rows={16} value={editBody} onChange={(e) => setEditBody(e.target.value)} className="font-mono text-sm" />
              <div className="flex gap-2">
                <Button onClick={() => updateMutation.mutate()}>Save</Button>
                <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">{doc.body || "No content yet."}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Revision History ({revisions.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {revisions.map((rev) => (
              <div key={rev.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <span className="text-sm font-medium">Rev {rev.revision}</span>
                  {rev.changeNotes && <span className="text-sm text-muted-foreground ml-2">- {rev.changeNotes}</span>}
                </div>
                <span className="text-xs text-muted-foreground">{new Date(rev.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
