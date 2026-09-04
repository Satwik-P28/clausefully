import { testProvider } from '@/lib/providers';
import type { ProviderId } from '@/lib/domain';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as {
      provider: ProviderId;
      apiKey?: string;
      model?: string;
    };
    const environmentKey =
      body.provider === 'openai'
        ? process.env.OPENAI_API_KEY
        : body.provider === 'anthropic'
          ? process.env.ANTHROPIC_API_KEY
          : undefined;
    const message = await testProvider(
      body.provider,
      body.apiKey || environmentKey,
      body.model,
    );
    return Response.json(
      { message },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Connection failed.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
