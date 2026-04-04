import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "@/api/documents";
import { useNewsroom } from "@/context/NewsroomContext";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { DOCUMENT_CATEGORIES } from "@newsdesk/shared";

export function Documents() {
  const { selectedNewsroomId } = useNewsroom();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");

  const { data: documents = [] } = useQuery({
    queryKey: queryKeys.documents.list(selectedNewsroomId!),
    queryFn: () => documentsApi.list(selectedNewsroomId!),
    enabled: !!selectedNewsroomId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      documentsApi.create(selectedNewsroomId!, {
        title,
        slug: title.toLowerCase().replace(/\s+/g, "-"),
        body,
        category,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.list(selectedNewsroomId!) });
      setShowCreate(false);
      setTitle("");
      setBody("");
      setCategory("general");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Documents</h1>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4" />
          New Document
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader><CardTitle>Create Document</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Document title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              {DOCUMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
            </select>
            <Textarea placeholder="Document content (markdown supported)..." rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate()} disabled={!title}>Create</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {documents.map((doc) => (
          <Link key={doc.id} to={`/documents/${doc.id}`}>
            <Card className="hover:bg-accent/50 transition-colors">
              <CardContent className="flex items-center gap-3 p-4">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">Rev {doc.currentRevision} · Updated {new Date(doc.updatedAt).toLocaleDateString()}</p>
                </div>
                <Badge variant="outline">{doc.category.replace(/_/g, " ")}</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {documents.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">No documents yet. Create style guides, policies, and reference docs.</p>
      )}
    </div>
  );
}
