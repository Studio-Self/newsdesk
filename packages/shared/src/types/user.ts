export const NEWSROOM_ROLES = [
  "owner",
  "editor_in_chief",
  "section_editor",
  "reporter",
  "copy_editor",
  "viewer",
] as const;

export type NewsroomRole = (typeof NEWSROOM_ROLES)[number];

export const ROLE_PERMISSIONS: Record<NewsroomRole, string[]> = {
  owner: ["*"],
  editor_in_chief: ["stories:*", "agents:*", "approvals:*", "tasks:*", "goals:*", "projects:*", "routines:*", "documents:*", "costs:read", "settings:*"],
  section_editor: ["stories:*", "agents:read", "approvals:decide", "tasks:*", "goals:read", "projects:read", "documents:*", "costs:read"],
  reporter: ["stories:create", "stories:read", "stories:update_own", "tasks:read", "tasks:update_own", "documents:read"],
  copy_editor: ["stories:read", "stories:update", "tasks:read", "tasks:update_own", "documents:read"],
  viewer: ["stories:read", "tasks:read", "documents:read", "costs:read"],
};

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface NewsroomMembership {
  id: string;
  userId: string;
  newsroomId: string;
  role: NewsroomRole;
  createdAt: string;
}

export interface Invite {
  id: string;
  newsroomId: string;
  invitedByUserId: string;
  email: string;
  role: NewsroomRole;
  token: string;
  status: "pending" | "accepted" | "expired";
  createdAt: string;
  expiresAt: string;
}

export const NEWSROOM_ROLE_LABELS: Record<NewsroomRole, string> = {
  owner: "Owner",
  editor_in_chief: "Editor-in-Chief",
  section_editor: "Section Editor",
  reporter: "Reporter",
  copy_editor: "Copy Editor",
  viewer: "Viewer",
};
