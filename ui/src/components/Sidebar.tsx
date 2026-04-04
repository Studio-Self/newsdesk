import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Newspaper,
  Users,
  Kanban,
  Radio,
  ShieldCheck,
  DollarSign,
  Activity,
  FolderOpen,
  ListTodo,
  Target,
  FolderKanban,
  FileText,
  Clock,
  Key,
  Network,
} from "lucide-react";
import { useNewsroom } from "@/context/NewsroomContext";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/pipeline", label: "Pipeline", icon: Kanban },
      { path: "/activity", label: "Activity", icon: Activity },
    ],
  },
  {
    label: "Editorial",
    items: [
      { path: "/stories", label: "Stories", icon: Newspaper },
      { path: "/tasks", label: "Tasks", icon: ListTodo },
      { path: "/assignments", label: "Assignments", icon: FolderOpen },
      { path: "/approvals", label: "Approvals", icon: ShieldCheck },
    ],
  },
  {
    label: "Strategy",
    items: [
      { path: "/goals", label: "Goals", icon: Target },
      { path: "/projects", label: "Projects", icon: FolderKanban },
      { path: "/beats", label: "Beats", icon: Radio },
    ],
  },
  {
    label: "Newsroom",
    items: [
      { path: "/agents", label: "Agents", icon: Users },
      { path: "/org-chart", label: "Org Chart", icon: Network },
      { path: "/documents", label: "Documents", icon: FileText },
      { path: "/routines", label: "Routines", icon: Clock },
    ],
  },
  {
    label: "Settings",
    items: [
      { path: "/costs", label: "Costs", icon: DollarSign },
      { path: "/secrets", label: "Secrets", icon: Key },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const { selectedNewsroom } = useNewsroom();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <span className="text-lg font-bold tracking-tight text-primary">NEWSDESK</span>
      </div>

      {selectedNewsroom && (
        <div className="border-b border-border px-4 py-2">
          <p className="text-xs text-muted-foreground">Newsroom</p>
          <p className="text-sm font-medium truncate">{selectedNewsroom.name}</p>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-4 py-3">
        <p className="text-[10px] text-muted-foreground">Newsdesk v0.2.0</p>
      </div>
    </aside>
  );
}
