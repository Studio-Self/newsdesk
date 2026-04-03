import type { AgentRole, StoryStage } from "@newsdesk/shared";

export interface AdapterInput {
  storyId: string;
  storyTitle: string;
  storyDescription: string | null;
  storyBody: string | null;
  sourceUrls: string[] | null;
  stage: StoryStage;
  agentRole: AgentRole;
  agentName: string;
}

export interface AdapterOutput {
  body?: string;
  headlineOptions?: string[];
  socialContent?: Record<string, string>;
  sources?: Array<{ url: string; title: string; excerpt: string }>;
  qualityScore?: number;
  qualityCriteria?: { accuracy: number; clarity: number; style: number; completeness: number };
  feedback?: string;
  tokenUsage?: { inputTokens: number; outputTokens: number; model: string };
  costCents?: number;
}

export interface Adapter {
  name: string;
  execute(input: AdapterInput): Promise<AdapterOutput>;
}
