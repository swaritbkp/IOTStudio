import { useState } from 'react';
import { Key, ExternalLink, X } from 'lucide-react';
import { useAIStore } from '../../store/aiStore';

interface Props {
  onClose: () => void;
}

export function ApiKeySetup({ onClose }: Props) {
  const [key, setKey] = useState('');
  const setApiKey = useAIStore((s) => s.setApiKey);

  const handleSave = () => {
    if (key.trim()) {
      setApiKey(key.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-surface border border-border rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key size={20} className="text-accent" />
            <h2 className="text-lg font-semibold">Connect to AI</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-bg-elevated text-text-muted"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-text-secondary mb-4">
          AI works out of the box! For unlimited usage, add your own free
          OpenRouter API key — no credit card needed.
        </p>

        <a
          href="https://openrouter.ai/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover mb-4"
        >
          Get free key
          <ExternalLink size={14} />
        </a>

        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-or-v1-..."
          className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent mb-4"
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="flex-1 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save & Continue
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-bg-elevated text-text-secondary text-sm rounded-lg hover:text-text-primary transition-colors"
          >
            Skip
          </button>
        </div>

        <p className="text-[10px] text-text-muted mt-3">
          Your key is stored locally and only sent to openrouter.ai. Without a key, requests go through our server proxy.
        </p>
      </div>
    </div>
  );
}
