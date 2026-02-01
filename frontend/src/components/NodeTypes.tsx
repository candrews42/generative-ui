import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { DiagramNode } from '../types';

const nodeStyles: Record<string, { bg: string; border: string; icon: string }> = {
  file: { bg: 'bg-slate-50', border: 'border-slate-300', icon: '📄' },
  function: { bg: 'bg-purple-50', border: 'border-purple-300', icon: '⚡' },
  class: { bg: 'bg-blue-50', border: 'border-blue-300', icon: '🔷' },
  api: { bg: 'bg-green-50', border: 'border-green-300', icon: '🔌' },
  database: { bg: 'bg-orange-50', border: 'border-orange-300', icon: '🗃️' },
  service: { bg: 'bg-pink-50', border: 'border-pink-300', icon: '⚙️' },
  component: { bg: 'bg-cyan-50', border: 'border-cyan-300', icon: '🧩' },
};

interface CustomNodeProps {
  data: DiagramNode;
  selected?: boolean;
}

const CustomNode = memo(({ data, selected }: CustomNodeProps) => {
  const style = nodeStyles[data.type] || nodeStyles.file;

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 shadow-sm cursor-pointer transition-all min-w-[140px] max-w-[200px]
        ${style.bg} ${style.border}
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${data.highlighted ? 'ring-2 ring-yellow-400 animate-pulse' : ''}
        hover:shadow-md
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white"
      />

      <div className="flex items-start gap-2">
        <span className="text-lg">{style.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-800 truncate text-sm">
            {data.label}
          </div>
          {data.description && (
            <div className="text-xs text-gray-500 mt-0.5 truncate">
              {data.description}
            </div>
          )}
          {data.codeLocation && (
            <div className="text-[10px] text-gray-400 mt-1 font-mono truncate">
              {data.codeLocation.file.split('/').pop()}:{data.codeLocation.startLine}
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const nodeTypes: Record<string, any> = {
  file: CustomNode,
  function: CustomNode,
  class: CustomNode,
  api: CustomNode,
  database: CustomNode,
  service: CustomNode,
  component: CustomNode,
  default: CustomNode,
};
