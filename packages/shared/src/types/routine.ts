export interface Routine {
  id: string;
  newsroomId: string;
  name: string;
  description: string | null;
  schedule: string;
  agentId: string | null;
  action: string;
  actionConfig: Record<string, unknown>;
  enabled: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
  updatedAt: string;
}
