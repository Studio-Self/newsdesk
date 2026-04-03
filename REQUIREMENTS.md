# Newsdesk Requirements

> AI-powered newsroom orchestration platform where specialized agents collaborate to produce, verify, edit, and publish news content through an automated editorial pipeline.

## 1. Vision

Newsdesk replaces manual newsroom workflows with an AI-agent system. Each agent fills a traditional newsroom role (reporter, fact-checker, copy editor, etc.) and stories flow through a structured pipeline from pitch to publication. Human editors retain oversight through approval gates and a real-time dashboard.

## 2. Core Concepts

| Concept | Description |
|---------|-------------|
| **Newsroom** | An isolated workspace (multi-tenant). All entities are scoped to a newsroom. |
| **Agent** | An AI worker with a specific role, LLM adapter, monthly budget, and status. |
| **Story** | A news article that progresses through pipeline stages. |
| **Beat** | A topic area (e.g. politics, tech) that organizes coverage. |
| **Assignment** | A task linking a beat or topic to an agent to produce a story. |
| **Approval** | A gate at the review stage requiring human or senior-agent sign-off. |

## 3. Functional Requirements

### 3.1 Story Pipeline

The editorial pipeline enforces a strict stage progression:

```
pitch -> assigned -> drafting -> fact_check -> copy_edit -> review -> ready -> published
                                     \                        \
                                      -> drafting (rework)     -> copy_edit (reject)

Any stage (except published) -> killed
```

- **FR-1**: Stories must follow valid stage transitions as defined in `STAGE_TRANSITIONS`.
- **FR-2**: The `review` stage requires an explicit approval before advancing to `ready`.
- **FR-3**: Stories can be "killed" (spiked) from any non-terminal stage.
- **FR-4**: Every stage transition must be logged with timestamp, acting agent, and optional notes.
- **FR-5**: Stories track priority levels: `breaking`, `urgent`, `normal`, `feature`.

### 3.2 Agent System

Six specialized roles collaborate on story production:

| Role | Responsibility |
|------|---------------|
| **Editor** | Oversees pipeline, assigns stories, approves publication |
| **Reporter** | Researches and drafts stories |
| **Fact-Checker** | Verifies claims and sources |
| **Copy Editor** | Polishes prose, checks style and grammar |
| **Publisher** | Formats and pushes final content to distribution |
| **Social Editor** | Generates social media content for published stories |

- **FR-6**: Each agent connects to an LLM via a pluggable adapter (e.g. `ClaudeLocalAdapter`).
- **FR-7**: Agents report status (`idle`, `working`, `paused`, `error`) and heartbeat timestamps.
- **FR-8**: Every agent run is logged with token usage, cost, duration, input/output summaries, and error details.
- **FR-9**: Agents operate within a configurable monthly budget (in cents). Runs that would exceed budget must be blocked or flagged.

### 3.3 Quality & Scoring

- **FR-10**: Agents produce quality scores at each pipeline stage, grading on four criteria: accuracy, clarity, style, completeness (each 0-100).
- **FR-11**: An aggregate quality score per story is available on the dashboard.

### 3.4 Source Verification

- **FR-12**: Stories maintain a list of sources (URLs, titles, excerpts).
- **FR-13**: Each source tracks whether it has been verified and by which agent.

### 3.5 Cost Management

- **FR-14**: All LLM API costs are tracked per agent run as `CostEvent` records.
- **FR-15**: The dashboard displays total spend, average cost per article, and per-agent budget utilization.
- **FR-16**: Monthly budget enforcement per agent with alerts or hard stops when approaching limits.

### 3.6 Real-Time Updates

- **FR-17**: WebSocket connections deliver live events scoped by newsroom.
- **FR-18**: Event types include story CRUD, stage changes, agent status changes, run lifecycle, and approval decisions.
- **FR-19**: The UI reactively updates pipeline boards, dashboards, and activity feeds from WebSocket events.

### 3.7 Dashboard & Activity

- **FR-20**: Dashboard shows pipeline stage counts, active/total agents, pending approvals, cost metrics, stories published today, and average quality score.
- **FR-21**: A global activity log records all significant events with type, related story/agent, and metadata.

### 3.8 Newsroom Management

- **FR-22**: Support creating, reading, updating newsroom workspaces.
- **FR-23**: All data is isolated per newsroom (multi-tenant by foreign key).

### 3.9 UI Views

The frontend provides:

| View | Purpose |
|------|---------|
| Dashboard | Pipeline overview, key metrics, recent activity |
| Pipeline | Kanban board of stories by stage |
| Stories | Filterable table of all stories |
| Story Detail | Full story view with body, sources, stage history, quality scores |
| Agents | Agent roster with status and budget |
| Agent Detail | Individual agent config and run history |
| Beats | Beat/topic management |
| Assignments | Assignment tracking |
| Approvals | Approval queue for review-stage stories |
| Costs | Cost analysis and budget dashboards |
| Activity | Chronological event timeline |

## 4. Non-Functional Requirements

### 4.1 Performance

- **NFR-1**: API responses < 200ms for standard CRUD operations.
- **NFR-2**: WebSocket event delivery < 500ms from state change to UI update.
- **NFR-3**: Dashboard aggregation queries should be optimized with appropriate indexes.

### 4.2 Reliability

- **NFR-4**: Agent run failures must be captured (status: `failed`, error logged) — not silently dropped.
- **NFR-5**: Database migrations run automatically on startup (embedded-postgres for dev).
- **NFR-6**: Graceful degradation if an agent adapter is unavailable.

### 4.3 Security

- **NFR-7**: Authentication and authorization (not yet implemented — required before production).
- **NFR-8**: API keys (e.g. `ANTHROPIC_API_KEY`) must never be exposed to the frontend.
- **NFR-9**: Input validation on all API endpoints (Zod schemas).

### 4.4 Extensibility

- **NFR-10**: Agent adapters follow a pluggable interface — adding a new LLM backend should not require changes to core logic.
- **NFR-11**: Story stages and transitions are defined declaratively and could be made configurable per newsroom in the future.

### 4.5 Observability

- **NFR-12**: Structured logging via Pino across all server operations.
- **NFR-13**: Agent run metrics (tokens, cost, duration) stored for analysis.

## 5. Technical Architecture

```
┌──────────────────────────────────────────────────────┐
│                     Frontend (React)                  │
│  Vite + React 19 + React Router 7 + TailwindCSS 4   │
│  TanStack Query for server state, WebSocket client    │
└──────────────────┬───────────────┬───────────────────┘
                   │ REST API      │ WebSocket
┌──────────────────┴───────────────┴───────────────────┐
│                  Server (Express 5)                   │
│  Routes → Services → Drizzle ORM → PostgreSQL        │
│  Adapters → LLM APIs (Claude, etc.)                  │
│  Pino logging, Zod validation                        │
└──────────────────┬───────────────────────────────────┘
                   │
┌──────────────────┴───────────────────────────────────┐
│                PostgreSQL Database                    │
│  12 tables, JSONB fields, comprehensive indexes      │
│  embedded-postgres for development                   │
└──────────────────────────────────────────────────────┘
```

**Monorepo structure** (pnpm workspaces):
- `packages/db` — Drizzle schema and migrations
- `packages/shared` — TypeScript types shared across server and UI
- `server/` — Express API, services, adapters, WebSocket
- `ui/` — React SPA

## 6. Current Gaps (TODO)

These are known gaps between the scaffold and production-readiness:

| Gap | Priority | Notes |
|-----|----------|-------|
| **Authentication / Authorization** | High | No user model, login, or permissions system |
| **Agent orchestration logic** | High | Adapters are stubs — agents don't actually run LLM calls yet |
| **Test coverage** | High | Vitest configured but zero tests |
| **Error recovery** | Medium | Agent failures need retry/backoff strategies |
| **Production database** | Medium | Only embedded-postgres; need connection to external PG |
| **Deployment** | Medium | No Docker, CI/CD, or infrastructure config |
| **API documentation** | Low | No OpenAPI/Swagger spec |
| **Rate limiting** | Low | No API rate limiting or abuse protection |
