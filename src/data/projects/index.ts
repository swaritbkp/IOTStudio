import { beginnerProjects } from './beginner';
import { intermediateProjects } from './intermediate';
import { advancedProjects } from './advanced';
import { expertProjects } from './expert';
import type { ProjectDef } from '../../engine/types';

export const ALL_PROJECTS: ProjectDef[] = [
  ...beginnerProjects,
  ...intermediateProjects,
  ...advancedProjects,
  ...expertProjects,
];

export const PROJECTS_BY_CATEGORY = {
  Beginner: beginnerProjects,
  Intermediate: intermediateProjects,
  Advanced: advancedProjects,
  Expert: expertProjects,
} as const;

export function getProjectById(id: string): ProjectDef | undefined {
  return ALL_PROJECTS.find((p) => p.id === id);
}
