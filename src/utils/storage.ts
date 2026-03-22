import { get, set, del, keys } from 'idb-keyval';
import type { SavedProject } from '../engine/types';

const PROJECT_PREFIX = 'project:';
const AUTOSAVE_KEY = 'autosave';
const SETTINGS_KEY = 'settings';

export const storage = {
  async saveProject(project: SavedProject): Promise<void> {
    await set(`${PROJECT_PREFIX}${project.id}`, project);
  },

  async loadProject(id: string): Promise<SavedProject | undefined> {
    return get(`${PROJECT_PREFIX}${id}`);
  },

  async listProjects(): Promise<SavedProject[]> {
    const allKeys = await keys();
    const projectKeys = allKeys.filter((k) => String(k).startsWith(PROJECT_PREFIX));
    const projects: SavedProject[] = [];
    for (const key of projectKeys) {
      const p = await get(key);
      if (p) projects.push(p as SavedProject);
    }
    return projects.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  async deleteProject(id: string): Promise<void> {
    await del(`${PROJECT_PREFIX}${id}`);
  },

  async autoSave(state: {
    boardState: SavedProject['boardState'];
    code: string;
  }): Promise<void> {
    await set(AUTOSAVE_KEY, { ...state, updatedAt: new Date().toISOString() });
  },

  async getAutoSave(): Promise<
    | { boardState: SavedProject['boardState']; code: string; updatedAt: string }
    | undefined
  > {
    return get(AUTOSAVE_KEY);
  },

  async saveSettings(settings: Record<string, unknown>): Promise<void> {
    await set(SETTINGS_KEY, settings);
  },

  async getSettings(): Promise<Record<string, unknown> | undefined> {
    return get(SETTINGS_KEY);
  },
};
