import type { AgentRole, StoryStage } from "@newsdesk/shared";

/**
 * Maps each actionable story stage to the agent role that should process it,
 * and the stage it should transition to on success.
 */
export interface StageAction {
  role: AgentRole;
  nextStage: StoryStage;
  /** If true, the agent's quality score determines whether to advance or rework */
  qualityGated?: boolean;
  /** Stage to send back to on quality failure (score < threshold) */
  reworkStage?: StoryStage;
  /** Which story field holds this role's agent ID */
  agentField: string;
}

export const PIPELINE: Partial<Record<StoryStage, StageAction>> = {
  pitch: {
    role: "editor",
    nextStage: "assigned",
    agentField: "assigneeAgentId",
  },
  assigned: {
    role: "reporter",
    nextStage: "drafting",
    agentField: "reporterAgentId",
  },
  drafting: {
    role: "reporter",
    nextStage: "fact_check",
    agentField: "reporterAgentId",
  },
  fact_check: {
    role: "fact_checker",
    nextStage: "copy_edit",
    qualityGated: true,
    reworkStage: "drafting",
    agentField: "factCheckerAgentId",
  },
  copy_edit: {
    role: "copy_editor",
    nextStage: "review",
    agentField: "copyEditorAgentId",
  },
  // review: handled specially — creates approval request, waits for human
  ready: {
    role: "publisher",
    nextStage: "published",
    agentField: "publisherAgentId",
  },
};

/** After a story is published, the social editor runs as a follow-up */
export const POST_PUBLISH_ROLE: AgentRole = "social_editor";
export const POST_PUBLISH_AGENT_FIELD = "socialEditorAgentId";

/** Quality score threshold — below this, fact-checker sends story back */
export const QUALITY_THRESHOLD = 60;
