import type { Adapter, AdapterInput, AdapterOutput } from "./types.js";
import type { AgentRole } from "@newsdesk/shared";

const ROLE_PROMPTS: Record<AgentRole, string> = {
  editor: `You are a news editor. Your job is to review story pitches, assess newsworthiness, assign priority levels, and create clear editorial assignments. Break complex stories into manageable pieces. Set deadlines and assign beats.`,

  reporter: `You are an investigative reporter. Research the assigned topic thoroughly, gather facts from multiple sources, write a clear and compelling news article following AP style. Include source citations. Focus on the 5 W's: Who, What, When, Where, Why.`,

  fact_checker: `You are a fact-checker. Verify every claim in the article against reliable sources. Flag any unverified claims, check statistics, verify quotes, and confirm dates and names. Provide a fact-check report with confidence levels for each claim.`,

  copy_editor: `You are a copy editor. Clean the prose for clarity, grammar, and style guide compliance. Fix passive voice, tighten sentences, ensure consistent tone, check AP style. Do not change the factual content or the reporter's voice.`,

  publisher: `You are a publisher. Format the article for CMS publication. Generate 3-5 headline options (varying from straightforward to engaging). Write a meta description, suggest tags, and ensure the article structure works for web reading.`,

  social_editor: `You are a social media editor. Create platform-specific social posts to promote this article. Write posts for Twitter/X (280 chars), LinkedIn (professional tone), and a brief newsletter teaser. Each should drive engagement and clicks.`,
};

export class ClaudeLocalAdapter implements Adapter {
  name = "claude-local";

  async execute(input: AdapterInput): Promise<AdapterOutput> {
    const systemPrompt = ROLE_PROMPTS[input.agentRole];

    const userPrompt = `
Story: ${input.storyTitle}
${input.storyDescription ? `Brief: ${input.storyDescription}` : ""}
${input.storyBody ? `Current Draft:\n${input.storyBody}` : ""}
${input.sourceUrls?.length ? `Sources: ${input.sourceUrls.join(", ")}` : ""}
Stage: ${input.stage}
    `.trim();

    // For now, return a placeholder. Real implementation will call Claude API.
    return {
      body: `[Draft by ${input.agentName}] Processing: ${input.storyTitle}`,
      tokenUsage: { inputTokens: 0, outputTokens: 0, model: "claude-sonnet-4-6" },
      costCents: 0,
    };
  }
}
