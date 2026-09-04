import { reviewWithProvider } from '@/lib/providers';
import type { ReviewRequest } from '@/lib/domain';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as ReviewRequest;
    if (!body.draft?.trim() || body.draft.length > 20_000)
      return Response.json(
        { error: 'Drafts must contain 1–20,000 characters.' },
        { status: 400 },
      );
    const environmentKey =
      body.provider === 'openai'
        ? process.env.OPENAI_API_KEY
        : body.provider === 'anthropic'
          ? process.env.ANTHROPIC_API_KEY
          : undefined;
    const result = await reviewWithProvider({
      ...body,
      apiKey: body.apiKey || environmentKey,
    });
    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'The review could not be completed.';
    return Response.json(
      { error: message },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
