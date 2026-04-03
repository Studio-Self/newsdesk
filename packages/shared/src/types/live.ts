export type LiveEventType =
  | "story:created"
  | "story:updated"
  | "story:stage_changed"
  | "story:deleted"
  | "agent:status_changed"
  | "agent:run_started"
  | "agent:run_completed"
  | "approval:requested"
  | "approval:decided"
  | "activity:new";

export interface LiveEvent {
  type: LiveEventType;
  newsroomId: string;
  data: Record<string, unknown>;
  timestamp: string;
}
