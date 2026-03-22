import { create } from 'zustand';

interface DataPoint {
  timestamp: number;
  value: number;
}

const MAX_POINTS = 200;

interface ChartState {
  series: Record<string, DataPoint[]>;
  addDataPoint: (key: string, value: number, timestamp: number) => void;
  clearData: () => void;
}

export const useChartStore = create<ChartState>()((set) => ({
  series: {},
  addDataPoint: (key, value, timestamp) =>
    set((state) => {
      const existing = state.series[key] || [];
      const updated = [...existing, { timestamp, value }].slice(-MAX_POINTS);
      return { series: { ...state.series, [key]: updated } };
    }),
  clearData: () => set({ series: {} }),
}));
