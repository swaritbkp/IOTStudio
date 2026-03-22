import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { useBoardStore } from '../../store/boardStore';
import { useCodeStore } from '../../store/codeStore';

interface Props {
  onSelect: (text: string) => void;
}

export function SuggestionChips({ onSelect }: Props) {
  const nodes = useBoardStore((s) => s.nodes);
  const code = useCodeStore((s) => s.code);
  const error = useCodeStore((s) => s.error);

  const suggestions = useMemo(() => {
    const chips: string[] = [];
    const names = useBoardStore.getState().getComponentNames();

    if (error) {
      chips.push(`Fix: ${error.substring(0, 50)}`);
    }

    if (nodes.length === 0) {
      chips.push('Build a traffic light');
      chips.push('Build a weather station');
      chips.push('Build a smart fan');
      return chips;
    }

    const hasCode = code.includes('function loop');
    const hasLed = names.actuators.some((n) => n.includes('LED'));
    const hasTemp = names.sensors.some((n) => n.includes('Temperature'));
    const hasServo = names.actuators.some((n) => n.includes('Servo'));
    const hasLCD = names.actuators.some((n) => n.includes('LCD'));
    const hasMotor = names.actuators.some((n) => n.includes('Motor'));

    if (!hasCode) {
      if (hasLed) chips.push('Blink the LED');
      if (hasTemp && hasLed) chips.push('Temperature alarm');
      if (hasTemp && hasLCD) chips.push('Show temp on LCD');
      if (hasServo) chips.push('Sweep the servo');
      if (hasMotor && hasTemp) chips.push('Smart fan control');
      if (chips.length === 0) chips.push('Generate code for this circuit');
    } else {
      chips.push('Explain this code');
      chips.push('Add data logging');
      chips.push('Optimize the code');
    }

    return chips.slice(0, 3);
  }, [nodes, code, error]);

  if (suggestions.length === 0) return null;

  return (
    <div className="flex gap-1.5 flex-wrap">
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-muted text-accent text-[11px] hover:bg-accent/20 transition-colors"
        >
          <Sparkles size={10} />
          {s}
        </button>
      ))}
    </div>
  );
}
