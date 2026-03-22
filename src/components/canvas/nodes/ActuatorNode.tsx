import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '../../../utils/cn';
import * as Icons from 'lucide-react';
import { X } from 'lucide-react';
import { useBoardStore } from '../../../store/boardStore';

export const ActuatorNode = memo(({ data, selected }: NodeProps) => {
  const d = data as {
    label: string;
    icon: string;
    liveValue: unknown;
    simulationType?: string;
    color?: string;
    nodeId: string;
    description?: string;
  };

  const removeComponent = useBoardStore((s) => s.removeComponent);
  const IconComp = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>>)[d.icon] || Icons.Lightbulb;

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      removeComponent(d.nodeId);
    },
    [d.nodeId, removeComponent]
  );

  const renderVisual = () => {
    const val = d.liveValue;
    const simType = d.simulationType;

    if (simType === 'led' || simType === 'rgb_led') {
      const brightness =
        typeof val === 'number' ? val / 255 : val ? 1 : 0;
      const color = d.color || '#EF4444';
      return (
        <div
          className={cn('w-8 h-8 rounded-full transition-all', brightness > 0 && 'animate-led-glow')}
          style={{
            background:
              brightness > 0
                ? `radial-gradient(circle, ${color} 0%, transparent 70%)`
                : '#333',
            opacity: Math.max(0.2, brightness),
            boxShadow:
              brightness > 0 ? `0 0 ${brightness * 20}px ${color}` : 'none',
          }}
        />
      );
    }

    if (simType === 'servo') {
      const angle = typeof val === 'number' ? val : 90;
      return (
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-text-muted" />
          <div
            className="absolute top-1/2 left-1/2 w-1 h-5 bg-accent rounded-full origin-bottom transition-transform"
            style={{
              transform: `translate(-50%, -100%) rotate(${angle - 90}deg)`,
            }}
          />
        </div>
      );
    }

    if (simType === 'motor') {
      const speed = typeof val === 'number' ? val : 0;
      return (
        <div className={cn(speed > 0 && 'animate-motor-spin')}>
          <IconComp size={24} className="text-accent" />
        </div>
      );
    }

    if (simType === 'buzzer') {
      const active = typeof val === 'number' ? val > 0 : !!val;
      return (
        <div className={cn(active && 'animate-buzzer-pulse')}>
          <IconComp
            size={24}
            className={active ? 'text-warning' : 'text-text-muted'}
          />
        </div>
      );
    }

    if (simType === 'lcd' || simType === 'oled') {
      const text = typeof val === 'string' ? val : '';
      const lines = text.split('\\n').slice(0, simType === 'lcd' ? 2 : 4);
      return (
        <div
          className={cn(
            'px-2 py-1 rounded font-[family-name:var(--font-code)] text-[9px] leading-tight min-w-[100px]',
            simType === 'lcd'
              ? 'bg-green-900/60 text-green-300'
              : 'bg-blue-950/60 text-blue-300'
          )}
        >
          {lines.length > 0 ? lines.map((l, i) => (
            <div key={i} className="truncate">
              {l || '\u00A0'}
            </div>
          )) : <div>{'\u00A0'}</div>}
        </div>
      );
    }

    if (simType === 'seven_segment') {
      const digit = typeof val === 'number' ? Math.floor(val) % 10 : 0;
      return (
        <div className="text-2xl font-bold font-[family-name:var(--font-code)] text-red-500 bg-black/40 px-2 py-0.5 rounded">
          {digit}
        </div>
      );
    }

    if (simType === 'relay' || simType === 'solenoid') {
      const on = !!val;
      return (
        <IconComp
          size={24}
          className={on ? 'text-accent' : 'text-text-muted'}
        />
      );
    }

    return (
      <IconComp size={24} className="text-accent" />
    );
  };

  const formatValue = (val: unknown): string => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? 'ON' : 'OFF';
    if (typeof val === 'number') {
      if (d.simulationType === 'servo') return `${val}°`;
      return String(val);
    }
    if (typeof val === 'string') return val.substring(0, 16);
    return '—';
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
        {renderVisual()}
        <div className="text-xs font-semibold text-text-primary truncate max-w-[120px]">
          {d.label}
        </div>
        <div className="text-[10px] text-text-secondary font-[family-name:var(--font-code)]">
          {formatValue(d.liveValue)}
        </div>
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

ActuatorNode.displayName = 'ActuatorNode';
