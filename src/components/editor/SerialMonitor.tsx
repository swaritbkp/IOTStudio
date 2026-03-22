import { useEffect, useRef } from 'react';
import { Trash2, Terminal } from 'lucide-react';
import { useCodeStore } from '../../store/codeStore';
import { cn } from '../../utils/cn';

export function SerialMonitor() {
  const serialLogs = useCodeStore((s) => s.serialLogs);
  const error = useCodeStore((s) => s.error);
  const clearLogs = useCodeStore((s) => s.clearLogs);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [serialLogs]);

  return (
    <div className="flex flex-col h-full bg-bg-primary border-t border-border">
      <div className="flex items-center justify-between px-3 py-1.5 bg-bg-surface border-b border-border">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <Terminal size={12} />
          Serial Monitor
          <span className="text-text-muted">({serialLogs.length})</span>
        </div>
        <button
          onClick={clearLogs}
          className="p-1 rounded hover:bg-bg-elevated transition-colors text-text-muted hover:text-text-secondary"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-2 font-[family-name:var(--font-code)] text-[11px] leading-relaxed"
      >
        {error && (
          <div className="text-error bg-error/10 px-2 py-1 rounded mb-1">
            {error}
          </div>
        )}
        {serialLogs.map((log, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-text-muted shrink-0 select-none">
              {(log.timestamp / 1000).toFixed(1)}s
            </span>
            <span className={cn('text-text-primary', log.message.includes('ERROR') && 'text-error')}>
              {log.message}
            </span>
          </div>
        ))}
        {serialLogs.length === 0 && !error && (
          <div className="text-text-muted text-center py-4">
            Run the simulation to see output here
          </div>
        )}
      </div>
    </div>
  );
}
