import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useChartStore } from '../../store/chartStore';
import { X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useState } from 'react';
import { cn } from '../../utils/cn';

const COLORS = [
  '#10B981',
  '#3B82F6',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
];

export function DataCharts() {
  const series = useChartStore((s) => s.series);
  const show = useUIStore((s) => s.showCharts);
  const toggle = useUIStore((s) => s.toggleCharts);
  const [oscilloscope, setOscilloscope] = useState(false);

  const { data, keys } = useMemo(() => {
    const seriesKeys = Object.keys(series);
    if (seriesKeys.length === 0) return { data: [], keys: [] };

    // Merge all series into chart data points
    const allTimestamps = new Set<number>();
    for (const key of seriesKeys) {
      for (const point of series[key] || []) {
        allTimestamps.add(point.timestamp);
      }
    }

    const sortedTs = Array.from(allTimestamps).sort((a, b) => a - b);
    const merged = sortedTs.map((ts) => {
      const row: Record<string, number> = { time: ts / 1000 };
      for (const key of seriesKeys) {
        const points = series[key] || [];
        const point = points.find((p) => p.timestamp === ts);
        if (point) row[key] = point.value;
      }
      return row;
    });

    if (oscilloscope && merged.length > 50) {
      return { data: merged.slice(-50), keys: seriesKeys };
    }
    return { data: merged, keys: seriesKeys };
  }, [series, oscilloscope]);

  if (!show || keys.length === 0) return null;

  return (
    <div className="bg-bg-surface border-t border-border p-3 h-48">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary font-medium">
            Data Charts
          </span>
          <button
            onClick={() => setOscilloscope(!oscilloscope)}
            className={cn(
              "px-1.5 py-0.5 rounded text-[9px] transition-colors border",
              oscilloscope
                ? "bg-accent/20 text-accent border-accent/40"
                : "bg-bg-surface text-text-muted border-border hover:text-text-primary"
            )}
            title="Rolling window view"
          >
            Oscilloscope
          </button>
        </div>
        <button
          onClick={toggle}
          className="p-1 rounded hover:bg-bg-elevated text-text-muted"
        >
          <X size={12} />
        </button>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#252D38" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 9, fill: '#5A6577' }}
            tickFormatter={(v: number) => `${v.toFixed(0)}s`}
          />
          <YAxis tick={{ fontSize: 9, fill: '#5A6577' }} width={40} />
          <Tooltip
            contentStyle={{
              background: '#1C2128',
              border: '1px solid #252D38',
              borderRadius: 8,
              fontSize: 11,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 10 }}
            iconSize={8}
          />
          {keys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
