export interface Config {
  port: number;
  databaseUrl: string;
  anthropicApiKey: string | null;
  nodeEnv: string;
}

export function loadConfig(): Config {
  return {
    port: parseInt(process.env.PORT ?? "3100", 10),
    databaseUrl: process.env.DATABASE_URL ?? "postgresql://newsdesk:newsdesk@localhost:5433/newsdesk",
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? null,
    nodeEnv: process.env.NODE_ENV ?? "development",
  };
}
