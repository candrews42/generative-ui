# Generative UI - Visual Codebase Interface

An interactive visual interface that renders codebase visualizations based on natural language queries. Built with React Flow and Claude.

## Quick Start

### Prerequisites

- Node.js 18+
- An Anthropic API key (set as `ANTHROPIC_API_KEY` environment variable)

### Installation

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

### Running

**Terminal 1 - Backend:**
```bash
cd backend
ANTHROPIC_API_KEY=your-key-here npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

## Usage

1. Enter the path to a codebase you want to visualize
2. Type a natural language query like:
   - "Show me the overall architecture"
   - "Show me all API routes and their handlers"
   - "Show me how data flows from API to database"
   - "Show me the dependencies between modules"
3. Click nodes to view source code snippets
4. Ask follow-up questions to explore deeper

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ QueryInput  │  │ React Flow  │  │   CodePanel     │  │
│  │             │  │   Canvas    │  │   (snippets)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend (Hono)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   /api/     │  │    Code     │  │    Claude       │  │
│  │   query     │→ │   Reader    │→ │    Analysis     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Frontend**: React, React Flow, Tailwind CSS, Vite
- **Backend**: Node.js, Hono, tsx
- **AI**: Claude API (Anthropic)
- **Layout**: dagre (automatic graph layout)

## Development

```bash
# Type check frontend
cd frontend && npx tsc --noEmit

# Type check backend
cd backend && npx tsc --noEmit
```

## License

MIT
