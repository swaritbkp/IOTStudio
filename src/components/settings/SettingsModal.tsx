import { useState } from 'react';
import { Settings, X, Trash2 } from 'lucide-react';
import { useAIStore } from '../../store/aiStore';
import { useUIStore } from '../../store/uiStore';
import { ModelSelector } from '../ai/ModelSelector';
import { del, keys as idbKeys } from 'idb-keyval';

export function SettingsModal() {
  const show = useUIStore((s) => s.showSettings);
  const toggle = useUIStore((s) => s.toggleSettings);
  const apiKey = useAIStore((s) => s.apiKey);
  const setApiKey = useAIStore((s) => s.setApiKey);
  const [keyInput, setKeyInput] = useState(apiKey);

  if (!show) return null;

  const handleSaveKey = () => {
    setApiKey(keyInput);
  };

  const handleClearData = async () => {
    if (!confirm('Delete all saved projects and settings? This cannot be undone.'))
      return;
    const allKeys = await idbKeys();
    for (const key of allKeys) {
      await del(key);
    }
    localStorage.removeItem('iotstudio_openrouter_key');
    localStorage.removeItem('iotstudio_selected_model');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-surface border border-border rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings size={20} className="text-accent" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          <button
            onClick={toggle}
            className="p-1 rounded-lg hover:bg-bg-elevated text-text-muted"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              OpenRouter API Key
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="sk-or-v1-..."
                className="flex-1 px-3 py-2 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
              />
              <button
                onClick={handleSaveKey}
                className="px-3 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent-hover transition-colors"
              >
                Save
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Default AI Model
            </label>
            <ModelSelector />
          </div>

          <div className="pt-3 border-t border-border">
            <button
              onClick={handleClearData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-error/10 text-error text-sm hover:bg-error/20 transition-colors"
            >
              <Trash2 size={14} />
              Clear All Saved Data
            </button>
            <p className="text-[10px] text-text-muted mt-1.5">
              Deletes all saved projects, settings, and API key.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
