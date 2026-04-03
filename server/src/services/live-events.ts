import type { LiveEvent } from "@newsdesk/shared";

type Listener = (event: LiveEvent) => void;
const listeners = new Map<string, Set<Listener>>();

export function subscribeNewsroomEvents(newsroomId: string, listener: Listener): () => void {
  if (!listeners.has(newsroomId)) {
    listeners.set(newsroomId, new Set());
  }
  listeners.get(newsroomId)!.add(listener);
  return () => {
    listeners.get(newsroomId)?.delete(listener);
  };
}

export function publishLiveEvent(event: LiveEvent) {
  const subs = listeners.get(event.newsroomId);
  if (subs) {
    for (const listener of subs) {
      try {
        listener(event);
      } catch {
        // ignore listener errors
      }
    }
  }
}
