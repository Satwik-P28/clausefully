export type ProviderId = 'demo' | 'openai' | 'anthropic';

export type IntentLock = {
  id: string;
  value: string;
};

export type Suggestion = {
  id: string;
  category: 'grammar' | 'clarity' | 'flow' | 'tone';
  original: string;
  replacement: string;
  explanation: string;
  risk: 'low' | 'medium' | 'blocked';
  preservedLocks: string[];
};

export type ReviewRequest = {
  draft: string;
  locks: string[];
  voice: string;
  provider: ProviderId;
  model: string;
  apiKey?: string;
};

export type ReviewResult = {
  suggestions: Suggestion[];
  provider: ProviderId;
  model: string;
  durationMs: number;
};

export function parseLocks(value: string): string[] {
  return [
    ...new Set(
      value
        .split(/[;\n]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ].slice(0, 12);
}

export function verifyLocks(
  text: string,
  locks: string[],
): { passed: string[]; missing: string[] } {
  const normalized = text.toLocaleLowerCase();
  return locks.reduce(
    (result, lock) => {
      (normalized.includes(lock.toLocaleLowerCase())
        ? result.passed
        : result.missing
      ).push(lock);
      return result;
    },
    { passed: [] as string[], missing: [] as string[] },
  );
}

export function applySuggestion(draft: string, suggestion: Suggestion): string {
  const index = draft.indexOf(suggestion.original);
  if (index === -1)
    throw new Error(
      'This sentence changed after the review. Run a fresh review before applying it.',
    );
  return `${draft.slice(0, index)}${suggestion.replacement}${draft.slice(index + suggestion.original.length)}`;
}

export function serializeMarkdown(draft: string): string {
  return `# Clausefully draft\n\n${draft}\n`;
}

export function normalizeSuggestions(
  value: unknown,
  draft: string,
  locks: string[],
): Suggestion[] {
  if (
    !value ||
    typeof value !== 'object' ||
    !Array.isArray((value as { suggestions?: unknown }).suggestions)
  ) {
    throw new Error(
      'The provider returned an unexpected response. Try another model or the demo provider.',
    );
  }

  return (value as { suggestions: unknown[] }).suggestions
    .slice(0, 8)
    .flatMap((raw, index) => {
      if (!raw || typeof raw !== 'object') return [];
      const candidate = raw as Record<string, unknown>;
      const original =
        typeof candidate.original === 'string' ? candidate.original : '';
      const replacement =
        typeof candidate.replacement === 'string' ? candidate.replacement : '';
      if (
        !original ||
        !replacement ||
        original === replacement ||
        !draft.includes(original)
      )
        return [];
      const checks = verifyLocks(
        replacement,
        locks.filter((lock) =>
          original.toLowerCase().includes(lock.toLowerCase()),
        ),
      );
      return [
        {
          id:
            typeof candidate.id === 'string'
              ? candidate.id
              : `suggestion-${index + 1}`,
          category: ['grammar', 'clarity', 'flow', 'tone'].includes(
            String(candidate.category),
          )
            ? (candidate.category as Suggestion['category'])
            : 'clarity',
          original,
          replacement,
          explanation:
            typeof candidate.explanation === 'string'
              ? candidate.explanation
              : 'A focused edit that keeps the surrounding draft intact.',
          risk: checks.missing.length
            ? 'blocked'
            : candidate.risk === 'medium'
              ? 'medium'
              : 'low',
          preservedLocks: checks.passed,
        },
      ];
    });
}

export function demoReview(
  draft: string,
  locks: string[],
  voice: string,
): Suggestion[] {
  const candidates: Omit<Suggestion, 'id' | 'risk' | 'preservedLocks'>[] = [];
  const phrase = 'I want to keep';
  if (draft.includes(phrase)) {
    candidates.push({
      category: 'clarity',
      original: phrase,
      replacement: 'I recommend keeping',
      explanation: `Makes the recommendation more direct while respecting the requested ${voice || 'original'} voice.`,
    });
  }
  const thinkMatch = draft.match(/\bI think that\b/i);
  if (thinkMatch) {
    candidates.push({
      category: 'clarity',
      original: thinkMatch[0],
      replacement: 'I think',
      explanation: 'Removes a filler word without changing the claim.',
    });
  }
  const veryMatch = draft.match(/\bvery ([a-z]+)\b/i);
  if (veryMatch) {
    candidates.push({
      category: 'flow',
      original: veryMatch[0],
      replacement: veryMatch[1],
      explanation:
        'Uses the original adjective directly; review this optional tightening.',
    });
  }
  const doubleSpace = draft.match(/ {2,}/);
  if (doubleSpace) {
    candidates.push({
      category: 'grammar',
      original: doubleSpace[0],
      replacement: ' ',
      explanation: 'Removes extra spacing.',
    });
  }
  if (!candidates.length && draft.trim()) {
    const sentence = draft.match(/[^.!?]+[.!?]?/)?.[0]?.trim();
    if (sentence)
      candidates.push({
        category: 'tone',
        original: sentence,
        replacement: sentence,
        explanation:
          'No safe change found. Your sentence already respects the supplied constraints.',
      });
  }

  return candidates.flatMap((candidate, index) => {
    if (candidate.original === candidate.replacement) return [];
    const affectedLocks = locks.filter((lock) =>
      candidate.original.toLowerCase().includes(lock.toLowerCase()),
    );
    const checks = verifyLocks(candidate.replacement, affectedLocks);
    return [
      {
        ...candidate,
        id: `demo-${index + 1}`,
        risk: checks.missing.length ? 'blocked' : 'low',
        preservedLocks: checks.passed,
      },
    ];
  });
}

export function buildReviewPrompt(
  draft: string,
  locks: string[],
  voice: string,
): string {
  return `You are a conservative copy editor. Return JSON only with a top-level "suggestions" array. Each suggestion must have category (grammar|clarity|flow|tone), original (an exact substring of the draft), replacement, explanation, and risk (low|medium). Make focused edits, never rewrite the whole draft. Never remove or alter these locked facts/phrases: ${locks.join('; ') || 'none supplied'}. Preserve this voice: ${voice || "the writer's existing voice"}. If no safe improvement exists, return an empty suggestions array.\n\nDRAFT:\n${draft}`;
}
