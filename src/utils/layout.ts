import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 100;

export function getAutoLayout(
  nodes: Node[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR'
): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 80, ranksep: 120 });

  nodes.forEach((node) => {
    const isMcu =
      (node.data as { category?: string }).category === 'microcontroller';
    g.setNode(node.id, {
      width: isMcu ? 220 : NODE_WIDTH,
      height: isMcu ? 160 : NODE_HEIGHT,
    });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - (pos.width ?? NODE_WIDTH) / 2,
        y: pos.y - (pos.height ?? NODE_HEIGHT) / 2,
      },
    };
  });
}
