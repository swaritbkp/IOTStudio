import { memo } from 'react';
import { FolderOpen, Download, Trash2 } from 'lucide-react';
import type { SavedProject } from '../../engine/types';

interface Props {
  project: SavedProject;
  onLoad: () => void;
  onExport: () => void;
  onDelete: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const ProjectCard = memo(
  ({ project, onLoad, onExport, onDelete }: Props) => {
    const nodeCount =
      Array.isArray(project.boardState?.nodes)
        ? project.boardState.nodes.length
        : 0;

    return (
      <div className="bg-bg-surface border border-border rounded-xl p-3 hover:border-border-active transition-colors">
        <div className="flex items-start justify-between mb-1.5">
          <div className="min-w-0">
            <div className="text-sm font-medium text-text-primary truncate">
              {project.name}
            </div>
            <div className="text-[10px] text-text-muted">
              {timeAgo(project.updatedAt)} &middot; {nodeCount} components
            </div>
          </div>
        </div>

        {project.description && (
          <div className="text-xs text-text-secondary mb-2 line-clamp-1">
            {project.description}
          </div>
        )}

        <div className="flex gap-1.5">
          <button
            onClick={onLoad}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/20 text-accent text-[11px] hover:bg-accent/30 transition-colors"
          >
            <FolderOpen size={10} />
            Load
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-bg-elevated text-text-secondary text-[11px] hover:text-text-primary transition-colors"
          >
            <Download size={10} />
            Export
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-bg-elevated text-text-secondary text-[11px] hover:text-error transition-colors ml-auto"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>
    );
  }
);

ProjectCard.displayName = 'ProjectCard';
