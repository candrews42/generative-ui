// Shared types for Generative UI

export type NodeType = 'file' | 'function' | 'class' | 'api' | 'database' | 'service' | 'component';

export interface CodeLocation {
  file: string;
  startLine: number;
  endLine?: number;
}

export interface DiagramNode {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  codeLocation?: CodeLocation;
  metadata?: Record<string, unknown>;
  highlighted?: boolean;
  group?: string;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  type: 'imports' | 'calls' | 'extends' | 'implements' | 'uses' | 'contains' | 'returns';
  label?: string;
  animated?: boolean;
}

export interface DiagramResponse {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  title?: string;
  summary?: string;
}

export interface QueryRequest {
  query: string;
  codebasePath: string;
  context?: {
    previousNodes?: string[];
    focusArea?: string;
  };
}

export interface CodeSnippet {
  file: string;
  content: string;
  startLine: number;
  endLine: number;
  language: string;
}

// Query templates for common operations
export const QUERY_TEMPLATES = [
  {
    label: 'Architecture Overview',
    query: 'Show me the overall architecture of this codebase',
    description: 'High-level view of main components and their relationships'
  },
  {
    label: 'API Routes',
    query: 'Show me all API routes and their handlers',
    description: 'Map of HTTP endpoints and the code that handles them'
  },
  {
    label: 'Database Models',
    query: 'Show me the database models and their relationships',
    description: 'Schema visualization with relations'
  },
  {
    label: 'Data Flow',
    query: 'Show me how data flows from API to database',
    description: 'Trace data transformations through the system'
  },
  {
    label: 'Dependencies',
    query: 'Show me the main dependencies between modules',
    description: 'Import/export relationships between files'
  }
] as const;
