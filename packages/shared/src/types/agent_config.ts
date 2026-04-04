export interface AgentConfigRevision {
  id: string;
  agentId: string;
  revision: number;
  config: Record<string, unknown>;
  changedBy: string | null;
  changeNotes: string | null;
  createdAt: string;
}

export interface AgentRuntimeState {
  id: string;
  agentId: string;
  state: Record<string, unknown>;
  updatedAt: string;
}

export interface AgentApiKey {
  id: string;
  agentId: string;
  newsroomId: string;
  label: string;
  lastUsedAt: string | null;
  createdAt: string;
}
