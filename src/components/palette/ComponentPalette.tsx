import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { COMPONENTS, getComponentsByCategory } from '../../data/components';
import { useBoardStore } from '../../store/boardStore';
import { ComponentCard } from './ComponentCard';

const CATEGORIES = [
  { key: 'microcontroller' as const, label: 'Microcontrollers' },
  { key: 'sensor' as const, label: 'Sensors' },
  { key: 'actuator' as const, label: 'Actuators' },
  { key: 'module' as const, label: 'Modules' },
];

export function ComponentPalette() {
  const [search, setSearch] = useState('');
  const addComponent = useBoardStore((s) => s.addComponent);

  const filtered = useMemo(() => {
    if (!search) return null;
    const q = search.toLowerCase();
    return COMPONENTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="h-full flex flex-col bg-bg-primary border-r border-border">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search components..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {filtered ? (
          <div className="space-y-1">
            {filtered.map((c) => (
              <ComponentCard
                key={c.type}
                component={c}
                onClick={() => addComponent(c.type)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="text-xs text-text-muted text-center py-4">
                No components found
              </div>
            )}
          </div>
        ) : (
          CATEGORIES.map((cat) => {
            const items = getComponentsByCategory(cat.key);
            return (
              <div key={cat.key}>
                <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider px-1 mb-1">
                  {cat.label}
                </div>
                <div className="space-y-1">
                  {items.map((c) => (
                    <ComponentCard
                      key={c.type}
                      component={c}
                      onClick={() => addComponent(c.type)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
