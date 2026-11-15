import { useEffect } from 'react';
import { Monitor, Moon, Sun, Trash2 } from 'lucide-react';
import type { DemoCategoryId, DemoEntry } from '../types/demo';
import type { ThemeChoice } from './Topbar';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  demos: DemoEntry[];
  categoryLabels: Record<DemoCategoryId, string>;
  onSelectDemo: (demo: DemoEntry) => void;
  onThemeChange: (theme: ThemeChoice) => void;
  onDismissAll: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  demos,
  categoryLabels,
  onSelectDemo,
  onThemeChange,
  onDismissAll,
}: CommandPaletteProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  const grouped = new Map<DemoCategoryId, DemoEntry[]>();
  for (const demo of demos) {
    const list = grouped.get(demo.category) ?? [];
    list.push(demo);
    grouped.set(demo.category, list);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search 37 demos, APIs, or actions..." />
      <CommandList>
        <CommandEmpty>No matching demo or action found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => {
              onDismissAll();
              onOpenChange(false);
            }}
          >
            <span className="inline-flex items-center gap-2">
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
              <span>Dismiss All Active Overlays</span>
            </span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onThemeChange('light');
              onOpenChange(false);
            }}
          >
            <span className="inline-flex items-center gap-2">
              <Sun className="h-3.5 w-3.5" />
              <span>Theme: Light</span>
            </span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onThemeChange('dark');
              onOpenChange(false);
            }}
          >
            <span className="inline-flex items-center gap-2">
              <Moon className="h-3.5 w-3.5" />
              <span>Theme: Dark</span>
            </span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onThemeChange('auto');
              onOpenChange(false);
            }}
          >
            <span className="inline-flex items-center gap-2">
              <Monitor className="h-3.5 w-3.5" />
              <span>Theme: Auto (System)</span>
            </span>
          </CommandItem>
        </CommandGroup>

        {[...grouped.entries()].map(([category, items]) => (
          <CommandGroup key={category} heading={categoryLabels[category]}>
            {items.map((demo) => (
              <CommandItem
                key={demo.id}
                value={`${demo.className} ${demo.label} ${demo.route} ${demo.description}`}
                onSelect={() => {
                  onSelectDemo(demo);
                  onOpenChange(false);
                }}
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium text-[var(--pg-text)]">
                    {demo.className}
                  </span>
                  <span className="truncate text-[11px] text-[var(--pg-muted)]">
                    {demo.label} · {demo.route}
                  </span>
                </div>
                {demo.badge && (
                  <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                    {demo.badge}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
