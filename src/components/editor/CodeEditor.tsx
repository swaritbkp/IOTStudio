import { useRef, useEffect } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import type { ViewUpdate } from '@codemirror/view';
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
