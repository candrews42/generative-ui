import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { readCodebaseFiles, summarizeFiles } from './files.js';
import type { QueryRequest, DiagramResponse, DiagramNode, DiagramEdge } from '../../shared/types.js';

const client = new Anthropic();

// Zod schema for validating LLM response
const NodeSchema = z.object({
  id: z.string(),
  type: z.enum(['file', 'function', 'class', 'api', 'database', 'service', 'component']),
  label: z.string(),
  description: z.string().optional(),
  codeLocation: z.object({
    file: z.string(),
    startLine: z.number(),
    endLine: z.number().optional()
  }).optional(),
  metadata: z.record(z.unknown()).optional(),
  highlighted: z.boolean().optional(),
  group: z.string().optional()
});

const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.enum(['imports', 'calls', 'extends', 'implements', 'uses', 'contains', 'returns']),
  label: z.string().optional(),
  animated: z.boolean().optional()
});

const DiagramResponseSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  title: z.string().optional(),
  summary: z.string().optional()
});

const SYSTEM_PROMPT = `You are a code analysis assistant that generates visual diagrams of codebases.

Your task is to analyze code and return a JSON structure representing nodes and edges for a visual diagram.

Guidelines:
1. Create meaningful nodes that represent the key components asked about
2. Connect nodes with appropriate edge types
3. Include code locations when possible (file path and line numbers)
4. Keep the diagram focused - don't include every detail, just what's relevant to the query
5. Use descriptive labels that are concise but clear
6. Group related items when it makes sense

Node types:
- file: A source code file
- function: A function or method
- class: A class or interface
- api: An API endpoint or route
- database: A database table or model
- service: An external service or module
- component: A UI component

Edge types:
- imports: File/module imports another
- calls: Function calls another function
- extends: Class extends another
- implements: Class implements interface
- uses: General usage/dependency
- contains: Parent contains child
- returns: Function returns type

IMPORTANT: Return ONLY valid JSON matching this schema, no markdown or explanation:
{
  "nodes": [{ "id": "string", "type": "string", "label": "string", ... }],
  "edges": [{ "id": "string", "source": "string", "target": "string", "type": "string", ... }],
  "title": "optional string",
  "summary": "optional string"
}`;

export async function analyzeCodebase(request: QueryRequest): Promise<DiagramResponse> {
  const files = await readCodebaseFiles(request.codebasePath);

  if (files.length === 0) {
    return {
      nodes: [{
        id: 'empty',
        type: 'file',
        label: 'No code files found',
        description: 'The specified path contains no readable code files'
      }],
      edges: [],
      title: 'Empty Codebase',
      summary: 'No code files were found in the specified directory.'
    };
  }

  // Build context for LLM
  const fileContents = files.map(f => {
    return `=== ${f.relativePath} ===\n${f.content}\n`;
  }).join('\n');

  const fileSummary = summarizeFiles(files);

  const userPrompt = `Analyze this codebase and generate a diagram based on the following query:

QUERY: ${request.query}

${request.context?.focusArea ? `Focus area: ${request.context.focusArea}` : ''}
${request.context?.previousNodes?.length ? `Previous nodes to connect to: ${request.context.previousNodes.join(', ')}` : ''}

FILE SUMMARY:
${fileSummary}

CODE:
${fileContents}

Generate a JSON diagram response with relevant nodes and edges. Remember to include codeLocation with file paths relative to the codebase root.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }]
    });

    // Extract text from response
    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse and validate JSON
    let jsonStr = textContent.text.trim();

    // Try to extract JSON if wrapped in markdown
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);
    const validated = DiagramResponseSchema.parse(parsed);

    // Ensure all edges reference existing nodes
    const nodeIds = new Set(validated.nodes.map(n => n.id));
    const validEdges = validated.edges.filter(e =>
      nodeIds.has(e.source) && nodeIds.has(e.target)
    );

    return {
      ...validated,
      edges: validEdges
    };
  } catch (error) {
    console.error('LLM analysis error:', error);

    // Return a fallback diagram showing file structure
    return createFallbackDiagram(files, request.query);
  }
}

function createFallbackDiagram(
  files: { relativePath: string; extension: string }[],
  query: string
): DiagramResponse {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];

  // Group files by directory
  const dirs = new Map<string, string[]>();

  for (const file of files) {
    const parts = file.relativePath.split('/');
    const dir = parts.length > 1 ? parts[0] : '.';
    if (!dirs.has(dir)) {
      dirs.set(dir, []);
    }
    dirs.get(dir)!.push(file.relativePath);
  }

  // Create nodes for directories and files
  for (const [dir, filePaths] of dirs) {
    const dirId = `dir-${dir}`;
    nodes.push({
      id: dirId,
      type: 'service',
      label: dir === '.' ? 'root' : dir,
      description: `${filePaths.length} files`,
      group: 'directories'
    });

    for (const filePath of filePaths.slice(0, 5)) {
      const fileId = `file-${filePath.replace(/[/\\]/g, '-')}`;
      nodes.push({
        id: fileId,
        type: 'file',
        label: filePath.split('/').pop() || filePath,
        codeLocation: { file: filePath, startLine: 1 },
        group: dir
      });

      edges.push({
        id: `edge-${dirId}-${fileId}`,
        source: dirId,
        target: fileId,
        type: 'contains'
      });
    }
  }

  return {
    nodes,
    edges,
    title: 'File Structure (Fallback)',
    summary: `Could not analyze for "${query}". Showing file structure instead.`
  };
}
