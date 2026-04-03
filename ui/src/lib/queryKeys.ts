export const queryKeys = {
  newsrooms: ["newsrooms"] as const,
  dashboard: (newsroomId: string) => ["dashboard", newsroomId] as const,
  stories: {
    list: (newsroomId: string) => ["stories", newsroomId] as const,
    detail: (id: string) => ["stories", "detail", id] as const,
    stages: (id: string) => ["stories", "stages", id] as const,
  },
  pipeline: (newsroomId: string) => ["pipeline", newsroomId] as const,
  agents: {
    list: (newsroomId: string) => ["agents", newsroomId] as const,
    detail: (id: string) => ["agents", "detail", id] as const,
  },
  beats: {
    list: (newsroomId: string) => ["beats", newsroomId] as const,
  },
  assignments: {
    list: (newsroomId: string) => ["assignments", newsroomId] as const,
  },
  approvals: {
    list: () => ["approvals"] as const,
    pending: () => ["approvals", "pending"] as const,
  },
  costs: (newsroomId: string) => ["costs", newsroomId] as const,
  activity: (newsroomId: string) => ["activity", newsroomId] as const,
};
