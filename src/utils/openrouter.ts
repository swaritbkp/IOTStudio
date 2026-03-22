const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const PROXY_BASE = '/api';

export async function* streamChat(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  systemPrompt: string
): AsyncGenerator<string> {
  const useProxy = !apiKey;
  const url = useProxy
    ? `${PROXY_BASE}/chat`
    : `${OPENROUTER_BASE}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (!useProxy) {
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['HTTP-Referer'] = 'https://iot-studio.vercel.app';
    headers['X-Title'] = 'IoT Studio by Bilota AI';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
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
