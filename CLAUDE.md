# CLAUDE.md — IoT Studio by Bilota AI

> This file tells Claude Code how to work on this project. Claude Code reads this automatically.

## Project Overview
IoT Studio is a browser-based virtual IoT circuit simulator by Bilota AI. Users drag components (sensors, actuators, microcontrollers) onto a React Flow canvas, wire them, write simulation code in CodeMirror 6, and run simulations. AI features powered by OpenRouter free LLMs (client-side, no backend).

## Tech Stack
- **Framework**: React 18 + TypeScript + Vite 6
- **Styling**: Tailwind CSS 4 with CSS variables (dark theme, emerald accent #10B981)
- **State**: Zustand + Immer
- **Canvas**: React Flow (@xyflow/react) — custom nodes and edges
- **Editor**: CodeMirror 6 (@codemirror/*)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Storage**: idb-keyval (IndexedDB)
- **Layout**: dagre (auto-layout algorithm)
- **AI**: OpenRouter API (OpenAI-compatible, client-side calls, no backend)
- **Deploy**: Vercel (static SPA, no serverless functions)

## Commands
```bash
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check (tsc --noEmit)
```

## Architecture Rules

### NO Backend
This is a fully static SPA. No Express, no serverless functions, no API proxy. The OpenRouter API key is stored in the user's localStorage and calls are made directly from the browser.

### State Management Pattern
All state lives in Zustand stores in `src/store/`. Components never hold complex state locally. Stores use Immer for immutable updates.

Key stores:
- `boardStore` — components on canvas, connections, positions (React Flow nodes/edges)
- `codeStore` — editor content, simulation running state, speed, serial logs
- `aiStore` — chat history, selected model, loading state, API key
- `historyStore` — saved projects list, auto-save state
- `chartStore` — real-time data series from logData()
- `projectStore` — current project metadata, example project loader
- `uiStore` — panel visibility, active tab (mobile), settings

### Component Organization
```
src/components/
  layout/     → AppShell, CommandBar, BottomTabBar, ResizablePanel
  palette/    → ComponentPalette, ComponentCard
  canvas/     → CircuitCanvas, nodes/ (3 node types), edges/ (WireEdge), CanvasControls
  editor/     → CodeEditor, EditorToolbar, SerialMonitor, ApiReference
  ai/         → AIDock, ChatMessage, ModelSelector, SuggestionChips, ApiKeySetup
  charts/     → DataCharts
  history/    → HistoryPanel, SaveModal, ProjectCard
  settings/   → SettingsModal
```

### Simulation Engine
Lives in `src/engine/`. The SimulationEngine:
1. Parses user code to extract `setup()` and `loop()` function bodies
2. Creates sandboxed execution via `new Function()` — ONLY expose: readSensor, writeActuator, log, logData, delay, millis, map, constrain, HIGH, LOW
3. Runs setup() once, then loop() on interval (1000/speed ms)
4. Broadcasts state changes to Zustand stores → UI updates reactively

**NEVER use eval(). NEVER expose window, document, fetch, or any DOM API to user code.**

### OpenRouter Integration
- Client file: `src/utils/openrouter.ts`
- All calls go to `https://openrouter.ai/api/v1/chat/completions`
- Must include headers: `HTTP-Referer`, `X-Title`
- Stream responses using SSE (data: {json}\n\n format, OpenAI-compatible)
- Free models end with `:free` suffix
- Model list in `src/data/models.ts` with hardcoded fallback + dynamic fetch from `/api/v1/models`

### Data Files
- `src/data/components.ts` — full component catalog (microcontrollers, sensors, actuators, modules) with pin definitions, simulation configs
- `src/data/models.ts` — OpenRouter free model definitions grouped by category
- `src/data/projects/` — 25 prebuilt projects split across 4 files (beginner, intermediate, advanced, expert)
- `src/data/starterProject.ts` — default Blink LED project loaded on first visit

### Persistence (IndexedDB via idb-keyval)
- `src/utils/storage.ts` wraps idb-keyval
- Keys: `projects:{uuid}` for saved projects, `autosave` for auto-save, `settings` for user prefs
- Auto-save every 60 seconds (silent, no UI)
- Manual save via Save modal (user names the project)

## Code Style
- TypeScript strict mode
- Functional components only (no class components)
- Named exports (not default) for all components except page-level
- Tailwind utility classes inline — no separate CSS files except index.css for variables
- Use `cn()` helper (clsx + tailwind-merge) for conditional classes
- Prefer `const` over `let`
- Error boundaries around: SimulationEngine execution, AI API calls, file import parsing

## Common Gotchas
1. **React Flow nodes must be memoized** — wrap custom nodes in `memo()` or performance tanks
2. **CodeMirror 6 is imperative** — use `useRef` + `useEffect` for state sync, don't try to make it fully controlled
3. **Web Audio API requires user gesture** — buzzer audio only works after first user click (add a silent audio context init on first interaction)
4. **idb-keyval is async** — all storage operations return Promises, handle loading states
5. **OpenRouter SSE stream** — parse `data: [DONE]` as end signal, handle `data: {"error": ...}` inline
6. **Vite env vars** — only `VITE_` prefixed vars are exposed to client. The optional demo key uses `VITE_DEFAULT_OPENROUTER_KEY`
7. **dagre layout** — import as `import dagre from '@dagrejs/dagre'` (the npm package name is @dagrejs/dagre)

## Testing Checklist (before committing)
- [ ] App loads with Blink LED project (not empty canvas)
- [ ] Can add components from palette to canvas
- [ ] Can wire components (drag Handle to Handle)
- [ ] Can write code and hit Run → simulation executes
- [ ] LED node glows when writeActuator sets it HIGH
- [ ] Serial Monitor shows log() output
- [ ] Save → History → Load round-trips correctly
- [ ] Export .iotstudio → Import .iotstudio → same state
- [ ] Model selector dropdown shows grouped models
- [ ] AI chat sends request to OpenRouter and streams response
- [ ] App works without API key (AI features show "Set up AI" prompt)
- [ ] Mobile layout: bottom tabs, palette sheet, touch-friendly
- [ ] All 25 example projects load and run without errors

## Deployment
```bash
# Build and deploy to Vercel
npm run build
npx vercel --prod
```
No environment variables required (API key is user-provided). Optional: `VITE_DEFAULT_OPENROUTER_KEY` for demo deployment.
