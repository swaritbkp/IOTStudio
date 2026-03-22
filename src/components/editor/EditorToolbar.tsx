import {
  Play,
  Square,
  BookOpen,
  Download,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCodeStore } from '../../store/codeStore';
import { useUIStore } from '../../store/uiStore';
import { useAIStore } from '../../store/aiStore';
import { useBoardStore } from '../../store/boardStore';
import { useProjectStore } from '../../store/projectStore';
import { downloadArduinoSketch } from '../../utils/arduinoExporter';
import { downloadPlatformIOProject } from '../../utils/platformioExporter';
import { PackageOpen } from 'lucide-react';

const TEMPLATES = [
  {
    label: 'Blink LED',
    code: `let ledState = LOW;

function setup() {
  log("Starting Blink Template...");
}

function loop() {
  ledState = ledState === LOW ? HIGH : LOW;
  writeActuator("LED 1", ledState);
  delay(1000);
}`
  },
  {
    label: 'Read Analog Sensor',
    code: `function setup() {
  log("Starting Analog Read Template...");
}

function loop() {
  let val = readSensor("Potentiometer 1");
  log("Sensor value: " + val);
  delay(500);
}`
  },
  {
    label: 'Servo Sweep',
    code: `let angle = 0;
let direction = 1;

function setup() {
  log("Starting Servo Sweep...");
}

function loop() {
  writeActuator("Servo 1", angle);
  angle += 5 * direction;
  
  if (angle >= 180 || angle <= 0) {
    direction *= -1;
  }
  delay(50);
}`
  },
  {
    label: 'Read Temp/Humidity',
    code: `function setup() {
  log("Starting DHT11 Reader...");
}

function loop() {
  let temp = readSensor("Temperature 1");
  let hum = readSensor("Humidity 1");
  log("Temp: " + temp + "C, Humidity: " + hum + "%");
  delay(2000);
}`
  },
  {
    label: 'RGB LED Control',
    code: `let hue = 0;

function setup() {
  log("Starting RGB Sweep...");
}

// Simple HSV to RGB mapping approximation
function hsvToRgb(h) {
  let s = 1.0, v = 1.0;
  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);
  
  let r, g, b;
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return { r: Math.floor(r*255), g: Math.floor(g*255), b: Math.floor(b*255) };
}

function loop() {
  hue += 0.01;
  if(hue > 1.0) hue = 0;
  
  let color = hsvToRgb(hue);
  writeActuator("RGB LED 1", color);
  delay(50);
}`
  },
  {
    label: 'Ultrasonic Distance',
    code: `function setup() {
  log("Starting Distance Sensor...");
}

function loop() {
  let distance = readSensor("Ultrasonic 1");
  log("Distance: " + distance + " cm");
  
  if(distance < 30) {
    writeActuator("Buzzer 1", 1000); // 1000Hz tone
  } else {
    writeActuator("Buzzer 1", 0); // off
  }
  delay(250);
}`
  }
];

interface Props {
  onRun: () => void;
  onStop: () => void;
}

const SPEEDS = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
  { label: '5x', value: 5 },
];

export function EditorToolbar({ onRun, onStop }: Props) {
  const isRunning = useCodeStore((s) => s.isRunning);
  const speed = useCodeStore((s) => s.speed);
  const setSpeed = useCodeStore((s) => s.setSpeed);
  const toggleApiRef = useUIStore((s) => s.toggleApiRef);
  const code = useCodeStore((s) => s.code);
  const nodes = useBoardStore((s) => s.nodes);
  const projectName = useProjectStore((s) => s.currentName);
  const setCode = useCodeStore((s) => s.setCode);

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-bg-surface border-b border-border">
      <button
        onClick={isRunning ? onStop : onRun}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all',
          isRunning
            ? 'bg-error/20 text-error hover:bg-error/30'
            : 'bg-accent/20 text-accent hover:bg-accent/30'
        )}
      >
        {isRunning ? (
          <>
            <Square size={12} />
            Stop
          </>
        ) : (
          <>
            <Play size={12} />
            Run
          </>
        )}
      </button>

      <div className="flex items-center gap-1 ml-2 border-l border-border pl-2">
        <select
          onChange={(e) => {
            const t = TEMPLATES.find(x => x.label === e.target.value);
            if (t) setCode(t.code);
            e.target.value = ""; // reset dropdown
          }}
          className="px-2 py-1 rounded-md text-[10px] sm:text-xs font-medium bg-bg-elevated text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors border-none outline-none ring-0 appearance-none cursor-pointer"
          title="Load Code Template"
          defaultValue=""
        >
          <option value="" disabled>Load Template...</option>
          {TEMPLATES.map(t => (
            <option key={t.label} value={t.label}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-0.5 ml-2 border-l border-border pl-2">
        <Gauge size={12} className="text-text-muted" />
        {SPEEDS.map((s) => (
          <button
            key={s.value}
            onClick={() => setSpeed(s.value)}
            className={cn(
              'px-1.5 py-0.5 rounded text-[10px] transition-colors',
              speed === s.value
                ? 'bg-accent/20 text-accent'
                : 'text-text-muted hover:text-text-secondary'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      <button
        onClick={() => {
          useUIStore.getState().setActiveTab('ai');
          useAIStore.getState().sendMessage("Explain this code step-by-step:\n\n```javascript\n" + code + "\n```");
        }}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] sm:text-xs font-medium bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors mr-1"
        title="Explain Code with AI"
      >
        <Sparkles size={12} />
        Explain
      </button>

      <button
        onClick={toggleApiRef}
        className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
        title="API Reference"
      >
        <BookOpen size={14} />
      </button>

      <button
        onClick={() => downloadArduinoSketch(code, nodes, projectName)}
        className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
        title="Export Arduino .ino"
      >
        <Download size={14} />
      </button>

      <button
        onClick={() => downloadPlatformIOProject(code, nodes, projectName)}
        className="p-1.5 flex items-center gap-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
        title="Export PlatformIO Project"
      >
        <PackageOpen size={14} />
      </button>
    </div>
  );
}
