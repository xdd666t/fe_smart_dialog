import {
  AppWindow,
  Bell,
  Blocks,
  ChevronDown,
  LoaderCircle,
  MessageSquare,
  Pin,
  Search,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { DemoCategoryId, DemoCategoryMeta, DemoEntry } from '../types/demo';

interface SidebarTreeProps {
  categories: DemoCategoryMeta[];
  demos: DemoEntry[];
  activeDemo: DemoEntry;
  expandedCategories: Set<DemoCategoryId>;
  searchKeyword: string;
  mobileOpen: boolean;
  onSearchChange: (q: string) => void;
  onToggleCategory: (id: DemoCategoryId) => void;
  onSelectDemo: (demo: DemoEntry) => void;
}

const CATEGORY_ICON: Record<DemoCategoryId, typeof AppWindow> = {
  dialog: AppWindow,
  attach: Pin,
  notify: Bell,
  loading: LoaderCircle,
  toast: MessageSquare,
  other: Blocks,
};

export function SidebarTree({
  categories,
  demos,
  activeDemo,
  expandedCategories,
  searchKeyword,
  mobileOpen,
  onSearchChange,
  onToggleCategory,
  onSelectDemo,
}: SidebarTreeProps) {
  const q = searchKeyword.trim().toLowerCase();

  return (
    <aside
      data-testid="playground-sidebar"
      data-mobile-open={String(mobileOpen)}
      className={cn(
        'flex h-full min-h-0 flex-col overflow-hidden bg-[var(--pg-surface)] border-[var(--pg-border)]',
        'hidden data-[mobile-open=true]:flex data-[mobile-open=true]:max-h-[340px] data-[mobile-open=true]:border-b lg:flex lg:max-h-none lg:border-b-0',
      )}
    >
      <div className="border-b border-[var(--pg-border)] p-3">
        <div className="relative flex items-center">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[var(--pg-subtle)]"
          />
          <input
            type="search"
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="筛选演示，例如 guide / toast / react..."
            data-testid="sidebar-search"
            className="w-full rounded-lg border border-[var(--pg-border)] bg-[var(--pg-surface-subtle)] py-1.5 pr-3 pl-8 text-xs text-[var(--pg-text)] placeholder:text-[var(--pg-subtle)] outline-none transition-colors focus:border-indigo-500 focus:bg-[var(--pg-surface)] focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <nav
        aria-label="Demo Navigation"
        data-testid="demo-tree"
        className="flex-1 overflow-y-auto p-2"
      >
        {categories.map((cat) => {
          const items = demos.filter((d) => {
            if (d.category !== cat.id) return false;
            if (!q) return true;
            return (
              d.label.toLowerCase().includes(q) ||
              d.className.toLowerCase().includes(q) ||
              d.route.toLowerCase().includes(q) ||
              d.description.toLowerCase().includes(q)
            );
          });

          if (q && items.length === 0) return null;

          const isExpanded = Boolean(q) || expandedCategories.has(cat.id);
          const Icon = CATEGORY_ICON[cat.id];

          return (
            <div
              key={cat.id}
              className="mb-1"
              data-category={cat.id}
              data-expanded={String(isExpanded)}
            >
              <button
                type="button"
                data-testid={`nav-group-${cat.id}`}
                onClick={() => onToggleCategory(cat.id)}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-[var(--pg-text)] transition-colors hover:bg-[var(--pg-surface-subtle)] cursor-pointer"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Icon
                    className="h-3.5 w-3.5 shrink-0 text-indigo-500"
                    aria-hidden="true"
                  />
                  <span className="truncate">{cat.label}</span>
                  <span className="rounded-md bg-[var(--pg-surface-subtle)] px-1.5 py-0.2 font-mono text-[10px] font-medium text-[var(--pg-subtle)]">
                    {items.length}
                  </span>
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    'h-3.5 w-3.5 shrink-0 text-[var(--pg-subtle)] transition-transform duration-150',
                    !isExpanded && '-rotate-90',
                  )}
                />
              </button>

              {isExpanded && (
                <div className="mt-0.5 flex flex-col gap-0.5 border-l border-[var(--pg-border)] pl-2.5 ml-3.5">
                  {items.map((demo) => {
                    const isActive = demo.id === activeDemo.id;
                    return (
                      <button
                        key={demo.id}
                        type="button"
                        data-testid={`nav-item-${demo.id}`}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => onSelectDemo(demo)}
                        className={cn(
                          'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-all cursor-pointer',
                          isActive
                            ? 'bg-indigo-500/10 font-semibold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                            : 'font-medium text-[var(--pg-muted)] hover:bg-[var(--pg-surface-subtle)] hover:text-[var(--pg-text)]',
                        )}
                      >
                        <span className="truncate">{demo.label}</span>
                        {demo.badge && (
                          <span className="shrink-0 rounded bg-[var(--pg-surface-subtle)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--pg-subtle)]">
                            {demo.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
