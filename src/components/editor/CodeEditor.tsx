import { useRef, useEffect } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { ViewUpdate, hoverTooltip } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { autocompletion } from '@codemirror/autocomplete';
import { useCodeStore } from '../../store/codeStore';

const iotCompletions = [
  { label: 'readSensor', type: 'function', info: '(name: string) → number | boolean' },
  { label: 'writeActuator', type: 'function', info: '(name: string, value: any) → void' },
  { label: 'log', type: 'function', info: '(message: any) → void' },
  { label: 'logData', type: 'function', info: '(key: string, value: number) → void' },
  { label: 'delay', type: 'function', info: '(ms: number) → void' },
  { label: 'millis', type: 'function', info: '() → number' },
  { label: 'map', type: 'function', info: '(value, fromLow, fromHigh, toLow, toHigh) → number' },
  { label: 'constrain', type: 'function', info: '(value, low, high) → number' },
  { label: 'HIGH', type: 'constant', info: '1' },
  { label: 'LOW', type: 'constant', info: '0' },
];

const apiDocs: Record<string, string> = {
  readSensor: "readSensor(name: string) -> number | boolean\nReads the current value of a sensor (e.g., 'Temperature 1').",
  writeActuator: "writeActuator(name: string, value: any) -> void\nWrites a value to an actuator (e.g., 'LED 1', HIGH).",
  log: "log(message: any) -> void\nPrints a message or value to the Serial Monitor at the bottom.",
  logData: "logData(key: string, value: number) -> void\nPlots a numerical value to the real-time Data Chart.",
  delay: "delay(ms: number) -> void\nPauses the simulation execution for a set number of milliseconds.",
  millis: "millis() -> number\nReturns the total number of simulated milliseconds since the board started.",
  map: "map(value, fromLow, fromHigh, toLow, toHigh) -> number\nMathematically re-maps a number from one range to another.",
  constrain: "constrain(value, low, high) -> number\nConstrains a number to be within a specific range."
};

const tooltipExtension = hoverTooltip((view, pos, side) => {
  const {from, to, text} = view.state.doc.lineAt(pos);
  let start = pos, end = pos;
  while (start > from && /\w/.test(text[start - 1 - from] || '')) start--;
  while (end < to && /\w/.test(text[end - from] || '')) end++;
  if ((start === pos && side < 0) || (end === pos && side > 0)) return null;
  const word = text.slice(start - from, end - from);
  const doc = apiDocs[word];
  if (doc) {
    return {
      pos: start,
      end,
      above: true,
      create() {
        const dom = document.createElement("div");
        dom.className = "p-2 text-xs font-[family-name:var(--font-code)] bg-[#1e2329] border border-[#2d333b] shadow-xl rounded-md max-w-xs whitespace-pre-wrap text-emerald-300";
        dom.textContent = doc;
        return {dom};
      }
    };
  }
  return null;
});

export function CodeEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const isExternalUpdate = useRef(false);

  const code = useCodeStore((s) => s.code);
  const setCode = useCodeStore((s) => s.setCode);

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        javascript(),
        oneDark,
        autocompletion({
          override: [
            (context) => {
              const word = context.matchBefore(/\w*/);
              if (!word || (word.from === word.to && !context.explicit))
                return null;
              return {
                from: word.from,
                options: iotCompletions,
              };
            },
          ],
        }),
        tooltipExtension,
        EditorView.updateListener.of((update: ViewUpdate) => {
          if (update.docChanged && !isExternalUpdate.current) {
            setCode(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '13px',
          },
          '.cm-scroller': {
            fontFamily: 'var(--font-code)',
          },
          '.cm-gutters': {
            background: '#0C0F12',
            border: 'none',
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external code changes into CM
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== code) {
      isExternalUpdate.current = true;
      view.dispatch({
        changes: {
          from: 0,
          to: currentDoc.length,
          insert: code,
        },
      });
      isExternalUpdate.current = false;
    }
  }, [code]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden bg-bg-primary"
    />
  );
}
