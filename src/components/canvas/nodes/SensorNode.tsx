import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '../../../utils/cn';
import * as Icons from 'lucide-react';
import { X } from 'lucide-react';
import { useBoardStore } from '../../../store/boardStore';

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
  const IconComp = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[d.icon] || Icons.CircleDot;

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      removeComponent(d.nodeId);
    },
    [d.nodeId, removeComponent]
  );

  const formatValue = (val: unknown): string => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? 'ON' : 'OFF';
    if (typeof val === 'number') return val.toFixed(1);
    if (typeof val === 'object') {
      const obj = val as Record<string, number>;
      if ('r' in obj) return `R:${obj.r} G:${obj.g} B:${obj.b}`;
      if ('x' in obj) return `${obj.x?.toFixed(1)},${obj.y?.toFixed(1)},${obj.z?.toFixed(1)}`;
    }
    return String(val);
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

SensorNode.displayName = 'SensorNode';
