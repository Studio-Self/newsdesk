export const AGENT_ROLES = [
  "editor",
  "reporter",
  "fact_checker",
  "copy_editor",
  "publisher",
  "social_editor",
] as const;

export type AgentRole = (typeof AGENT_ROLES)[number];

export const AGENT_STATUSES = ["idle", "working", "paused", "error"] as const;
export type AgentStatus = (typeof AGENT_STATUSES)[number];

export interface Agent {
  id: string;
  newsroomId: string;
  name: string;
  role: AgentRole;
  title: string | null;
  icon: string | null;
  status: AgentStatus;
  adapterType: string;
  adapterConfig: Record<string, unknown>;
  budgetMonthlyCents: number;
  spentMonthlyCents: number;
  lastHeartbeatAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const ROLE_LABELS: Record<AgentRole, string> = {
  editor: "Editor",
  reporter: "Reporter",
  fact_checker: "Fact-Checker",
  copy_editor: "Copy Editor",
  publisher: "Publisher",
  social_editor: "Social Media Editor",
};
