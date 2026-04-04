export const PROJECT_STATUSES = ["active", "completed", "archived", "on_hold"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface Project {
  id: string;
  newsroomId: string;
  title: string;
  slug: string;
  description: string | null;
  status: ProjectStatus;
  leadAgentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectGoal {
  id: string;
  projectId: string;
  goalId: string;
  createdAt: string;
}

export interface ProjectStory {
  id: string;
  projectId: string;
  storyId: string;
  createdAt: string;
}
