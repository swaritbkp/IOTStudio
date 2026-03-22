import { create } from 'zustand';
import {
  type Node,
  type Edge,
  type Connection,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import { getComponentDef } from '../data/components';
import { getAutoLayout } from '../utils/layout';

const instanceCounters: Record<string, number> = {};

function getNextInstanceName(type: string, displayName: string): string {
  const key = type;
  instanceCounters[key] = (instanceCounters[key] || 0) + 1;
  return `${displayName} ${instanceCounters[key]}`;
}

export function resetInstanceCounters() {
  Object.keys(instanceCounters).forEach((k) => delete instanceCounters[k]);
}

interface BoardState {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addComponent: (type: string, position?: { x: number; y: number }) => void;
  removeComponent: (nodeId: string) => void;
  clearBoard: () => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodeData: (name: string, value: unknown) => void;
  updateNodeSettings: (nodeId: string, updates: { label?: string; liveValue?: unknown }) => void;
  autoLayout: () => void;
  getComponentNames: () => {
    sensors: string[];
    actuators: string[];
    mcus: string[];
  };
}

export const useBoardStore = create<BoardState>()((set, get) => ({
  nodes: [],
  edges: [],

  onNodesChange: (changes) =>
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    })),

  onEdgesChange: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    })),

  onConnect: (connection) =>
    set((state) => ({
      edges: addEdge(
        {
          ...connection,
          id: `e-${connection.source}-${connection.target}-${Date.now()}`,
          type: 'wire',
          animated: false,
        },
        state.edges
      ),
    })),

  addComponent: (type, position) => {
    const def = getComponentDef(type);
    if (!def) return;

    const label = getNextInstanceName(type, def.name);
    const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const node: Node = {
      id,
      type: def.category === 'microcontroller' ? 'microcontroller' : def.category === 'sensor' ? 'sensor' : 'actuator',
      position: position || { x: 250 + Math.random() * 200, y: 150 + Math.random() * 200 },
      data: {
        label,
        componentType: type,
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

    set((state) => ({ nodes: [...state.nodes, node] }));
  },

  removeComponent: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
    })),

  clearBoard: () => {
    resetInstanceCounters();
    set({ nodes: [], edges: [] });
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  updateNodeData: (name, value) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        (n.data as { label?: string }).label === name
          ? { ...n, data: { ...n.data, liveValue: value } }
          : n
      ),
    })),

  updateNodeSettings: (nodeId, updates) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                ...(updates.label !== undefined ? { label: updates.label } : {}),
                ...(updates.liveValue !== undefined ? { liveValue: updates.liveValue } : {}),
              },
            }
          : n
      ),
    })),

  autoLayout: () => {
    const { nodes, edges } = get();
    const laid = getAutoLayout(nodes, edges);
    set({ nodes: laid });
  },

  getComponentNames: () => {
    const nodes = get().nodes;
    return {
      sensors: nodes
        .filter((n) => (n.data as { category?: string }).category === 'sensor')
        .map((n) => (n.data as { label: string }).label),
      actuators: nodes
        .filter(
          (n) => (n.data as { category?: string }).category === 'actuator'
        )
        .map((n) => (n.data as { label: string }).label),
      mcus: nodes
        .filter(
          (n) =>
            (n.data as { category?: string }).category === 'microcontroller'
        )
        .map((n) => (n.data as { label: string }).label),
    };
  },
}));
