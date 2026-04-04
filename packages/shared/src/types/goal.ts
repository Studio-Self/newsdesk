export const GOAL_STATUSES = ["active", "achieved", "paused", "cancelled"] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];

export interface Goal {
  id: string;
  newsroomId: string;
  parentGoalId: string | null;
  title: string;
  description: string | null;
  status: GoalStatus;
  targetDate: string | null;
  progressPct: number;
  createdAt: string;
  updatedAt: string;
}
