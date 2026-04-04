export const TASK_TYPES = [
  "general",
  "pitch_followup",
  "revision_request",
  "fact_check",
  "source_followup",
  "photo_request",
  "copy_review",
  "legal_review",
] as const;

export type TaskType = (typeof TASK_TYPES)[number];

export const TASK_STATUSES = ["open", "in_progress", "blocked", "completed", "cancelled"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["critical", "high", "normal", "low"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface EditorialTask {
  id: string;
  newsroomId: string;
  title: string;
  description: string | null;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  storyId: string | null;
  assigneeAgentId: string | null;
  createdByAgentId: string | null;
  labels: string[];
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  agentId: string | null;
  authorName: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  general: "General",
  pitch_followup: "Pitch Follow-up",
  revision_request: "Revision Request",
  fact_check: "Fact Check",
  source_followup: "Source Follow-up",
  photo_request: "Photo Request",
  copy_review: "Copy Review",
  legal_review: "Legal Review",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  blocked: "Blocked",
  completed: "Completed",
  cancelled: "Cancelled",
};
