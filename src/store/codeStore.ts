import { create } from 'zustand';
import type { SerialLogEntry } from '../engine/types';

const MAX_LOGS = 500;

interface CodeState {
  code: string;
  isRunning: boolean;
  speed: number;
  serialLogs: SerialLogEntry[];
  error: string | null;
  setCode: (code: string) => void;
  setRunning: (running: boolean) => void;
  setSpeed: (speed: number) => void;
  addLog: (message: string, timestamp: number) => void;
  clearLogs: () => void;
  setError: (error: string | null) => void;
}

export const useCodeStore = create<CodeState>()((set) => ({
  code: '',
  isRunning: false,
  speed: 1,
  serialLogs: [],
  error: null,
  setCode: (code) => set({ code }),
  setRunning: (isRunning) => set({ isRunning }),
  setSpeed: (speed) => set({ speed }),
  addLog: (message, timestamp) =>
    set((state) => {
      const logs = [...state.serialLogs, { message, timestamp }];
      return { serialLogs: logs.slice(-MAX_LOGS) };
    }),
  clearLogs: () => set({ serialLogs: [] }),
  setError: (error) => set({ error }),
}));
