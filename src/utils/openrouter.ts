const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export async function* streamChat(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  systemPrompt: string
): AsyncGenerator<string> {
  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://iot-studio.bilota.ai',
      'X-Title': 'IoT Studio by Bilota AI',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string } }).error?.message ||
        `OpenRouter error: ${response.status}`
    );
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        /* skip malformed chunks */
      }
    }
  }
}

export async function fetchFreeModels(apiKey: string) {
  try {
    const res = await fetch(`${OPENROUTER_BASE}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    return (
      (data as { data?: Array<{ id: string; name: string; context_length: number; pricing?: { prompt?: string; completion?: string } }> }).data
        ?.filter(
          (m) => m.pricing?.prompt === '0' && m.pricing?.completion === '0'
        )
        ?.map((m) => ({
          id: m.id,
          name: m.name,
          context: m.context_length,
          provider: m.id.split('/')[0],
        })) ?? []
    );
  } catch {
    return null;
  }
}
