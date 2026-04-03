import { cn } from "@/lib/utils";

function scoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
}

export function QualityBadge({ score }: { score: number }) {
  return (
    <span className={cn("text-sm font-bold", scoreColor(score))}>
      {score}/100
    </span>
  );
}
