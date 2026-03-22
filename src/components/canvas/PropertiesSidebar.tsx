import { useBoardStore } from '../../store/boardStore';

export function PropertiesSidebar() {
  const nodes = useBoardStore((s) => s.nodes);
  const updateNodeSettings = useBoardStore((s) => s.updateNodeSettings);
  
  const selectedNode = nodes.find((n) => n.selected);

  if (!selectedNode) return null;

  const data = selectedNode.data as any;

  return (
    <div className="absolute right-4 top-4 w-64 bg-bg-secondary border border-border rounded-lg shadow-xl overflow-hidden z-50 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-border bg-bg-tertiary">
        <h3 className="text-sm font-semibold text-text-primary">Properties</h3>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Component Name
          </label>
          <input
            type="text"
            className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent"
            value={data.label || ''}
            onChange={(e) => updateNodeSettings(selectedNode.id, { label: e.target.value })}
            placeholder="e.g. Temperature 1"
          />
        </div>

        {data.category !== 'microcontroller' && data.simulationType !== 'digital' && (
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Initial Value
            </label>
            <input
              type="number"
              className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent"
              value={data.liveValue !== undefined ? Number(data.liveValue) : 0}
              onChange={(e) => updateNodeSettings(selectedNode.id, { liveValue: parseFloat(e.target.value) })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
