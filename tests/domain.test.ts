import { describe, expect, it } from 'vitest';
import {
  applySuggestion,
  demoReview,
  normalizeSuggestions,
  parseLocks,
  verifyLocks,
} from '@/lib/domain';

describe('intent-lock domain', () => {
  it('deduplicates and caps intent locks', () => {
    expect(parseLocks('Friday; scope\nFriday')).toEqual(['Friday', 'scope']);
    expect(
      parseLocks(
        Array.from({ length: 20 }, (_, index) => `x${index}`).join(';'),
      ),
    ).toHaveLength(12);
  });

  it('checks locks case-insensitively', () => {
    expect(
      verifyLocks('Ship FRIDAY with smaller scope', [
        'Friday',
        'smaller scope',
        'Maya',
      ]),
    ).toEqual({ passed: ['Friday', 'smaller scope'], missing: ['Maya'] });
  });

  it('generates a focused deterministic demo edit', () => {
    const draft = 'I want to keep the smaller launch scope until Friday.';
    const [suggestion] = demoReview(
      draft,
      ['smaller launch scope', 'Friday'],
      'direct',
    );
    expect(suggestion.original).toBe('I want to keep');
    expect(applySuggestion(draft, suggestion)).toContain(
      'I recommend keeping the smaller launch scope until Friday.',
    );
  });

  it('blocks provider output that removes an affected lock', () => {
    const [suggestion] = normalizeSuggestions(
      {
        suggestions: [
          {
            category: 'clarity',
            original: 'Ship Friday',
            replacement: 'Ship soon',
            explanation: 'Shorter',
            risk: 'low',
          },
        ],
      },
      'Ship Friday please.',
      ['Friday'],
    );
    expect(suggestion.risk).toBe('blocked');
  });

  it('refuses stale replacements', () => {
    expect(() =>
      applySuggestion('Changed draft', {
        id: '1',
        category: 'clarity',
        original: 'Old',
        replacement: 'New',
        explanation: '',
        risk: 'low',
        preservedLocks: [],
      }),
    ).toThrow(/fresh review/);
  });
});
