import { memo } from 'react';
import { Bot, User, Copy, Code2 } from 'lucide-react';
import type { ChatMessage as ChatMsg } from '../../engine/types';
import { cn } from '../../utils/cn';
import { useCodeStore } from '../../store/codeStore';
import { FREE_MODELS } from '../../data/models';

interface Props {
  message: ChatMsg;
}

export const ChatMessage = memo(({ message }: Props) => {
  const setCode = useCodeStore((s) => s.setCode);
  const isUser = message.role === 'user';
  const model = FREE_MODELS.find((m) => m.id === message.model);

  // Extract code blocks
  const parts = message.content.split(/(```[\s\S]*?```)/g);

  const handleApplyCode = (code: string) => {
    // Remove language identifier from first line
    const lines = code.split('\n');
    if (lines[0]?.match(/^(javascript|js|typescript|ts)$/)) {
      lines.shift();
    }
    setCode(lines.join('\n').trim());
  };

  return (
    <div
      className={cn(
        'flex gap-2 px-3 py-2',
        isUser ? 'flex-row-reverse' : ''
      )}
    >
      <div
        className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
          isUser ? 'bg-accent/20' : 'bg-bg-elevated'
        )}
      >
        {isUser ? (
          <User size={12} className="text-accent" />
        ) : (
          <Bot size={12} className="text-text-secondary" />
        )}
      </div>

      <div className={cn('flex-1 min-w-0', isUser && 'text-right')}>
        {!isUser && model && (
          <div className="text-[9px] text-text-muted mb-0.5">
            {model.name}
          </div>
        )}
        <div
          className={cn(
            'inline-block text-xs leading-relaxed rounded-xl px-3 py-2 max-w-full text-left',
            isUser
              ? 'bg-accent/20 text-text-primary'
              : 'bg-bg-elevated text-text-primary'
          )}
        >
          {parts.map((part, i) => {
            if (part.startsWith('```')) {
              const code = part.replace(/^```\w*\n?/, '').replace(/```$/, '');
              return (
                <div key={i} className="my-2">
                  <div className="bg-bg-primary rounded-lg overflow-hidden border border-border">
                    <div className="flex items-center justify-between px-2 py-1 border-b border-border">
                      <span className="text-[9px] text-text-muted">Code</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(code.trim())
                          }
                          className="p-0.5 rounded hover:bg-bg-elevated text-text-muted"
                          title="Copy"
                        >
                          <Copy size={10} />
                        </button>
                        <button
                          onClick={() => handleApplyCode(code)}
                          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-accent/20 text-accent text-[9px] hover:bg-accent/30"
                        >
                          <Code2 size={10} />
                          Apply
                        </button>
                      </div>
                    </div>
                    <pre className="p-2 text-[11px] font-[family-name:var(--font-code)] overflow-x-auto whitespace-pre-wrap">
                      {code.trim()}
                    </pre>
                  </div>
                </div>
              );
            }
            return <span key={i} className="whitespace-pre-wrap">{part}</span>;
          })}
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export function CircuitJSONBlock({ content, onApply }: { content: string, onApply: (data: any) => void }) {
  try {
    const match = content.match(/```json\n([\s\S]*?)```/);
    if (!match || !match[1]) return null;
    const data = JSON.parse(match[1]);
    if (!data.components || !data.connections) return null;
    return (
      <div className="mt-2 mb-2 p-3 bg-bg-tertiary border border-accent/30 rounded-xl flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="text-xs text-text-primary">
            <div className="font-semibold text-accent">{data.title || 'AI Generated Circuit'}</div>
            <div className="text-[10px] text-text-muted mt-0.5">{data.components.length} components, {data.connections.length} wires</div>
          </div>
          <button
            onClick={() => onApply(data)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white hover:bg-accent-hover text-[10px] font-bold rounded-lg transition-colors shadow-lg shadow-accent/20"
          >
            <Code2 size={12} />
            Build on Canvas
          </button>
        </div>
      </div>
    );
  } catch (e) {
    return null;
  }
}
