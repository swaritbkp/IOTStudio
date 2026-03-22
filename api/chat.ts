export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(null, { status: 405 });
  }

  const apiKey = (process as any).env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Server API key not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: { model?: string; messages?: unknown[]; stream?: boolean };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const upstreamRes = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://iot-studio.vercel.app',
        'X-Title': 'IoT Studio by Bilota AI',
      },
      body: JSON.stringify({
        model: body.model,
        messages: body.messages,
        stream: body.stream ?? true,
      }),
    }
  );

  if (!upstreamRes.ok) {
    const errText = await upstreamRes.text();
    return new Response(errText, {
      status: upstreamRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // SSE passthrough — stream the response body directly
  return new Response(upstreamRes.body, {
    status: 200,
    headers: {
      'Content-Type': body.stream !== false ? 'text/event-stream' : 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
}
