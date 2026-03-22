import { useEffect, useRef, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AppShell } from './components/layout/AppShell';
import { SimulationEngine } from './engine/SimulationEngine';
import { useBoardStore } from './store/boardStore';
import { useCodeStore } from './store/codeStore';
import { useChartStore } from './store/chartStore';
import { useProjectStore } from './store/projectStore';
import { useHistoryStore } from './store/historyStore';
import { useUIStore } from './store/uiStore';

export default function App() {
  const engineRef = useRef<SimulationEngine | null>(null);
  const setRunning = useCodeStore((s) => s.setRunning);
  const addLog = useCodeStore((s) => s.addLog);
  const setError = useCodeStore((s) => s.setError);
  const addDataPoint = useChartStore((s) => s.addDataPoint);
  const updateNodeData = useBoardStore((s) => s.updateNodeData);
  const initializeProject = useProjectStore((s) => s.initialize);
  const autoSave = useHistoryStore((s) => s.autoSave);

  useEffect(() => {
    initializeProject();
  }, [initializeProject]);

  // Auto-save every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      autoSave();
    }, 60000);
    return () => clearInterval(interval);
  }, [autoSave]);

  const handleRun = useCallback(() => {
    const { code, speed } = useCodeStore.getState();
    const { nodes } = useBoardStore.getState();

    useCodeStore.getState().clearLogs();
    useChartStore.getState().clearData();
    setError(null);

    const engine = new SimulationEngine({
      onActuatorChange: (name, value) => {
        updateNodeData(name, value);
      },
      onLog: (msg, ts) => {
        addLog(msg, ts);
      },
      onLogData: (key, value, ts) => {
        addDataPoint(key, value, ts);
      },
      onError: (err) => {
        setError(err);
        setRunning(false);
      },
    });

    engine.start(code, speed, nodes);
    engineRef.current = engine;
    setRunning(true);
  }, [setRunning, addLog, setError, addDataPoint, updateNodeData]);

  const handleStop = useCallback(() => {
    engineRef.current?.stop();
    engineRef.current = null;
    setRunning(false);
  }, [setRunning]);

  // Update speed while running
  useEffect(() => {
    const unsub = useCodeStore.subscribe((state, prevState) => {
      if (engineRef.current?.isActive() && state.speed !== prevState.speed) {
        const speed = state.speed;
        const { code } = useCodeStore.getState();
        const { nodes } = useBoardStore.getState();
        engineRef.current.stop();

        const engine = new SimulationEngine({
          onActuatorChange: (name, value) => {
            updateNodeData(name, value);
          },
          onLog: (msg, ts) => {
            addLog(msg, ts);
          },
          onLogData: (key, value, ts) => {
            addDataPoint(key, value, ts);
          },
          onError: (err) => {
            setError(err);
            setRunning(false);
          },
        });
        engine.start(code, speed, nodes);
        engineRef.current = engine;
      }
    });
    return unsub;
  }, [updateNodeData, addLog, addDataPoint, setError, setRunning]);

  // Wire sensor UI controls to running engine
  useEffect(() => {
    const unsub = useBoardStore.subscribe((state, prev) => {
      if (!engineRef.current?.isActive()) return;
      for (const node of state.nodes) {
        const prevNode = prev.nodes.find((n) => n.id === node.id);
        if (
          prevNode &&
          (node.data as { category?: string }).category === 'sensor' &&
          (node.data as { liveValue?: unknown }).liveValue !==
            (prevNode.data as { liveValue?: unknown }).liveValue
        ) {
          engineRef.current.setSensorValue(
            (node.data as { label: string }).label,
            (node.data as { liveValue: unknown }).liveValue
          );
        }
      }
    });
    return unsub;
  }, []);

  // Apply theme class to <html> element for CSS variable switching
  const theme = useUIStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.remove(theme === 'light' ? 'dark' : 'light');
  }, [theme]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        useUIStore.getState().toggleSaveModal();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const isRunning = useCodeStore.getState().isRunning;
        if (isRunning) handleStop();
        else handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun, handleStop]);

  return (
    <ReactFlowProvider>
      <AppShell onRun={handleRun} onStop={handleStop} />
    </ReactFlowProvider>
  );
}
