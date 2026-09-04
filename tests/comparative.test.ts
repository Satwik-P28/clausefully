import { describe, expect, it } from 'vitest';
import cases from './fixtures/comparative-cases.json';
import { normalizeSuggestions, serializeMarkdown } from '@/lib/domain';

describe('predeclared comparative targets', () => {
  it.each(cases)(
    '$id preserves an affected lock or blocks the edit',
    (item) => {
      const [result] = normalizeSuggestions(
        {
          suggestions: [
            {
              category: 'clarity',
              original: item.original,
              replacement: item.replacement,
              explanation: 'Fixture edit',
              risk: 'low',
            },
          ],
        },
        item.draft,
        item.locks,
      );
      expect(result.risk).toBe(item.expectedRisk);
      expect(item.draft.includes(result.original)).toBe(true);
    },
  );

  it('exports every draft byte after the documented heading', () => {
    const draft = 'Maya — Friday\n\nKeep $500 & “voice”.';
    expect(serializeMarkdown(draft)).toBe(`# GentleEdit draft\n\n${draft}\n`);
  });
});
