# IoT Studio by Bilota AI

A browser-based IoT circuit simulator with AI-powered code generation. Drag components onto a canvas, wire them up, write simulation code, and run — all in your browser.

## Features

- **Visual Circuit Builder** — Drag & drop sensors, actuators, and microcontrollers onto a React Flow canvas
- **Code Editor** — Write simulation code with CodeMirror 6, autocomplete, and syntax highlighting
- **Simulation Engine** — Run setup/loop patterns with sandboxed execution and live sensor data
- **AI Assistant** — Generate and explain code using free OpenRouter LLMs (no API cost)
- **25 Example Projects** — From Blink LED to PID controllers, all with complete working code
- **Real-time Charts** — Visualize sensor data with Recharts
- **Save & History** — Save projects to IndexedDB, auto-save every 60s, import/export .iotstudio files
- **Arduino Export** — Export your simulation code as an Arduino .ino sketch
- **Mobile Friendly** — Responsive layout with bottom tabs for touch devices

## Tech Stack

React 18 · TypeScript · Vite 6 · Tailwind CSS 4 · Zustand · React Flow · CodeMirror 6 · Recharts · Lucide React · idb-keyval · dagre · OpenRouter API

## Getting Started

```bash
git clone <your-repo-url>
cd iot-studio
npm install
npm run dev
```

Open http://localhost:5173 — the app loads with a Blink LED starter project.

## AI Setup (Optional)

1. Get a free API key at [openrouter.ai/keys](https://openrouter.ai/keys)
2. Click the "Set up AI" button in the app
3. Paste your key — it's stored locally and never sent anywhere except OpenRouter

The app works fully without AI. Manual coding is always available.

## Example Projects

### Beginner
Blink LED · Button Toggle · Potentiometer Dimmer · Traffic Light · Buzzer Melody · SOS Morse Code

### Intermediate
Smart Night Light · Temperature Alarm · Smart Fan · Distance Warning · Light Logger · Motion Alarm · Servo Controller · Digital Thermometer

### Advanced
Weather Station · Intruder Detection · Smart Greenhouse · Home Security · Line Following Robot · Color Sorter

### Expert
PID Temperature Controller · Earthquake Detector · Smart Parking · Industrial Tank Monitor · Wireless Sensor Network

## License

MIT

---

Built with Claude Code by Bilota AI
