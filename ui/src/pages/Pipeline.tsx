import { PipelineBoard } from "@/components/PipelineBoard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

export function Pipeline() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Story Pipeline</h1>
        <Link to="/stories/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Story
          </Button>
        </Link>
      </div>
      <PipelineBoard />
    </div>
  );
}
