import { useNavigate } from "react-router-dom";
import { Plus, Workflow } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pipelines</h1>
        <Button onClick={() => navigate("/workflows/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Pipeline
        </Button>
      </div>
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-700 text-gray-500">
        <div className="text-center">
          <Workflow className="mx-auto mb-2 h-8 w-8" />
          <p>No pipelines yet. Create your first one.</p>
        </div>
      </div>
    </div>
  );
}
