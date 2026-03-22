# IoT Studio by Bilota AI — Claude Code Build Prompt

> Paste this entire file into Claude Code.

Build "IoT Studio by Bilota AI" — a browser-based IoT circuit simulator. Users drag components onto a canvas, wire them, write or AI-generate code, and run simulations. AI powered by OpenRouter with a dropdown to select from free LLMs.

---

## TECH STACK (strict)
- React 18 + TypeScript + Vite 6
- Tailwind CSS 4
- Zustand + Immer (state)
- React Flow @xyflow/react (circuit canvas)
- CodeMirror 6 (code editor)
- Recharts (charts)
- Lucide React (icons)
- idb-keyval (IndexedDB persistence for saves + history)
- dagre (auto-layout)
- OpenRouter API (OpenAI-compatible, base URL: https://openrouter.ai/api/v1)
- Fonts: DM Sans (UI), IBM Plex Mono (code) via Google Fonts

NO backend. NO serverless functions. API key stored client-side in localStorage (user provides their own OpenRouter key). This is a fully static SPA deployed to Vercel.

---

## LAYOUT

### Desktop (≥1024px)
```
┌──────────────────────────────────────────────────────────────────┐
│ ⚡IoT Studio  [New▾] [Save] [History] [Import] [Export]  [▶Run] │
├────────┬─────────────────────────────┬───────────────────────────┤
│        │                             │                           │
│ Compo- │    Circuit Canvas           │  Code Editor              │
│ nent   │    (React Flow)             │  (CodeMirror 6)           │
│ Panel  │                             │                           │
│ 240px  │                             ├───────────────────────────┤
│        │                             │  Serial Monitor           │
├────────┴─────────────────────────────┴───────────────────────────┤
│ 🤖 [Model: ▾ Llama 3.3 70B] Ask AI... [Suggest✨]    [⚙ Key]   │
└──────────────────────────────────────────────────────────────────┘
```

### Mobile (<1024px)
- Bottom tabs: Canvas | Code | AI | History
- FAB (+) for component palette sheet
- Swipe between views

---

## DESIGN TOKENS

```css
:root {
  --bg-primary: #0C0F12;
  --bg-surface: #151A20;
  --bg-elevated: #1C2128;
  --bg-canvas: #0A0D10;
  --border: #252D38;
  --border-active: #3D4F65;
  --accent: #10B981;
  --accent-hover: #34D399;
  --accent-muted: rgba(16, 185, 129, 0.15);
  --text-primary: #E8ECF1;
  --text-secondary: #8B95A5;
  --text-muted: #5A6577;
  --error: #EF4444;
  --warning: #F59E0B;
}
```

Dark warm theme. Glass-morphism nodes on canvas. Emerald accent. Rounded-2xl cards. DM Sans for UI, IBM Plex Mono for code. Animations: drop=scale bounce, wire=draw, LED=glow pulse, run=green ripple.

---

## OPENROUTER AI INTEGRATION (CRITICAL)

### API Configuration
- Base URL: `https://openrouter.ai/api/v1/chat/completions`
- Auth: `Authorization: Bearer {user's OpenRouter key}`
- Headers: `HTTP-Referer: https://iot-studio.bilota.ai`, `X-Title: IoT Studio by Bilota AI`
- API is OpenAI-compatible (same request/response format as OpenAI Chat Completions)

### API Key Setup
- On first launch, if no key in localStorage, show a setup modal:
  - Title: "Connect to AI"
  - Description: "IoT Studio uses OpenRouter for AI features. Get a free API key at openrouter.ai — no credit card needed."
  - Link: "Get free key →" opens https://openrouter.ai/keys in new tab
  - Input: paste API key
  - "Save & Continue" button → stores in localStorage as `iotstudio_openrouter_key`
  - "Skip" button → app works fully without AI (manual mode only)
- Key can be changed anytime in Settings (⚙ gear icon in Command Bar)
- Key is NEVER sent to any server other than openrouter.ai

### Model Selector Dropdown (in AI Dock bar)
Dropdown showing free models grouped by capability. User can switch models anytime mid-conversation.

**Default model: `meta-llama/llama-3.3-70b-instruct:free`** (best general-purpose free model)

**Grouped dropdown:**

```
── Best for Code ──
  Qwen3 Coder 480B        qwen/qwen3-coder:free              262K ctx
  OpenAI GPT-OSS 120B     openai/gpt-oss-120b:free           131K ctx

── Best for Reasoning ──
  NVIDIA Nemotron 3 Super  nvidia/nemotron-3-super-120b-a12b:free  262K ctx
  Arcee Trinity Large      arcee-ai/trinity-large-preview:free     131K ctx

── General Purpose ──
  Llama 3.3 70B ⭐ DEFAULT  meta-llama/llama-3.3-70b-instruct:free  66K ctx
  Mistral Small 3.1        mistralai/mistral-small-3.1-24b-instruct:free  128K ctx
  Gemma 3 27B              google/gemma-3-27b-it:free              131K ctx
  MiniMax M2.5             minimax/minimax-m2.5:free               197K ctx
  GLM 4.5 Air              z-ai/glm-4.5-air:free                  131K ctx

── Lightweight / Fast ──
  Qwen3 4B                 qwen/qwen3-4b:free                     41K ctx
  Gemma 3 4B               google/gemma-3-4b-it:free              33K ctx
  NVIDIA Nemotron Nano 9B  nvidia/nemotron-nano-9b-v2:free        128K ctx
  Llama 3.2 3B             meta-llama/llama-3.2-3b-instruct:free  131K ctx

── Auto (Let OpenRouter Pick) ──
  Free Router              openrouter/free                         200K ctx
```

Each dropdown item shows: model name, provider badge, context length. Selected model is remembered in localStorage.

### Dynamic Model List (Bonus)
On app load (if key exists), fetch `https://openrouter.ai/api/v1/models` and filter where `pricing.prompt === "0"` to get live free model list. Fall back to the hardcoded list above if fetch fails. Cache for 24 hours in localStorage.

### AI Request Format
```typescript
const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "https://iot-studio.bilota.ai",
    "X-Title": "IoT Studio by Bilota AI"
  },
  body: JSON.stringify({
    model: selectedModel, // e.g., "meta-llama/llama-3.3-70b-instruct:free"
    messages: [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: userMessage }
    ],
    stream: true
  })
});
// Parse SSE stream (OpenAI-compatible format: data: {"choices":[{"delta":{"content":"..."}}]})
```

### System Prompt (injected dynamically)
```
You are the IoT Studio AI assistant by Bilota AI. You help users build IoT circuits and write simulation code.

CURRENT BOARD STATE:
Components: {list of components with names and types}
Connections: {list of wire connections}
Current Code: {code from editor}

SIMULATION API (this is the ONLY API available to the user):
- readSensor(name) → number | boolean
- writeActuator(name, value) → void
- log(message) → void (prints to Serial Monitor)
- logData(key, value) → void (sends to chart)
- delay(ms) → void
- millis() → number
- map(value, fromLow, fromHigh, toLow, toHigh) → number
- constrain(value, low, high) → number
- Constants: HIGH=1, LOW=0

Code pattern:
function setup() { /* runs once */ }
function loop() { /* runs repeatedly */ }

RULES:
- Use EXACT component names from the board state
- Write ONLY valid JavaScript using the API above
- Keep explanations concise
- When asked to generate code, output a code block with the complete setup() + loop()
```

### AI Capabilities
1. **"Generate Code"** — user types request or clicks Suggest✨ chips. AI sees board state, returns code. "Apply to Editor" button on code blocks.
2. **"Explain Code"** — button in editor toolbar. Sends current code. AI explains line-by-line.
3. **"Fix Error"** — on simulation error, "Ask AI to fix" button sends error + code + board state.
4. **Smart Suggestions** — SuggestionChips reads boardStore. Examples:
   - Board has Arduino + LED, no code → "Blink the LED", "Fade LED with PWM"
   - Board has DHT11 + LCD → "Show temperature on LCD"
   - Simulation error → "Fix: {error message}"
   - Empty board → "Build a traffic light", "Build a weather station"

---

## SAVE / LOAD / HISTORY SYSTEM

### Save (💾 button in Command Bar)
- Opens "Save Project" modal
- Input: Project name (auto-populated with current project name or "Untitled Project")
- Optional: Description text area (1-2 lines)
- "Save" button → stores to IndexedDB via idb-keyval
- Save format:
```typescript
interface SavedProject {
  id: string;            // crypto.randomUUID()
  name: string;
  description?: string;
  savedAt: string;       // ISO timestamp
  updatedAt: string;     // ISO timestamp
  boardState: {
    components: ComponentNode[];
    connections: Edge[];
    viewport: { x: number; y: number; zoom: number };
  };
  code: string;
  chartData?: any[];
}
```
- If saving over an existing project (same name), ask "Overwrite?" confirmation
- Toast notification: "Project saved ✓"
- Auto-save: every 60 seconds to a special `__autosave` key in IndexedDB (silent, no toast)

### Load
- Accessed from History tab/panel (see below)
- Click a saved project → loads board state, code, chart data
- Confirmation if current work is unsaved: "You have unsaved changes. Load anyway?"

### History Tab
- **Desktop**: Accessible via "History" button in Command Bar → opens a slide-over panel (right side, 360px) overlaying the code editor
- **Mobile**: Dedicated bottom tab (4th tab: Canvas | Code | AI | History)
- Shows a vertical timeline of saved projects, most recent first:
```
┌─────────────────────────────┐
│ 📁 SAVED PROJECTS           │
│                             │
│ ┌─────────────────────────┐ │
│ │ Weather Station v2      │ │
│ │ 2 hours ago · 5 comps   │ │
│ │ [Load] [Export] [Delete] │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ Traffic Light            │ │
│ │ Yesterday · 4 comps     │ │
│ │ [Load] [Export] [Delete] │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 💾 Auto-save             │ │
│ │ 5 min ago · 3 comps     │ │
│ │ [Restore]               │ │
│ └─────────────────────────┘ │
│                             │
│ [Import .iotstudio file]   │
└─────────────────────────────┘
```
- Each card shows: name, relative time ("2 hours ago"), component count, description preview
- Actions per card: Load, Export (.iotstudio), Delete (with confirmation)
- Auto-save entry always at bottom with "Restore" button
- "Import .iotstudio file" button at bottom → file picker
- Search/filter bar at top of history panel
- Sort: Recent first (default), Name A-Z

### Export
- **Export Project (.iotstudio)**: JSON file download. Contains full SavedProject object. Named `{project-name}.iotstudio`
- **Export Code (.ino)**: Arduino sketch download. Basic translation:
  - readSensor("Temperature 1") → analogRead(A0) with pin mapping comment
  - writeActuator("LED 1", HIGH) → digitalWrite(13, HIGH)
  - log() → Serial.println()
  - delay() → delay()
  - Wraps in `void setup()` / `void loop()` with `#include` headers
  - Comment header: `// Generated by IoT Studio by Bilota AI`
- Both Export buttons available in Command Bar AND in History panel per-project

### Import
- **Import .iotstudio**: File picker accepts .iotstudio files → parses JSON → loads board state + code
- Available in Command Bar AND History panel
- Validates file structure before loading — shows error if invalid format

### On First Load Behavior
1. Check IndexedDB for auto-save → if exists, restore it silently
2. If no auto-save, load the default "Blink LED" starter project
3. NEVER show an empty canvas

---

## COMMAND BAR

```
⚡ IoT Studio  [New ▾] [💾 Save] [📁 History] [↑ Import] [↓ Export ▾] [▶ Run] [⚙]
```

- **New ▾** dropdown: "Blank Canvas" + all 25 prebuilt projects grouped by difficulty
- **💾 Save**: opens save modal
- **📁 History**: toggles history slide-over panel
- **↑ Import**: file picker for .iotstudio
- **↓ Export ▾** dropdown: "Export Project (.iotstudio)" / "Export Arduino (.ino)"
- **▶ Run / ■ Stop**: green play button, turns red stop when running. Speed selector (0.5x, 1x, 2x, 5x) as sub-dropdown
- **⚙ Settings**: modal with: OpenRouter API key input, default model selection, simulation speed, clear all saved data

---

## COMPONENT PALETTE (Left Panel)

Search bar at top. Click = add to canvas. Drag = place at position.

### Microcontrollers
Arduino Uno (14 digital, 6 analog), ESP32 (30 GPIO), Raspberry Pi Pico (26 GPIO)

### Sensors
Temperature/DHT11 (float 15-45°C), Light/LDR (int 0-1023), Humidity (float 30-90%), Motion/PIR (boolean), Ultrasonic/HC-SR04 (float 2-400cm), Soil Moisture (int 0-1023), Sound/Mic (int 0-1023), Gas/MQ-2 (int 0-1023), Potentiometer (int 0-1023, slider on node), Button (boolean, click on node), IR Sensor (boolean), Flame Sensor (int 0-1023), Pressure/BMP180 (float 300-1100 hPa), Color Sensor/TCS3200 ({r,g,b} 0-255), Accelerometer/MPU6050 ({x,y,z} float)

### Actuators
LED (5 colors, PWM 0-255 with glow), RGB LED (3x PWM color mix), Servo (0-180° animated arm), DC Motor (PWM spin animation), Buzzer (Hz via Web Audio), Relay (boolean click), LCD 16x2 (string char grid), 7-Segment (int 0-9), OLED 128x64 (pixel buffer), Stepper Motor (step animation), LED Strip/NeoPixel (RGB array), Solenoid Valve (boolean)

### Modules
WiFi/ESP (simulated connect), Bluetooth/HC-05 (simulated pair), SD Card (simulated r/w), RTC/DS3231 (real clock), Relay Module 4ch (4x boolean)

---

## CIRCUIT CANVAS (React Flow)

- Custom nodes per type: MicrocontrollerNode, SensorNode, ActuatorNode
- Each node: SVG icon + name + instance # + live state + pin Handles
- Drag Handle→Handle to wire. Colored edges. Validation rules.
- Auto-suggest ghost wires when sensor dropped near MCU
- Auto-layout button (dagre left→right)
- Zoom, pan, fit-to-view, minimap toggle
- Smart suggestion chips float above AI dock when board has components but no code

---

## CODE EDITOR (CodeMirror 6)

Simulation API: readSensor, writeActuator, log, logData, delay, millis, map, constrain, HIGH, LOW.

Pattern: `function setup() {} function loop() {}`

Features: syntax highlight, line numbers, bracket match, autocomplete for API, error gutter, collapsible API reference panel.

Toolbar: [▶ Run/■ Stop] [Speed ▾] [Explain Code] [Export .ino] [API Ref]

---

## SIMULATION ENGINE (src/engine/SimulationEngine.ts)

1. Parse code → extract setup() and loop()
2. Sandbox via `new Function()` with controlled scope (ONLY API functions)
3. Execute setup() once
4. Interval: loop() every (1000/speed) ms
5. Each tick: sensor values update → loop() runs → actuator changes broadcast to canvas → logs to Serial Monitor → data to charts

Sensor patterns: Temperature=random walk bounded 15-45°C. Light=sine wave 60s period. Motion=10% chance/tick with cooldown. Potentiometer/Button=user-controlled on node.

Error handling: syntax errors before run, runtime errors per loop(), 100ms timeout for infinite loops.

Serial Monitor: below editor, timestamped, auto-scroll, clear, max 500 lines.

---

## 25 PREBUILT PROJECTS

All must have COMPLETE working code. Define in src/data/projects/ split by difficulty file.

### ★☆☆ Beginner
1. Blink LED — Arduino + LED, toggle every 1s
2. Button Toggle LED — Arduino + Button + LED, press to toggle
3. Potentiometer Dimmer — Arduino + Pot + LED, pot controls brightness via map()
4. Traffic Light — Arduino + 3 LEDs (R/Y/G), sequential cycle
5. Buzzer Melody — Arduino + Buzzer, simple tune via frequency array
6. SOS Morse Code — Arduino + LED + Buzzer, blink/beep SOS pattern

### ★★☆ Intermediate
7. Smart Night Light — Arduino + LDR + LED, brightness inversely proportional to light
8. Temperature Alarm — Arduino + DHT11 + Buzzer + LED, alarm when >30°C
9. Smart Fan — Arduino + DHT11 + DC Motor, fan speed proportional to temp
10. Distance Warning — Arduino + Ultrasonic + Buzzer + LED, buzzer frequency maps to distance
11. Light Level Logger — Arduino + LDR + LCD, shows level on LCD + logData chart
12. Motion Detector Alarm — Arduino + PIR + Buzzer + Relay, motion triggers 5s alarm
13. Servo Sweep Controller — Arduino + Pot + Servo, pot controls angle
14. Digital Thermometer — Arduino + DHT11 + 7-Segment, shows temp digit

### ★★★ Advanced
15. Weather Station — ESP32 + DHT11 + Pressure + LDR + LCD + OLED, full dashboard + charts
16. Intruder Detection — Arduino + PIR + Ultrasonic + Buzzer + Relay + LED, dual-sensor verification
17. Smart Greenhouse — ESP32 + DHT11 + Soil Moisture + LDR + Relay + DC Motor, auto control
18. Home Security Dashboard — ESP32 + PIR + Ultrasonic + Flame + Gas + Buzzer + Relay + LCD
19. Line Following Robot Sim — Arduino + 2x IR + 2x DC Motor, differential drive
20. Color Sorting System — Arduino + Color Sensor + Servo + LCD, detect + sort

### ★★★★ Expert
21. PID Temperature Controller — ESP32 + DHT11 + DC Motor + LCD + OLED, PID algorithm
22. Earthquake Detector — Arduino + Accelerometer + Buzzer + LED Strip + LCD, vibration detection
23. Smart Parking System — ESP32 + 4x Ultrasonic + LED Strip + LCD + Servo gate, 4 slots
24. Industrial Tank Monitor — ESP32 + Ultrasonic + Pressure + Temp + Solenoid + Relay + LCD + OLED
25. Wireless Sensor Network — 2x ESP32 + DHT11 + LDR + LCD, simulated wireless data exchange

---

## FILE STRUCTURE

```
iot-studio/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
├── .env.example                    # VITE_DEFAULT_OPENROUTER_KEY= (optional, for demo deployment)
├── .gitignore
├── LICENSE                         # MIT
├── README.md
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── components/
    │   ├── layout/
    │   │   ├── AppShell.tsx
    │   │   ├── CommandBar.tsx
    │   │   ├── BottomTabBar.tsx
    │   │   └── ResizablePanel.tsx
    │   ├── palette/
    │   │   ├── ComponentPalette.tsx
    │   │   └── ComponentCard.tsx
    │   ├── canvas/
    │   │   ├── CircuitCanvas.tsx
    │   │   ├── nodes/
    │   │   │   ├── MicrocontrollerNode.tsx
    │   │   │   ├── SensorNode.tsx
    │   │   │   └── ActuatorNode.tsx
    │   │   ├── edges/
    │   │   │   └── WireEdge.tsx
    │   │   └── CanvasControls.tsx
    │   ├── editor/
    │   │   ├── CodeEditor.tsx
    │   │   ├── EditorToolbar.tsx
    │   │   ├── SerialMonitor.tsx
    │   │   └── ApiReference.tsx
    │   ├── ai/
    │   │   ├── AIDock.tsx
    │   │   ├── ChatMessage.tsx
    │   │   ├── ModelSelector.tsx
    │   │   ├── SuggestionChips.tsx
    │   │   └── ApiKeySetup.tsx
    │   ├── charts/
    │   │   └── DataCharts.tsx
    │   ├── history/
    │   │   ├── HistoryPanel.tsx
    │   │   ├── SaveModal.tsx
    │   │   └── ProjectCard.tsx
    │   └── settings/
    │       └── SettingsModal.tsx
    ├── engine/
    │   ├── SimulationEngine.ts
    │   ├── SensorSimulator.ts
    │   ├── AudioEngine.ts
    │   └── types.ts
    ├── store/
    │   ├── boardStore.ts
    │   ├── codeStore.ts
    │   ├── aiStore.ts
    │   ├── chartStore.ts
    │   ├── projectStore.ts
    │   ├── historyStore.ts
    │   └── uiStore.ts
    ├── data/
    │   ├── components.ts
    │   ├── models.ts               # OpenRouter free model definitions
    │   ├── projects/
    │   │   ├── index.ts
    │   │   ├── beginner.ts
    │   │   ├── intermediate.ts
    │   │   ├── advanced.ts
    │   │   └── expert.ts
    │   └── starterProject.ts
    └── utils/
        ├── openrouter.ts           # API client: sendMessage, fetchModels, stream parser
        ├── projectSerializer.ts
        ├── arduinoExporter.ts
        ├── storage.ts              # IndexedDB wrapper: save, load, listAll, delete, autoSave
        └── layout.ts
```

---

## GIT & DEPLOY

```bash
git init && git add . && git commit -m "feat: IoT Studio v1.0 by Bilota AI"
gh repo create bilota-ai/iot-studio --public --description "AI-native IoT simulator with free LLMs via OpenRouter | Bilota AI" --source=. --push
npx vercel --prod
```

README.md: Title, tagline, feature list (8 bullets with emojis), tech stack badges, getting started (clone, install, dev), 25 projects listed, "Built with Claude Code", MIT License.

---

## CRITICAL RULES

1. **NO backend.** Fully static SPA. OpenRouter called directly from client. API key in localStorage only.
2. **Model selector must work.** Dropdown in AI dock shows grouped free models. User can switch mid-conversation. Selected model persisted in localStorage.
3. **Save/Load/History must work end-to-end.** Save → appears in History → Load → exact same state. Auto-save every 60s. Import/Export round-trips perfectly.
4. **No empty canvas ever.** First load → restore auto-save OR load Blink LED starter.
5. **All 25 projects have COMPLETE working code.** Not stubs. Every project runs in the simulation engine.
6. **Simulation visually works.** Run → LED glows, servo moves, LCD shows text, buzzer plays, charts update.
7. **AI is optional.** App works fully without API key. AI features gracefully disabled with "Set up AI" prompts.
8. **Mobile works.** Bottom tabs, touch-friendly (44px min), slide-up sheets, responsive.
9. **Stream AI responses.** Parse OpenRouter SSE stream for typing effect. Show model name badge on each AI message.
