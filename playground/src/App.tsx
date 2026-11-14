import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { SmartDialog, SmartStatus } from 'fe-smart-dialog';
import { CodeInspectorPane } from './components/CodeInspectorPane';
import { CommandPalette } from './components/CommandPalette';
import {
  DemoStagePane,
  type LayerStatusSnapshot,
} from './components/DemoStagePane';
import { HeroShowcase } from './components/HeroShowcase';
import { SidebarTree } from './components/SidebarTree';
import { Topbar, type ThemeChoice } from './components/Topbar';
import { ATTACH_DEMOS } from './demos/attachDemos';
import { DIALOG_DEMOS } from './demos/dialogDemos';
import { FEEDBACK_DEMOS } from './demos/feedbackDemos';
import { OTHER_AND_FRAMEWORK_DEMOS } from './demos/otherFrameworkDemos';
import type { DemoCategoryId, DemoCategoryMeta, DemoEntry } from './types/demo';
import { THEME_BY_KEY } from './utils/enumMaps';

const CATEGORIES: DemoCategoryMeta[] = [
  { id: 'dialog', label: 'Dialog' },
  { id: 'attach', label: 'Attach' },
  { id: 'notify', label: 'Notify' },
  { id: 'loading', label: 'Loading' },
  { id: 'toast', label: 'Toast' },
  { id: 'other', label: 'Other & Frameworks' },
];

const CATEGORY_LABELS: Record<DemoCategoryId, string> = {
  dialog: 'Dialog',
  attach: 'Attach',
  notify: 'Notify',
  loading: 'Loading',
  toast: 'Toast',
  other: 'Other & Frameworks',
};

const ALL_DEMOS: DemoEntry[] = [
  ...DIALOG_DEMOS,
  ...ATTACH_DEMOS,
  ...FEEDBACK_DEMOS,
  ...OTHER_AND_FRAMEWORK_DEMOS,
];

const DIALOG_PARAM = 'dialogType';

function resolveInitialDemo(): { demo: DemoEntry; hasDeepLink: boolean } {
  const params = new URLSearchParams(window.location.search);
  const targetName = params.get(DIALOG_PARAM);
  if (targetName) {
    const matched = ALL_DEMOS.find(
      (d) =>
        d.className.toLowerCase() === targetName.toLowerCase() ||
        d.id.toLowerCase() === targetName.toLowerCase(),
    );
    if (matched) {
      return { demo: matched, hasDeepLink: true };
    }
  }
  return { demo: ALL_DEMOS[0]!, hasDeepLink: false };
}

function dismissAllOverlays(): Promise<void> {
  return Promise.all([
    SmartDialog.dismiss({ status: SmartStatus.allDialog, force: true }),
    SmartDialog.dismiss({ status: SmartStatus.allNotify, force: true }),
    SmartDialog.dismiss({ status: SmartStatus.loading, force: true }),
    SmartDialog.dismiss({ status: SmartStatus.allToast, force: true }),
  ]).then(() => undefined);
}

function formatLogLine(msg: string): string {
  const now = new Date();
  const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  return `[${ts}] ${msg}`;
}

export function App() {
  const initial = useMemo(() => resolveInitialDemo(), []);
  const workbenchRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<ThemeChoice>('auto');
  const [systemDark, setSystemDark] = useState<boolean>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  const [heroOpen, setHeroOpen] = useState<boolean>(!initial.hasDeepLink);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeDemo, setActiveDemo] = useState<DemoEntry>(initial.demo);
  const [expandedCategories, setExpandedCategories] = useState<
    Set<DemoCategoryId>
  >(() => new Set<DemoCategoryId>(['dialog', initial.demo.category]));
  const [logs, setLogs] = useState<string[]>([
    '[ready] 选择左侧菜单或点击上方 Quick-Try 卡片交互',
  ]);
  const [status, setStatus] = useState<LayerStatusSnapshot>({
    custom: false,
    attach: false,
    notify: false,
    loading: false,
    toast: false,
  });
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    window.matchMedia('(min-width: 1024px)').matches,
  );

  const isDark = theme === 'dark' || (theme === 'auto' && systemDark);

  useEffect(() => {
    const darkMq = window.matchMedia('(prefers-color-scheme: dark)');
    const onDarkChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    darkMq.addEventListener('change', onDarkChange);

    const desktopMq = window.matchMedia('(min-width: 1024px)');
    const onDesktopChange = (e: MediaQueryListEvent) =>
      setIsDesktop(e.matches);
    desktopMq.addEventListener('change', onDesktopChange);

    return () => {
      darkMq.removeEventListener('change', onDarkChange);
      desktopMq.removeEventListener('change', onDesktopChange);
    };
  }, []);

  useEffect(() => {
    const rootEl = document.documentElement;
    rootEl.setAttribute('data-pg-theme', theme);
    rootEl.setAttribute('data-pg-resolved-theme', isDark ? 'dark' : 'light');
  }, [theme, isDark]);

  useEffect(() => {
    let rafId = 0;
    const sync = () => {
      const next: LayerStatusSnapshot = {
        custom: SmartDialog.config.custom.isExist,
        attach: SmartDialog.config.attach.isExist,
        notify: SmartDialog.config.notify.isExist,
        loading: SmartDialog.config.loading.isExist,
        toast: SmartDialog.config.toast.isExist,
      };
      setStatus((prev) =>
        prev.custom === next.custom &&
        prev.attach === next.attach &&
        prev.notify === next.notify &&
        prev.loading === next.loading &&
        prev.toast === next.toast
          ? prev
          : next,
      );
      rafId = window.requestAnimationFrame(sync);
    };
    rafId = window.requestAnimationFrame(sync);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const appendLog = useCallback((msg: string) => {
    const line = formatLogLine(msg);
    setLogs((prev) => [...prev.slice(-39), line]);
  }, []);

  const handleThemeChange = useCallback(
    (next: ThemeChoice) => {
      setTheme(next);
      SmartDialog.init({ theme: THEME_BY_KEY[next] });
      appendLog(`theme -> SmartTheme.${next}`);
    },
    [appendLog],
  );

  const handleDismissAll = useCallback(() => {
    appendLog('Dismiss Everything');
    void dismissAllOverlays();
  }, [appendLog]);

  const handleSelectDemo = useCallback((demo: DemoEntry) => {
    void dismissAllOverlays();
    setActiveDemo(demo);
    setMobileSidebarOpen(false);
    setExpandedCategories((prev) => {
      if (prev.has(demo.category)) return prev;
      const next = new Set(prev);
      next.add(demo.category);
      return next;
    });

    const url = new URL(window.location.href);
    url.searchParams.set(DIALOG_PARAM, demo.className);
    window.history.replaceState(window.history.state, '', url.toString());
  }, []);

  const handleToggleCategory = useCallback((id: DemoCategoryId) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const jumpToWorkbench = useCallback(() => {
    workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--pg-bg)] text-[var(--pg-text)]">
      <Topbar
        demoCount={ALL_DEMOS.length}
        theme={theme}
        heroOpen={heroOpen}
        onThemeChange={handleThemeChange}
        onToggleHero={() => setHeroOpen((v) => !v)}
        onToggleSidebar={() => setMobileSidebarOpen((v) => !v)}
        onOpenCommand={() => setCmdOpen(true)}
        onDismissAll={handleDismissAll}
      />

      {heroOpen && (
        <HeroShowcase
          isDark={isDark}
          onLog={appendLog}
          onJumpWorkbench={jumpToWorkbench}
        />
      )}

      <main
        ref={workbenchRef}
        className="flex flex-1 min-h-0 flex-col bg-[var(--pg-bg)]"
      >
        {isDesktop ? (
          <div className="h-[calc(100vh-3.5rem)] min-h-[600px] w-full">
            <Group orientation="horizontal" className="h-full w-full">
              <Panel defaultSize="20%" minSize="15%" maxSize="32%">
                <SidebarTree
                  categories={CATEGORIES}
                  demos={ALL_DEMOS}
                  activeDemo={activeDemo}
                  expandedCategories={expandedCategories}
                  searchKeyword={searchKeyword}
                  mobileOpen={mobileSidebarOpen}
                  onSearchChange={setSearchKeyword}
                  onToggleCategory={handleToggleCategory}
                  onSelectDemo={handleSelectDemo}
                />
              </Panel>

              <Separator className="pg-resizer" />

              <Panel defaultSize="43%" minSize="25%">
                <CodeInspectorPane demo={activeDemo} isDark={isDark} />
              </Panel>

              <Separator className="pg-resizer" />

              <Panel defaultSize="37%" minSize="25%">
                <DemoStagePane
                  demo={activeDemo}
                  status={status}
                  logs={logs}
                  onLog={appendLog}
                  onClearLogs={() => setLogs([])}
                  onResetStageOverlays={() => void dismissAllOverlays()}
                />
              </Panel>
            </Group>
          </div>
        ) : (
          <div className="flex flex-col">
            <SidebarTree
              categories={CATEGORIES}
              demos={ALL_DEMOS}
              activeDemo={activeDemo}
              expandedCategories={expandedCategories}
              searchKeyword={searchKeyword}
              mobileOpen={mobileSidebarOpen}
              onSearchChange={setSearchKeyword}
              onToggleCategory={handleToggleCategory}
              onSelectDemo={handleSelectDemo}
            />
            <CodeInspectorPane demo={activeDemo} isDark={isDark} />
            <DemoStagePane
              demo={activeDemo}
              status={status}
              logs={logs}
              onLog={appendLog}
              onClearLogs={() => setLogs([])}
              onResetStageOverlays={() => void dismissAllOverlays()}
            />
          </div>
        )}
      </main>

      <CommandPalette
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        demos={ALL_DEMOS}
        categoryLabels={CATEGORY_LABELS}
        onSelectDemo={(demo) => {
          handleSelectDemo(demo);
          jumpToWorkbench();
        }}
        onThemeChange={handleThemeChange}
        onToggleHero={() => setHeroOpen((v) => !v)}
        onDismissAll={handleDismissAll}
      />
    </div>
  );
}
