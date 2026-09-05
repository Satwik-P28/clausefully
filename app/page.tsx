'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpenCheck,
  ArrowRight,
  Check,
  CheckCircle2,
  Clipboard,
  Download,
  Feather,
  FileText,
  Github,
  House,
  KeyRound,
  LockKeyhole,
  Menu,
  Plus,
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
  demo: 'clausefully-demo-v1',
  openai: 'gpt-4.1-mini',
  anthropic: 'claude-3-5-haiku-latest',
};

function countWords(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export default function Home() {
  const [draft, setDraft] = useState(sample);
  const [lockText, setLockText] = useState('Friday; smaller launch scope');
  const [voice, setVoice] = useState('Direct, warm, confident');
  const [hydrated, setHydrated] = useState(false);
  const [provider, setProvider] = useState<ProviderId>('demo');
  const [model, setModel] = useState(defaults.demo);
  const [apiKey, setApiKey] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [connection, setConnection] = useState('');

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDraft(window.localStorage.getItem('clausefully-draft') ?? sample);
      setLockText(
        window.localStorage.getItem('clausefully-locks') ??
          'Friday; smaller launch scope',
      );
      setVoice(
        window.localStorage.getItem('clausefully-voice') ??
          'Direct, warm, confident',
      );
      setWelcome(window.localStorage.getItem('clausefully-welcomed') !== 'yes');
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const id = window.setTimeout(() => {
      window.localStorage.setItem('clausefully-draft', draft);
      window.localStorage.setItem('clausefully-locks', lockText);
      window.localStorage.setItem('clausefully-voice', voice);
    }, 250);
    return () => window.clearTimeout(id);
  }, [draft, hydrated, lockText, voice]);

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
    anchor.download = 'clausefully-draft.md';
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
    window.localStorage.setItem('clausefully-welcomed', 'yes');
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
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card px-3 sm:px-5">
        <a href="#workspace" className="flex items-center gap-2 font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <BookOpenCheck className="size-4" aria-hidden="true" />
          </span>
          <span className="text-[15px] tracking-[-.02em]">Clausefully</span>
          <span className="hidden rounded-md bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[.1em] text-muted-foreground sm:inline">
            open
          </span>
        </a>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
            <ShieldCheck className="size-3.5" aria-hidden="true" /> Saved on
            this device
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            nativeButton={false}
            render={
              <a
                href="https://github.com/Satwik-P28/clausefully"
                target="_blank"
                rel="noreferrer"
                aria-label="Star Clausefully on GitHub"
              />
            }
          >
            <Github />
            <span className="hidden sm:inline">Star</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
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
      </header>

      <section
        id="workspace"
        className="grid min-h-[calc(100vh-3.5rem)] bg-[#f5f4f8] lg:grid-cols-[210px_minmax(480px,1fr)_390px]"
      >
        <aside className="border-b bg-[#17172b] p-3 text-white lg:border-r lg:border-b-0 lg:p-4">
          <nav
            aria-label="Workspace"
            className="flex gap-2 lg:block lg:space-y-1"
          >
            <div className="flex flex-1 items-center gap-2 rounded-lg bg-white/12 px-3 py-2.5 text-left text-sm font-medium lg:w-full">
              <FileText className="size-4 text-[#c9c7ff]" /> Current draft
            </div>
            <button
              className="hidden w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-white/65 hover:bg-white/8 lg:flex"
              onClick={() => {
                setDraft('');
                setReview(null);
              }}
            >
              <Plus className="size-4" /> New draft
            </button>
            <div className="hidden w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-white/65 lg:flex">
              <House className="size-4" /> Local workspace
            </div>
          </nav>
          <div className="mt-6 hidden rounded-xl border border-white/10 bg-white/5 p-3 lg:block">
            <p className="flex items-center gap-2 text-xs font-semibold">
              <LockKeyhole className="size-3.5 text-[#ff9d82]" /> Intent locks
            </p>
            <p className="mt-2 text-[11px] leading-5 text-white/55">
              Dates, names, promises, and voice stay under your control.
            </p>
          </div>
          <p className="mt-[calc(100vh-25rem)] hidden text-[10px] leading-4 text-white/35 lg:block">
            Independent open-source alternative. Not affiliated with Grammarly
            or Superhuman.
          </p>
        </aside>

        <section className="min-w-0 p-3 sm:p-6 xl:p-10">
          {(error || notice) && (
            <div
              role={error ? 'alert' : 'status'}
              className={`mx-auto mb-3 flex max-w-[760px] items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-900' : 'border-indigo-200 bg-indigo-50 text-indigo-950'}`}
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

          <div className="mx-auto max-w-[760px] overflow-hidden rounded-xl border bg-card shadow-[0_12px_44px_-24px_rgba(32,30,61,.35)]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
              <div>
                <h1 className="text-sm font-semibold">Untitled note</h1>
                <p className="text-[11px] text-muted-foreground">
                  {countWords(draft)} words · changes save locally
                </p>
              </div>
              <div className="flex items-center gap-1">
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

            <div className="relative bg-white px-5 py-7 sm:px-10 sm:py-10">
              <Textarea
                aria-label="Draft to review"
                value={draft}
                maxLength={20000}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setReview(null);
                }}
                placeholder="Start writing or paste a draft…"
                className="min-h-[390px] resize-y rounded-none border-0 bg-transparent p-0 font-serif text-[17px] leading-8 shadow-none focus-visible:ring-0"
              />
              {review && visibleSuggestions.length > 0 && (
                <span className="pointer-events-none absolute right-4 top-7 rounded-full bg-[#e9e8ff] px-2.5 py-1 text-[10px] font-bold text-[#4b49a9] sm:right-8">
                  {visibleSuggestions.length} review marker
                </span>
              )}
            </div>

            <div className="grid gap-px border-t bg-border sm:grid-cols-2">
              <label
                htmlFor="intent-locks"
                className="bg-card px-4 py-3 text-xs"
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  <LockKeyhole className="size-3.5 text-[#e0664f]" /> Protect
                  these details
                </span>
                <Input
                  id="intent-locks"
                  className="mt-1 h-8 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
                  value={lockText}
                  onChange={(event) => setLockText(event.target.value)}
                  placeholder="Names, dates, promises; separated by ;"
                  aria-describedby="locks-help"
                />
                <span id="locks-help" className="sr-only">
                  Separate up to 12 facts or phrases with semicolons.
                </span>
              </label>
              <label
                htmlFor="voice-description"
                className="bg-card px-4 py-3 text-xs"
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  <Feather className="size-3.5 text-primary" /> Preserve this
                  voice
                </span>
                <Input
                  id="voice-description"
                  className="mt-1 h-8 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
                  value={voice}
                  onChange={(event) => setVoice(event.target.value)}
                  placeholder="Direct, playful, understated…"
                />
              </label>
            </div>
          </div>
        </section>

        <aside className="border-t bg-card p-4 lg:border-t-0 lg:border-l lg:p-5">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="text-sm font-semibold">Writing review</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Exact edits, never silent rewrites
              </p>
            </div>
            <span
              className="grid size-9 place-items-center rounded-full border-4 border-[#d9d8ff] text-[11px] font-bold text-primary"
              aria-label={
                review
                  ? `${visibleSuggestions.length} open suggestions`
                  : 'No review yet'
              }
            >
              {review ? visibleSuggestions.length : '—'}
            </span>
          </div>

          <Button
            size="lg"
            className="mt-4 h-11 w-full rounded-lg"
            onClick={requestReview}
            disabled={!draft.trim() || busy}
          >
            {busy ? (
              <>
                <RefreshCw className="animate-spin" /> Checking your draft…
              </>
            ) : (
              <>
                <Sparkles /> Review my writing <ArrowRight />
              </>
            )}
          </Button>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            {providerMeta[provider].label} · {model}
          </p>

          <div className="mt-5">
            {!review ? (
              <EmptyReview />
            ) : (
              <div aria-live="polite">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold">
                    {visibleSuggestions.length
                      ? `${safeCount} suggestion${safeCount === 1 ? '' : 's'} to review`
                      : 'Review complete'}
                  </p>
                  <span className="flex items-center gap-1 rounded-full bg-[#efefff] px-2 py-1 text-[10px] font-semibold text-[#4b49a9]">
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
                  <div className="rounded-xl border bg-secondary/40 p-6 text-center">
                    <CheckCircle2 className="mx-auto size-8 text-primary" />
                    <h2 className="mt-3 text-base font-semibold">
                      All reviewed
                    </h2>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      No safe, focused edits remain. Clausefully will not invent
                      work just to look busy.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={requestReview}
                    >
                      <RefreshCw /> Review again
                    </Button>
                  </div>
                )}
                <p className="mt-4 flex items-start gap-2 rounded-lg bg-[#fff5f1] p-3 text-[11px] leading-5 text-[#7a3d31]">
                  <LockKeyhole className="mt-0.5 size-3.5 shrink-0" />
                  {locks.length
                    ? `${locks.join(' · ')} ${locks.length === 1 ? 'was' : 'were'} checked wherever an edit touched them.`
                    : 'Add a detail lock before reviewing consequential text.'}
                </p>
              </div>
            )}
          </div>
        </aside>
      </section>

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
              Clausefully makes small, inspectable suggestions while protecting
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
    <div className="flex min-h-[260px] flex-col justify-between">
      <div>
        <p className="text-xs font-semibold">No review yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Run a review to see focused suggestions here.
        </p>
      </div>
      <div className="mx-auto max-w-xs py-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-[#efefff] text-primary">
          <Feather />
        </span>
        <h2 className="mt-4 text-base font-semibold">Your words stay yours.</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Protect the details that matter, then review every proposed change.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-1.5 text-center text-[9px] text-muted-foreground">
        {['Write', 'Review', 'Decide'].map((step, index) => (
          <div key={step} className="rounded-lg bg-secondary/50 p-2">
            <span className="block font-semibold text-foreground">
              0{index + 1}
            </span>
            {step}
          </div>
        ))}
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
      className={`rounded-xl border bg-background p-4 shadow-sm ${blocked ? 'border-amber-300' : 'border-[#deddf4]'}`}
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
        <p className="rounded-md bg-[#fff2ef] px-2.5 py-1.5 text-[#7d3327]">
          <span className="sr-only">Original: </span>
          <span className="line-through decoration-[#e0664f]">
            {item.original}
          </span>
        </p>
        <p className="rounded-md bg-[#efefff] px-2.5 py-1.5 text-[#29275f]">
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
