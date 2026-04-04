import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { secretsApi } from "@/api/secrets";
import { useNewsroom } from "@/context/NewsroomContext";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Key, Trash2 } from "lucide-react";

export function Secrets() {
  const { selectedNewsroomId } = useNewsroom();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  const { data: secrets = [] } = useQuery({
    queryKey: queryKeys.secrets.list(selectedNewsroomId!),
    queryFn: () => secretsApi.list(selectedNewsroomId!),
    enabled: !!selectedNewsroomId,
  });

  const createMutation = useMutation({
    mutationFn: () => secretsApi.set(selectedNewsroomId!, key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.secrets.list(selectedNewsroomId!) });
      setShowCreate(false);
      setKey("");
      setValue("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (secretKey: string) => secretsApi.delete(selectedNewsroomId!, secretKey),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.secrets.list(selectedNewsroomId!) }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Secrets</h1>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4" />
          Add Secret
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader><CardTitle>Add Secret</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Key (e.g., OPENAI_API_KEY)" value={key} onChange={(e) => setKey(e.target.value)} />
            <Input type="password" placeholder="Value" value={value} onChange={(e) => setValue(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate()} disabled={!key || !value}>Save</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {secrets.map((secret) => (
          <Card key={secret.id}>
            <CardContent className="flex items-center gap-3 p-4">
              <Key className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1">
                <p className="font-mono text-sm font-medium">{secret.key}</p>
                <p className="text-xs text-muted-foreground">v{secret.currentVersion} · Updated {new Date(secret.updatedAt).toLocaleDateString()}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(secret.key)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {secrets.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">No secrets configured. Add API keys and credentials for integrations.</p>
      )}
    </div>
  );
}
