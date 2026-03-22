import type { ModelDef } from '../engine/types';

export const FREE_MODELS: ModelDef[] = [
  // Code
  { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder 480B', provider: 'Qwen', context: 262000, category: 'code' },
  { id: 'openai/gpt-oss-120b:free', name: 'GPT-OSS 120B', provider: 'OpenAI', context: 131000, category: 'code' },

  // Reasoning
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron 3 Super', provider: 'NVIDIA', context: 262000, category: 'reasoning' },
  { id: 'arcee-ai/trinity-large-preview:free', name: 'Trinity Large', provider: 'Arcee', context: 131000, category: 'reasoning' },

  // General
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', provider: 'Meta', context: 66000, category: 'general', isDefault: true },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3.1', provider: 'Mistral', context: 128000, category: 'general' },
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B', provider: 'Google', context: 131000, category: 'general' },
  { id: 'minimax/minimax-m2.5:free', name: 'MiniMax M2.5', provider: 'MiniMax', context: 197000, category: 'general' },
  { id: 'z-ai/glm-4.5-air:free', name: 'GLM 4.5 Air', provider: 'Z.ai', context: 131000, category: 'general' },

  // Lightweight
  { id: 'qwen/qwen3-4b:free', name: 'Qwen3 4B', provider: 'Qwen', context: 41000, category: 'lightweight' },
  { id: 'google/gemma-3-4b-it:free', name: 'Gemma 3 4B', provider: 'Google', context: 33000, category: 'lightweight' },
  { id: 'nvidia/nemotron-nano-9b-v2:free', name: 'Nemotron Nano 9B', provider: 'NVIDIA', context: 128000, category: 'lightweight' },
  { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B', provider: 'Meta', context: 131000, category: 'lightweight' },

  // Auto
  { id: 'openrouter/free', name: 'Auto (Let OpenRouter Pick)', provider: 'OpenRouter', context: 200000, category: 'auto' },
];

export const MODEL_CATEGORIES = [
  { key: 'code' as const, label: 'Best for Code' },
  { key: 'reasoning' as const, label: 'Best for Reasoning' },
  { key: 'general' as const, label: 'General Purpose' },
  { key: 'lightweight' as const, label: 'Lightweight / Fast' },
  { key: 'auto' as const, label: 'Auto' },
];

export const DEFAULT_MODEL = FREE_MODELS.find((m) => m.isDefault)!.id;
