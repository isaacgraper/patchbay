import { useParams } from "react-router-dom";
import Canvas from "../components/canvas/Canvas";
import NodePalette from "../components/canvas/NodePalette";
import NodeInspector from "../components/canvas/NodeInspector";

export default function WorkflowEditor() {
  const { id } = useParams();

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
        <h1 className="text-sm font-medium text-gray-400">
          Pipeline {id === "new" ? "(unsaved)" : `#${id}`}
        </h1>
      </header>
      <div className="flex flex-1">
        <NodePalette />
        <div className="flex-1">
          <Canvas />
        </div>
        <NodeInspector />
      </div>
    </div>
  );
}
