import { useRef, useState } from 'react';
import {
  Alignment,
  NotifyType,
  SmartDialog,
  SmartHighlightShape,
  SmartNonAnimationType,
  SmartStatus,
  SmartToastType,
} from 'fe-smart-dialog';
import {
  ArrowDown,
  ArrowUpRight,
  Bell,
  BookOpen,
  Check,
  Compass,
  Copy,
  Layers,
  LoaderCircle,
  MessageSquare,
  Pin,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getDocsHref } from '../utils/docsUrl';
import { CodeBlock } from './CodeBlock';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

type HeroLayerKey = 'toast' | 'notify' | 'loading' | 'attach' | 'custom';

interface HeroShowcaseProps {
  isDark: boolean;
  onLog: (msg: string) => void;
  onJumpWorkbench: () => void;
}

const INSTALL_CMD = 'npm install fe-smart-dialog';

export function HeroShowcase({
  isDark,
  onLog,
  onJumpWorkbench,
}: HeroShowcaseProps) {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [activeLayer, setActiveLayer] = useState<HeroLayerKey>('toast');
  const [toastMode, setToastMode] = useState<'normal' | 'last' | 'multi'>(
    'last',
  );
  const [notifyKind, setNotifyKind] = useState<
    'success' | 'warning' | 'error'
  >('success');
  const [attachPos, setAttachPos] = useState<
    'bottomCenter' | 'topCenter' | 'centerRight'
  >('bottomCenter');

  const tourBtnRef = useRef<HTMLButtonElement>(null);
  const deckCardRef = useRef<HTMLDivElement>(null);
  const attachBtnRef = useRef<HTMLButtonElement>(null);

  const handleCopyInstall = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
    } catch {
      // ignore clipboard fallback
    }
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 1600);
  };

  const heroSnippet = (() => {
    switch (activeLayer) {
      case 'toast': {
        const modeMap = {
          normal: 'SmartToastType.normal',
          last: 'SmartToastType.last',
          multi: 'SmartToastType.multi',
        };
        return `import { SmartDialog, SmartToastType } from 'fe-smart-dialog';

await SmartDialog.showToast('Saved to workspace', {
  displayType: ${modeMap[toastMode]},
});`;
      }
      case 'notify': {
        return `import { NotifyType, SmartDialog } from 'fe-smart-dialog';

await SmartDialog.showNotify({
  notifyType: NotifyType.${notifyKind},
  msg: 'Semantic ${notifyKind} alert delivered',
});`;
      }
      case 'loading': {
        return `import { SmartDialog, SmartStatus } from 'fe-smart-dialog';

void SmartDialog.showLoading({ msg: 'Deploying bundle...' });
await deployTask();
await SmartDialog.dismiss({ status: SmartStatus.loading });`;
      }
      case 'attach': {
        return `import { Alignment, SmartDialog } from 'fe-smart-dialog';

await SmartDialog.showAttach({
  targetContext: anchorEl,
  alignment: Alignment.${attachPos},
  builder: () => popoverCard,
});`;
      }
      case 'custom': {
        return `import { Alignment, SmartDialog } from 'fe-smart-dialog';

const confirmed = await SmartDialog.show<boolean>({
  alignment: Alignment.center,
  builder: ({ dismiss }) => confirmModal(dismiss),
});`;
      }
    }
  })();

  const triggerHeroDemo = async () => {
    if (activeLayer === 'toast') {
      const displayType =
        toastMode === 'normal'
          ? SmartToastType.normal
          : toastMode === 'multi'
            ? SmartToastType.multi
            : SmartToastType.last;
      onLog(`hero -> showToast(${toastMode})`);
      if (toastMode === 'multi') {
        void SmartDialog.showToast('Queued toast #1', { displayType });
        void SmartDialog.showToast('Stacked toast #2', { displayType });
      } else {
        void SmartDialog.showToast('Changes synced cleanly', { displayType });
      }
      return;
    }

    if (activeLayer === 'notify') {
      const typeMap = {
        success: NotifyType.success,
        warning: NotifyType.warning,
        error: NotifyType.error,
      };
      const msgMap = {
        success: 'Build & deployment succeeded',
        warning: 'Rate limit approaching 85%',
        error: 'Connection dropped — retrying',
      };
      onLog(`hero -> showNotify(${notifyKind})`);
      void SmartDialog.showNotify({
        notifyType: typeMap[notifyKind],
        msg: msgMap[notifyKind],
        displayTime: 2200,
      });
      return;
    }

    if (activeLayer === 'loading') {
      onLog('hero -> showLoading(1.6s)');
      void SmartDialog.showLoading({ msg: 'Syncing state...' });
      setTimeout(() => {
        void SmartDialog.dismiss({ status: SmartStatus.loading });
      }, 1600);
      return;
    }

    if (activeLayer === 'attach') {
      const alignMap = {
        bottomCenter: Alignment.bottomCenter,
        topCenter: Alignment.topCenter,
        centerRight: Alignment.centerRight,
      };
      onLog(`hero -> showAttach(${attachPos})`);
      void SmartDialog.showAttach({
        targetContext: attachBtnRef.current,
        alignment: alignMap[attachPos],
        builder: ({ dismiss }) => {
          const pop = document.createElement('div');
          pop.className = 'pg-dialog-box';
          pop.style.cssText = 'min-width:220px;padding:12px 14px;';
          pop.innerHTML = `<div style="font-weight:600;font-size:13px;margin-bottom:4px;">Anchored Popover</div><div style="font-size:12px;color:var(--pg-muted);margin-bottom:10px;">Alignment.${attachPos}</div>`;
          const close = document.createElement('button');
          close.className = 'pg-btn pg-btn--sm pg-btn--primary';
          close.textContent = 'Close';
          close.onclick = () => void dismiss();
          pop.appendChild(close);
          return pop;
        },
      });
      return;
    }

    onLog('hero -> SmartDialog.show<boolean>()');
    const accepted = await SmartDialog.show<boolean>({
      alignment: Alignment.center,
      builder: ({ dismiss }) => {
        const box = document.createElement('div');
        box.className = 'pg-dialog-box';
        box.innerHTML = `
          <div style="font-weight:700;font-size:15px;margin-bottom:6px;">Publish release v1.0.0?</div>
          <p style="margin:0 0 14px;font-size:13px;color:var(--pg-muted);">Promise-based return value resolves cleanly back to your caller.</p>
        `;
        const actions = document.createElement('div');
        actions.className = 'pg-actions';
        actions.style.justifyContent = 'flex-end';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'pg-btn pg-btn--sm';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = () => void dismiss(false);

        const okBtn = document.createElement('button');
        okBtn.className = 'pg-btn pg-btn--sm pg-btn--primary';
        okBtn.textContent = 'Confirm';
        okBtn.onclick = () => void dismiss(true);

        actions.append(cancelBtn, okBtn);
        box.appendChild(actions);
        return box;
      },
    });
    if (accepted !== undefined) {
      void SmartDialog.showToast(`Resolved: ${String(accepted)}`);
    }
  };

  const runSpotlightTour = () => {
    const showStep = (step: 1 | 2) => {
      const target = step === 1 ? tourBtnRef.current : deckCardRef.current;
      if (!target) return;
      onLog(`hero spotlight step ${step}/2`);
      void SmartDialog.showAttach({
        tag: 'hero-spotlight-tour',
        keepSingle: true,
        targetContext: target,
        alignment: step === 1 ? Alignment.bottomCenter : Alignment.centerLeft,
        nonAnimationTypes: [
          SmartNonAnimationType.highlightMask_nonAnimation,
          SmartNonAnimationType.continueKeepSingle,
        ],
        highlightBuilder: (offset, size) => ({
          left: offset.dx - 6,
          top: offset.dy - 6,
          width: size.width + 12,
          height: size.height + 12,
          borderRadius: 12,
          shape:
            step === 1 ? SmartHighlightShape.rect : SmartHighlightShape.rect,
        }),
        builder: ({ dismiss }) => {
          const card = document.createElement('div');
          card.className = 'pg-dialog-box';
          card.style.maxWidth = '290px';
          card.innerHTML = `
            <div style="font-size:11px;font-weight:600;color:var(--pg-primary);margin-bottom:4px;">SPOTLIGHT TOUR · ${step} / 2</div>
            <div style="font-weight:600;font-size:14px;margin-bottom:6px;">${
              step === 1
                ? 'SVG Even-Odd Spotlight Cutout'
                : '5-Layer Stackable Overlay Deck'
            }</div>
            <p style="margin:0 0 12px;font-size:12.5px;color:var(--pg-muted);">${
              step === 1
                ? 'Automatically tracks anchor geometry, scroll, and resize with keepSingle reuse.'
                : 'Try Toast, Notify, Loading, Attach, and Custom modals independently.'
            }</p>
          `;
          const footer = document.createElement('div');
          footer.className = 'pg-actions';
          footer.style.justifyContent = 'flex-end';
          const btn = document.createElement('button');
          btn.className = 'pg-btn pg-btn--sm pg-btn--primary';
          btn.textContent = step === 1 ? 'Next Step →' : 'Done';
          btn.onclick = () => {
            if (step === 1) {
              showStep(2);
            } else {
              void dismiss();
            }
          };
          footer.appendChild(btn);
          card.appendChild(footer);
          return card;
        },
      });
    };

    showStep(1);
  };

  return (
    <section
      data-testid="hero-showcase"
      className="pg-hero-glow border-b border-[var(--pg-border)] bg-[var(--pg-bg)]"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-8 px-5 py-8 lg:grid-cols-12 lg:px-8 lg:py-10">
        {/* Left Editorial Column */}
        <div className="flex flex-col items-start gap-4 lg:col-span-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              <span>Inspired by flutter_smart_dialog</span>
            </Badge>
            <Badge variant="outline">Vanilla TS · React 19 · Vue 3</Badge>
          </div>

          <h2 className="m-0 text-3xl font-bold tracking-tight text-[var(--pg-text)] sm:text-4xl">
            Every frontend overlay layer,{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-sky-400">
              zero dependencies.
            </span>
          </h2>

          <p className="m-0 max-w-xl text-sm leading-relaxed text-[var(--pg-muted)] sm:text-[15px]">
            Custom modals, anchored popovers, SVG spotlight tours, semantic
            notifications, singleton loading, and smart toast queues — with SPA
            route &amp; DOM lifecycle binding and native{' '}
            <code className="rounded bg-[var(--pg-surface-subtle)] px-1.5 py-0.5 text-xs">
              &lt;dialog&gt;
            </code>{' '}
            top-layer support.
          </p>

          {/* Copyable Install Pill */}
          <button
            type="button"
            onClick={handleCopyInstall}
            className="group inline-flex items-center gap-3 rounded-xl border border-[var(--pg-border-strong)] bg-[var(--pg-surface)] px-3.5 py-2 text-xs font-mono text-[var(--pg-text)] shadow-xs transition-all hover:border-indigo-500/50 cursor-pointer"
          >
            <Terminal
              className="h-3.5 w-3.5 text-indigo-500"
              aria-hidden="true"
            />
            <span>{INSTALL_CMD}</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-[var(--pg-surface-subtle)] px-2 py-0.5 text-[11px] font-sans font-medium text-[var(--pg-muted)] group-hover:text-[var(--pg-text)]">
              {copiedCmd ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <Button
              ref={tourBtnRef}
              type="button"
              variant="default"
              size="lg"
              onClick={runSpotlightTour}
            >
              <Compass className="h-4 w-4" aria-hidden="true" />
              <span>Run Spotlight Tour</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onJumpWorkbench}
            >
              <span>Explore 37 Demos</span>
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </Button>

            <a
              href={getDocsHref('guide/getting-started')}
              data-testid="hero-docs-link"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-indigo-500/35 bg-indigo-500/10 px-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 transition-colors hover:bg-indigo-500/20"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span>快速接入文档</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--pg-muted)]">
            <span>自动注入样式 · 零配置即用 · 多端支持：</span>
            <a href={getDocsHref('guide/frameworks')} className="underline hover:text-[var(--pg-text)]">
              Vanilla TS
            </a>
            <a href={getDocsHref('guide/frameworks')} className="underline hover:text-[var(--pg-text)]">
              React Provider
            </a>
            <a href={getDocsHref('guide/frameworks')} className="underline hover:text-[var(--pg-text)]">
              Vue 3 Plugin
            </a>
            <a href={getDocsHref('api/')} className="underline hover:text-[var(--pg-text)]">
              TypeDoc API
            </a>
          </div>
        </div>

        {/* Right Interactive Quick-Try Card (Sonner Style) */}
        <div className="lg:col-span-6">
          <div
            ref={deckCardRef}
            className="overflow-hidden rounded-2xl border border-[var(--pg-border)] bg-[var(--pg-surface)] shadow-lg shadow-zinc-950/5 dark:shadow-black/40"
          >
            <div className="flex flex-col items-start gap-2 border-b border-[var(--pg-border)] bg-[var(--pg-surface-subtle)]/70 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
              <span className="text-xs font-semibold text-[var(--pg-text)]">
                5-Layer Live Try Deck
              </span>

              <Tabs
                value={activeLayer}
                onValueChange={(v) => setActiveLayer(v as HeroLayerKey)}
                className="max-w-full"
              >
                <TabsList className="max-w-full flex-wrap">
                  <TabsTrigger value="toast" className="px-2 sm:px-2.5">
                    <MessageSquare className="hidden h-3 w-3 sm:inline-block" />
                    <span>Toast</span>
                  </TabsTrigger>
                  <TabsTrigger value="notify" className="px-2 sm:px-2.5">
                    <Bell className="hidden h-3 w-3 sm:inline-block" />
                    <span>Notify</span>
                  </TabsTrigger>
                  <TabsTrigger value="loading" className="px-2 sm:px-2.5">
                    <LoaderCircle className="hidden h-3 w-3 sm:inline-block" />
                    <span>Loading</span>
                  </TabsTrigger>
                  <TabsTrigger value="attach" className="px-2 sm:px-2.5">
                    <Pin className="hidden h-3 w-3 sm:inline-block" />
                    <span>Attach</span>
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="px-2 sm:px-2.5">
                    <Layers className="hidden h-3 w-3 sm:inline-block" />
                    <span>Custom</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Interactive Controls Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--pg-border)] px-4 py-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {activeLayer === 'toast' &&
                  (['last', 'normal', 'multi'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setToastMode(m)}
                      className={cn(
                        'rounded-md border px-2.5 py-1 text-[11.5px] font-medium transition-colors cursor-pointer',
                        toastMode === m
                          ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          : 'border-[var(--pg-border)] bg-[var(--pg-surface)] text-[var(--pg-muted)] hover:text-[var(--pg-text)]',
                      )}
                    >
                      {m}
                    </button>
                  ))}

                {activeLayer === 'notify' &&
                  (['success', 'warning', 'error'] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setNotifyKind(k)}
                      className={cn(
                        'rounded-md border px-2.5 py-1 text-[11.5px] font-medium transition-colors cursor-pointer',
                        notifyKind === k
                          ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          : 'border-[var(--pg-border)] bg-[var(--pg-surface)] text-[var(--pg-muted)] hover:text-[var(--pg-text)]',
                      )}
                    >
                      {k}
                    </button>
                  ))}

                {activeLayer === 'attach' &&
                  (['bottomCenter', 'topCenter', 'centerRight'] as const).map(
                    (p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAttachPos(p)}
                        className={cn(
                          'rounded-md border px-2.5 py-1 text-[11.5px] font-medium transition-colors cursor-pointer',
                          attachPos === p
                            ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                            : 'border-[var(--pg-border)] bg-[var(--pg-surface)] text-[var(--pg-muted)] hover:text-[var(--pg-text)]',
                        )}
                      >
                        {p}
                      </button>
                    ),
                  )}

                {(activeLayer === 'loading' || activeLayer === 'custom') && (
                  <span className="text-xs text-[var(--pg-muted)]">
                    {activeLayer === 'loading'
                      ? 'Auto-dismisses after 1.6s singleton guard'
                      : 'Awaits boolean result from Promise<T>'}
                  </span>
                )}
              </div>

              <Button
                ref={attachBtnRef}
                type="button"
                variant="default"
                size="default"
                onClick={() => void triggerHeroDemo()}
              >
                Trigger {activeLayer}
              </Button>
            </div>

            {/* Compact Shiki Code Preview */}
            <CodeBlock code={heroSnippet} lang="typescript" isDark={isDark} compact />
          </div>
        </div>
      </div>
    </section>
  );
}
