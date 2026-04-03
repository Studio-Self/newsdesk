import type { Adapter } from "./types.js";
import { ClaudeLocalAdapter } from "./claude-local.js";

export type { Adapter, AdapterInput, AdapterOutput } from "./types.js";

const adapters = new Map<string, Adapter>();

// Register default adapters
adapters.set("claude-local", new ClaudeLocalAdapter());

export function getAdapter(type: string): Adapter | null {
  return adapters.get(type) ?? null;
}

export function registerAdapter(adapter: Adapter) {
  adapters.set(adapter.name, adapter);
}
