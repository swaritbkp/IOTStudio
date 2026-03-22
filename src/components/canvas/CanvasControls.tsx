import { useReactFlow } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize, LayoutGrid } from 'lucide-react';
import { useBoardStore } from '../../store/boardStore';
import { cn } from '../../utils/cn';

export function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const autoLayout = useBoardStore((s) => s.autoLayout);

  const btnClass = cn(
    'p-1.5 rounded-lg bg-bg-surface border border-border',
    'text-text-secondary hover:text-text-primary hover:border-border-active',
    'transition-colors'
  );

  return (
    <div className="absolute bottom-4 left-4 flex gap-1 z-10">
      <button onClick={() => zoomIn()} className={btnClass} title="Zoom In">
        <ZoomIn size={14} />
      </button>
      <button onClick={() => zoomOut()} className={btnClass} title="Zoom Out">
        <ZoomOut size={14} />
      </button>
      <button onClick={() => fitView({ padding: 0.2 })} className={btnClass} title="Fit View">
        <Maximize size={14} />
      </button>
      <button onClick={autoLayout} className={btnClass} title="Auto Layout">
        <LayoutGrid size={14} />
      </button>
    </div>
  );
}
