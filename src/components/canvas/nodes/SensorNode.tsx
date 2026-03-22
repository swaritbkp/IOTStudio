import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '../../../utils/cn';
import * as Icons from 'lucide-react';
import { X } from 'lucide-react';
import { useBoardStore } from '../../../store/boardStore';

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'HIGH' : 'LOW';
  if (typeof val === 'number') return val % 1 === 0 ? String(val) : val.toFixed(1);
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    if ('r' in obj && 'g' in obj && 'b' in obj) return `R:${obj.r} G:${obj.g} B:${obj.b}`;
    if ('x' in obj && 'y' in obj && 'z' in obj) return `${(obj.x as number).toFixed(1)}, ${(obj.y as number).toFixed(1)}, ${(obj.z as number).toFixed(1)}`;
    return JSON.stringify(val);
  }
  return String(val);
}

const SENSOR_RANGES: Record<string, { min: number; max: number; step?: number; unit?: string }> = {
  potentiometer: { min: 0, max: 1023, unit: '' },
  ultrasonic: { min: 2, max: 400, step: 1, unit: ' cm' },
  temperature: { min: -40, max: 125, step: 0.1, unit: '°C' },
  thermometer: { min: -40, max: 125, step: 0.1, unit: '°C' },
  humidity: { min: 0, max: 100, step: 0.1, unit: '%' },
  light: { min: 0, max: 1023, unit: '' },
  soil: { min: 0, max: 1023, unit: '' },
  sound: { min: 0, max: 1023, unit: '' },
  gas: { min: 0, max: 1023, unit: '' },
  flame: { min: 0, max: 1023, unit: '' },
  pressure: { min: 300, max: 1100, step: 1, unit: ' hPa' },
  analog: { min: 0, max: 1023, unit: '' },
};

const DIGITAL_TYPES = ['switch', 'button', 'digital', 'motion', 'ir'];

export const SensorNode = memo(({ data, selected }: NodeProps) => {
  const d = data as {
    label: string;
    icon: string;
    imageUrl?: string;
    liveValue: unknown;
    interactable?: boolean;
    simulationType?: string;
    nodeId: string;
    pins: { id: string }[];
    description?: string;
  };

  const removeComponent = useBoardStore((s) => s.removeComponent);
  const updateNodeData = useBoardStore((s) => s.updateNodeData);
  const IconComp = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[d.icon] || Icons.CircleDot;

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      removeComponent(d.nodeId);
    },
    [d.nodeId, removeComponent]
  );

  const renderInteractiveControl = () => {
    if (!d.interactable) {
      return <div className="text-[10px] text-text-secondary font-[family-name:var(--font-code)]">{formatValue(d.liveValue)}</div>;
    }

    const range = d.simulationType ? SENSOR_RANGES[d.simulationType] : undefined;
    if (range) {
      const val = typeof d.liveValue === 'number' ? d.liveValue : range.min;
      return (
        <div className="w-full px-1 cursor-default pointer-events-auto" onMouseDownCapture={(e) => e.stopPropagation()}>
          <input
            type="range" min={range.min} max={range.max} step={range.step ?? 1} value={val}
            className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
            onChange={(e) => updateNodeData(d.label, Number(e.target.value))}
            title={`${val}`}
          />
          <div className="text-[9px] text-text-secondary text-center font-[family-name:var(--font-code)] mt-0.5">
            {typeof val === 'number' && val % 1 !== 0 ? val.toFixed(1) : val}{range.unit || ''}
          </div>
        </div>
      );
    }

    if (d.simulationType && DIGITAL_TYPES.includes(d.simulationType)) {
      const isON = !!d.liveValue;
      return (
        <div className="w-full cursor-default pointer-events-auto" onMouseDownCapture={(e) => e.stopPropagation()}>
          <button
            className={cn("mt-1 px-3 py-0.5 rounded-full text-[9px] font-bold transition-colors w-full", isON ? "bg-accent text-white" : "bg-bg-elevated text-text-muted border border-border")}
            onClick={() => updateNodeData(d.label, isON ? 0 : 1)}
          >
            {isON ? 'ON' : 'OFF'}
          </button>
        </div>
      );
    }

    return <div className="text-[10px] text-text-secondary font-[family-name:var(--font-code)]">{formatValue(d.liveValue)}</div>;
  };

  return (
    <div
      className={cn(
        'group bg-bg-surface border rounded-2xl p-3 min-w-[140px] transition-all',
        selected
          ? 'border-accent shadow-lg shadow-accent/20'
          : 'border-border hover:border-border-active',
        'animate-drop-bounce'
      )}
      title={d.description}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-accent !w-3 !h-3 !border-2 !border-bg-primary"
      />

      <div className="flex flex-col items-center gap-1.5">
        <div className="w-12 h-12 rounded-xl bg-accent-muted flex items-center justify-center overflow-hidden">
          {d.imageUrl ? (
            <img src={d.imageUrl} alt={d.label} className="w-full h-full object-contain" />
          ) : (
            <IconComp size={20} className="text-accent" />
          )}
        </div>
        <div className="text-xs font-semibold text-text-primary truncate max-w-[120px] mb-1">
          {d.label}
        </div>
        {renderInteractiveControl()}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-accent !w-3 !h-3 !border-2 !border-bg-primary"
      />

      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-error text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={10} />
      </button>
    </div>
  );
});

SensorNode.displayName = 'SensorNode';
