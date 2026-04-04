# Newsdesk

AI-powered newsroom orchestration platform. Specialized agents (reporter, fact-checker, copy editor, publisher, social editor) collaborate to produce and publish news content through a structured editorial pipeline.

## Quickstart

Requires **Node.js >= 20** and **pnpm** (`corepack enable`).

```bash
git clone https://github.com/studio-self/newsdesk.git
cd newsdesk
pnpm install
pnpm dev
```

That's it. The database auto-provisions (embedded PostgreSQL), and both the API and UI are served at [http://localhost:3100](http://localhost:3100).

To use AI agents, set your Anthropic API key:

```bash
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
```

## Commands

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `pnpm dev`         | Start dev server (API + UI)        |
| `pnpm build`       | Build all packages                 |
| `pnpm test`        | Run tests (watch mode)             |
| `pnpm test:run`    | Run tests (single run)             |
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
└── package.json     # Root workspace config
```

## License

See [LICENSE](LICENSE).
