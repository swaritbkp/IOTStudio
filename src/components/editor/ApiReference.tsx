import { X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

const API_FUNCTIONS = [
  {
    name: 'readSensor(name)',
    returns: 'number | boolean | object',
    desc: 'Read the current value of a sensor by its display name.',
  },
  {
    name: 'writeActuator(name, value)',
    returns: 'void',
    desc: 'Set the value of an actuator. LEDs accept 0-255 (PWM), servos 0-180°.',
  },
  {
    name: 'log(message)',
    returns: 'void',
    desc: 'Print a message to the Serial Monitor.',
  },
  {
    name: 'logData(key, value)',
    returns: 'void',
    desc: 'Send a numeric data point to the chart. Key is the series name.',
  },
  {
    name: 'delay(ms)',
    returns: 'void',
    desc: 'Pause execution (simulated via loop interval).',
  },
  {
    name: 'millis()',
    returns: 'number',
    desc: 'Get milliseconds since simulation started.',
  },
  {
    name: 'map(value, fromLow, fromHigh, toLow, toHigh)',
    returns: 'number',
    desc: 'Re-map a value from one range to another.',
  },
  {
    name: 'constrain(value, low, high)',
    returns: 'number',
    desc: 'Constrain a value between a minimum and maximum.',
  },
  {
    name: 'HIGH / LOW',
    returns: '1 / 0',
    desc: 'Constants for digital pin states.',
  },
];

export function ApiReference() {
  const show = useUIStore((s) => s.showApiRef);
  const toggle = useUIStore((s) => s.toggleApiRef);

  if (!show) return null;

  return (
    <div className="absolute inset-0 z-10 bg-bg-primary/95 backdrop-blur-sm overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">
          Simulation API Reference
        </h3>
        <button
          onClick={toggle}
          className="p-1 rounded hover:bg-bg-elevated text-text-muted hover:text-text-primary"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {API_FUNCTIONS.map((fn) => (
          <div
            key={fn.name}
            className="bg-bg-surface border border-border rounded-xl p-3"
          >
            <div className="font-[family-name:var(--font-code)] text-xs text-accent">
              {fn.name}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">
              Returns: {fn.returns}
            </div>
            <div className="text-xs text-text-secondary mt-1">{fn.desc}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-bg-surface border border-border rounded-xl">
        <div className="text-xs font-semibold text-text-primary mb-2">
          Code Pattern
        </div>
        <pre className="font-[family-name:var(--font-code)] text-[11px] text-text-secondary">
          {`function setup() {\n  // Runs once at start\n}\n\nfunction loop() {\n  // Runs repeatedly\n}`}
        </pre>
      </div>
    </div>
  );
}
