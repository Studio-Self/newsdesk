import { eq, and, ne, inArray } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { stories, agents, agentRuns, sources } from "@newsdesk/db";
import type { StoryStage, AgentRole } from "@newsdesk/shared";

type StoryRow = typeof stories.$inferSelect;
type AgentRow = typeof agents.$inferSelect;
import { getAdapter } from "../adapters/index.js";
import type { AdapterInput } from "../adapters/index.js";
import { storyService } from "../services/stories.js";
import { agentService } from "../services/agents.js";
import { costService } from "../services/costs.js";
import { qualityService } from "../services/quality.js";
import { activityService } from "../services/activity.js";
import { approvalService } from "../services/approvals.js";
import { publishLiveEvent } from "../services/live-events.js";
import { logger } from "../middleware/logger.js";
import {
  PIPELINE,
  POST_PUBLISH_ROLE,
  POST_PUBLISH_AGENT_FIELD,
  QUALITY_THRESHOLD,
} from "./pipeline.js";
import type { StageAction } from "./pipeline.js";

export interface OrchestratorConfig {
  /** Heartbeat interval in milliseconds (default: 30_000) */
  intervalMs: number;
  /** Maximum concurrent agent runs per tick (default: 5) */
  maxConcurrent: number;
  /** Dry run mode — log actions but don't call LLMs (default: false) */
  dryRun: boolean;
}

const DEFAULT_CONFIG: OrchestratorConfig = {
  intervalMs: 30_000,
  maxConcurrent: 5,
  dryRun: false,
};

/** Stages the orchestrator actively processes */
const ACTIONABLE_STAGES: StoryStage[] = [
  "pitch",
  "assigned",
  "drafting",
  "fact_check",
  "copy_edit",
  "ready",
];

export class Orchestrator {
  private db: Db;
  private config: OrchestratorConfig;
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;
  private processing = false;
  private tickCount = 0;
  private storySvc: ReturnType<typeof storyService>;
  private agentSvc: ReturnType<typeof agentService>;
  private costSvc: ReturnType<typeof costService>;
  private qualitySvc: ReturnType<typeof qualityService>;
  private actSvc: ReturnType<typeof activityService>;
  private approvalSvc: ReturnType<typeof approvalService>;

  constructor(db: Db, config?: Partial<OrchestratorConfig>) {
    this.db = db;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.storySvc = storyService(db);
    this.agentSvc = agentService(db);
    this.costSvc = costService(db);
    this.qualitySvc = qualityService(db);
    this.actSvc = activityService(db);
    this.approvalSvc = approvalService(db);
  }

  /** Start the heartbeat loop */
  start() {
    if (this.running) {
      logger.warn("Orchestrator already running");
      return;
    }
    this.running = true;
    logger.info(
      { intervalMs: this.config.intervalMs, dryRun: this.config.dryRun },
      "Orchestrator started",
    );

    // Run immediately on start, then on interval
    this.tick();
    this.timer = setInterval(() => this.tick(), this.config.intervalMs);
  }

  /** Stop the heartbeat loop */
  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    logger.info("Orchestrator stopped");
  }

  /** Get current status */
  status() {
    return {
      running: this.running,
      processing: this.processing,
      tickCount: this.tickCount,
      config: this.config,
    };
  }

  /** Single heartbeat tick — scan for work and dispatch agents */
  private async tick() {
    if (this.processing) {
      logger.debug("Tick skipped — previous tick still processing");
      return;
    }

    this.processing = true;
    this.tickCount++;
    const tickId = this.tickCount;

    try {
      logger.debug({ tickId }, "Orchestrator tick");

      // Find all stories in actionable stages across all newsrooms
      const actionableStories = await this.db
        .select()
        .from(stories)
        .where(inArray(stories.stage, ACTIONABLE_STAGES));

      if (actionableStories.length === 0) {
        logger.debug({ tickId }, "No actionable stories found");
        return;
      }

      logger.info(
        { tickId, storyCount: actionableStories.length },
        "Found actionable stories",
      );

      // Process up to maxConcurrent stories per tick
      const batch = actionableStories.slice(0, this.config.maxConcurrent);
      const results = await Promise.allSettled(
        batch.map((story) => this.processStory(story, tickId)),
      );

      for (const result of results) {
        if (result.status === "rejected") {
          logger.error({ tickId, err: result.reason }, "Story processing failed");
        }
      }

      // Handle post-publish social content generation
      await this.processPostPublish(tickId);
    } catch (err) {
      logger.error({ tickId, err }, "Orchestrator tick failed");
    } finally {
      this.processing = false;
    }
  }

  /** Process a single story through its current pipeline stage */
  private async processStory(story: StoryRow, tickId: number) {
    const stage = story.stage as StoryStage;
    const action = PIPELINE[stage];
    if (!action) return;

    const log = logger.child({ tickId, storyId: story.id, stage, role: action.role });

    // Find an available agent for this role in this newsroom
    const agent = await this.findAvailableAgent(
      story.newsroomId,
      action.role,
      story,
      action.agentField,
    );

    if (!agent) {
      log.debug("No available agent for role");
      return;
    }

    // Check budget
    if (agent.budgetMonthlyCents > 0 && agent.spentMonthlyCents >= agent.budgetMonthlyCents) {
      log.warn({ agentId: agent.id, budget: agent.budgetMonthlyCents, spent: agent.spentMonthlyCents }, "Agent over budget, skipping");
      await this.actSvc.log({
        newsroomId: story.newsroomId,
        type: "agent:budget_exceeded",
        storyId: story.id,
        agentId: agent.id,
        data: { budget: agent.budgetMonthlyCents, spent: agent.spentMonthlyCents },
      });
      return;
    }

    log.info({ agentId: agent.id, agentName: agent.name }, "Dispatching agent");

    // Mark agent as working
    await this.agentSvc.update(agent.id, {
      status: "working",
      lastHeartbeatAt: new Date(),
    });

    publishLiveEvent({
      type: "agent:status_changed",
      newsroomId: story.newsroomId,
      data: { agentId: agent.id, status: "working" },
      timestamp: new Date().toISOString(),
    });

    // Create agent run record
    const startTime = Date.now();
    const [run] = await this.db
      .insert(agentRuns)
      .values({
        agentId: agent.id,
        storyId: story.id,
        status: "running",
        stage,
        inputSummary: `Processing "${story.title}" at stage ${stage}`,
      })
      .returning();

    publishLiveEvent({
      type: "agent:run_started",
      newsroomId: story.newsroomId,
      data: { agentId: agent.id, runId: run.id, storyId: story.id, stage },
      timestamp: new Date().toISOString(),
    });

    try {
      // Execute the adapter
      const adapterInput: AdapterInput = {
        storyId: story.id,
        storyTitle: story.title,
        storyDescription: story.description,
        storyBody: story.body,
        sourceUrls: story.sourceUrls as string[] | null,
        stage,
        agentRole: action.role,
        agentName: agent.name,
      };

      let output;
      if (this.config.dryRun) {
        log.info("Dry run — skipping LLM call");
        output = {
          body: `[DRY RUN] ${agent.name} processed "${story.title}" at ${stage}`,
          tokenUsage: { inputTokens: 0, outputTokens: 0, model: "dry-run" },
          costCents: 0,
          qualityScore: 80,
          qualityCriteria: { accuracy: 80, clarity: 80, style: 80, completeness: 80 },
          feedback: "Dry run — no actual processing",
        };
      } else {
        const adapter = getAdapter(agent.adapterType ?? "claude-local");
        if (!adapter) {
          throw new Error(`Adapter "${agent.adapterType}" not found`);
        }
        output = await adapter.execute(adapterInput);
      }

      const durationMs = Date.now() - startTime;

      // Update the agent run with results
      await this.db
        .update(agentRuns)
        .set({
          status: "completed",
          outputSummary: output.feedback ?? output.body?.slice(0, 200) ?? "Done",
          tokenUsage: output.tokenUsage ?? null,
          costCents: output.costCents ?? 0,
          durationMs,
          completedAt: new Date(),
        })
        .where(eq(agentRuns.id, run.id));

      // Update story content based on agent output
      const storyUpdate: Record<string, unknown> = {};
      if (output.body) storyUpdate.body = output.body;
      if (output.headlineOptions) storyUpdate.headlineOptions = output.headlineOptions;
      if (output.socialContent) storyUpdate.socialContent = output.socialContent;
      if (output.body) storyUpdate.wordCount = output.body.split(/\s+/).length;

      // Assign this agent to the story's role field
      storyUpdate[action.agentField] = agent.id;

      if (Object.keys(storyUpdate).length > 0) {
        await this.storySvc.update(story.id, storyUpdate as Parameters<typeof this.storySvc.update>[1]);
      }

      // Record sources if provided
      if (output.sources?.length) {
        for (const src of output.sources) {
          await this.db.insert(sources).values({
            storyId: story.id,
            url: src.url,
            title: src.title,
            excerpt: src.excerpt,
          });
        }
      }

      // Record cost
      if (output.costCents && output.costCents > 0) {
        await this.costSvc.create({
          newsroomId: story.newsroomId,
          agentId: agent.id,
          storyId: story.id,
          runId: run.id,
          amountCents: output.costCents,
          description: `${action.role} processing at ${stage} stage`,
        });

        // Update agent's spent budget
        await this.agentSvc.update(agent.id, {
          spentMonthlyCents: agent.spentMonthlyCents + output.costCents,
        });
      }

      // Record quality score
      if (output.qualityScore != null) {
        await this.qualitySvc.create({
          storyId: story.id,
          agentId: agent.id,
          stage,
          score: output.qualityScore,
          criteria: output.qualityCriteria,
          feedback: output.feedback,
        });
      }

      // Determine next stage
      await this.advanceStory(story, action, output.qualityScore, agent.id, log);

      // Log activity
      await this.actSvc.log({
        newsroomId: story.newsroomId,
        type: "agent:run_completed",
        storyId: story.id,
        agentId: agent.id,
        data: {
          runId: run.id,
          stage,
          durationMs,
          costCents: output.costCents ?? 0,
          qualityScore: output.qualityScore,
        },
      });

      // Mark agent idle
      await this.agentSvc.update(agent.id, {
        status: "idle",
        lastHeartbeatAt: new Date(),
      });

      publishLiveEvent({
        type: "agent:run_completed",
        newsroomId: story.newsroomId,
        data: { agentId: agent.id, runId: run.id, storyId: story.id, stage },
        timestamp: new Date().toISOString(),
      });
      publishLiveEvent({
        type: "agent:status_changed",
        newsroomId: story.newsroomId,
        data: { agentId: agent.id, status: "idle" },
        timestamp: new Date().toISOString(),
      });

      log.info({ durationMs, costCents: output.costCents }, "Agent run completed");
    } catch (err) {
      const durationMs = Date.now() - startTime;

      // Mark run as failed
      await this.db
        .update(agentRuns)
        .set({
          status: "failed",
          error: err instanceof Error ? err.message : String(err),
          durationMs,
          completedAt: new Date(),
        })
        .where(eq(agentRuns.id, run.id));

      // Mark agent as error
      await this.agentSvc.update(agent.id, {
        status: "error",
        lastHeartbeatAt: new Date(),
      });

      publishLiveEvent({
        type: "agent:status_changed",
        newsroomId: story.newsroomId,
        data: { agentId: agent.id, status: "error" },
        timestamp: new Date().toISOString(),
      });

      await this.actSvc.log({
        newsroomId: story.newsroomId,
        type: "agent:run_failed",
        storyId: story.id,
        agentId: agent.id,
        data: { error: err instanceof Error ? err.message : String(err) },
      });

      log.error({ err, durationMs }, "Agent run failed");
    }
  }

  /** Advance the story to the next stage based on pipeline rules */
  private async advanceStory(
    story: StoryRow,
    action: StageAction,
    qualityScore: number | undefined,
    agentId: string,
    log: typeof logger,
  ) {
    // Quality gate check (e.g., fact-checker can send back to drafting)
    if (action.qualityGated && action.reworkStage && qualityScore != null) {
      if (qualityScore < QUALITY_THRESHOLD) {
        log.info(
          { qualityScore, threshold: QUALITY_THRESHOLD },
          "Quality below threshold, sending to rework",
        );
        await this.storySvc.transitionStage(story.id, action.reworkStage, {
          agentId,
          notes: `Quality score ${qualityScore} below threshold ${QUALITY_THRESHOLD} — rework needed`,
        });
        return;
      }
    }

    // The review stage is special — create an approval request
    if (action.nextStage === "review") {
      const result = await this.storySvc.transitionStage(story.id, "review", {
        agentId,
        notes: "Ready for editorial review",
      });
      if (result.success) {
        // Create approval request — this waits for human/editor decision
        await this.approvalSvc.create({
          storyId: story.id,
          stage: "review",
          requestedByAgentId: agentId,
        });
        log.info("Story sent to review — approval requested");
      }
      return;
    }

    // Normal transition
    const result = await this.storySvc.transitionStage(story.id, action.nextStage, {
      agentId,
      notes: `Processed by ${action.role}`,
    });

    if (!result.success) {
      log.warn({ error: result.error }, "Stage transition failed");
    }
  }

  /** Handle social content generation after stories are published */
  private async processPostPublish(tickId: number) {
    // Find published stories without social content
    const published = await this.db
      .select()
      .from(stories)
      .where(
        and(
          eq(stories.stage, "published"),
          // Only process stories that don't have a social editor assigned yet
        ),
      );

    for (const story of published) {
      // Skip if social editor already assigned
      if (story.socialEditorAgentId) continue;

      const agent = await this.findAvailableAgent(
        story.newsroomId,
        POST_PUBLISH_ROLE,
        story,
        POST_PUBLISH_AGENT_FIELD,
      );
      if (!agent) continue;

      const log = logger.child({ tickId, storyId: story.id, role: POST_PUBLISH_ROLE });
      log.info("Generating social content for published story");

      // Reuse processStory-like logic but with social editor specifics
      await this.agentSvc.update(agent.id, { status: "working", lastHeartbeatAt: new Date() });

      const startTime = Date.now();
      const [run] = await this.db
        .insert(agentRuns)
        .values({
          agentId: agent.id,
          storyId: story.id,
          status: "running",
          stage: "published",
          inputSummary: `Generating social content for "${story.title}"`,
        })
        .returning();

      try {
        const adapter = getAdapter(agent.adapterType ?? "claude-local");
        if (!adapter) throw new Error(`Adapter not found`);

        const output = this.config.dryRun
          ? {
              socialContent: { twitter: "[DRY RUN]", linkedin: "[DRY RUN]", newsletter: "[DRY RUN]" },
              tokenUsage: { inputTokens: 0, outputTokens: 0, model: "dry-run" },
              costCents: 0,
            }
          : await adapter.execute({
              storyId: story.id,
              storyTitle: story.title,
              storyDescription: story.description,
              storyBody: story.body,
              sourceUrls: story.sourceUrls as string[] | null,
              stage: "published",
              agentRole: POST_PUBLISH_ROLE,
              agentName: agent.name,
            });

        const durationMs = Date.now() - startTime;

        await this.db.update(agentRuns).set({
          status: "completed",
          outputSummary: "Social content generated",
          tokenUsage: output.tokenUsage ?? null,
          costCents: output.costCents ?? 0,
          durationMs,
          completedAt: new Date(),
        }).where(eq(agentRuns.id, run.id));

        // Update story with social content and social editor assignment
        const updateData: Record<string, unknown> = { socialEditorAgentId: agent.id };
        if (output.socialContent) updateData.socialContent = output.socialContent;
        await this.storySvc.update(story.id, updateData as Parameters<typeof this.storySvc.update>[1]);

        if (output.costCents && output.costCents > 0) {
          await this.costSvc.create({
            newsroomId: story.newsroomId,
            agentId: agent.id,
            storyId: story.id,
            runId: run.id,
            amountCents: output.costCents,
            description: "Social content generation",
          });
          await this.agentSvc.update(agent.id, {
            spentMonthlyCents: agent.spentMonthlyCents + output.costCents,
          });
        }

        await this.agentSvc.update(agent.id, { status: "idle", lastHeartbeatAt: new Date() });
        log.info({ durationMs }, "Social content generated");
      } catch (err) {
        const durationMs = Date.now() - startTime;
        await this.db.update(agentRuns).set({
          status: "failed",
          error: err instanceof Error ? err.message : String(err),
          durationMs,
          completedAt: new Date(),
        }).where(eq(agentRuns.id, run.id));
        await this.agentSvc.update(agent.id, { status: "error", lastHeartbeatAt: new Date() });
        log.error({ err }, "Social content generation failed");
      }
    }
  }

  /** Find an available (idle, within budget) agent for a role in a newsroom */
  private async findAvailableAgent(
    newsroomId: string,
    role: AgentRole,
    story: StoryRow,
    agentField: string,
  ): Promise<AgentRow | null> {
    // If the story already has an agent assigned for this role, prefer them
    const existingAgentId = (story as Record<string, unknown>)[agentField] as string | null;
    if (existingAgentId) {
      const existing = await this.agentSvc.getById(existingAgentId);
      if (existing && existing.status === "idle") {
        return existing;
      }
    }

    // Find idle agents with this role in this newsroom
    const candidates = await this.db
      .select()
      .from(agents)
      .where(
        and(
          eq(agents.newsroomId, newsroomId),
          eq(agents.role, role),
          eq(agents.status, "idle"),
          ne(agents.status, "paused"),
        ),
      );

    if (candidates.length === 0) return null;

    // Prefer agents with remaining budget, pick the one with most budget left
    const withinBudget = candidates.filter(
      (a) => a.budgetMonthlyCents === 0 || a.spentMonthlyCents < a.budgetMonthlyCents,
    );

    if (withinBudget.length === 0) return null;

    // Sort by least spent (most budget remaining)
    withinBudget.sort((a: AgentRow, b: AgentRow) => {
      const aRemaining = a.budgetMonthlyCents - a.spentMonthlyCents;
      const bRemaining = b.budgetMonthlyCents - b.spentMonthlyCents;
      return bRemaining - aRemaining;
    });

    return withinBudget[0];
  }
}
