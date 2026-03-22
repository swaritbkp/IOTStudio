import { Layout, Code2, Bot, FolderOpen } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useUIStore } from '../../store/uiStore';

const TABS = [
  { key: 'canvas' as const, label: 'Canvas', icon: Layout },
  { key: 'code' as const, label: 'Code', icon: Code2 },
  { key: 'ai' as const, label: 'AI', icon: Bot },
  { key: 'history' as const, label: 'History', icon: FolderOpen },
];

export function BottomTabBar() {
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);

  return (
    <div className="flex items-center justify-around h-14 bg-bg-surface border-t border-border lg:hidden">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={cn(
            'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors min-w-[60px]',
            activeTab === key
              ? 'text-accent'
              : 'text-text-muted hover:text-text-secondary'
          )}
        >
          <Icon size={18} />
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}
