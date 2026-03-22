import { create } from 'zustand';

interface UIState {
  showPalette: boolean;
  showHistory: boolean;
  showSettings: boolean;
  showApiRef: boolean;
  showSaveModal: boolean;
  showCharts: boolean;
  activeTab: 'canvas' | 'code' | 'ai' | 'history';
  palettePanelWidth: number;
  editorPanelWidth: number;
  togglePalette: () => void;
  toggleHistory: () => void;
  toggleSettings: () => void;
  toggleApiRef: () => void;
  toggleSaveModal: () => void;
  toggleCharts: () => void;
  setActiveTab: (tab: UIState['activeTab']) => void;
  setPalettePanelWidth: (w: number) => void;
  setEditorPanelWidth: (w: number) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  showPalette: true,
  showHistory: false,
  showSettings: false,
  showApiRef: false,
  showSaveModal: false,
  showCharts: false,
  activeTab: 'canvas',
  palettePanelWidth: 240,
  editorPanelWidth: 420,
  togglePalette: () => set((s) => ({ showPalette: !s.showPalette })),
  toggleHistory: () => set((s) => ({ showHistory: !s.showHistory })),
  toggleSettings: () => set((s) => ({ showSettings: !s.showSettings })),
  toggleApiRef: () => set((s) => ({ showApiRef: !s.showApiRef })),
  toggleSaveModal: () => set((s) => ({ showSaveModal: !s.showSaveModal })),
  toggleCharts: () => set((s) => ({ showCharts: !s.showCharts })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setPalettePanelWidth: (w) => set({ palettePanelWidth: w }),
  setEditorPanelWidth: (w) => set({ editorPanelWidth: w }),
}));
