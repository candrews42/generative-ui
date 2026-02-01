import type { DiagramNode, CodeSnippet } from '../types';

interface CodePanelProps {
  node: DiagramNode;
  snippet: CodeSnippet | null;
  loading: boolean;
  onClose: () => void;
}

const nodeTypeLabels: Record<string, string> = {
  file: 'File',
  function: 'Function',
  class: 'Class',
  api: 'API Endpoint',
  database: 'Database',
  service: 'Service',
  component: 'Component',
};

const nodeTypeColors: Record<string, string> = {
  file: 'bg-gray-100 text-gray-700',
  function: 'bg-purple-100 text-purple-700',
  class: 'bg-blue-100 text-blue-700',
  api: 'bg-green-100 text-green-700',
  database: 'bg-orange-100 text-orange-700',
  service: 'bg-pink-100 text-pink-700',
  component: 'bg-cyan-100 text-cyan-700',
};

export function CodePanel({ node, snippet, loading, onClose }: CodePanelProps) {
  return (
    <div className="w-96 border-l border-gray-200 bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${nodeTypeColors[node.type] || 'bg-gray-100'}`}>
              {nodeTypeLabels[node.type] || node.type}
            </span>
            {node.highlighted && (
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-700">
                Highlighted
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-800 truncate">{node.label}</h3>
          {node.description && (
            <p className="text-sm text-gray-600 mt-1">{node.description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Location */}
      {node.codeLocation && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm">
          <span className="text-gray-500">Location: </span>
          <span className="font-mono text-gray-700">
            {node.codeLocation.file}:{node.codeLocation.startLine}
            {node.codeLocation.endLine && node.codeLocation.endLine !== node.codeLocation.startLine && (
              <span>-{node.codeLocation.endLine}</span>
            )}
          </span>
        </div>
      )}

      {/* Code snippet */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-4 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 text-gray-500">Loading code...</span>
          </div>
        ) : snippet ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-mono">
                Lines {snippet.startLine}-{snippet.endLine}
              </span>
              <span className="text-xs text-gray-400">{snippet.language}</span>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              <code>
                {snippet.content.split('\n').map((line, i) => (
                  <div key={i} className="flex">
                    <span className="text-gray-500 select-none w-10 flex-shrink-0 text-right pr-3">
                      {snippet.startLine + i}
                    </span>
                    <span className="flex-1">{line || ' '}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        ) : node.codeLocation ? (
          <div className="p-4 text-center text-gray-400">
            <p>Could not load code snippet</p>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-400">
            <p>No code location available</p>
            {node.metadata && Object.keys(node.metadata).length > 0 && (
              <div className="mt-4 text-left">
                <div className="text-xs text-gray-500 mb-2">Metadata:</div>
                <pre className="bg-gray-50 p-2 rounded text-xs text-gray-600 overflow-x-auto">
                  {JSON.stringify(node.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Group info */}
      {node.group && (
        <div className="px-4 py-2 border-t border-gray-200 text-sm text-gray-500">
          Group: <span className="font-medium text-gray-700">{node.group}</span>
        </div>
      )}
    </div>
  );
}
