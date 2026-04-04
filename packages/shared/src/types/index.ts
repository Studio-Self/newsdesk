export * from "./newsroom.js";
export * from "./agent.js";
export * from "./story.js";
export * from "./beat.js";
export * from "./assignment.js";
export * from "./approval.js";
export * from "./quality.js";
export * from "./live.js";
export * from "./user.js";
export * from "./task.js";
export * from "./goal.js";
export * from "./project.js";
export * from "./document.js";
export * from "./routine.js";
export * from "./secret.js";
export * from "./asset.js";
export * from "./budget.js";
export * from "./agent_config.js";

export interface AgentRun {
  id: string;
  agentId: string;
  storyId: string | null;
  status: "running" | "completed" | "failed";
  stage: string | null;
  inputSummary: string | null;
  outputSummary: string | null;
  tokenUsage: { inputTokens: number; outputTokens: number; model: string } | null;
  costCents: number;
  durationMs: number | null;
  error: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface CostEvent {
  id: string;
  newsroomId: string;
  agentId: string;
  storyId: string | null;
  runId: string;
  amountCents: number;
  description: string;
  createdAt: string;
}

export interface ActivityLogEntry {
  id: string;
  newsroomId: string;
  type: string;
  storyId: string | null;
  agentId: string | null;
  data: Record<string, unknown>;
  createdAt: string;
}

export interface Source {
  id: string;
  storyId: string;
  url: string;
  title: string | null;
  excerpt: string | null;
  verified: boolean;
  verifiedByAgentId: string | null;
  createdAt: string;
}

export interface DashboardSummary {
  pipelineCounts: Record<string, number>;
  activeAgents: number;
  totalAgents: number;
  pendingApprovals: number;
  totalCostCents: number;
  avgCostPerArticleCents: number;
  storiesPublishedToday: number;
  avgQualityScore: number;
  openTasks: number;
  activeProjects: number;
  activeGoals: number;
}
