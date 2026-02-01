# Generative UI: Visual Codebase Interface

## Product Requirements Document
**Version:** 0.1  
**Author:** Gimli (for Colin)  
**Date:** 2026-02-01  
**Status:** Draft

---

## Executive Summary

**Generative UI** is a visual codebase interface that renders and updates based on natural language queries. Instead of manually building visual workflows like in n8n, you describe what you want to see or do, and the UI generates/updates the visualization in real-time.

The core thesis: **n8n and similar visual workflow builders are becoming obsolete because AI coding agents can generate and modify code faster than humans can drag nodes.**

---

## 1. Problem Statement

### The n8n Model: What It Offers

n8n is a popular open-source workflow automation platform with:

**Core Value Props:**
- Visual drag-and-drop workflow builder
- 400+ integrations (nodes) for various services
- Self-hostable / privacy-first option
- Trigger → Action model for automations
- Built-in debugging with execution history
- Data pinning for testing
- AI assistant for help (cloud only)

**Target Users:**
- Non-developers automating business processes
- Developers who prefer visual debugging
- Teams needing audit trails and documentation

### Why This Model Is Becoming Obsolete

**1. The Manual Burden**
- n8n requires users to manually drag nodes, configure each one, connect them, and debug visually
- Even with an AI assistant, you're still manually placing and connecting nodes
- The visual representation is the *end product*, not just documentation

**2. The Learning Curve Paradox**
- n8n markets as "no-code" but actually requires:
  - Understanding JSON data structures
  - Working with APIs and credentials
  - Expression syntax (`{{ $json.field }}`)
  - Understanding data flow between nodes
- Users who can learn this can also learn to prompt an AI

**3. The Speed Gap**
- Describing a workflow in natural language: ~30 seconds
- Claude Code implementing that workflow: ~2 minutes
- Manually building in n8n: 15-60 minutes
- **AI is 10-30x faster for people who know what they want**

**4. The Flexibility Ceiling**
- n8n's power is limited by available nodes
- Custom logic requires writing JavaScript anyway
- AI agents can use ANY API, ANY logic, ANY language

**5. Visual → Verbal Shift**
- Gen Z and AI-native users think in conversation, not boxes and arrows
- "Show me the auth flow" is more natural than clicking through 20 nodes

### The Core Insight

> n8n's value was making invisible code visible to non-coders.
> But AI makes code accessible to non-coders directly.
> The visual representation should be *output*, not *input*.

---

## 2. Vision: What Generative UI Does Differently

### The Paradigm Shift

| Traditional (n8n) | Generative UI |
|-------------------|---------------|
| Visual input → Code execution | Natural language input → Visual output |
| Manual node placement | AI-generated layouts |
| Static workflows | Dynamic, query-responsive views |
| Build what you need | Ask to see what exists |
| Documentation is separate | Visualization IS documentation |

### Core Concept

**Generative UI** treats visualization as a **query interface to a codebase**, not a construction tool.

```
User: "Show me all the API routes and which services they call"
→ Generates interactive diagram of routes → services → databases

User: "Highlight where authentication happens"  
→ Same diagram, auth paths glow/highlight

User: "What happens when a user signs up?"
→ Animated flow showing the signup journey through code
```

### Key Differentiators

1. **Responsive to Questions** - The UI changes based on what you ask
2. **Context-Aware** - Understands the actual codebase, not abstract shapes
3. **Always Up-to-Date** - Generated from live code, not manually maintained
4. **Explorable** - Click a node to see the code, ask follow-up questions
5. **Actionable** - "Add rate limiting to this endpoint" updates both viz and code

---

## 3. Feasible Options (Ranked by Effort vs Impact)

### Option A: Static Diagram Generator (MVP)
**Effort:** Low (1-2 weeks)  
**Impact:** Medium

Generate Mermaid/D2 diagrams from codebase on demand.

```
User: "Generate architecture diagram for this repo"
→ LLM analyzes code → Outputs Mermaid → Renders diagram
```

**Pros:**
- Already proven (Swark exists, does exactly this)
- No frontend work needed
- Outputs are portable (Mermaid renders anywhere)

**Cons:**
- Not interactive
- Not real-time updating
- Limited to what diagram formats support

**Build vs Buy:** Just use Swark or build a simple MCP tool

---

### Option B: Interactive Query-Based Viewer
**Effort:** Medium (4-6 weeks)  
**Impact:** High

React Flow-based canvas that updates based on NL queries.

```
User: "Show me the data flow from API to database"
→ Renders interactive node graph
→ Click any node to see code
→ Ask follow-up questions about specific nodes
```

**Pros:**
- True generative UI experience
- Highly interactive and explorable
- Proves the concept compellingly

**Cons:**
- Requires significant frontend work
- Need to design good node/edge schemas
- LLM latency for each query

**Technical Stack:**
- React Flow for canvas
- LLM for code analysis and diagram generation
- AST parsing for accurate code relationships

---

### Option C: Live Code Synchronization
**Effort:** High (2-3 months)  
**Impact:** Very High

Visualization that stays in sync with codebase changes.

```
Developer makes code change → Diagram auto-updates
AI suggests: "This creates a circular dependency, see highlighted path"
```

**Pros:**
- Revolutionary developer experience
- Catches architectural issues early
- Always-accurate documentation

**Cons:**
- Complex file watching and incremental analysis
- High computational cost
- Needs robust caching strategy

---

### Option D: Bidirectional Generation
**Effort:** Very High (3-6 months)  
**Impact:** Maximum

Changes to the visualization generate code changes.

```
User drags a new "rate limiter" node onto an API route
→ LLM generates middleware code
→ Code is inserted into the codebase
```

**Pros:**
- True replacement for n8n paradigm
- Visual editing with AI implementation
- Best of both worlds

**Cons:**
- Extremely complex
- Safety concerns with auto-generated code
- Needs robust testing/validation

---

### Recommended Path

```
Phase 1: Option A (Static Generator) → Prove value, learn patterns
Phase 2: Option B (Query-Based Viewer) → Build the killer demo
Phase 3: Option C (Live Sync) → If Phase 2 gets traction
Phase 4: Option D (Bidirectional) → Long-term vision
```

---

## 4. Technical Approaches

### 4.1 Code Analysis

**AST Parsing (Deterministic)**
- Use language-specific parsers (TypeScript: `ts-morph`, Python: `ast`, etc.)
- Extract: imports, exports, function calls, class relationships
- Pros: Accurate, fast, no LLM cost
- Cons: Language-specific, misses semantic meaning

**LLM Analysis (Semantic)**
- Feed code to LLM, ask for structural understanding
- Extract: intent, architectural patterns, business logic
- Pros: Understands meaning, works across languages
- Cons: Slower, costs money, can hallucinate

**Hybrid Approach (Recommended)**
```
1. AST parsing extracts raw relationships
2. LLM interprets and enriches with semantic understanding
3. Cache results, invalidate on file changes
```

### 4.2 Diagram Generation

**Text-to-Diagram via LLM**
```typescript
const prompt = `
Given this codebase analysis:
${JSON.stringify(astAnalysis)}

User asked: "${userQuery}"

Generate a Mermaid diagram showing the relevant relationships.
`;
```

**Structured Output → Renderer**
```typescript
interface DiagramNode {
  id: string;
  type: 'file' | 'function' | 'class' | 'api' | 'database';
  label: string;
  codeLocation: { file: string; line: number };
  metadata: Record<string, any>;
}

interface DiagramEdge {
  source: string;
  target: string;
  type: 'imports' | 'calls' | 'extends' | 'implements';
  label?: string;
}

// LLM outputs this schema, React Flow renders it
```

### 4.3 Canvas Technologies

| Technology | Best For | Notes |
|------------|----------|-------|
| **React Flow** | Interactive node graphs | Most mature, great docs |
| **Mermaid** | Static diagrams in docs | Markdown-friendly |
| **D2** | Complex architecture diagrams | Better layouts than Mermaid |
| **Excalidraw** | Hand-drawn aesthetic | Good for informal sharing |
| **Sigma.js** | Large graph visualization | Performance-focused |

**Recommendation:** React Flow for interactive canvas, Mermaid export for sharing.

### 4.4 MCP Integration

Claude Code can connect to an MCP server that provides:

```typescript
// MCP Tool: analyze_codebase
{
  name: "analyze_codebase",
  description: "Analyze codebase structure and relationships",
  inputSchema: {
    query: { type: "string", description: "What to analyze" },
    scope: { type: "string", description: "Directory or file pattern" }
  }
}

// MCP Tool: generate_diagram
{
  name: "generate_diagram",
  description: "Generate visual diagram of code relationships",
  inputSchema: {
    query: { type: "string", description: "What to visualize" },
    format: { enum: ["mermaid", "reactflow", "d2"] }
  }
}

// MCP Tool: update_diagram  
{
  name: "update_diagram",
  description: "Update existing diagram based on question",
  inputSchema: {
    diagramId: { type: "string" },
    query: { type: "string" }
  }
}
```

---

## 5. MVP Scope Recommendation

### Target: 2-Week Proof of Concept

Build **Option B (Interactive Query-Based Viewer)** in minimal form.

### MVP Features

1. **Single-page React app with React Flow canvas**
2. **Input box for natural language queries**
3. **Backend that:**
   - Reads a specified codebase directory
   - Sends code context + query to Claude
   - Parses structured response into nodes/edges
   - Returns React Flow-compatible JSON
4. **Basic node interactions:**
   - Click node to see code snippet
   - Hover for summary tooltip
5. **Pre-built query templates:**
   - "Show architecture overview"
   - "Show API routes"
   - "Show database models"
   - "Highlight [search term]"

### MVP Non-Goals

- Live file watching
- Bidirectional editing
- Multiple diagram tabs
- Collaboration features
- User authentication

### Technical MVP Stack

```
Frontend: React + React Flow + Tailwind
Backend: Node.js/Bun simple API
LLM: Claude API (or Claude Code directly)
Code Analysis: Simple file reading + LLM
Hosting: Local-first (localhost:3000)
```

### Success Criteria

1. **Demo-able in 2 minutes** - Open app, type query, see diagram
2. **Responds to 5 different query types** - Architecture, routes, models, deps, search
3. **Updates diagram on follow-up questions** - "Now highlight the auth parts"
4. **Works on a real codebase** - Test on this repo or a public repo
5. **Colin says "holy shit"** - The most important metric

---

## 6. Open Questions

### Product Questions

1. **Who is the user?**
   - Developers onboarding to new codebases?
   - Tech leads reviewing architecture?
   - Non-technical stakeholders wanting visibility?
   - All of the above with different views?

2. **What's the killer query?**
   - What question, if answered well, makes this instantly valuable?
   - Candidates: "What happens when X?", "Where does Y come from?", "How do I add Z?"

3. **How does this relate to Claude Code?**
   - Is this a standalone tool or an MCP integration?
   - Should diagrams appear in the terminal or a separate UI?

### Technical Questions

1. **Context window limits**
   - How do we handle large codebases that don't fit in context?
   - Progressive loading? Summarization? RAG?

2. **Caching strategy**
   - How much can we cache between queries?
   - When do we invalidate?

3. **Accuracy requirements**
   - How wrong can the diagram be before it's harmful?
   - Do we need AST parsing or is LLM-only okay for MVP?

4. **Latency tolerance**
   - Is 3-5 seconds acceptable for a query response?
   - Should we stream partial results?

### Strategic Questions

1. **Is this actually better than n8n?**
   - Or just different? 
   - n8n has execution built-in; this is visualization only (for now)

2. **What's the moat?**
   - Anyone can build LLM + React Flow
   - Is it the UX? The prompts? The integrations?

3. **What comes after the demo?**
   - If this works, what's the product?
   - OSS tool? SaaS? Feature of something larger?

---

## 7. Competitive Landscape

| Tool | What It Does | Gap Generative UI Fills |
|------|--------------|-------------------------|
| **Swark** | LLM → Mermaid diagrams | Not interactive, one-shot |
| **CodeSee** | Auto-generated code maps | Expensive, not NL-queryable |
| **Eraser.io** | AI diagram generation | Generic, not codebase-aware |
| **GitHub Copilot** | Code completion | No visualization |
| **n8n** | Visual workflow builder | Manual, not code-synced |
| **React Flow** | UI framework | No AI, just rendering |

**Unique Position:** First tool that makes codebase visualization *conversational*.

---

## 8. Why This Proves n8n Is Obsolete

The demo narrative:

> "In n8n, you manually drag nodes to build a workflow. 
> Let me show you something different.
>
> [Opens Generative UI]
> [Types: 'Show me what happens when a new user signs up']
> [Diagram appears showing: API → Validation → DB → Email → Analytics]
>
> Now watch this.
> [Types: 'Add rate limiting before the API handler']
> [Diagram updates with new node, code is generated]
>
> I just did in 10 seconds what takes 10 minutes in n8n.
> And my diagram is actually connected to real code."

---

## Appendix A: Research Sources

- n8n features: https://n8n.io/features/
- n8n limitations: https://www.altexsoft.com/blog/n8n-pros-and-cons/
- Swark (LLM diagrams): https://github.com/swark-io/swark
- React Flow: https://reactflow.dev/
- Mermaid: https://mermaid.js.org/
- D2: https://d2lang.com/
- MCP Protocol: https://modelcontextprotocol.io/
- Claude Code MCP: https://code.claude.com/docs/en/mcp

## Appendix B: Similar Projects to Study

1. **Swark** - VS Code extension, LLM → Mermaid, GitHub Copilot integrated
2. **CodeSee** - Commercial code visualization (RIP - shut down, but approach was good)
3. **Eraser.io** - AI architecture diagram generator
4. **Miro AI** - AI features in whiteboard tool
5. **tldraw** - Collaborative canvas (good UX reference)

---

*This PRD is a living document. Update as the project evolves.*
