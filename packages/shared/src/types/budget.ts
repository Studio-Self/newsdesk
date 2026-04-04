export interface BudgetPolicy {
  id: string;
  newsroomId: string;
  name: string;
  scope: "newsroom" | "beat" | "agent";
  scopeId: string | null;
  limitCents: number;
  periodDays: number;
  alertThresholdPct: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetIncident {
  id: string;
  newsroomId: string;
  policyId: string | null;
  agentId: string | null;
  type: string;
  amountCents: number;
  message: string | null;
  createdAt: string;
}
