import { CommandBar } from './CommandBar';
import { BottomTabBar } from './BottomTabBar';
import { ResizablePanel } from './ResizablePanel';
import { ComponentPalette } from '../palette/ComponentPalette';
import { CircuitCanvas } from '../canvas/CircuitCanvas';
import { CodeEditor } from '../editor/CodeEditor';
import { EditorToolbar } from '../editor/EditorToolbar';
import { SerialMonitor } from '../editor/SerialMonitor';
import { ApiReference } from '../editor/ApiReference';
import { AIDock } from '../ai/AIDock';
import { DataCharts } from '../charts/DataCharts';
import { HistoryPanel } from '../history/HistoryPanel';
import { SaveModal } from '../history/SaveModal';
import { SettingsModal } from '../settings/SettingsModal';
import { useUIStore } from '../../store/uiStore';

interface Props {
  onRun: () => void;
  onStop: () => void;
}

export function AppShell({ onRun, onStop }: Props) {
  const showSaveModal = useUIStore((s) => s.showSaveModal);
  const activeTab = useUIStore((s) => s.activeTab);
  const showPalette = useUIStore((s) => s.showPalette);
  const theme = useUIStore((s) => s.theme);

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${theme === 'light' ? 'light' : 'dark'} bg-bg-primary text-text-primary transition-colors duration-300`}>
      <CommandBar onRun={onRun} onStop={onStop} />

      {/* Desktop layout */}
      <div className="flex-1 hidden lg:flex overflow-hidden relative">
        {/* Palette */}
        {showPalette && (
          <div className="w-[240px] shrink-0 overflow-hidden">
            <ComponentPalette />
          </div>
        )}

        {/* Main area: Canvas + Editor split */}
        <ResizablePanel initialSplit={55}>
          <CircuitCanvas />
          <div className="flex flex-col h-full relative">
            <EditorToolbar onRun={onRun} onStop={onStop} />
            <div className="flex-1 overflow-hidden relative">
              <CodeEditor />
              <ApiReference />
            </div>
            <div className="h-[140px] shrink-0">
              <SerialMonitor />
            </div>
          </div>
        </ResizablePanel>

        {/* History panel overlay */}
        <HistoryPanel />
      </div>

      {/* Data Charts (below main area on desktop) */}
      <div className="hidden lg:block">
        <DataCharts />
      </div>

      {/* AI Dock (bottom on desktop) */}
      <div className="hidden lg:block">
        <AIDock />
      </div>

      {/* Mobile layout */}
      <div className="flex-1 lg:hidden overflow-hidden">
        {activeTab === 'canvas' && (
          <div className="h-full flex flex-col">
            <CircuitCanvas />
            <div className="absolute bottom-16 right-4 z-10">
              <button
                onClick={() => useUIStore.getState().togglePalette()}
                className="w-12 h-12 rounded-full bg-accent text-white shadow-lg flex items-center justify-center text-xl"
              >
                +
              </button>
            </div>
            {showPalette && (
              <div className="absolute inset-x-0 bottom-14 h-[60%] z-20 bg-bg-primary border-t border-border rounded-t-2xl overflow-hidden">
                <ComponentPalette />
              </div>
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <div className="h-full flex flex-col">
            <EditorToolbar onRun={onRun} onStop={onStop} />
            <div className="flex-1 overflow-hidden relative">
              <CodeEditor />
              <ApiReference />
            </div>
            <div className="h-[120px] shrink-0">
              <SerialMonitor />
            </div>
            <DataCharts />
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="h-full flex flex-col">
            <AIDock />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="h-full relative">
            <HistoryPanel forceShow />
          </div>
        )}
      </div>

      {/* Bottom tab bar (mobile only) */}
      <BottomTabBar />

      {/* Modals */}
      {showSaveModal && <SaveModal />}
      <SettingsModal />
    </div>
  );
}
