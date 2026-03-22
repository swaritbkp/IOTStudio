import { useEffect, useRef, useState } from 'react';
import { X, Upload, Search } from 'lucide-react';
import { useHistoryStore } from '../../store/historyStore';
import { useUIStore } from '../../store/uiStore';
import { ProjectCard } from './ProjectCard';

export function HistoryPanel({ forceShow = false }: { forceShow?: boolean } = {}) {
  const show = useUIStore((s) => s.showHistory);
  const toggleHistory = useUIStore((s) => s.toggleHistory);
  const projects = useHistoryStore((s) => s.projects);
  const isLoading = useHistoryStore((s) => s.isLoading);
  const loadProjects = useHistoryStore((s) => s.loadProjects);
  const loadProject = useHistoryStore((s) => s.loadProject);
  const deleteProject = useHistoryStore((s) => s.deleteProject);
  const exportProject = useHistoryStore((s) => s.exportProject);
  const importProject = useHistoryStore((s) => s.importProject);
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (show) loadProjects();
  }, [show, loadProjects]);

  if (!show && !forceShow) return null;

  const filtered = search
    ? projects.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : projects;

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importProject(file);
        toggleHistory();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Import failed');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this project?')) {
      await deleteProject(id);
    }
  };

  const handleLoad = async (id: string) => {
    await loadProject(id);
    toggleHistory();
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[360px] bg-bg-primary border-l border-border z-30 flex flex-col shadow-2xl">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="text-sm font-semibold">Saved Projects</h3>
        <button
          onClick={toggleHistory}
          className="p-1 rounded hover:bg-bg-elevated text-text-muted"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {isLoading ? (
          <div className="text-xs text-text-muted text-center py-8">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-xs text-text-muted text-center py-8">
            No saved projects yet
          </div>
        ) : (
          filtered.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onLoad={() => handleLoad(p.id)}
              onExport={() => exportProject(p.id)}
              onDelete={() => handleDelete(p.id)}
            />
          ))
        )}
      </div>

      <div className="p-3 border-t border-border">
        <input
          ref={fileRef}
          type="file"
          accept=".iotstudio"
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-bg-surface border border-border text-text-secondary text-xs hover:text-text-primary hover:border-border-active transition-colors"
        >
          <Upload size={14} />
          Import .iotstudio file
        </button>
      </div>
    </div>
  );
}
