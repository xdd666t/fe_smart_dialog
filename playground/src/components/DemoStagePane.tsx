import { useEffect, useRef, useState } from 'react';
import { Eraser, RotateCcw, Terminal } from 'lucide-react';
import { cn } from '../lib/utils';
import type { DemoEntry } from '../types/demo';
import { Badge } from './ui/badge';

export interface LayerStatusSnapshot {
  custom: boolean;
  attach: boolean;
  notify: boolean;
  loading: boolean;
  toast: boolean;
}

interface DemoStagePaneProps {
  demo: DemoEntry;
  status: LayerStatusSnapshot;
  logs: string[];
  onLog: (message: string) => void;
  onClearLogs: () => void;
  onResetStageOverlays: () => void;
}

const LAYER_KEYS: ReadonlyArray<keyof LayerStatusSnapshot> = [
  'custom',
  'attach',
  'notify',
  'loading',
  'toast',
];

export function DemoStagePane({
  demo,
  status,
  logs,
  onLog,
  onClearLogs,
  onResetStageOverlays,
}: DemoStagePaneProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const logBoxRef = useRef<HTMLDivElement>(null);
  const [remountTick, setRemountTick] = useState(0);

  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;

    stageEl.innerHTML = '';
    const cleanup = demo.mount(stageEl, { log: onLog });

    return () => {
      cleanup?.();
      stageEl.innerHTML = '';
    };
  }, [demo, onLog, remountTick]);

  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <section className="flex h-full min-w-0 min-h-0 flex-col gap-3 p-3.5">
      {/* Live Interactive Stage */}
      <div className="flex flex-1 min-h-[280px] flex-col overflow-hidden rounded-xl border border-[var(--pg-border)] bg-[var(--pg-surface)] shadow-2xs">
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-[var(--pg-border)] bg-[var(--pg-surface)] px-3.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span className="text-xs font-semibold text-[var(--pg-text)]">
              Interactive Live Stage
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" data-testid="stage-classname">
              {demo.className}
            </Badge>
            <button
              type="button"
              onClick={() => {
                onResetStageOverlays();
                setRemountTick((t) => t + 1);
                onLog(`remount stage -> ${demo.className}`);
              }}
              title="Reset & Remount Stage"
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[var(--pg-muted)] transition-colors hover:bg-[var(--pg-surface-subtle)] hover:text-[var(--pg-text)] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          ref={stageRef}
          data-testid="demo-stage"
          className="pg-dot-grid flex flex-1 min-h-0 flex-col items-center justify-center gap-3.5 overflow-auto p-5"
        />
      </div>

      {/* 5-Layer Telemetry & Event Console */}
      <div
        data-testid="playground-status"
        className="flex shrink-0 flex-col gap-2.5 rounded-xl border border-[var(--pg-border)] bg-[var(--pg-surface)] p-3 shadow-2xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {LAYER_KEYS.map((key) => {
              const active = status[key];
              const pillKey = `st-${key}`;
              return (
                <span
                  key={key}
                  data-pill={pillKey}
                  data-active={String(active)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] transition-colors',
                    active
                      ? 'border-emerald-500/40 bg-emerald-500/12 font-semibold text-emerald-600 dark:text-emerald-400'
                      : 'border-[var(--pg-border)] bg-[var(--pg-surface-subtle)] text-[var(--pg-muted)]',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      active
                        ? 'bg-emerald-500 animate-pulse'
                        : 'bg-[var(--pg-subtle)]/50',
                    )}
                  />
                  <span>{key}:</span>
                  <strong data-testid={pillKey}>{String(active)}</strong>
                </span>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onClearLogs}
            title="Clear Event Log"
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-[var(--pg-subtle)] transition-colors hover:bg-[var(--pg-surface-subtle)] hover:text-[var(--pg-text)] cursor-pointer"
          >
            <Eraser className="h-3 w-3" aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>

        <div
          ref={logBoxRef}
          data-testid="event-log"
          className="h-[88px] overflow-y-auto rounded-lg border border-[var(--pg-border)] bg-[var(--pg-surface-subtle)] px-2.5 py-2 font-mono text-[11px] leading-relaxed text-[var(--pg-muted)]"
        >
          {logs.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-1.5 truncate">
              <Terminal
                className="h-2.5 w-2.5 shrink-0 text-[var(--pg-subtle)]"
                aria-hidden="true"
              />
              <span className="truncate">{entry}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
