export const ASSIGNMENT_STATUSES = ["open", "in_progress", "completed", "cancelled"] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export interface Assignment {
  id: string;
  newsroomId: string;
  beatId: string | null;
  title: string;
  description: string | null;
  assignedByAgentId: string | null;
  status: AssignmentStatus;
  priority: string;
  createdAt: string;
  updatedAt: string;
}
