'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clipboard,
  Download,
  Feather,
  KeyRound,
  LockKeyhole,
  Menu,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  applySuggestion,
  parseLocks,
  serializeMarkdown,
  type ProviderId,
  type ReviewResult,
  type Suggestion,
} from '@/lib/domain';
import { providerMeta } from '@/lib/providers';

const sample =
  'Hey Maya — I can send the revised proposal Friday. I want to keep the smaller launch scope because it gives us room to learn without overpromising. I know the timeline is tight, but I’m confident we can make it work.';
const defaults: Record<ProviderId, string> = {
  demo: 'gentle-demo-v1',
  openai: 'gpt-4.1-mini',
  anthropic: 'claude-3-5-haiku-latest',
};

function countWords(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export default function Home() {
  const [draft, setDraft] = useState(() =>
    typeof window === 'undefined'
      ? sample
      : (window.localStorage.getItem('gentleedit-draft') ?? sample),
  );
  const [lockText, setLockText] = useState(() =>
    typeof window === 'undefined'
      ? 'Friday; smaller launch scope'
      : (window.localStorage.getItem('gentleedit-locks') ??
        'Friday; smaller launch scope'),
  );
  const [voice, setVoice] = useState(() =>
    typeof window === 'undefined'
      ? 'Direct, warm, confident'
      : (window.localStorage.getItem('gentleedit-voice') ??
        'Direct, warm, confident'),
  );
  const [provider, setProvider] = useState<ProviderId>('demo');
  const [model, setModel] = useState(defaults.demo);
  const [apiKey, setApiKey] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [welcome, setWelcome] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.localStorage.getItem('gentleedit-welcomed') !== 'yes',
  );
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [connection, setConnection] = useState('');

  useEffect(() => {
    const id = window.setTimeout(() => {
      window.localStorage.setItem('gentleedit-draft', draft);
      window.localStorage.setItem('gentleedit-locks', lockText);
      window.localStorage.setItem('gentleedit-voice', voice);
    }, 250);
    return () => window.clearTimeout(id);
  }, [draft, lockText, voice]);

  const locks = useMemo(() => parseLocks(lockText), [lockText]);
  const visibleSuggestions =
    review?.suggestions.filter((item) => !dismissed.includes(item.id)) ?? [];
  const safeCount = visibleSuggestions.filter(
    (item) => item.risk !== 'blocked',
  ).length;

  async function requestReview() {
    if (!draft.trim()) return;
    setBusy(true);
    setError('');
    setNotice('');
    setDismissed([]);
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft,
          locks,
          voice,
          provider,
          model,
          apiKey: apiKey || undefined,
        }),
      });
      const data = (await response.json()) as ReviewResult & { error?: string };
      if (!response.ok) throw new Error(data.error || 'Review failed.');
      setReview(data);
      setNotice(
        data.suggestions.length
          ? `${data.suggestions.length} focused suggestion${data.suggestions.length === 1 ? '' : 's'} ready.`
          : 'No safe improvements found. Your draft already respects the constraints.',
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Review failed.');
    } finally {
      setBusy(false);
    }
  }

  function accept(item: Suggestion) {
    if (item.risk === 'blocked') return;
    try {
      setDraft((current) => applySuggestion(current, item));
      setDismissed((current) => [...current, item.id]);
      setNotice(
        'Suggestion applied. Your original remains in local browser history until you leave this page.',
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not apply suggestion.',
      );
    }
  }

  async function testConnection() {
    setConnection('Testing…');
    try {
      const response = await fetch('/api/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, model, apiKey: apiKey || undefined }),
      });
      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || 'Connection failed.');
      setConnection(data.message || 'Connection succeeded.');
    } catch (cause) {
      setConnection(
        cause instanceof Error ? cause.message : 'Connection failed.',
      );
    }
  }

  function exportDraft() {
    const blob = new Blob([serializeMarkdown(draft)], {
      type: 'text/markdown',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'gentleedit-draft.md';
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice('Draft exported as Markdown.');
  }

  async function copyDraft() {
    await navigator.clipboard.writeText(draft);
    setNotice('Draft copied.');
  }
  function chooseProvider(next: ProviderId) {
    setProvider(next);
    setModel(defaults[next]);
    setApiKey('');
    setConnection('');
  }
  function finishWelcome() {
    window.localStorage.setItem('gentleedit-welcomed', 'yes');
    setWelcome(false);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <a
        href="#workspace"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to editor
      </a>
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-7">
          <a
            href="#workspace"
            className="flex items-center gap-2.5 font-semibold tracking-tight"
          >
            <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Feather className="size-4" aria-hidden="true" />
            </span>
            GentleEdit
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[.12em] text-muted-foreground">
              v0.1
            </span>
          </a>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
              <ShieldCheck className="size-3.5" /> Local draft · no account
            </span>
            <Button
              variant="outline"
              className="rounded-xl"
              aria-label={`Provider settings: ${providerMeta[provider].label}`}
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 />
              <span className="hidden sm:inline">
                {providerMeta[provider].label}
              </span>
              <span className="sm:hidden">
                <Menu />
              </span>
            </Button>
          </div>
        </div>
      </header>

      <section
        id="workspace"
        className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 sm:py-10"
      >
        <div className="mb-7 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-primary">
              <LockKeyhole className="size-3.5" /> Intent-locked editing
            </div>
            <h1 className="max-w-3xl text-balance font-serif text-4xl leading-[1.03] tracking-[-.035em] sm:text-5xl">
              Polish the writing.
              <br />
              Keep the person.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              A review-first writing assistant that treats your meaning, facts,
              and voice as constraints—not suggestions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {['No account', 'Your API key', 'Nothing auto-applied'].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border bg-card px-3 py-1.5 text-muted-foreground"
                >
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        {(error || notice) && (
          <div
            role={error ? 'alert' : 'status'}
            className={`mb-4 flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}
          >
            <span>{error || notice}</span>
            <button
              aria-label="Dismiss message"
              onClick={() => {
                setError('');
                setNotice('');
              }}
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        <div className="grid overflow-hidden rounded-[28px] border bg-card shadow-[0_24px_70px_-34px_rgba(41,52,39,.38)] lg:grid-cols-[minmax(0,1.12fr)_minmax(350px,.88fr)]">
          <section className="border-b p-5 sm:p-7 lg:border-r lg:border-b-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">Your draft</p>
                <p className="text-xs text-muted-foreground">
                  {countWords(draft)} words · autosaved on this device
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDraft(sample);
                    setReview(null);
                  }}
                >
                  Use sample
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Copy draft"
                  onClick={copyDraft}
                >
                  <Clipboard />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Export draft"
                  onClick={exportDraft}
                >
                  <Download />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Clear draft"
                  onClick={() => {
                    setDraft('');
                    setReview(null);
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
            <Textarea
              aria-label="Draft to review"
              value={draft}
              maxLength={20000}
              onChange={(event) => {
                setDraft(event.target.value);
                setReview(null);
              }}
              placeholder="Paste or write something you want to polish…"
              className="min-h-[310px] resize-y rounded-2xl border-0 bg-secondary/55 p-5 text-[15px] leading-7 shadow-inner focus-visible:ring-primary/25"
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label
                htmlFor="intent-locks"
                className="rounded-2xl border bg-background p-4 text-sm"
              >
                <span className="mb-1 flex items-center gap-1.5 font-semibold">
                  <LockKeyhole className="size-3.5 text-primary" /> What must
                  stay true?
                </span>
                <Input
                  id="intent-locks"
                  className="border-0 px-0 shadow-none focus-visible:ring-0"
                  value={lockText}
                  onChange={(event) => setLockText(event.target.value)}
                  placeholder="Names, dates, promises; separated by ;"
                  aria-describedby="locks-help"
                />
                <span
                  id="locks-help"
                  className="mt-1 block text-[11px] text-muted-foreground"
                >
                  Separate up to 12 facts or phrases with semicolons.
                </span>
              </label>
              <label
                htmlFor="voice-description"
                className="rounded-2xl border bg-background p-4 text-sm"
              >
                <span className="mb-1 flex items-center gap-1.5 font-semibold">
                  <Feather className="size-3.5 text-primary" /> How should it
                  feel?
                </span>
                <Input
                  id="voice-description"
                  className="border-0 px-0 shadow-none focus-visible:ring-0"
                  value={voice}
                  onChange={(event) => setVoice(event.target.value)}
                  placeholder="Direct, playful, understated…"
                />
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  A short description, not a generic preset.
                </span>
              </label>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-11 rounded-xl"
                onClick={requestReview}
                disabled={!draft.trim() || busy}
              >
                {busy ? (
                  <>
                    <RefreshCw className="animate-spin" /> Reviewing carefully…
                  </>
                ) : (
                  <>
                    <Sparkles /> Review without rewriting me <ArrowRight />
                  </>
                )}
              </Button>
              <span className="text-xs text-muted-foreground">
                Using {providerMeta[provider].label} · {model}
              </span>
            </div>
          </section>

          <aside className="bg-[#f3f4ed] p-5 sm:p-7">
            {!review ? (
              <EmptyReview />
            ) : (
              <div aria-live="polite">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {visibleSuggestions.length
                        ? `${safeCount} careful suggestion${safeCount === 1 ? '' : 's'}`
                        : 'Review complete'}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {review.durationMs} ms ·{' '}
                      {providerMeta[review.provider].label}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                    <Check className="size-3" /> Locks checked
                  </span>
                </div>
                {visibleSuggestions.length ? (
                  <div className="space-y-3">
                    {visibleSuggestions.map((item) => (
                      <SuggestionCard
                        key={item.id}
                        item={item}
                        onAccept={() => accept(item)}
                        onDismiss={() =>
                          setDismissed((current) => [...current, item.id])
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border bg-background p-6 text-center">
                    <CheckCircle2 className="mx-auto size-8 text-primary" />
                    <h2 className="mt-3 font-serif text-xl">Nothing forced.</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      No safe, focused edits remain. That is a valid result—not
                      an invitation to rewrite for the sake of activity.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={requestReview}
                    >
                      <RefreshCw /> Review again
                    </Button>
                  </div>
                )}
                <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                  <LockKeyhole className="mt-0.5 size-3.5 shrink-0" />{' '}
                  {locks.length
                    ? `${locks.join(' · ')} ${locks.length === 1 ? 'was' : 'were'} checked wherever an edit touched them.`
                    : 'Add a fact lock to protect a non-negotiable detail.'}
                </p>
              </div>
            )}
          </aside>
        </div>

        <section className="mt-12 grid gap-6 border-t pt-8 md:grid-cols-3">
          <Info
            title="Review, don’t surrender"
            text="Every edit is a small exact replacement. Accept or dismiss each one; blocked suggestions can’t be applied."
          />
          <Info
            title="Keys stay ephemeral"
            text="Keys are held only in page memory, sent over HTTPS for the request, and never placed in local storage or logs."
          />
          <Info
            title="Leave with everything"
            text="Your draft autosaves locally and exports as plain Markdown. No account, proprietary document format, or exit fee."
          />
        </section>
      </section>

      <footer className="border-t px-4 py-7 text-center text-xs leading-5 text-muted-foreground">
        GentleEdit is an independent open-source writing assistant. It is not
        affiliated with or endorsed by Grammarly or Superhuman.
      </footer>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Choose your review provider</DialogTitle>
            <DialogDescription>
              Use the offline demo or bring your own provider key. Keys live in
              memory only and disappear when this tab closes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <label htmlFor="provider" className="block text-sm font-medium">
              Provider
              <NativeSelect
                id="provider"
                className="mt-1.5 w-full"
                value={provider}
                onChange={(event) =>
                  chooseProvider(event.target.value as ProviderId)
                }
              >
                <NativeSelectOption value="demo">
                  Demo — no key
                </NativeSelectOption>
                <NativeSelectOption value="openai">OpenAI</NativeSelectOption>
                <NativeSelectOption value="anthropic">
                  Anthropic
                </NativeSelectOption>
              </NativeSelect>
            </label>
            <label htmlFor="model" className="block text-sm font-medium">
              Model
              <Input
                id="model"
                className="mt-1.5"
                value={model}
                onChange={(event) => setModel(event.target.value)}
              />
            </label>
            {provider !== 'demo' && (
              <label htmlFor="api-key" className="block text-sm font-medium">
                API key
                <Input
                  id="api-key"
                  className="mt-1.5 font-mono"
                  type="password"
                  autoComplete="off"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder={provider === 'openai' ? 'sk-…' : 'sk-ant-…'}
                />
                <span className="mt-1.5 block text-xs font-normal text-muted-foreground">
                  Never stored. The self-hosted server can instead read{' '}
                  {provider === 'openai'
                    ? 'OPENAI_API_KEY'
                    : 'ANTHROPIC_API_KEY'}
                  .
                </span>
              </label>
            )}
            <div className="rounded-xl bg-secondary p-3 text-xs leading-5 text-muted-foreground">
              {providerMeta[provider].note}
            </div>
            {connection && (
              <output className="block text-sm">{connection}</output>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={testConnection}>
              <KeyRound /> Test connection
            </Button>
            <Button onClick={() => setSettingsOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={welcome} onOpenChange={setWelcome}>
        <DialogContent className="sm:max-w-lg" showCloseButton={false}>
          <DialogHeader>
            <div className="mb-2 grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Feather />
            </div>
            <DialogTitle className="font-serif text-2xl">
              Editing should feel like consent.
            </DialogTitle>
            <DialogDescription>
              GentleEdit makes small, inspectable suggestions while protecting
              the facts and voice you name.
            </DialogDescription>
          </DialogHeader>
          <ol className="grid gap-2 text-sm">
            <li className="rounded-xl bg-secondary p-3">
              <strong>1. Lock the truth.</strong> Name details that cannot
              change.
            </li>
            <li className="rounded-xl bg-secondary p-3">
              <strong>2. Describe your voice.</strong> Use your own words, not a
              preset.
            </li>
            <li className="rounded-xl bg-secondary p-3">
              <strong>3. Review every edit.</strong> Nothing is applied behind
              your back.
            </li>
          </ol>
          <DialogFooter>
            <Button onClick={finishWelcome}>
              Try the sample <ArrowRight />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function EmptyReview() {
  return (
    <div className="flex h-full min-h-[420px] flex-col justify-between">
      <div>
        <p className="text-sm font-semibold">Review space</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Suggestions appear here, one deliberate choice at a time.
        </p>
      </div>
      <div className="mx-auto max-w-xs text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border bg-background text-primary shadow-sm">
          <Feather />
        </span>
        <h2 className="mt-5 font-serif text-2xl">
          Your voice stays in the room.
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Set your non-negotiables, then ask for a review. GentleEdit flags any
          suggestion that risks them.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-muted-foreground">
        {['Draft locally', 'Review changes', 'Export freely'].map(
          (step, index) => (
            <div
              key={step}
              className="rounded-xl border border-black/5 bg-white/50 p-2"
            >
              <span className="block font-semibold text-foreground">
                0{index + 1}
              </span>
              {step}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function SuggestionCard({
  item,
  onAccept,
  onDismiss,
}: {
  item: Suggestion;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  const blocked = item.risk === 'blocked';
  return (
    <article
      className={`rounded-2xl border bg-background p-4 shadow-sm ${blocked ? 'border-amber-300' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[.13em] text-muted-foreground">
          {item.category} · {item.risk} risk
        </p>
        {blocked && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
            Blocked by lock
          </span>
        )}
      </div>
      <div className="mt-3 space-y-2 text-sm leading-6">
        <p className="rounded-lg bg-red-50 px-2.5 py-1.5 text-red-950">
          <span className="sr-only">Original: </span>
          <span className="line-through decoration-red-400">
            {item.original}
          </span>
        </p>
        <p className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-emerald-950">
          <span className="sr-only">Suggestion: </span>
          {item.replacement}
        </p>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        {item.explanation}
      </p>
      <div className="mt-4 flex gap-2">
        <Button size="sm" disabled={blocked} onClick={onAccept}>
          {blocked ? <LockKeyhole /> : <Check />}{' '}
          {blocked ? 'Protected' : 'Accept'}
        </Button>
        <Button size="sm" variant="outline" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </article>
  );
}
function Info({ title, text }: { title: string; text: string }) {
  return (
    <article>
      <h2 className="font-serif text-xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </article>
  );
}
