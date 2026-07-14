import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Connection,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback } from "react";

const initialNodes = [
  {
    id: "trigger-1",
    type: "input",
    position: { x: 250, y: 25 },
    data: { label: "MCP Trigger" },
  },
];

export default function Canvas() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => [...eds, { ...connection, id: `${eds.length + 1}` } as Edge]);
    },
    [setEdges],
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
