import { useAIStore } from '../../store/aiStore';
import { FREE_MODELS, MODEL_CATEGORIES } from '../../data/models';

export function ModelSelector() {
  const selectedModel = useAIStore((s) => s.selectedModel);
  const setModel = useAIStore((s) => s.setModel);

  return (
    <select
      value={selectedModel}
      onChange={(e) => setModel(e.target.value)}
      className="bg-bg-elevated border border-border rounded-lg px-2 py-1 text-[11px] text-text-primary focus:outline-none focus:border-accent max-w-[200px] cursor-pointer"
    >
      {MODEL_CATEGORIES.map((cat) => {
        const models = FREE_MODELS.filter((m) => m.category === cat.key);
        return (
          <optgroup key={cat.key} label={cat.label}>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.provider}) {Math.floor(m.context / 1000)}K
                {m.isDefault ? ' *' : ''}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}
