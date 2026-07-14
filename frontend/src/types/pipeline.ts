import type { Node, Edge } from "@xyflow/react";

export type NodeCategory = "trigger" | "context_skill" | "model" | "mcp_tool";

export type PipelineNode = Node<{
  label: string;
  category: NodeCategory;
  config: Record<string, unknown>;
}>;

export type PipelineEdge = Edge;

export interface Pipeline {
  id: number;
  name: string;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  createdAt: string;
  updatedAt: string;
}
