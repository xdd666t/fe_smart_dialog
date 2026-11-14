import { useEffect, useState } from 'react';
import { Check, Copy, Link2 } from 'lucide-react';
import { FRAMEWORK_SNIPPETS_BY_ID } from '../demos/snippets';
import type { DemoEntry } from '../types/demo';
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
  const [codeTab, setCodeTab] = useState<CodeTab>('vanilla');

  const frameworkSnippets = FRAMEWORK_SNIPPETS_BY_ID[demo.id];
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
        : demo.code;

  const activeFilename =
    codeTab === 'react'
      ? `${demo.className}.tsx`
      : codeTab === 'vue'
        ? `${demo.className}.vue.ts`
        : `${demo.className}.ts`;

  const activeLang = codeTab === 'react' ? 'tsx' : 'typescript';

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
