import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useHistoryStore } from '../../store/historyStore';
import { useUIStore } from '../../store/uiStore';

export function SaveModal() {
  const currentName = useProjectStore((s) => s.currentName);
  const [name, setName] = useState(currentName || 'Untitled Project');
  const [description, setDescription] = useState('');
  const saveProject = useHistoryStore((s) => s.saveProject);
  const toggleSaveModal = useUIStore((s) => s.toggleSaveModal);
  const setProjectName = useProjectStore((s) => s.setName);

  const handleSave = async () => {
    if (!name.trim()) return;
    await saveProject(name.trim(), description.trim() || undefined);
    setProjectName(name.trim());
    toggleSaveModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-surface border border-border rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Save size={20} className="text-accent" />
            <h2 className="text-lg font-semibold">Save Project</h2>
          </div>
          <button
            onClick={toggleSaveModal}
            className="p-1 rounded-lg hover:bg-bg-elevated text-text-muted"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-text-secondary mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={toggleSaveModal}
            className="px-4 py-2 bg-bg-elevated text-text-secondary text-sm rounded-lg hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
