import {
  buildReviewPrompt,
  demoReview,
  normalizeSuggestions,
  type ProviderId,
  type ReviewRequest,
  type ReviewResult,
} from './domain';

const DEFAULT_MODELS: Record<ProviderId, string> = {
  demo: 'gentle-demo-v1',
  openai: 'gpt-4.1-mini',
  anthropic: 'claude-3-5-haiku-latest',
};

export const providerMeta = {
  demo: { label: 'Demo', note: 'No key. Deterministic, private, and limited.' },
  openai: {
    label: 'OpenAI',
    note: 'Draft and key pass through this app in memory, then go to OpenAI.',
  },
  anthropic: {
    label: 'Anthropic',
    note: 'Draft and key pass through this app in memory, then go to Anthropic.',
  },
} as const;

function timeoutSignal(ms = 30_000): AbortSignal {
  return AbortSignal.timeout(ms);
}

function requireKey(request: ReviewRequest): string {
  const key = request.apiKey?.trim();
  if (!key)
    throw new Error(
      `Add a ${providerMeta[request.provider].label} API key or switch to Demo.`,
    );
  return key;
}

function parseJsonText(text: string): unknown {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(
      'The provider returned text instead of valid review JSON. Try again or switch models.',
    );
  }
}

export async function reviewWithProvider(
  request: ReviewRequest,
): Promise<ReviewResult> {
  const start = Date.now();
  const model = request.model || DEFAULT_MODELS[request.provider];
  if (request.provider === 'demo')
    return {
      suggestions: demoReview(request.draft, request.locks, request.voice),
      provider: 'demo',
      model,
      durationMs: Date.now() - start,
    };

  const key = requireKey(request);
  const prompt = buildReviewPrompt(request.draft, request.locks, request.voice);
  let raw: unknown;
  if (request.provider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: timeoutSignal(),
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!response.ok) throw await providerError(response, 'OpenAI');
    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    raw = parseJsonText(data.choices?.[0]?.message?.content || '');
  } else {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: timeoutSignal(),
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1400,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!response.ok) throw await providerError(response, 'Anthropic');
    const data = (await response.json()) as {
      content?: { type: string; text?: string }[];
    };
    raw = parseJsonText(
      data.content?.find((item) => item.type === 'text')?.text || '',
    );
  }
  return {
    suggestions: normalizeSuggestions(raw, request.draft, request.locks),
    provider: request.provider,
    model,
    durationMs: Date.now() - start,
  };
}

export async function testProvider(
  provider: ProviderId,
  apiKey?: string,
  model?: string,
): Promise<string> {
  if (provider === 'demo')
    return 'Demo provider is ready. No network or key required.';
  const request = {
    provider,
    apiKey,
    model: model || DEFAULT_MODELS[provider],
    draft: '',
    locks: [],
    voice: '',
  } satisfies ReviewRequest;
  const key = requireKey(request);
  const url =
    provider === 'openai'
      ? 'https://api.openai.com/v1/models'
      : 'https://api.anthropic.com/v1/messages';
  const init: RequestInit =
    provider === 'openai'
      ? {
          headers: { Authorization: `Bearer ${key}` },
          signal: timeoutSignal(12_000),
        }
      : {
          method: 'POST',
          headers: {
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: request.model,
            max_tokens: 1,
            messages: [{ role: 'user', content: 'Reply with OK' }],
          }),
          signal: timeoutSignal(12_000),
        };
  const response = await fetch(url, init);
  if (!response.ok)
    throw await providerError(response, providerMeta[provider].label);
  return `${providerMeta[provider].label} connection succeeded.`;
}

async function providerError(
  response: Response,
  label: string,
): Promise<Error> {
  if (response.status === 401 || response.status === 403)
    return new Error(
      `${label} rejected the API key. Check the key and its permissions.`,
    );
  if (response.status === 429)
    return new Error(
      `${label} rate limit or quota reached. Wait, check billing, or choose another provider.`,
    );
  if (response.status >= 500)
    return new Error(`${label} is temporarily unavailable. Try again shortly.`);
  return new Error(
    `${label} returned error ${response.status}. Check the model name and provider account.`,
  );
}
