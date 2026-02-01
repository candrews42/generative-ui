import { useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { QueryInput } from './components/QueryInput';
import { CodePanel } from './components/CodePanel';
import { nodeTypes } from './components/NodeTypes';
import { layoutDiagram } from './utils/layout';
import { queryCodebase, fetchCodeSnippet } from './utils/api';
import type { DiagramNode, CodeSnippet } from './types';

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [codebasePath, setCodebasePath] = useState<string>(
    '/home/ubuntu/clawd/generative-ui'
  );
  const [selectedNode, setSelectedNode] = useState<DiagramNode | null>(null);
  const [codeSnippet, setCodeSnippet] = useState<CodeSnippet | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);

  const handleQuery = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    setSelectedNode(null);
    setCodeSnippet(null);

    try {
      const result = await queryCodebase(query, codebasePath);

      if (result.nodes.length === 0) {
        setError('No results found for that query.');
        return;
      }

      const { nodes: layoutedNodes, edges: layoutedEdges } = layoutDiagram(
        result.nodes,
        result.edges
      );

      // Cast to the React Flow types (using unknown to bridge type systems)
      setNodes(layoutedNodes as unknown as Node[]);
      setEdges(layoutedEdges as unknown as Edge[]);
      setTitle(result.title || '');
      setSummary(result.summary || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [codebasePath, setNodes, setEdges]);

  const handleNodeClick = useCallback(async (_: React.MouseEvent, node: Node) => {
    const diagramNode = node.data as unknown as DiagramNode;
    setSelectedNode(diagramNode);

    if (diagramNode.codeLocation) {
      setCodeLoading(true);
      try {
        const snippet = await fetchCodeSnippet(
          `${codebasePath}/${diagramNode.codeLocation.file}`,
          diagramNode.codeLocation.startLine,
          diagramNode.codeLocation.endLine
        );
        setCodeSnippet(snippet);
      } catch (err) {
        console.error('Failed to fetch code:', err);
        setCodeSnippet(null);
      } finally {
        setCodeLoading(false);
      }
    } else {
      setCodeSnippet(null);
    }
  }, [codebasePath]);

  const closeCodePanel = useCallback(() => {
    setSelectedNode(null);
    setCodeSnippet(null);
  }, []);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800">Generative UI</h1>
        <span className="text-sm text-gray-500">Visual Codebase Interface</span>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Path:</label>
          <input
            type="text"
            value={codebasePath}
            onChange={(e) => setCodebasePath(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="/path/to/codebase"
          />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              style: { stroke: '#64748b', strokeWidth: 2 },
            }}
          >
            <Controls />
            <MiniMap
              nodeStrokeWidth={3}
              zoomable
              pannable
              className="bg-white"
            />
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          </ReactFlow>

          {/* Query input overlay */}
          <div className="absolute top-4 left-4 right-4 z-10">
            <QueryInput onQuery={handleQuery} loading={loading} />
          </div>

          {/* Title and summary */}
          {(title || summary) && (
            <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur rounded-lg shadow-lg p-3 max-w-md">
              {title && <h2 className="font-semibold text-gray-800">{title}</h2>}
              {summary && <p className="text-sm text-gray-600 mt-1">{summary}</p>}
            </div>
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-700">Analyzing codebase...</span>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="absolute top-20 left-4 right-4 z-10">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            </div>
          )}

          {/* Empty state */}
          {nodes.length === 0 && !loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-lg">Enter a query to visualize your codebase</p>
                <p className="text-sm mt-2">Try: "Show me the architecture overview"</p>
              </div>
            </div>
          )}
        </div>

        {/* Code panel */}
        {selectedNode && (
          <CodePanel
            node={selectedNode}
            snippet={codeSnippet}
            loading={codeLoading}
            onClose={closeCodePanel}
          />
        )}
      </div>
    </div>
  );
}
