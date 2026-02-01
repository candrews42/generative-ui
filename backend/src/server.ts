import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { analyzeCodebase } from './analyze.js';
import { getCodeSnippet } from './files.js';
import type { QueryRequest } from '../../shared/types.js';

const app = new Hono();

// Enable CORS for frontend
app.use('/*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}));

// Health check
app.get('/', (c) => c.json({ status: 'ok', service: 'generative-ui-backend' }));

// Main query endpoint
app.post('/api/query', async (c) => {
  try {
    const body = await c.req.json<QueryRequest>();

    if (!body.query) {
      return c.json({ error: 'Query is required' }, 400);
    }

    if (!body.codebasePath) {
      return c.json({ error: 'Codebase path is required' }, 400);
    }

    console.log(`[Query] "${body.query}" on ${body.codebasePath}`);

    const result = await analyzeCodebase(body);
    return c.json(result);
  } catch (error) {
    console.error('Query error:', error);
    return c.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get code snippet for a node
app.post('/api/code', async (c) => {
  try {
    const body = await c.req.json<{ file: string; startLine: number; endLine?: number }>();

    if (!body.file) {
      return c.json({ error: 'File path is required' }, 400);
    }

    const snippet = await getCodeSnippet(body.file, body.startLine, body.endLine);
    return c.json(snippet);
  } catch (error) {
    console.error('Code snippet error:', error);
    return c.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

const port = parseInt(process.env.PORT || '3001');

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`Generative UI Backend running on http://localhost:${info.port}`);
});
