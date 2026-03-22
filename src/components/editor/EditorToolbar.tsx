import {
  Play,
  Square,
  BookOpen,
  Download,
  Gauge,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCodeStore } from '../../store/codeStore';
import { useUIStore } from '../../store/uiStore';
import { useBoardStore } from '../../store/boardStore';
import { useProjectStore } from '../../store/projectStore';
import { downloadArduinoSketch } from '../../utils/arduinoExporter';

const BLINK_TEMPLATE = `let ledState = LOW;

function setup() {
  log("Starting Blink Template...");
}

function loop() {
  ledState = ledState === LOW ? HIGH : LOW;
  writeActuator("LED 1", ledState);
  delay(1000);
}`;

const READ_SENSOR_TEMPLATE = `function setup() {
  log("Starting Read Sensor Template...");
}

function loop() {
  let val = readSensor("Temperature 1");
  log("Temp: " + val);
  delay(1000);
}`;

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
        <button
          onClick={() => setCode(BLINK_TEMPLATE)}
          className="px-2 py-1 rounded-md text-[10px] sm:text-xs font-medium bg-bg-elevated text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          title="Load Blink Template"
        >
          Blink
        </button>
        <button
          onClick={() => setCode(READ_SENSOR_TEMPLATE)}
          className="px-2 py-1 rounded-md text-[10px] sm:text-xs font-medium bg-bg-elevated text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          title="Load Read Sensor Template"
        >
          Read Sensor
        </button>
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
    </div>
  );
}
