import { create } from 'zustand';
import type { SavedProject } from '../engine/types';
import { storage } from '../utils/storage';
import { useBoardStore } from './boardStore';
import { useCodeStore } from './codeStore';

interface HistoryState {
  projects: SavedProject[];
  isLoading: boolean;
  loadProjects: () => Promise<void>;
  saveProject: (name: string, description?: string) => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  autoSave: () => Promise<void>;
  restoreAutoSave: () => Promise<boolean>;
  exportProject: (id: string) => Promise<void>;
  importProject: (file: File) => Promise<void>;
}

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  projects: [],
  isLoading: false,

  loadProjects: async () => {
    set({ isLoading: true });
    const projects = await storage.listProjects();
    set({ projects, isLoading: false });
  },

  saveProject: async (name, description) => {
    const { nodes, edges } = useBoardStore.getState();
    const { code } = useCodeStore.getState();

    const existing = get().projects.find((p) => p.name === name);
    const project: SavedProject = {
      id: existing?.id || crypto.randomUUID(),
      name,
      description,
      savedAt: existing?.savedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      boardState: {
        nodes: nodes as unknown[],
        edges: edges as unknown[],
        viewport: { x: 0, y: 0, zoom: 1 },
      },
      code,
    };

    await storage.saveProject(project);
    await get().loadProjects();
  },

  loadProject: async (id) => {
    const project = await storage.loadProject(id);
    if (!project) return;

    useBoardStore.getState().setNodes(project.boardState.nodes as never[]);
    useBoardStore.getState().setEdges(project.boardState.edges as never[]);
    useCodeStore.getState().setCode(project.code);
  },

  deleteProject: async (id) => {
    await storage.deleteProject(id);
    await get().loadProjects();
  },

  autoSave: async () => {
    const { nodes, edges } = useBoardStore.getState();
    const { code } = useCodeStore.getState();
    if (nodes.length === 0 && !code) return;

    await storage.autoSave({
      boardState: {
        nodes: nodes as unknown[],
        edges: edges as unknown[],
        viewport: { x: 0, y: 0, zoom: 1 },
      },
      code,
    });
  },

  restoreAutoSave: async () => {
    const saved = await storage.getAutoSave();
    if (!saved) return false;

    useBoardStore.getState().setNodes(saved.boardState.nodes as never[]);
    useBoardStore.getState().setEdges(saved.boardState.edges as never[]);
    useCodeStore.getState().setCode(saved.code);
    return true;
  },

  exportProject: async (id) => {
    const project = await storage.loadProject(id);
    if (!project) return;
    const { exportProject: exp } = await import('../utils/projectSerializer');
    exp(project);
  },

  importProject: async (file) => {
    const { importProject: imp } = await import('../utils/projectSerializer');
    const project = await imp(file);
    await storage.saveProject(project);
    await get().loadProjects();

    useBoardStore.getState().setNodes(project.boardState.nodes as never[]);
    useBoardStore.getState().setEdges(project.boardState.edges as never[]);
    useCodeStore.getState().setCode(project.code);
  },
}));
