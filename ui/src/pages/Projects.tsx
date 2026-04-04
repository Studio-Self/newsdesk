import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/api/projects";
import { useNewsroom } from "@/context/NewsroomContext";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderKanban } from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  archived: "bg-gray-100 text-gray-800",
  on_hold: "bg-yellow-100 text-yellow-800",
};

export function Projects() {
  const { selectedNewsroomId } = useNewsroom();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { data: projects = [] } = useQuery({
    queryKey: queryKeys.projects.list(selectedNewsroomId!),
    queryFn: () => projectsApi.list(selectedNewsroomId!),
    enabled: !!selectedNewsroomId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      projectsApi.create(selectedNewsroomId!, {
        title,
        slug: title.toLowerCase().replace(/\s+/g, "-"),
        description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list(selectedNewsroomId!) });
      setShowCreate(false);
      setTitle("");
      setDescription("");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader><CardTitle>Create Project</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Project title (e.g., Election 2026 Coverage)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate()} disabled={!title}>Create</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.id} to={`/projects/${project.id}`}>
            <Card className="hover:bg-accent/50 transition-colors h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">{project.title}</h3>
                  </div>
                  <Badge className={STATUS_COLORS[project.status]}>{project.status}</Badge>
                </div>
                {project.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{project.description}</p>}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">No projects yet. Create projects to organize related stories.</p>
      )}
    </div>
  );
}
