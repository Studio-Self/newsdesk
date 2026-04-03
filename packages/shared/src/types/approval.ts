export const APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export interface Approval {
  id: string;
  storyId: string;
  stage: string;
  status: ApprovalStatus;
  requestedByAgentId: string | null;
  decidedBy: string | null;
  decisionNotes: string | null;
  createdAt: string;
  decidedAt: string | null;
}
