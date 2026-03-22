import { memo } from 'react';
import * as Icons from 'lucide-react';
import type { ComponentDef } from '../../engine/types';
import { cn } from '../../utils/cn';

interface Props {
  component: ComponentDef;
  onClick: () => void;
}

export const ComponentCard = memo(({ component, onClick }: Props) => {
  const IconComp = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[component.icon] || Icons.Box;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl',
        'bg-bg-surface border border-border hover:border-accent/40',
        'transition-all hover:bg-bg-elevated cursor-pointer text-left'
      )}
    >
      <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center shrink-0 overflow-hidden">
        {component.imageUrl ? (
          <img src={component.imageUrl} alt={component.name} className="w-full h-full object-cover" />
        ) : (
          <IconComp size={16} className="text-accent" />
        )}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-text-primary truncate">
          {component.name}
        </div>
        <div className="text-[10px] text-text-muted truncate">
          {component.description}
        </div>
      </div>
    </button>
  );
});

ComponentCard.displayName = 'ComponentCard';
