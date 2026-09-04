import { describe, expect, it } from 'vitest';
import { POST } from '@/app/api/review/route';

describe('review endpoint', () => {
  it('runs the demo adapter without a credential', async () => {
    const request = new Request('http://localhost/api/review', {
      method: 'POST',
      body: JSON.stringify({
        provider: 'demo',
        model: 'gentle-demo-v1',
        draft: 'I want to keep Friday.',
        locks: ['Friday'],
        voice: 'warm',
      }),
    });
    const response = await POST(request);
    const result = (await response.json()) as {
      suggestions: { risk: string }[];
    };
    expect(response.status).toBe(200);
    expect(result.suggestions[0].risk).toBe('low');
  });

  it('validates empty and oversized drafts', async () => {
    const response = await POST(
      new Request('http://localhost/api/review', {
        method: 'POST',
        body: JSON.stringify({ provider: 'demo', draft: '' }),
      }),
    );
    expect(response.status).toBe(400);
  });
});
