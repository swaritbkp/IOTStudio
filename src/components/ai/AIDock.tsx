import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Key, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAIStore } from '../../store/aiStore';
import { ModelSelector } from './ModelSelector';
import { ChatMessage } from './ChatMessage';
import { SuggestionChips } from './SuggestionChips';
import { ApiKeySetup } from './ApiKeySetup';

export function AIDock() {
  const [input, setInput] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [showKeySetup, setShowKeySetup] = useState(false);
  const messages = useAIStore((s) => s.messages);
  const isLoading = useAIStore((s) => s.isLoading);
  const apiKey = useAIStore((s) => s.apiKey);
  const sendMessage = useAIStore((s) => s.sendMessage);
  const clearChat = useAIStore((s) => s.clearChat);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
    setExpanded(true);
  };

  const handleSuggestion = (text: string) => {
    if (!apiKey) {
      setShowKeySetup(true);
      return;
    }
    sendMessage(text);
    setExpanded(true);
  };

  return (
    <>
      {showKeySetup && (
        <ApiKeySetup onClose={() => setShowKeySetup(false)} />
      )}

      <div
        className={cn(
          'bg-bg-surface border-t border-border transition-all',
          expanded ? 'h-80' : 'h-auto'
        )}
      >
        {/* Chat messages area */}
        {expanded && (
          <div
            ref={chatRef}
            className="h-[calc(100%-80px)] overflow-y-auto"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-text-muted">
                <Bot size={24} className="mb-2 opacity-40" />
                <span className="text-xs">
                  Ask AI to help with your circuit
                </span>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))
            )}
          </div>
        )}

        {/* Controls bar */}
        <div className="px-3 py-2 space-y-2">
          <SuggestionChips onSelect={handleSuggestion} />

          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded text-text-muted hover:text-text-secondary"
            >
              {expanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronUp size={14} />
              )}
            </button>

            <Bot size={14} className="text-accent shrink-0" />
            <ModelSelector />

            {apiKey ? (
              <div className="flex-1 flex gap-1.5">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask AI..."
                  className="flex-1 px-3 py-1.5 bg-bg-primary border border-border rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover disabled:opacity-40 transition-colors"
                >
                  <Send size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowKeySetup(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/20 text-accent text-xs hover:bg-accent/30"
              >
                <Key size={12} />
                Set up AI
              </button>
            )}

            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-1.5 rounded text-text-muted hover:text-text-secondary"
                title="Clear chat"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
