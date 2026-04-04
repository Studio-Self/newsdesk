# Newsdesk

AI-powered newsroom orchestration platform. Specialized agents (reporter, fact-checker, copy editor, publisher, social editor) collaborate to produce and publish news content through a structured editorial pipeline.

## Prerequisites

- **Node.js** >= 20
- **pnpm** 9.15.4 (`corepack enable` to use the version pinned in `package.json`)

## Install

```bash
pnpm install
```

## Configure

Copy the example env file and fill in your API key:

```bash
cp .env.example .env
```

Edit `.env`:

```
ANTHROPIC_API_KEY=sk-ant-...   # Required — your Anthropic API key
PORT=3100                       # Optional, defaults to 3100
NODE_ENV=development            # Optional
```

## Development

Start the backend (Express + embedded Postgres — the database auto-initializes):

```bash
pnpm dev
```

In a separate terminal, start the frontend (Vite dev server):

```bash
pnpm dev:ui
```

## Testing

Tests use [Vitest](https://vitest.dev/).

```bash
pnpm test          # Watch mode
pnpm test:run      # Single run (CI)
```

## Other Commands

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `pnpm build`       | Build all packages                 |
| `pnpm typecheck`   | Type-check all packages            |
| `pnpm db:generate` | Generate Drizzle ORM migrations    |
| `pnpm db:migrate`  | Apply database migrations          |

## Project Structure

```
newsdesk/
├── server/          # Express 5 API backend
├── ui/              # React 19 + Vite frontend
├── packages/
│   ├── db/          # Drizzle ORM schema & migrations
│   └── shared/      # Shared TypeScript types
├── vitest.config.ts # Test configuration
└── package.json     # Root workspace config
```

## License

See [LICENSE](LICENSE).
