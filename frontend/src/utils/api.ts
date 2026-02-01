import type { DiagramResponse, CodeSnippet } from '../types';

const API_BASE = '/api';

export async function queryCodebase(
  query: string,
  codebasePath: string
): Promise<DiagramResponse> {
  const response = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      codebasePath,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function fetchCodeSnippet(
  file: string,
  startLine: number,
  endLine?: number
): Promise<CodeSnippet> {
  const response = await fetch(`${API_BASE}/code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file,
      startLine,
      endLine,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}
