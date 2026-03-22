# SKILL.md — IoT Studio Implementation Patterns

> Reference guide for Claude Code. Read this before writing any code. Contains exact patterns, snippets, and implementation details.

---

## 1. PROJECT SETUP

```bash
# Initialize
npm create vite@latest iot-studio -- --template react-ts
cd iot-studio

# Core deps
npm install @xyflow/react zustand immer @codemirror/view @codemirror/state @codemirror/lang-javascript @codemirror/autocomplete @codemirror/commands @codemirror/search @codemirror/lint recharts lucide-react idb-keyval @dagrejs/dagre clsx tailwind-merge

# Tailwind
npm install -D tailwindcss @tailwindcss/vite
```

### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { target: 'es2022' }
});
```

### index.css
```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

@theme {
  --color-bg-primary: #0C0F12;
  --color-bg-surface: #151A20;
  --color-bg-elevated: #1C2128;
  --color-bg-canvas: #0A0D10;
  --color-border: #252D38;
  --color-border-active: #3D4F65;
  --color-accent: #10B981;
  --color-accent-hover: #34D399;
  --color-accent-muted: rgba(16, 185, 129, 0.15);
  --color-text-primary: #E8ECF1;
  --color-text-secondary: #8B95A5;
  --color-text-muted: #5A6577;
  --color-error: #EF4444;
  --color-warning: #F59E0B;
  --font-ui: 'DM Sans', sans-serif;
  --font-code: 'IBM Plex Mono', monospace;
}

body {
  font-family: var(--font-ui);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  margin: 0;
  overflow: hidden;
  height: 100vh;
}
```

### cn() utility (src/utils/cn.ts)
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```

---

## 2. ZUSTAND STORE PATTERNS

### boardStore.ts
```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';

interface BoardState {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  addComponent: (type: string, position?: { x: number; y: number }) => void;
  removeComponent: (nodeId: string) => void;
  clearBoard: () => void;
  getComponentNames: () => { sensors: string[]; actuators: string[]; mcus: string[] };
}

export const useBoardStore = create<BoardState>()(
  immer((set, get) => ({
    nodes: [],
    edges: [],
    onNodesChange: (changes) => set((state) => {
      state.nodes = applyNodeChanges(changes, state.nodes) as Node[];
    }),
    onEdgesChange: (changes) => set((state) => {
      state.edges = applyEdgeChanges(changes, state.edges) as Edge[];
    }),
    onConnect: (connection) => set((state) => {
      state.edges = addEdge({ ...connection, type: 'wire' }, state.edges) as Edge[];
    }),
    addComponent: (type, position) => {
      // Generate unique ID, increment instance counter, create node
      // Position via dagre if not specified
    },
    removeComponent: (nodeId) => set((state) => {
      state.nodes = state.nodes.filter(n => n.id !== nodeId);
      state.edges = state.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    }),
    clearBoard: () => set({ nodes: [], edges: [] }),
    getComponentNames: () => {
      const nodes = get().nodes;
      return {
        sensors: nodes.filter(n => n.data.category === 'sensor').map(n => n.data.label),
        actuators: nodes.filter(n => n.data.category === 'actuator').map(n => n.data.label),
        mcus: nodes.filter(n => n.data.category === 'microcontroller').map(n => n.data.label),
      };
    },
  }))
);
```

### historyStore.ts
```typescript
import { create } from 'zustand';
import { get as idbGet, set as idbSet, del as idbDel, keys as idbKeys } from 'idb-keyval';

interface SavedProject {
  id: string;
  name: string;
  description?: string;
  savedAt: string;
  updatedAt: string;
  boardState: { nodes: any[]; edges: any[]; viewport: any };
  code: string;
}

interface HistoryState {
  projects: SavedProject[];
  isLoading: boolean;
  loadProjects: () => Promise<void>;
  saveProject: (name: string, description?: string) => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  autoSave: () => Promise<void>;
  restoreAutoSave: () => Promise<boolean>;
  exportProject: (id: string) => void;
  importProject: (file: File) => Promise<void>;
}

// Implementation uses idb-keyval with keys like "project:{uuid}" and "autosave"
```

---

## 3. REACT FLOW CUSTOM NODES

### Pattern for all node types
```typescript
import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

// CRITICAL: Always memo() custom nodes
export const SensorNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={cn(
      "bg-bg-surface border rounded-2xl p-3 min-w-[140px] transition-all",
      selected ? "border-accent shadow-lg shadow-accent/20" : "border-border",
      "backdrop-blur-sm"
    )}>
      {/* Input handles on left */}
      <Handle type="target" position={Position.Left} className="!bg-accent !w-3 !h-3" />

      {/* Content */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-2xl">{data.icon}</div>
        <div className="text-sm font-medium text-text-primary">{data.label}</div>
        <div className="text-xs text-text-secondary font-code">
          {data.liveValue !== undefined ? String(data.liveValue) : '—'}
        </div>
      </div>

      {/* Output handles on right */}
      <Handle type="source" position={Position.Right} className="!bg-accent !w-3 !h-3" />

      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); data.onDelete?.(data.nodeId); }}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-error text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
      >
        ×
      </button>
    </div>
  );
});

// ActuatorNode — same pattern but with visual feedback:
// - LED: colored circle with CSS radial-gradient glow when ON, opacity scales with PWM
// - Servo: rotated line/arm element using CSS transform: rotate({angle}deg)
// - LCD: grid of character cells rendered in monospace font
// - Buzzer: pulsing icon when active
// - Motor: spinning icon using CSS animation

// MicrocontrollerNode — larger card with board illustration, pin labels on edges
```

### Registering node types
```typescript
// In CircuitCanvas.tsx
const nodeTypes = useMemo(() => ({
  microcontroller: MicrocontrollerNode,
  sensor: SensorNode,
  actuator: ActuatorNode,
}), []);

<ReactFlow
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}
  edgeTypes={{ wire: WireEdge }}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  fitView
>
  <Controls />
  <MiniMap />
  <Background variant="dots" gap={20} size={1} color="#252D38" />
</ReactFlow>
```

---

## 4. SIMULATION ENGINE

### SimulationEngine.ts — Core Pattern
```typescript
export class SimulationEngine {
  private running = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private startTime = 0;
  private sensorSim: SensorSimulator;

  // Callbacks
  private onActuatorChange: (name: string, value: any) => void;
  private onLog: (msg: string, ts: number) => void;
  private onLogData: (key: string, val: number, ts: number) => void;
  private onError: (err: string, line?: number) => void;

  start(code: string, speed: number, components: ComponentDef[]) {
    try {
      // Extract function bodies
      const setupMatch = code.match(/function\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\n\}/);
      const loopMatch = code.match(/function\s+loop\s*\(\s*\)\s*\{([\s\S]*?)\n\}/);

      if (!setupMatch || !loopMatch) {
        this.onError('Code must contain setup() and loop() functions');
        return;
      }

      this.startTime = performance.now();
      this.sensorSim = new SensorSimulator(components);

      // Build sandbox scope
      const scope = {
        readSensor: (name: string) => this.sensorSim.read(name),
        writeActuator: (name: string, value: any) => this.onActuatorChange(name, value),
        log: (msg: any) => this.onLog(String(msg), this.elapsed()),
        logData: (key: string, val: number) => this.onLogData(key, val, this.elapsed()),
        delay: (ms: number) => { /* track accumulated delay */ },
        millis: () => this.elapsed(),
        map: (v: number, fl: number, fh: number, tl: number, th: number) =>
          ((v - fl) / (fh - fl)) * (th - tl) + tl,
        constrain: (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi),
        HIGH: 1, LOW: 0,
      };

      const scopeKeys = Object.keys(scope);
      const scopeValues = Object.values(scope);

      // Execute setup
      const setupFn = new Function(...scopeKeys, `"use strict";\n${setupMatch[1]}`);
      setupFn(...scopeValues);

      // Start loop
      const loopFn = new Function(...scopeKeys, `"use strict";\n${loopMatch[1]}`);
      this.running = true;
      this.intervalId = setInterval(() => {
        if (!this.running) return;
        try {
          this.sensorSim.tick(); // Update sensor values
          const start = performance.now();
          loopFn(...scopeValues);
          if (performance.now() - start > 100) {
            this.stop();
            this.onError('Loop execution exceeded 100ms — possible infinite loop');
          }
        } catch (e: any) {
          this.onError(e.message);
        }
      }, 1000 / speed);
    } catch (e: any) {
      this.onError(`Syntax error: ${e.message}`);
    }
  }

  stop() {
    this.running = false;
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
  }

  private elapsed() {
    return Math.floor(performance.now() - this.startTime);
  }
}
```

### SensorSimulator.ts — Value Patterns
```typescript
export class SensorSimulator {
  private values: Map<string, any> = new Map();
  private state: Map<string, any> = new Map(); // internal state for random walks

  tick() {
    for (const [name, config] of this.components) {
      switch (config.type) {
        case 'temperature':
          const curr = this.state.get(name) ?? 25;
          const next = Math.max(15, Math.min(45, curr + (Math.random() - 0.5) * 0.6));
          this.state.set(name, next);
          this.values.set(name, Math.round(next * 10) / 10);
          break;
        case 'light':
          const elapsed = performance.now() / 1000;
          const base = Math.sin(elapsed / 30 * Math.PI) * 512 + 512;
          this.values.set(name, Math.floor(Math.max(0, Math.min(1023, base + (Math.random() - 0.5) * 80))));
          break;
        case 'motion':
          const lastTrigger = this.state.get(`${name}_last`) ?? 0;
          const cooldown = this.state.get(`${name}_cd`) ?? 5000;
          if (performance.now() - lastTrigger > cooldown && Math.random() < 0.1) {
            this.values.set(name, true);
            this.state.set(`${name}_last`, performance.now());
            this.state.set(`${name}_cd`, 2000 + Math.random() * 8000);
          } else {
            this.values.set(name, false);
          }
          break;
        // ... humidity, ultrasonic, soil, pressure, gas, sound, flame, ir, color, accelerometer
      }
    }
  }

  read(name: string): any {
    return this.values.get(name);
  }

  // Called by UI when user interacts with potentiometer slider or button click
  setUserValue(name: string, value: any) {
    this.values.set(name, value);
  }
}
```

---

## 5. OPENROUTER CLIENT

### src/utils/openrouter.ts
```typescript
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export async function* streamChat(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  systemPrompt: string
): AsyncGenerator<string> {
  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://iot-studio.bilota.ai',
      'X-Title': 'IoT Studio by Bilota AI',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenRouter error: ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch { /* skip malformed chunks */ }
    }
  }
}

export async function fetchFreeModels(apiKey: string) {
  try {
    const res = await fetch(`${OPENROUTER_BASE}/models`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    const data = await res.json();
    return data.data
      ?.filter((m: any) => m.pricing?.prompt === '0' && m.pricing?.completion === '0')
      ?.map((m: any) => ({
        id: m.id,
        name: m.name,
        context: m.context_length,
        provider: m.id.split('/')[0],
      })) ?? [];
  } catch {
    return null; // Fall back to hardcoded list
  }
}
```

---

## 6. SAVE/LOAD/HISTORY PATTERN

### src/utils/storage.ts
```typescript
import { get, set, del, keys, entries } from 'idb-keyval';

const PROJECT_PREFIX = 'project:';
const AUTOSAVE_KEY = 'autosave';
const SETTINGS_KEY = 'settings';

export const storage = {
  async saveProject(project: SavedProject) {
    await set(`${PROJECT_PREFIX}${project.id}`, project);
  },

  async loadProject(id: string): Promise<SavedProject | undefined> {
    return get(`${PROJECT_PREFIX}${id}`);
  },

  async listProjects(): Promise<SavedProject[]> {
    const allKeys = await keys();
    const projectKeys = allKeys.filter(k => String(k).startsWith(PROJECT_PREFIX));
    const projects: SavedProject[] = [];
    for (const key of projectKeys) {
      const p = await get(key);
      if (p) projects.push(p as SavedProject);
    }
    return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async deleteProject(id: string) {
    await del(`${PROJECT_PREFIX}${id}`);
  },

  async autoSave(state: Omit<SavedProject, 'id' | 'name' | 'savedAt' | 'updatedAt'>) {
    await set(AUTOSAVE_KEY, { ...state, updatedAt: new Date().toISOString() });
  },

  async getAutoSave() {
    return get(AUTOSAVE_KEY);
  },

  async saveSettings(settings: any) {
    await set(SETTINGS_KEY, settings);
  },

  async getSettings() {
    return get(SETTINGS_KEY);
  },
};
```

---

## 7. COMPONENT DATA PATTERN

### src/data/components.ts
```typescript
export interface ComponentDef {
  type: string;          // e.g., 'arduino_uno', 'led_red', 'dht11'
  category: 'microcontroller' | 'sensor' | 'actuator' | 'module';
  name: string;          // Display name: "Arduino Uno"
  icon: string;          // Lucide icon name or emoji fallback
  pins: PinDef[];
  defaultValue: any;
  simulationType: string; // Maps to SensorSimulator pattern
  description: string;
}

export const COMPONENTS: ComponentDef[] = [
  // Microcontrollers
  {
    type: 'arduino_uno',
    category: 'microcontroller',
    name: 'Arduino Uno',
    icon: 'Cpu',
    pins: [
      { id: 'D0', type: 'digital', direction: 'both' },
      // ... D1-D13, A0-A5
    ],
    defaultValue: null,
    simulationType: 'none',
    description: '14 digital I/O, 6 analog inputs'
  },
  // Sensors
  {
    type: 'dht11',
    category: 'sensor',
    name: 'Temperature',
    icon: 'Thermometer',
    pins: [{ id: 'DATA', type: 'digital', direction: 'output' }],
    defaultValue: 25.0,
    simulationType: 'temperature',
    description: 'DHT11 — 15-45°C range'
  },
  // ... all other components
];
```

---

## 8. PROJECT DATA PATTERN

### src/data/projects/beginner.ts
```typescript
import type { ProjectDef } from './types';

export const beginnerProjects: ProjectDef[] = [
  {
    id: 'blink-led',
    title: 'Blink LED',
    difficulty: 1,
    category: 'Beginner',
    description: 'The classic first project — make an LED blink on and off.',
    concepts: ['Digital Output', 'setup/loop', 'delay()'],
    components: [
      { type: 'arduino_uno', position: { x: 200, y: 200 } },
      { type: 'led_red', position: { x: 500, y: 200 } },
    ],
    connections: [
      { sourceType: 'arduino_uno', sourcePin: 'D13', targetType: 'led_red', targetPin: 'ANODE' },
    ],
    code: `let ledState = 0;

function setup() {
  log("Starting Blink LED...");
}

function loop() {
  ledState = ledState === 0 ? 1 : 0;
  writeActuator("LED 1", ledState);
  log("LED is " + (ledState ? "ON" : "OFF"));
  delay(1000);
}`,
  },
  // ... projects 2-6
];
```

---

## 9. ARDUINO EXPORT PATTERN

### src/utils/arduinoExporter.ts
```typescript
export function exportToArduino(code: string, components: any[]): string {
  let arduino = `// Generated by IoT Studio by Bilota AI
// https://iot-studio.bilota.ai

`;

  // Add includes based on components
  if (components.some(c => c.type === 'dht11')) arduino += '#include <DHT.h>\n';
  if (components.some(c => c.type.includes('servo'))) arduino += '#include <Servo.h>\n';
  if (components.some(c => c.type.includes('lcd'))) arduino += '#include <LiquidCrystal.h>\n';

  arduino += '\n';

  // Transform code
  let transformed = code;

  // Replace API calls with Arduino equivalents
  transformed = transformed.replace(/readSensor\("([^"]+)"\)/g, 'analogRead(A0) /* $1 */');
  transformed = transformed.replace(/writeActuator\("([^"]+)",\s*(.*?)\)/g, 'digitalWrite(13, $2) /* $1 */');
  transformed = transformed.replace(/log\((.*?)\)/g, 'Serial.println($1)');
  transformed = transformed.replace(/logData\([^)]+\)/g, '/* logData - no equivalent */');

  // Wrap in Arduino structure
  const setupMatch = transformed.match(/function\s+setup\s*\(\)\s*\{([\s\S]*?)\n\}/);
  const loopMatch = transformed.match(/function\s+loop\s*\(\)\s*\{([\s\S]*?)\n\}/);

  // Extract variable declarations (above setup)
  const varSection = transformed.split('function setup')[0].trim();

  arduino += varSection.replace(/let |const /g, 'int ') + '\n\n';
  arduino += 'void setup() {\n  Serial.begin(9600);\n';
  arduino += (setupMatch?.[1] || '') + '\n}\n\n';
  arduino += 'void loop() {\n';
  arduino += (loopMatch?.[1] || '') + '\n}\n';

  return arduino;
}
```

---

## 10. MODEL SELECTOR PATTERN

### src/data/models.ts
```typescript
export interface ModelDef {
  id: string;
  name: string;
  provider: string;
  context: number;
  category: 'code' | 'reasoning' | 'general' | 'lightweight' | 'auto';
  isDefault?: boolean;
}

export const FREE_MODELS: ModelDef[] = [
  // Code
  { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder 480B', provider: 'Qwen', context: 262000, category: 'code' },
  { id: 'openai/gpt-oss-120b:free', name: 'GPT-OSS 120B', provider: 'OpenAI', context: 131000, category: 'code' },

  // Reasoning
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron 3 Super', provider: 'NVIDIA', context: 262000, category: 'reasoning' },
  { id: 'arcee-ai/trinity-large-preview:free', name: 'Trinity Large', provider: 'Arcee', context: 131000, category: 'reasoning' },

  // General
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', provider: 'Meta', context: 66000, category: 'general', isDefault: true },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3.1', provider: 'Mistral', context: 128000, category: 'general' },
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B', provider: 'Google', context: 131000, category: 'general' },
  { id: 'minimax/minimax-m2.5:free', name: 'MiniMax M2.5', provider: 'MiniMax', context: 197000, category: 'general' },
  { id: 'z-ai/glm-4.5-air:free', name: 'GLM 4.5 Air', provider: 'Z.ai', context: 131000, category: 'general' },

  // Lightweight
  { id: 'qwen/qwen3-4b:free', name: 'Qwen3 4B', provider: 'Qwen', context: 41000, category: 'lightweight' },
  { id: 'google/gemma-3-4b-it:free', name: 'Gemma 3 4B', provider: 'Google', context: 33000, category: 'lightweight' },
  { id: 'nvidia/nemotron-nano-9b-v2:free', name: 'Nemotron Nano 9B', provider: 'NVIDIA', context: 128000, category: 'lightweight' },
  { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B', provider: 'Meta', context: 131000, category: 'lightweight' },

  // Auto
  { id: 'openrouter/free', name: 'Auto (Let OpenRouter Pick)', provider: 'OpenRouter', context: 200000, category: 'auto' },
];

export const MODEL_CATEGORIES = [
  { key: 'code', label: '🧑‍💻 Best for Code' },
  { key: 'reasoning', label: '🧠 Best for Reasoning' },
  { key: 'general', label: '⚡ General Purpose' },
  { key: 'lightweight', label: '🪶 Lightweight / Fast' },
  { key: 'auto', label: '🔀 Auto' },
] as const;

export const DEFAULT_MODEL = FREE_MODELS.find(m => m.isDefault)!.id;
```

### ModelSelector.tsx
```typescript
// Grouped dropdown using <select> with <optgroup> or custom dropdown
// Shows: model name + provider badge + context length
// Selected model stored in aiStore + localStorage
// On change: update aiStore.selectedModel, persist to localStorage
```

---

## 11. PREBUILT PROJECT CODE EXAMPLES

Every project MUST have complete, runnable code. Here are the patterns for key projects:

### Project 7: Smart Night Light (★★☆)
```javascript
function setup() {
  log("Smart Night Light active");
}

function loop() {
  let light = readSensor("Light 1");
  let brightness = map(light, 0, 1023, 255, 0);
  brightness = constrain(brightness, 0, 255);
  writeActuator("LED 1", brightness);
  log("Light: " + light + " → LED: " + brightness);
  logData("light", light);
  logData("brightness", brightness);
}
```

### Project 15: Weather Station (★★★)
```javascript
function setup() {
  log("Weather Station initializing...");
  writeActuator("LCD 1", "Weather Station");
}

function loop() {
  let temp = readSensor("Temperature 1");
  let hum = readSensor("Humidity 1");
  let pressure = readSensor("Pressure 1");
  let light = readSensor("Light 1");

  let line1 = "T:" + temp.toFixed(1) + "C H:" + hum.toFixed(0) + "%";
  let line2 = "P:" + pressure.toFixed(0) + "hPa L:" + light;
  writeActuator("LCD 1", line1 + "\n" + line2);

  logData("temperature", temp);
  logData("humidity", hum);
  logData("pressure", pressure);
  logData("light", light);

  log(line1 + " | " + line2);
}
```

### Project 21: PID Temperature Controller (★★★★)
```javascript
let targetTemp = 28;
let integral = 0;
let lastError = 0;
let kp = 2.0;
let ki = 0.5;
let kd = 1.0;

function setup() {
  log("PID Controller - Target: " + targetTemp + "°C");
  writeActuator("LCD 1", "PID Target:" + targetTemp);
}

function loop() {
  let temp = readSensor("Temperature 1");
  let error = targetTemp - temp;

  integral = constrain(integral + error, -50, 50);
  let derivative = error - lastError;
  lastError = error;

  let output = kp * error + ki * integral + kd * derivative;
  output = constrain(output, 0, 255);

  writeActuator("DC Motor 1", Math.floor(output));
  writeActuator("LCD 1", "T:" + temp.toFixed(1) + " Out:" + Math.floor(output));

  logData("temperature", temp);
  logData("target", targetTemp);
  logData("output", output);

  log("Temp:" + temp.toFixed(1) + " Err:" + error.toFixed(1) + " Out:" + Math.floor(output));
}
```

---

## 12. DEPLOYMENT

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### .gitignore
```
node_modules/
dist/
.env
.env.local
.vercel
*.log
```

### Final commands
```bash
npm run build
git init
git add .
git commit -m "feat: IoT Studio v1.0 by Bilota AI"
gh repo create bilota-ai/iot-studio --public --description "AI-native IoT simulator with free LLMs via OpenRouter | Bilota AI" --source=. --push
npx vercel --prod
```
