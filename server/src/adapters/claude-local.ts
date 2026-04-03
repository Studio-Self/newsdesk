import Anthropic from "@anthropic-ai/sdk";
import type { Adapter, AdapterInput, AdapterOutput } from "./types.js";
import type { AgentRole } from "@newsdesk/shared";
import { logger } from "../middleware/logger.js";

const ROLE_PROMPTS: Record<AgentRole, string> = {
  editor: `You are a news editor. Your job is to review story pitches, assess newsworthiness, assign priority levels, and create clear editorial direction. Evaluate the pitch critically — is this story timely, important, and compelling? Provide a brief editorial memo with your assessment and direction for the reporter.

Respond with JSON:
{
  "body": "Your editorial memo and direction for the story",
  "qualityScore": 0-100,
  "qualityCriteria": { "accuracy": 0-100, "clarity": 0-100, "style": 0-100, "completeness": 0-100 },
  "feedback": "Brief feedback on the pitch"
}`,

  reporter: `You are an investigative reporter. Research the assigned topic thoroughly, gather facts from multiple sources, and write a clear, compelling news article following AP style. Include source citations. Focus on the 5 W's: Who, What, When, Where, Why. Write a complete article with a strong lede, supporting paragraphs, and proper attribution.

Respond with JSON:
{
  "body": "The full article text in AP style",
  "sources": [{ "url": "source url or description", "title": "source name", "excerpt": "key quote or fact" }],
  "qualityScore": 0-100,
  "qualityCriteria": { "accuracy": 0-100, "clarity": 0-100, "style": 0-100, "completeness": 0-100 },
  "feedback": "Notes on the reporting process"
}`,

  fact_checker: `You are a fact-checker. Verify every claim in the article against reliable sources. Flag any unverified claims, check statistics, verify quotes, and confirm dates and names. Provide a detailed fact-check report with confidence levels.

If claims cannot be verified or are inaccurate, set qualityScore below 60 to trigger a rework back to drafting.

Respond with JSON:
{
  "body": "The article with any corrections applied, or the original if all checks pass",
  "sources": [{ "url": "verification source", "title": "source name", "excerpt": "verification detail" }],
  "qualityScore": 0-100,
  "qualityCriteria": { "accuracy": 0-100, "clarity": 0-100, "style": 0-100, "completeness": 0-100 },
  "feedback": "Detailed fact-check report with findings"
}`,

  copy_editor: `You are a copy editor. Polish the prose for clarity, grammar, and AP style compliance. Fix passive voice, tighten sentences, ensure consistent tone. Do not change the factual content or the reporter's voice. Return the cleaned article.

Respond with JSON:
{
  "body": "The polished article text",
  "qualityScore": 0-100,
  "qualityCriteria": { "accuracy": 0-100, "clarity": 0-100, "style": 0-100, "completeness": 0-100 },
  "feedback": "Summary of copy edits made"
}`,

  publisher: `You are a publisher. Format the article for CMS publication. Generate 3-5 headline options (from straightforward to engaging). Write a meta description and suggest tags. Ensure the article structure works for web reading.

Respond with JSON:
{
  "body": "The final formatted article",
  "headlineOptions": ["headline 1", "headline 2", "headline 3"],
  "qualityScore": 0-100,
  "qualityCriteria": { "accuracy": 0-100, "clarity": 0-100, "style": 0-100, "completeness": 0-100 },
  "feedback": "Publishing notes"
}`,

  social_editor: `You are a social media editor. Create platform-specific social posts to promote this article. Write posts for Twitter/X (280 chars max), LinkedIn (professional tone), and a brief newsletter teaser. Each should drive engagement and clicks.

Respond with JSON:
{
  "socialContent": { "twitter": "tweet text", "linkedin": "linkedin post", "newsletter": "newsletter teaser" },
  "qualityScore": 0-100,
  "qualityCriteria": { "accuracy": 0-100, "clarity": 0-100, "style": 0-100, "completeness": 0-100 },
  "feedback": "Social strategy notes"
}`,
};

// Pricing per million tokens (in dollars) for common models
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-20250514": { input: 3, output: 15 },
  "claude-haiku-4-5-20251001": { input: 1, output: 5 },
  "claude-opus-4-20250514": { input: 15, output: 75 },
};

function calculateCostCents(
  inputTokens: number,
  outputTokens: number,
  model: string,
): number {
  const pricing = MODEL_PRICING[model] ?? { input: 3, output: 15 };
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return Math.ceil((inputCost + outputCost) * 100); // convert to cents
}

export class ClaudeLocalAdapter implements Adapter {
  name = "claude-local";
  private client: Anthropic;
  private model: string;

  constructor(model?: string) {
    this.client = new Anthropic(); // uses ANTHROPIC_API_KEY env var
    this.model = model ?? "claude-sonnet-4-20250514";
  }

  async execute(input: AdapterInput): Promise<AdapterOutput> {
    const systemPrompt = ROLE_PROMPTS[input.agentRole];

    const userPrompt = [
      `Story: ${input.storyTitle}`,
      input.storyDescription ? `Brief: ${input.storyDescription}` : "",
      input.storyBody ? `Current Draft:\n${input.storyBody}` : "",
      input.sourceUrls?.length ? `Sources: ${input.sourceUrls.join(", ")}` : "",
      `Stage: ${input.stage}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;
      const costCents = calculateCostCents(inputTokens, outputTokens, this.model);

      // Extract text content
      const textBlock = response.content.find((b) => b.type === "text");
      const rawText = textBlock?.type === "text" ? textBlock.text : "";

      // Parse JSON from response (handle markdown code blocks)
      let parsed: Record<string, unknown> = {};
      try {
        const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [
          null,
          rawText,
        ];
        parsed = JSON.parse(jsonMatch[1]!.trim());
      } catch {
        // If JSON parsing fails, use raw text as body
        logger.warn({ role: input.agentRole, storyId: input.storyId }, "Failed to parse JSON from Claude response, using raw text");
        parsed = { body: rawText };
      }

      const result: AdapterOutput = {
        tokenUsage: { inputTokens, outputTokens, model: this.model },
        costCents,
      };

      if (parsed.body) result.body = parsed.body as string;
      if (parsed.headlineOptions) result.headlineOptions = parsed.headlineOptions as string[];
      if (parsed.socialContent) result.socialContent = parsed.socialContent as Record<string, string>;
      if (parsed.sources) result.sources = parsed.sources as AdapterOutput["sources"];
      if (parsed.qualityScore) result.qualityScore = parsed.qualityScore as number;
      if (parsed.qualityCriteria) {
        result.qualityCriteria = parsed.qualityCriteria as {
          accuracy: number;
          clarity: number;
          style: number;
          completeness: number;
        };
      }
      if (parsed.feedback) result.feedback = parsed.feedback as string;

      return result;
    } catch (err) {
      logger.error({ err, role: input.agentRole, storyId: input.storyId }, "Claude API call failed");
      throw err;
    }
  }
}
