import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '../../../utils/cn';
import { Cpu, X } from 'lucide-react';
import { useBoardStore } from '../../../store/boardStore';

export const MicrocontrollerNode = memo(({ data, selected }: NodeProps) => {
  const d = data as {
    label: string;
    icon: string;
    nodeId: string;
    pins: { id: string; type: string; direction: string }[];
    description: string;
  };

  const removeComponent = useBoardStore((s) => s.removeComponent);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      removeComponent(d.nodeId);
    },
    [d.nodeId, removeComponent]
  );

  const leftPins = d.pins.filter((_, i) => i < Math.ceil(d.pins.length / 2)).slice(0, 8);
  const rightPins = d.pins.filter((_, i) => i >= Math.ceil(d.pins.length / 2)).slice(0, 8);

  return (
    <div
      className={cn(
        'group bg-bg-surface border rounded-2xl p-4 min-w-[200px] transition-all relative',
        selected
          ? 'border-accent shadow-lg shadow-accent/20'
          : 'border-border hover:border-border-active',
        'animate-drop-bounce'
      )}
    >
      {/* Left pin handles */}
      <div className="absolute left-0 top-12 flex flex-col gap-1">
        {leftPins.map((pin) => (
          <div key={pin.id} className="flex items-center -ml-1.5">
            <Handle
              type="target"
              position={Position.Left}
              id={pin.id}
              className="!bg-accent !w-2.5 !h-2.5 !border-2 !border-bg-primary !relative !transform-none !top-auto !left-auto"
            />
            <span className="text-[8px] text-text-muted ml-1 font-[family-name:var(--font-code)]">
              {pin.id}
            </span>
          </div>
        ))}
      </div>

      {/* Right pin handles */}
      <div className="absolute right-0 top-12 flex flex-col gap-1">
        {rightPins.map((pin) => (
          <div key={pin.id} className="flex items-center -mr-1.5 flex-row-reverse">
            <Handle
              type="source"
              position={Position.Right}
              id={pin.id}
              className="!bg-accent !w-2.5 !h-2.5 !border-2 !border-bg-primary !relative !transform-none !top-auto !right-auto"
            />
            <span className="text-[8px] text-text-muted mr-1 font-[family-name:var(--font-code)]">
              {pin.id}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2 px-6">
        <div className="w-12 h-12 rounded-xl bg-accent-muted flex items-center justify-center">
          <Cpu size={28} className="text-accent" />
        </div>
        <div className="text-sm font-semibold text-text-primary">{d.label}</div>
        <div className="text-[10px] text-text-secondary">{d.description}</div>
      </div>

      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-error text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={10} />
      </button>
    </div>
  );
});

MicrocontrollerNode.displayName = 'MicrocontrollerNode';
