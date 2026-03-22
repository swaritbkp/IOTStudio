import { useCallback, useRef, useEffect } from 'react';

interface Props {
  children: [React.ReactNode, React.ReactNode];
  direction?: 'horizontal' | 'vertical';
  initialSplit?: number;
  minSize?: number;
}

export function ResizablePanel({
  children,
  direction = 'horizontal',
  initialSplit = 50,
  minSize = 200,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef(initialSplit);
  const dragging = useRef(false);

  const updateSplit = useCallback(
    (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      let pct: number;
      if (direction === 'horizontal') {
        const pos = e.clientX - rect.left;
        pct = (pos / rect.width) * 100;
      } else {
        const pos = e.clientY - rect.top;
        pct = (pos / rect.height) * 100;
      }

      const minPct = (minSize / (direction === 'horizontal' ? rect.width : rect.height)) * 100;
      pct = Math.max(minPct, Math.min(100 - minPct, pct));
      splitRef.current = pct;

      const el = containerRef.current;
      el.style.setProperty('--split', `${pct}%`);
    },
    [direction, minSize]
  );

  useEffect(() => {
    const onMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    const onMouseMove = (e: MouseEvent) => updateSplit(e);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [updateSplit]);

  const handleMouseDown = () => {
    dragging.current = true;
    document.body.style.cursor =
      direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div
      ref={containerRef}
      className={`flex ${direction === 'horizontal' ? 'flex-row' : 'flex-col'} w-full h-full`}
      style={{ '--split': `${initialSplit}%` } as React.CSSProperties}
    >
      <div
        style={{
          [direction === 'horizontal' ? 'width' : 'height']:
            'var(--split)',
        }}
        className="overflow-hidden"
      >
        {children[0]}
      </div>

      <div
        onMouseDown={handleMouseDown}
        className={`${
          direction === 'horizontal'
            ? 'w-1 cursor-col-resize hover:bg-accent/30'
            : 'h-1 cursor-row-resize hover:bg-accent/30'
        } bg-border shrink-0 transition-colors`}
      />

      <div
        style={{
          [direction === 'horizontal' ? 'width' : 'height']:
            'calc(100% - var(--split) - 4px)',
        }}
        className="overflow-hidden"
      >
        {children[1]}
      </div>
    </div>
  );
}
