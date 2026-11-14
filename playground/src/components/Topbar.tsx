import {
  Layers,
  Menu,
  Monitor,
  Moon,
  Search,
  Sparkles,
  Sun,
  Trash2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export type ThemeChoice = 'auto' | 'light' | 'dark';

interface TopbarProps {
  demoCount: number;
  theme: ThemeChoice;
  heroOpen: boolean;
  onThemeChange: (next: ThemeChoice) => void;
  onToggleHero: () => void;
  onToggleSidebar: () => void;
  onOpenCommand: () => void;
  onDismissAll: () => void;
}

const THEME_OPTIONS: ReadonlyArray<{
  key: ThemeChoice;
  label: string;
  Icon: typeof Monitor;
}> = [
  { key: 'auto', label: 'Auto', Icon: Monitor },
  { key: 'light', label: 'Light', Icon: Sun },
  { key: 'dark', label: 'Dark', Icon: Moon },
];

export function Topbar({
  demoCount,
  theme,
  heroOpen,
  onThemeChange,
  onToggleHero,
  onToggleSidebar,
  onOpenCommand,
  onDismissAll,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[var(--pg-border)] bg-[var(--pg-surface)]/85 px-2.5 backdrop-blur-md sm:gap-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0 lg:hidden"
          data-testid="btn-toggle-sidebar"
          aria-label="Toggle Menu"
          onClick={onToggleSidebar}
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </Button>

        <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          <div
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/30 sm:h-8 sm:w-8"
          >
            <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="m-0 truncate text-[13.5px] font-bold tracking-tight text-[var(--pg-text)] sm:text-[15px]">
              fe-smart-dialog
            </h1>
            <Badge className="hidden sm:inline-flex">
              {demoCount} Demos
            </Badge>
            <Badge variant="secondary" className="hidden md:inline-flex">
              Zero Deps
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onOpenCommand}
          className="hidden md:inline-flex h-8 w-52 items-center justify-between gap-2 rounded-lg border border-[var(--pg-border)] bg-[var(--pg-surface-subtle)] px-2.5 text-xs text-[var(--pg-muted)] transition-colors hover:border-[var(--pg-border-strong)] hover:text-[var(--pg-text)] cursor-pointer"
        >
          <span className="inline-flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Quick jump...</span>
          </span>
          <kbd className="rounded border border-[var(--pg-border)] bg-[var(--pg-surface)] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[var(--pg-subtle)]">
            ⌘K
          </kbd>
        </button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleHero}
          aria-pressed={heroOpen}
          className={cn(
            'hidden sm:inline-flex',
            heroOpen &&
              'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
          )}
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Showcase</span>
        </Button>

        <div
          className="inline-flex items-center rounded-lg border border-[var(--pg-border)] bg-[var(--pg-surface-subtle)] p-0.5"
          role="group"
          aria-label="Theme Switch"
        >
          {THEME_OPTIONS.map(({ key, label, Icon }) => {
            const active = theme === key;
            return (
              <button
                key={key}
                type="button"
                data-theme-opt={key}
                data-testid={`btn-theme-${key}`}
                aria-pressed={active}
                onClick={() => onThemeChange(key)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11.5px] font-medium transition-all cursor-pointer sm:px-2',
                  active
                    ? 'bg-[var(--pg-surface)] text-[var(--pg-text)] shadow-2xs'
                    : 'text-[var(--pg-muted)] hover:text-[var(--pg-text)]',
                )}
              >
                <Icon className="h-3 w-3" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>

        <a
          href="https://github.com/xdd666t/fe_smart_dialog"
          target="_blank"
          rel="noreferrer"
          className="hidden xl:inline-flex h-8 items-center rounded-lg border border-[var(--pg-border)] px-2.5 text-xs font-medium text-[var(--pg-muted)] transition-colors hover:bg-[var(--pg-surface-subtle)] hover:text-[var(--pg-text)]"
        >
          GitHub
        </a>

        <Button
          type="button"
          variant="destructive"
          size="sm"
          data-testid="global-force-clear"
          onClick={onDismissAll}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Dismiss Everything</span>
          <span className="sm:hidden">Clear</span>
        </Button>
      </div>
    </header>
  );
}
