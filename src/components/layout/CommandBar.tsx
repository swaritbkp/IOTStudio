import { useState, useRef } from 'react';
import {
  Zap,
  Plus,
  Save,
  FolderOpen,
  Upload,
  Download,
  Play,
  Square,
  Settings,
  ChevronDown,
  FileCode,
  BarChart3,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCodeStore } from '../../store/codeStore';
import { useUIStore } from '../../store/uiStore';
import { useProjectStore } from '../../store/projectStore';
import { useBoardStore } from '../../store/boardStore';
import { PROJECTS_BY_CATEGORY } from '../../data/projects';
import { downloadArduinoSketch } from '../../utils/arduinoExporter';
import { exportProject as exportProjectFile } from '../../utils/projectSerializer';
import { useHistoryStore } from '../../store/historyStore';

interface Props {
  onRun: () => void;
  onStop: () => void;
}

export function CommandBar({ onRun, onStop }: Props) {
  const isRunning = useCodeStore((s) => s.isRunning);
  const projectName = useProjectStore((s) => s.currentName);
  const toggleSaveModal = useUIStore((s) => s.toggleSaveModal);
  const toggleHistory = useUIStore((s) => s.toggleHistory);
  const toggleSettings = useUIStore((s) => s.toggleSettings);
  const toggleCharts = useUIStore((s) => s.toggleCharts);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const loadExampleById = useProjectStore((s) => s.loadExampleById);
  const newBlankProject = useProjectStore((s) => s.newBlankProject);
  const code = useCodeStore((s) => s.code);
  const nodes = useBoardStore((s) => s.nodes);
  const importProject = useHistoryStore((s) => s.importProject);

  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importProject(file);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Import failed');
      }
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleExportProject = () => {
    setShowExportMenu(false);
    exportProjectFile({
      id: crypto.randomUUID(),
      name: projectName,
      savedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      boardState: {
        nodes: nodes as unknown[],
        edges: useBoardStore.getState().edges as unknown[],
        viewport: { x: 0, y: 0, zoom: 1 },
      },
      code,
    });
  };

  const handleExportArduino = () => {
    setShowExportMenu(false);
    downloadArduinoSketch(code, nodes, projectName);
  };

  const btnClass = cn(
    'flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs',
    'text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors'
  );

  return (
    <div className="flex items-center h-11 px-3 bg-bg-surface border-b border-border gap-1 shrink-0 glow-border">
      {/* Logo */}
      <div className="flex items-center gap-1.5 mr-3">
        <Zap size={16} className="text-accent" />
        <span className="text-sm font-bold gradient-text hidden sm:inline">
          IoT Studio
        </span>
      </div>

      {/* Project name */}
      <span className="text-xs text-text-muted truncate max-w-[120px] mr-2 hidden md:inline">
        {projectName}
      </span>

      {/* New dropdown */}
      <div className="relative">
        <button
          className={btnClass}
          onClick={() => {
            setShowNewMenu(!showNewMenu);
            setShowExportMenu(false);
          }}
        >
          <Plus size={12} />
          New
          <ChevronDown size={10} />
        </button>
        {showNewMenu && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-bg-elevated/95 backdrop-blur-sm border border-border rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
            <button
              onClick={() => {
                newBlankProject();
                setShowNewMenu(false);
              }}
              className="w-full text-left px-3 py-2 text-xs text-text-primary hover:bg-bg-surface transition-colors"
            >
              Blank Canvas
            </button>
            <div className="border-t border-border" />
            {(
              Object.entries(PROJECTS_BY_CATEGORY) as [
                string,
                typeof PROJECTS_BY_CATEGORY[keyof typeof PROJECTS_BY_CATEGORY],
              ][]
            ).map(([cat, projects]) => (
              <div key={cat}>
                <div className="px-3 py-1.5 text-[10px] font-semibold text-text-muted uppercase">
                  {cat}
                </div>
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      loadExampleById(p.id);
                      setShowNewMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors"
                  >
                    {'★'.repeat(p.difficulty)}
                    {'☆'.repeat(4 - p.difficulty)} {p.title}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <button className={btnClass} onClick={toggleSaveModal}>
        <Save size={12} />
        <span className="hidden sm:inline">Save</span>
      </button>

      <button className={btnClass} onClick={toggleHistory}>
        <FolderOpen size={12} />
        <span className="hidden sm:inline">History</span>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept=".iotstudio"
        onChange={handleImport}
        className="hidden"
      />
      <button
        className={btnClass}
        onClick={() => fileRef.current?.click()}
      >
        <Upload size={12} />
        <span className="hidden md:inline">Import</span>
      </button>

      {/* Export dropdown */}
      <div className="relative">
        <button
          className={btnClass}
          onClick={() => {
            setShowExportMenu(!showExportMenu);
            setShowNewMenu(false);
          }}
        >
          <Download size={12} />
          <span className="hidden md:inline">Export</span>
          <ChevronDown size={10} />
        </button>
        {showExportMenu && (
          <div className="absolute top-full left-0 mt-1 w-52 bg-bg-elevated/95 backdrop-blur-sm border border-border rounded-xl shadow-xl z-50">
            <button
              onClick={handleExportProject}
              className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors flex items-center gap-2"
            >
              <Download size={12} />
              Export Project (.iotstudio)
            </button>
            <button
              onClick={handleExportArduino}
              className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors flex items-center gap-2"
            >
              <FileCode size={12} />
              Export Arduino (.ino)
            </button>
          </div>
        )}
      </div>

      <div className="flex-1" />

      <button
        className={btnClass}
        onClick={toggleCharts}
      >
        <BarChart3 size={12} />
        <span className="hidden md:inline">Charts</span>
      </button>

      {/* Run/Stop */}
      <button
        onClick={isRunning ? onStop : onRun}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
          isRunning
            ? 'bg-error/20 text-error hover:bg-error/30'
            : 'bg-accent text-white hover:bg-accent-hover',
          !isRunning && 'animate-run-ripple'
        )}
      >
        {isRunning ? (
          <>
            <Square size={12} />
            Stop
          </>
        ) : (
          <>
            <Play size={12} />
            Run
          </>
        )}
      </button>

      <button
        onClick={toggleTheme}
        className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
        title="Toggle Theme"
      >
        {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
      </button>

      <button
        onClick={toggleSettings}
        className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
      >
        <Settings size={14} />
      </button>

      {/* Close dropdowns on outside click */}
      {(showNewMenu || showExportMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNewMenu(false);
            setShowExportMenu(false);
          }}
        />
      )}
    </div>
  );
}
