import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Pipeline } from "./pages/Pipeline";
import { Stories } from "./pages/Stories";
import { StoryDetail } from "./pages/StoryDetail";
import { Agents } from "./pages/Agents";
import { AgentDetail } from "./pages/AgentDetail";
import { Beats } from "./pages/Beats";
import { Assignments } from "./pages/Assignments";
import { Approvals } from "./pages/Approvals";
import { Costs } from "./pages/Costs";
import { Activity } from "./pages/Activity";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="stories" element={<Stories />} />
        <Route path="stories/new" element={<Stories />} />
        <Route path="stories/:id" element={<StoryDetail />} />
        <Route path="agents" element={<Agents />} />
        <Route path="agents/:id" element={<AgentDetail />} />
        <Route path="beats" element={<Beats />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="costs" element={<Costs />} />
        <Route path="activity" element={<Activity />} />
      </Route>
    </Routes>
  );
}
