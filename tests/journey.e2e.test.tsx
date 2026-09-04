import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import axe from 'axe-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Home from '@/app/page';

describe('primary writing journey', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('has no serious or critical automated accessibility violations', async () => {
    window.localStorage.setItem('gentleedit-welcomed', 'yes');
    render(<Home />);

    const results = await axe.run(document.body, {
      // jsdom has no canvas renderer; contrast is verified in browser QA.
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(
      results.violations.filter(({ impact }) =>
        ['serious', 'critical'].includes(impact ?? ''),
      ),
    ).toEqual([]);
  });

  it('reviews, explains, and applies one explicit suggestion', async () => {
    window.localStorage.setItem('gentleedit-welcomed', 'yes');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          provider: 'demo',
          model: 'gentle-demo-v1',
          durationMs: 2,
          suggestions: [
            {
              id: 'demo-1',
              category: 'clarity',
              original: 'I want to keep',
              replacement: 'I recommend keeping',
              explanation: 'More direct.',
              risk: 'low',
              preservedLocks: [],
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    render(<Home />);
    fireEvent.click(
      screen.getByRole('button', { name: /review without rewriting me/i }),
    );
    expect(await screen.findByText('More direct.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^accept$/i }));
    await waitFor(() =>
      expect(
        (screen.getByLabelText('Draft to review') as HTMLTextAreaElement).value,
      ).toContain('I recommend keeping'),
    );
  });

  it('shows provider errors without exposing credentials', async () => {
    window.localStorage.setItem('gentleedit-welcomed', 'yes');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ error: 'Provider rejected the API key.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    render(<Home />);
    fireEvent.click(
      screen.getByRole('button', { name: /review without rewriting me/i }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('rejected');
  });
});
