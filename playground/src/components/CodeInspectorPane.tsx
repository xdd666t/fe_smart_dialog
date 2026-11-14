import { useEffect, useState } from 'react';
import { BookOpen, Check, ChevronDown, ChevronRight, Copy, Link2 } from 'lucide-react';
import { getDemoGuide } from '../demos/demoGuides';
import { FRAMEWORK_SNIPPETS_BY_ID } from '../demos/snippets';
import type { DemoEntry } from '../types/demo';
import { getDocsHref } from '../utils/docsUrl';
import { CodeBlock } from './CodeBlock';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

type CodeTab = 'vanilla' | 'react' | 'vue';

interface CodeInspectorPaneProps {
  demo: DemoEntry;
  isDark: boolean;
}

export function CodeInspectorPane({ demo, isDark }: CodeInspectorPaneProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [guideOpen, setGuideOpen] = useState(true);
  const [codeTab, setCodeTab] = useState<CodeTab>('vanilla');

  const frameworkSnippets = FRAMEWORK_SNIPPETS_BY_ID[demo.id];
  const guide = getDemoGuide(demo);
  const hasReact = Boolean(frameworkSnippets?.react);
  const hasVue = Boolean(frameworkSnippets?.vue);

  useEffect(() => {
    setCodeTab('vanilla');
  }, [demo.id]);

  const activeCode =
    codeTab === 'react' && frameworkSnippets?.react
      ? frameworkSnippets.react
      : codeTab === 'vue' && frameworkSnippets?.vue
        ? frameworkSnippets.vue
        : (frameworkSnippets?.vanilla ?? demo.code);

  const activeFilename =
    codeTab === 'react'
      ? `${demo.className}.tsx`
      : codeTab === 'vue'
        ? `${demo.className}.vue.ts`
        : `${demo.className}.ts`;

  const activeLang =
    codeTab === 'react' || demo.id === 'framework-react' ? 'tsx' : 'typescript';

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeCode);
    } catch {
      // ignore clipboard restrictions in headless contexts
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  const handleCopyLink = async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('dialogType', demo.className);
      await navigator.clipboard.writeText(url.toString());
    } catch {
      // ignore clipboard restrictions
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1500);
  };

  return (
    <section className="flex h-full min-w-0 min-h-0 flex-col gap-3 p-3.5">
      {/* Demo Metadata Card */}
      <div className="flex items-start justify-between gap-3 rounded-xl border border-[var(--pg-border)] bg-[var(--pg-surface)] p-4 shadow-2xs">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h2
              data-testid="demo-title"
              className="m-0 text-base font-bold tracking-tight text-[var(--pg-text)]"
            >
              {demo.className}
            </h2>
            <code
              data-testid="demo-route"
              className="rounded-md border border-[var(--pg-border)] bg-[var(--pg-surface-subtle)] px-2 py-0.5 text-[11px] text-[var(--pg-muted)]"
            >
              {demo.route}
            </code>
            {demo.badge && <Badge>{demo.badge}</Badge>}
          </div>
          <p
            data-testid="demo-desc"
            className="m-0 text-xs leading-relaxed text-[var(--pg-muted)]"
          >
            {demo.description}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={getDocsHref(guide.docPath)}
            data-testid="demo-docs-link"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-indigo-500/35 bg-indigo-500/10 px-2.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 transition-colors hover:bg-indigo-500/20"
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden md:inline">查看文档</span>
          </a>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            title="Copy direct link to this demo"
            className="shrink-0"
          >
            {copiedLink ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Link2 className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {copiedLink ? 'Link Copied' : 'Share'}
            </span>
          </Button>
        </div>
      </div>

      {/* Collapsible Usage & Key Options Panel */}
      {(guide.summaryPoints.length > 0 || guide.keyParams.length > 0) && (
        <div
          data-testid="demo-guide-panel"
          className="rounded-xl border border-[var(--pg-border)] bg-[var(--pg-surface)] shadow-2xs"
        >
          <button
            type="button"
            data-testid="demo-guide-toggle"
            onClick={() => setGuideOpen((v) => !v)}
            className="flex w-full items-center justify-between px-3.5 py-2 text-left text-xs font-semibold text-[var(--pg-text)] transition-colors hover:bg-[var(--pg-surface-subtle)]/60 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              {guideOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-[var(--pg-muted)]" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-[var(--pg-muted)]" />
              )}
              <span>使用要点与核心参数（Guide &amp; Key Options）</span>
            </span>
            <span className="text-[11px] font-normal text-[var(--pg-muted)]">
              {guide.keyParams.length > 0
                ? `${guide.keyParams.length} options`
                : 'Notes'}
            </span>
          </button>

          {guideOpen && (
            <div className="max-h-40 overflow-y-auto border-t border-[var(--pg-border)] px-3.5 py-2.5 text-xs">
              {guide.summaryPoints.length > 0 && (
                <ul className="m-0 mb-2 space-y-1 pl-4 text-[11.5px] leading-relaxed text-[var(--pg-muted)]">
                  {guide.summaryPoints.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              )}
              {guide.keyParams.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-[var(--pg-border)]">
                  <table className="w-full border-collapse text-left text-[11px]">
                    <thead className="bg-[var(--pg-surface-subtle)] text-[var(--pg-muted)]">
                      <tr>
                        <th className="px-2 py-1 font-semibold">Option</th>
                        <th className="px-2 py-1 font-semibold">Type</th>
                        <th className="px-2 py-1 font-semibold">Default</th>
                        <th className="px-2 py-1 font-semibold">说明</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--pg-border)]">
                      {guide.keyParams.map((p) => (
                        <tr key={p.name}>
                          <td className="px-2 py-1 font-mono font-medium text-[var(--pg-text)] whitespace-nowrap">
                            {p.name}
                          </td>
                          <td className="px-2 py-1 font-mono text-[var(--pg-muted)] whitespace-nowrap">
                            {p.type}
                          </td>
                          <td className="px-2 py-1 font-mono text-[var(--pg-muted)] whitespace-nowrap">
                            {p.defaultVal ?? '—'}
                          </td>
                          <td className="px-2 py-1 text-[var(--pg-muted)]">
                            {p.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Shiki Code Window */}
      <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-xl border border-[var(--pg-code-border)] bg-[var(--pg-code-bg)] shadow-sm">
        <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-[var(--pg-code-border)] bg-[var(--pg-code-bar)] px-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span
              data-testid="code-filename"
              className="truncate font-mono text-xs font-medium text-[var(--pg-text)]"
            >
              {activeFilename}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {(hasReact || hasVue) && (
              <Tabs
                value={codeTab}
                onValueChange={(v) => setCodeTab(v as CodeTab)}
              >
                <TabsList>
                  <TabsTrigger value="vanilla">TS</TabsTrigger>
                  {hasReact && <TabsTrigger value="react">React</TabsTrigger>}
                  {hasVue && <TabsTrigger value="vue">Vue</TabsTrigger>}
                </TabsList>
              </Tabs>
            )}

            <button
              type="button"
              data-testid="copy-code-btn"
              onClick={handleCopyCode}
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[var(--pg-border-strong)] bg-[var(--pg-surface)] px-2.5 text-[11.5px] font-medium text-[var(--pg-text)] transition-colors hover:bg-[var(--pg-surface-subtle)] cursor-pointer"
            >
              {copiedCode ? (
                <Check className="h-3 w-3 text-emerald-500" aria-hidden="true" />
              ) : (
                <Copy className="h-3 w-3 text-[var(--pg-muted)]" aria-hidden="true" />
              )}
              <span data-testid="copy-btn-label">
                {copiedCode ? 'Copied!' : 'Copy'}
              </span>
            </button>
          </div>
        </div>

        <CodeBlock
          key={`${demo.id}-${codeTab}`}
          code={activeCode}
          lang={activeLang}
          isDark={isDark}
          codeTestId="code-preview"
          scrollTestId="code-scroll"
        />
      </div>
    </section>
  );
}
