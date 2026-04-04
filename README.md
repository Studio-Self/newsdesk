# Newsdesk

Open source. Self-hosted. No account required.

AI-powered newsroom orchestration platform. Specialized agents (reporter, fact-checker, copy editor, publisher, social editor) collaborate to produce and publish news content through a structured editorial pipeline.

## Quickstart

```bash
npx newsdesk-ai onboard --yes
```

If you already have Newsdesk configured, rerunning `onboard` keeps the existing config in place.

Or manually:

```bash
git clone https://github.com/studio-self/newsdesk.git
cd newsdesk
pnpm install
pnpm dev
```

This starts the API and UI at [http://localhost:3100](http://localhost:3100). An embedded PostgreSQL database is created automatically — no setup required.

**Requirements:** Node.js 20+, pnpm 9.15+

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
├── cli/             # npx onboarding CLI
├── server/          # Express 5 API backend
├── ui/              # React 19 + Vite frontend
├── packages/
│   ├── db/          # Drizzle ORM schema & migrations
│   └── shared/      # Shared TypeScript types
└── package.json     # Root workspace config
```

## License

See [LICENSE](LICENSE).
