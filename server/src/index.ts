import { createServer } from "node:http";
import { resolve } from "node:path";
import { createDb } from "@newsdesk/db";
import detectPort from "detect-port";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { setupWebSocketServer } from "./realtime/ws.js";
import { logger } from "./middleware/logger.js";

export interface StartServerOptions {
  /** Directory for embedded PostgreSQL data (defaults to ./postgres-data) */
  dataDir?: string;
  /** HTTP server port (defaults to PORT env or 3100) */
  port?: number;
  /** PostgreSQL port (defaults to 5433) */
  pgPort?: number;
  /** UI serving mode (defaults based on NODE_ENV) */
  uiMode?: "none" | "static" | "vite-dev";
  /** Absolute path to pre-built UI dist directory */
  uiDistPath?: string;
}

export interface ServerHandle {
  /** Port the HTTP server is listening on */
  port: number;
  /** Full URL to the running server */
  url: string;
  /** Gracefully shut down the server and database */
  shutdown: () => Promise<void>;
}

async function startEmbeddedPostgres(dataDir: string, port: number) {
  const { default: EmbeddedPostgres } = await import("embedded-postgres");
  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: "newsdesk",
    password: "newsdesk",
    port,
    persistent: true,
  });

  try {
    await pg.initialise();
  } catch {
    // Already initialized
  }
  await pg.start();
  logger.info({ port, dataDir }, "Embedded PostgreSQL started");

  // Create the database if it doesn't exist
  const { default: postgres } = await import("postgres");
  const adminSql = postgres(`postgresql://newsdesk:newsdesk@localhost:${port}/postgres`);
  try {
    await adminSql`CREATE DATABASE newsdesk`;
    logger.info("Created database 'newsdesk'");
  } catch {
    // Database already exists
  }
  await adminSql.end();

  return pg;
}

async function applyMigrations(connectionString: string) {
  const { default: postgres } = await import("postgres");
  const sql = postgres(connectionString);

  // Apply schema directly using raw SQL since we're bootstrapping
  await sql`
    CREATE TABLE IF NOT EXISTS newsrooms (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS agents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      newsroom_id UUID NOT NULL REFERENCES newsrooms(id),
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'reporter',
      title TEXT,
      icon TEXT,
      status TEXT NOT NULL DEFAULT 'idle',
      adapter_type TEXT NOT NULL DEFAULT 'claude-local',
      adapter_config JSONB NOT NULL DEFAULT '{}',
      budget_monthly_cents INTEGER NOT NULL DEFAULT 0,
      spent_monthly_cents INTEGER NOT NULL DEFAULT 0,
      last_heartbeat_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS beats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      newsroom_id UUID NOT NULL REFERENCES newsrooms(id),
      name TEXT NOT NULL,
      description TEXT,
      slug TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(newsroom_id, slug)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS assignments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      newsroom_id UUID NOT NULL REFERENCES newsrooms(id),
      beat_id UUID REFERENCES beats(id),
      title TEXT NOT NULL,
      description TEXT,
      assigned_by_agent_id UUID REFERENCES agents(id),
      status TEXT NOT NULL DEFAULT 'open',
      priority TEXT NOT NULL DEFAULT 'normal',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS stories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      newsroom_id UUID NOT NULL REFERENCES newsrooms(id),
      beat_id UUID REFERENCES beats(id),
      assignment_id UUID REFERENCES assignments(id),
      title TEXT NOT NULL,
      slug TEXT,
      description TEXT,
      body TEXT,
      headline_options JSONB,
      social_content JSONB,
      stage TEXT NOT NULL DEFAULT 'pitch',
      priority TEXT NOT NULL DEFAULT 'normal',
      assignee_agent_id UUID REFERENCES agents(id),
      reporter_agent_id UUID REFERENCES agents(id),
      fact_checker_agent_id UUID REFERENCES agents(id),
      copy_editor_agent_id UUID REFERENCES agents(id),
      publisher_agent_id UUID REFERENCES agents(id),
      social_editor_agent_id UUID REFERENCES agents(id),
      source_urls JSONB,
      word_count INTEGER,
      cost_total_cents INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      published_at TIMESTAMPTZ
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS story_stages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      story_id UUID NOT NULL REFERENCES stories(id),
      from_stage TEXT,
      to_stage TEXT NOT NULL,
      agent_id UUID REFERENCES agents(id),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS quality_scores (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      story_id UUID NOT NULL REFERENCES stories(id),
      agent_id UUID NOT NULL REFERENCES agents(id),
      stage TEXT NOT NULL,
      score INTEGER NOT NULL,
      criteria JSONB,
      feedback TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS approvals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      story_id UUID NOT NULL REFERENCES stories(id),
      stage TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      requested_by_agent_id UUID REFERENCES agents(id),
      decided_by TEXT,
      decision_notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      decided_at TIMESTAMPTZ
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS agent_runs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      agent_id UUID NOT NULL REFERENCES agents(id),
      story_id UUID REFERENCES stories(id),
      status TEXT NOT NULL DEFAULT 'running',
      stage TEXT,
      input_summary TEXT,
      output_summary TEXT,
      token_usage JSONB,
      cost_cents INTEGER NOT NULL DEFAULT 0,
      duration_ms INTEGER,
      error TEXT,
      started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      completed_at TIMESTAMPTZ
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cost_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      newsroom_id UUID NOT NULL REFERENCES newsrooms(id),
      agent_id UUID NOT NULL REFERENCES agents(id),
      story_id UUID REFERENCES stories(id),
      run_id UUID REFERENCES agent_runs(id),
      amount_cents INTEGER NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS activity_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      newsroom_id UUID NOT NULL REFERENCES newsrooms(id),
      type TEXT NOT NULL,
      story_id UUID REFERENCES stories(id),
      agent_id UUID REFERENCES agents(id),
      data JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sources (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      story_id UUID NOT NULL REFERENCES stories(id),
      url TEXT NOT NULL,
      title TEXT,
      excerpt TEXT,
      verified BOOLEAN NOT NULL DEFAULT false,
      verified_by_agent_id UUID REFERENCES agents(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS agents_newsroom_status_idx ON agents(newsroom_id, status)`;
  await sql`CREATE INDEX IF NOT EXISTS agents_newsroom_role_idx ON agents(newsroom_id, role)`;
  await sql`CREATE INDEX IF NOT EXISTS stories_newsroom_stage_idx ON stories(newsroom_id, stage)`;
  await sql`CREATE INDEX IF NOT EXISTS stories_newsroom_beat_idx ON stories(newsroom_id, beat_id)`;
  await sql`CREATE INDEX IF NOT EXISTS stories_assignee_idx ON stories(assignee_agent_id)`;
  await sql`CREATE INDEX IF NOT EXISTS story_stages_story_idx ON story_stages(story_id)`;
  await sql`CREATE INDEX IF NOT EXISTS quality_scores_story_idx ON quality_scores(story_id)`;
  await sql`CREATE INDEX IF NOT EXISTS quality_scores_agent_idx ON quality_scores(agent_id)`;
  await sql`CREATE INDEX IF NOT EXISTS approvals_story_idx ON approvals(story_id)`;
  await sql`CREATE INDEX IF NOT EXISTS approvals_status_idx ON approvals(status)`;
  await sql`CREATE INDEX IF NOT EXISTS agent_runs_agent_idx ON agent_runs(agent_id)`;
  await sql`CREATE INDEX IF NOT EXISTS agent_runs_story_idx ON agent_runs(story_id)`;
  await sql`CREATE INDEX IF NOT EXISTS cost_events_newsroom_idx ON cost_events(newsroom_id)`;
  await sql`CREATE INDEX IF NOT EXISTS activity_log_newsroom_idx ON activity_log(newsroom_id)`;
  await sql`CREATE INDEX IF NOT EXISTS sources_story_idx ON sources(story_id)`;

  await sql.end();
  logger.info("Database schema applied");
}

export async function startServer(options?: StartServerOptions): Promise<ServerHandle> {
  const config = loadConfig();
  const pgPort = options?.pgPort ?? 5433;
  const dataDir = options?.dataDir ?? resolve(process.cwd(), "postgres-data");

  // Start embedded PostgreSQL
  const pg = await startEmbeddedPostgres(dataDir, pgPort);
  const connectionString = `postgresql://newsdesk:newsdesk@localhost:${pgPort}/newsdesk`;

  // Apply migrations
  await applyMigrations(connectionString);

  // Create database connection
  const db = createDb(connectionString);

  // Detect available port
  const port = await detectPort(options?.port ?? config.port);

  // Create Express app
  const uiMode = options?.uiMode ?? (config.nodeEnv === "production" ? "static" : "vite-dev");
  const app = await createApp(db, {
    uiMode,
    serverPort: port,
    uiDistPath: options?.uiDistPath,
  });

  // Create HTTP server and attach WebSocket
  const server = createServer(app);
  setupWebSocketServer(server);

  return new Promise((resolveHandle) => {
    server.listen(port, () => {
      logger.info({ port, uiMode }, "Newsdesk server started");
      resolveHandle({
        port,
        url: `http://localhost:${port}`,
        shutdown: async () => {
          logger.info("Shutting down...");
          server.close();
          await pg.stop();
        },
      });
    });
  });
}

// CLI entry point — only runs when executed directly
const isCLI = process.argv[1] && (
  process.argv[1].endsWith("index.ts") ||
  process.argv[1].endsWith("index.js")
);

if (isCLI) {
  startServer()
    .then((handle) => {
      const config = loadConfig();
      const hasApiKey = !!config.anthropicApiKey;

      logger.info(`

  ┌─────────────────────────────────────────┐
  │                                         │
  │   NEWSDESK                              │
  │   AI Newsroom Orchestration             │
  │                                         │
  │   API:  http://localhost:${handle.port}          │
  │   UI:   http://localhost:${handle.port}          │
  │                                         │
  │   Orchestrator: POST /api/orchestrator  │
  │   Claude API:   ${hasApiKey ? "configured ✓" : "not set (dry-run only)"}         │
  │                                         │
  └─────────────────────────────────────────┘

      `);

      const shutdown = async () => {
        await handle.shutdown();
        process.exit(0);
      };
      process.on("SIGINT", shutdown);
      process.on("SIGTERM", shutdown);
    })
    .catch((err) => {
      console.error("Fatal error:", err);
      process.exit(1);
    });
}
