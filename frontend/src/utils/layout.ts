import Dagre from '@dagrejs/dagre';
import type { DiagramNode, DiagramEdge } from '../types';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 80;

interface LayoutNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: DiagramNode;
}

interface LayoutEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  animated?: boolean;
  style: React.CSSProperties;
  labelStyle: React.CSSProperties;
}

export function layoutDiagram(
  diagramNodes: DiagramNode[],
  diagramEdges: DiagramEdge[]
): { nodes: LayoutNode[]; edges: LayoutEdge[] } {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  g.setGraph({
    rankdir: 'TB', // Top to bottom
    nodesep: 60,
    ranksep: 80,
    marginx: 20,
    marginy: 20,
  });

  // Add nodes to dagre
  for (const node of diagramNodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  // Add edges to dagre
  for (const edge of diagramEdges) {
    g.setEdge(edge.source, edge.target);
  }

  // Run the layout
  Dagre.layout(g);

  // Convert to React Flow nodes
  const nodes: LayoutNode[] = diagramNodes.map((node) => {
    const position = g.node(node.id);
    return {
      id: node.id,
      type: node.type,
      position: {
        x: position.x - NODE_WIDTH / 2,
        y: position.y - NODE_HEIGHT / 2,
      },
      data: node,
    };
  });

  // Convert to React Flow edges with styling based on type
  const edges: LayoutEdge[] = diagramEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'smoothstep',
    label: edge.label,
    animated: edge.animated,
    style: getEdgeStyle(edge.type),
    labelStyle: { fontSize: 10, fill: '#64748b' },
  }));

  return { nodes, edges };
}

function getEdgeStyle(type: DiagramEdge['type']): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    strokeWidth: 2,
  };

  switch (type) {
    case 'imports':
      return { ...baseStyle, stroke: '#94a3b8' };
    case 'calls':
      return { ...baseStyle, stroke: '#8b5cf6', strokeDasharray: '5,5' };
    case 'extends':
      return { ...baseStyle, stroke: '#3b82f6', strokeWidth: 3 };
    case 'implements':
      return { ...baseStyle, stroke: '#3b82f6', strokeDasharray: '3,3' };
    case 'uses':
      return { ...baseStyle, stroke: '#64748b' };
    case 'contains':
      return { ...baseStyle, stroke: '#e2e8f0', strokeWidth: 3 };
    case 'returns':
      return { ...baseStyle, stroke: '#10b981', strokeDasharray: '8,4' };
    default:
      return baseStyle;
  }
}
