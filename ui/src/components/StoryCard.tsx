import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/timeAgo";
import type { Story } from "@newsdesk/shared";
import { STAGE_LABELS } from "@newsdesk/shared";
import { Link } from "react-router-dom";

const PRIORITY_COLORS: Record<string, string> = {
  breaking: "bg-red-600 text-white",
  urgent: "bg-amber-500 text-black",
  normal: "bg-blue-600 text-white",
  feature: "bg-purple-600 text-white",
};

export function StoryCard({ story }: { story: Story }) {
  return (
    <Link
      to={`/stories/${story.id}`}
      className="block rounded-lg border border-border bg-card p-3 hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium leading-tight">{story.title}</h4>
        <Badge className={cn("shrink-0 text-[10px]", PRIORITY_COLORS[story.priority])}>
          {story.priority}
        </Badge>
      </div>
      {story.description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{story.description}</p>
      )}
      <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>{STAGE_LABELS[story.stage] ?? story.stage}</span>
        <span>&middot;</span>
        <span>{timeAgo(story.updatedAt)}</span>
        {story.wordCount && (
          <>
            <span>&middot;</span>
            <span>{story.wordCount} words</span>
          </>
        )}
      </div>
    </Link>
  );
}
