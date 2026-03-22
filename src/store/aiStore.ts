import { create } from 'zustand';
import type { ChatMessage } from '../engine/types';
import { DEFAULT_MODEL } from '../data/models';
import { streamChat } from '../utils/openrouter';
import { useBoardStore } from './boardStore';
import { useCodeStore } from './codeStore';

const API_KEY_STORAGE = 'iotstudio_openrouter_key';
const MODEL_STORAGE = 'iotstudio_selected_model';

function getStoredKey(): string {
  return (
    localStorage.getItem(API_KEY_STORAGE) ||
    (import.meta.env.VITE_OPENROUTER_KEY as string) ||
    (import.meta.env.VITE_DEFAULT_OPENROUTER_KEY as string) ||
    ''
  );
}

function buildSystemPrompt(): string {
  const { nodes, edges } = useBoardStore.getState();
  const { code } = useCodeStore.getState();

  const components = nodes
    .map(
      (n) =>
        `- ${(n.data as { label?: string }).label || n.id} (${(n.data as { componentType?: string }).componentType || n.type})`
    )
    .join('\n');

  const connections = edges
    .map((e) => `- ${e.source} → ${e.target}`)
    .join('\n');

  return `You are the IoT Studio AI assistant by Bilota AI. You help users build IoT circuits and write simulation code.

CURRENT BOARD STATE:
Components:
${components || '(empty board)'}

Connections:
${connections || '(no connections)'}

Current Code:
${code || '(no code yet)'}

SIMULATION API (the ONLY API available):
- readSensor(name) → number | boolean | object
- writeActuator(name, value) → void
- log(message) → void (prints to Serial Monitor)
- logData(key, value) → void (sends to chart)
- delay(ms) → void
- millis() → number
- map(value, fromLow, fromHigh, toLow, toHigh) → number
- constrain(value, low, high) → number
- Constants: HIGH=1, LOW=0

Code pattern:
function setup() { /* runs once */ }
function loop() { /* runs repeatedly */ }

RULES:
- Use EXACT component names from the board state above
- Write ONLY valid JavaScript using the API above
- Keep explanations concise
- When asked to generate a circuit or diagram, output EXACTLY this JSON block format:
\`\`\`json
{
  "title": "Circuit Name",
  "components": [
    { "type": "arduino_uno", "position": { "x": 200, "y": 200 } },
    { "type": "led_red", "position": { "x": 500, "y": 200 } }
  ],
  "connections": [
    { "sourceType": "arduino_uno", "sourcePin": "D13", "targetType": "led_red", "targetPin": "ANODE" }
  ],
  "code": "let state = LOW;\\nfunction setup() { log('start'); }\\nfunction loop() { state = state === LOW ? HIGH : LOW; writeActuator('LED 1', state); delay(1000); }"
}
\`\`\`
Valid component types: arduino_uno, esp32, raspberry_pi_pico, dht11, button, potentiometer, led_red, rgb_led, servo, buzzer, lcd_16x2.
- When asked to generate code, output a complete code block with setup() + loop()`;
}

interface AIState {
  messages: ChatMessage[];
  selectedModel: string;
  apiKey: string;
  isLoading: boolean;
  isStreaming: boolean;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}

export const useAIStore = create<AIState>()((set, get) => ({
  messages: [],
  selectedModel: localStorage.getItem(MODEL_STORAGE) || DEFAULT_MODEL,
  apiKey: getStoredKey(),
  isLoading: false,
  isStreaming: false,

  setApiKey: (key) => {
    localStorage.setItem(API_KEY_STORAGE, key);
    set({ apiKey: key });
  },

  setModel: (model) => {
    localStorage.setItem(MODEL_STORAGE, model);
    set({ selectedModel: model });
  },

  sendMessage: async (content) => {
    const { apiKey, selectedModel, messages } = get();
    // Use user key, env key, or empty string (triggers server proxy fallback)
    const activeKey = apiKey || (import.meta.env.VITE_OPENROUTER_KEY as string) || '';

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      model: selectedModel,
      timestamp: Date.now(),
    };

    set({
      messages: [...messages, userMsg, assistantMsg],
      isLoading: true,
      isStreaming: true,
    });

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      let fullContent = '';
      for await (const chunk of streamChat(
        activeKey,
        selectedModel,
        history,
        buildSystemPrompt()
      )) {
        fullContent += chunk;
        set((state) => {
          const msgs = [...state.messages];
          const last = msgs[msgs.length - 1];
          if (last) {
            msgs[msgs.length - 1] = { ...last, content: fullContent };
          }
          return { messages: msgs };
        });
      }
    } catch (err) {
      set((state) => {
        const msgs = [...state.messages];
        const last = msgs[msgs.length - 1];
        if (last) {
          msgs[msgs.length - 1] = {
            ...last,
            content: `Error: ${err instanceof Error ? err.message : 'Failed to get response'}`,
          };
        }
        return { messages: msgs };
      });
    } finally {
      set({ isLoading: false, isStreaming: false });
    }
  },

  clearChat: () => set({ messages: [] }),
}));
