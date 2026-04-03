export const STORY_STAGES = [
  "pitch",
  "assigned",
  "drafting",
  "fact_check",
  "copy_edit",
  "review",
  "ready",
  "published",
  "killed",
] as const;

export type StoryStage = (typeof STORY_STAGES)[number];

export const STORY_PRIORITIES = ["breaking", "urgent", "normal", "feature"] as const;
export type StoryPriority = (typeof STORY_PRIORITIES)[number];

/** Valid stage transitions */
export const STAGE_TRANSITIONS: Record<StoryStage, StoryStage[]> = {
  pitch: ["assigned", "killed"],
  assigned: ["drafting", "killed"],
  drafting: ["fact_check", "killed"],
  fact_check: ["copy_edit", "drafting", "killed"], // can send back to drafting
  copy_edit: ["review", "killed"],
  review: ["ready", "copy_edit", "killed"], // approval gate - can reject back
  ready: ["published", "killed"],
  published: [],
  killed: [],
};

/** Stages that require an approval gate */
export const APPROVAL_REQUIRED_STAGES: StoryStage[] = ["review"];

export interface Story {
  id: string;
  newsroomId: string;
  beatId: string | null;
  assignmentId: string | null;
  title: string;
  slug: string | null;
  description: string | null;
  body: string | null;
  headlineOptions: string[] | null;
  socialContent: Record<string, string> | null;
  stage: StoryStage;
  priority: StoryPriority;
  assigneeAgentId: string | null;
  reporterAgentId: string | null;
  factCheckerAgentId: string | null;
  copyEditorAgentId: string | null;
  publisherAgentId: string | null;
  socialEditorAgentId: string | null;
  sourceUrls: string[] | null;
  wordCount: number | null;
  costTotalCents: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface StoryStageLog {
  id: string;
  storyId: string;
  fromStage: string | null;
  toStage: string;
  agentId: string | null;
  notes: string | null;
  createdAt: string;
}

export const STAGE_LABELS: Record<StoryStage, string> = {
  pitch: "Pitch",
  assigned: "Assigned",
  drafting: "Drafting",
  fact_check: "Fact-Check",
  copy_edit: "Copy Edit",
  review: "Review",
  ready: "Ready",
  published: "Published",
  killed: "Killed",
};
