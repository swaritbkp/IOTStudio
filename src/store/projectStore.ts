import { create } from 'zustand';
import type { ProjectDef } from '../engine/types';
import { STARTER_PROJECT } from '../data/starterProject';
import { getProjectById } from '../data/projects';
import { getComponentDef } from '../data/components';
import { useBoardStore, resetInstanceCounters } from './boardStore';
import { useCodeStore } from './codeStore';
import { useChartStore } from './chartStore';
import { useHistoryStore } from './historyStore';

interface ProjectState {
  currentName: string;
  currentId: string | null;
  isDirty: boolean;
  setName: (name: string) => void;
  setDirty: (dirty: boolean) => void;
  initialize: () => Promise<void>;
  loadProjectDef: (project: ProjectDef) => void;
  loadExampleById: (id: string) => void;
  newBlankProject: () => void;
}

function buildProjectNodes(project: ProjectDef) {
  resetInstanceCounters();
  const board = useBoardStore.getState();
  board.clearBoard();

  const nodeIdMap: Record<string, string> = {};
  const typeCounter: Record<string, number> = {};

  for (const comp of project.components) {
    const def = getComponentDef(comp.type);
    if (!def) continue;

    typeCounter[comp.type] = (typeCounter[comp.type] || 0) + 1;
    const instanceNum = typeCounter[comp.type]!;
    const label = `${def.name} ${instanceNum}`;
    const id = `${comp.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const mapKey = `${comp.type}-${instanceNum}`;
    nodeIdMap[mapKey] = id;

    const node = {
      id,
      type:
        def.category === 'microcontroller'
          ? 'microcontroller'
          : def.category === 'sensor'
            ? 'sensor'
            : 'actuator',
      position: comp.position,
      data: {
        label,
        componentType: comp.type,
        category: def.category,
        icon: def.icon,
        pins: def.pins,
        simulationType: def.simulationType,
        color: def.color,
        interactable: def.interactable,
        liveValue: def.defaultValue,
        description: def.description,
        nodeId: id,
      },
    };

    board.setNodes([...useBoardStore.getState().nodes, node]);
  }

  // Build edges from connections
  const edges = project.connections.map((conn, i) => {
    const sourceTypeCount: Record<string, number> = {};
    let sourceId = '';
    let targetId = '';

    for (const comp of project.components) {
      sourceTypeCount[comp.type] = (sourceTypeCount[comp.type] || 0) + 1;
      const key = `${comp.type}-${sourceTypeCount[comp.type]}`;
      if (comp.type === conn.sourceType && !sourceId) {
        sourceId = nodeIdMap[key] || '';
      }
      if (comp.type === conn.targetType && !targetId) {
        targetId = nodeIdMap[key] || '';
      }
    }

    return {
      id: `e-${i}-${Date.now()}`,
      source: sourceId,
      target: targetId,
      type: 'wire',
      sourceHandle: conn.sourcePin,
      targetHandle: conn.targetPin,
    };
  });

  board.setEdges(edges);
}

export const useProjectStore = create<ProjectState>()((set) => ({
  currentName: 'Blink LED',
  currentId: null,
  isDirty: false,

  setName: (name) => set({ currentName: name }),
  setDirty: (dirty) => set({ isDirty: dirty }),

  initialize: async () => {
    const restored = await useHistoryStore.getState().restoreAutoSave();
    if (restored) {
      set({ currentName: 'Auto-saved Project', isDirty: false });
      return;
    }
    // Load starter project
    const store = useProjectStore.getState();
    store.loadProjectDef(STARTER_PROJECT);
  },

  loadProjectDef: (project) => {
    useCodeStore.getState().setCode(project.code);
    useCodeStore.getState().setError(null);
    useCodeStore.getState().clearLogs();
    useChartStore.getState().clearData();
    buildProjectNodes(project);
    set({ currentName: project.title, currentId: project.id, isDirty: false });
  },

  loadExampleById: (id) => {
    const project = getProjectById(id);
    if (project) {
      useProjectStore.getState().loadProjectDef(project);
    }
  },

  newBlankProject: () => {
    useBoardStore.getState().clearBoard();
    useCodeStore.getState().setCode(`function setup() {\n  log("Hello IoT Studio!");\n}\n\nfunction loop() {\n  // Your code here\n  delay(1000);\n}`);
    useCodeStore.getState().setError(null);
    useCodeStore.getState().clearLogs();
    useChartStore.getState().clearData();
    set({ currentName: 'Untitled Project', currentId: null, isDirty: false });
  },
}));
