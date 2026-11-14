import React, { useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useLang } from '@rspress/core/runtime';
import { getWorkbenchHref } from './workbenchUrl';

export type KnobValue = string | boolean | number;
export type KnobState = Record<string, KnobValue>;

export interface DemoKnob {
  key: string;
  labelZh: string;
  labelEn: string;
  type: 'select' | 'boolean' | 'number' | 'text';
  defaultValue: KnobValue;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface DemoActionContext {
  knobs: KnobState;
  targetRef: RefObject<HTMLButtonElement | null>;
  log: (message: string) => void;
  isEn: boolean;
}

export interface DemoAction {
  id: string;
  labelZh: string;
  labelEn: string;
  variant?: 'primary' | 'default';
  onRun: (ctx: DemoActionContext) => void | Promise<void>;
}

export interface DemoSnippets {
  vanilla?: string | ((knobs: KnobState) => string);
  react?: string | ((knobs: KnobState) => string);
  vue?: string | ((knobs: KnobState) => string);
  cdn?: string | ((knobs: KnobState) => string);
}

export interface LiveDemoCardProps {
  id?: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  workbenchId?: string;
  knobs?: DemoKnob[];
  actions: DemoAction[];
  snippets: DemoSnippets;
  hasAttachTarget?: boolean;
  attachTargetLabelZh?: string;
  attachTargetLabelEn?: string;
  defaultShowCode?: boolean;
  renderStageExtra?: (ctx: DemoActionContext) => ReactNode;
}

type SnippetTabKey = keyof DemoSnippets;

const TAB_LABELS: Record<SnippetTabKey, string> = {
  vanilla: 'Vanilla TS',
  react: 'React 18/19',
  vue: 'Vue 3',
  cdn: 'CDN / UMD',
};

export function LiveDemoCard({
  id,
  titleZh,
  titleEn,
  descZh,
  descEn,
  workbenchId,
  knobs = [],
  actions,
  snippets,
  hasAttachTarget = false,
  attachTargetLabelZh = '目标锚点元素（Anchor Target）',
  attachTargetLabelEn = 'Anchor Target Element',
  defaultShowCode = true,
  renderStageExtra,
}: LiveDemoCardProps) {
  const lang = useLang();
  const isEn = lang === 'en';
  const targetRef = useRef<HTMLButtonElement | null>(null);

  const [knobState, setKnobState] = useState<KnobState>(() => {
    const initial: KnobState = {};
    for (const k of knobs) {
      initial[k.key] = k.defaultValue;
    }
    return initial;
  });

  const availableTabs = useMemo(
    () =>
      (['vanilla', 'react', 'vue', 'cdn'] as SnippetTabKey[]).filter(
        (key) => snippets[key] !== undefined,
      ),
    [snippets],
  );

  const [activeTab, setActiveTab] = useState<SnippetTabKey>(
    () => availableTabs[0] ?? 'vanilla',
  );
  const [showCode, setShowCode] = useState(defaultShowCode);
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const appendLog = (message: string) => {
    const stamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setLogs((prev) => [`[${stamp}] ${message}`, ...prev].slice(0, 4));
  };

  const ctx: DemoActionContext = {
    knobs: knobState,
    targetRef,
    log: appendLog,
    isEn,
  };

  const activeSnippetRaw = snippets[activeTab];
  const activeCode =
    typeof activeSnippetRaw === 'function'
      ? activeSnippetRaw(knobState)
      : activeSnippetRaw ?? '';

  const handleCopy = async () => {
    if (!activeCode) return;
    try {
      await navigator.clipboard.writeText(activeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      appendLog(isEn ? 'Clipboard unavailable' : '剪贴板不可用');
    }
  };

  return (
    <div className="fsd-demo-card" data-testid={id ? `docs-demo-${id}` : undefined}>
      <div className="fsd-demo-header">
        <div>
          <h4 className="fsd-demo-title">{isEn ? titleEn : titleZh}</h4>
          <p className="fsd-demo-desc">{isEn ? descEn : descZh}</p>
        </div>
        {workbenchId && (
          <a
            href={getWorkbenchHref(workbenchId)}
            className="fsd-btn fsd-btn--subtle"
            data-testid={id ? `docs-workbench-${id}` : undefined}
          >
            <span>{isEn ? 'Open in Workbench' : '在工作台打开'}</span>
            <span aria-hidden="true">-&gt;</span>
          </a>
        )}
      </div>

      {knobs.length > 0 && (
        <div className="fsd-demo-knobs">
          {knobs.map((knob) => (
            <label key={knob.key} className="fsd-knob-item">
              <span className="fsd-knob-label">{isEn ? knob.labelEn : knob.labelZh}</span>
              {knob.type === 'select' && knob.options && (
                <select
                  className="fsd-knob-select"
                  value={String(knobState[knob.key] ?? knob.defaultValue)}
                  onChange={(e) =>
                    setKnobState((prev) => ({ ...prev, [knob.key]: e.target.value }))
                  }
                >
                  {knob.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
              {knob.type === 'boolean' && (
                <select
                  className="fsd-knob-select"
                  value={String(Boolean(knobState[knob.key]))}
                  onChange={(e) =>
                    setKnobState((prev) => ({
                      ...prev,
                      [knob.key]: e.target.value === 'true',
                    }))
                  }
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              )}
              {knob.type === 'number' && (
                <input
                  type="number"
                  className="fsd-knob-input"
                  value={Number(knobState[knob.key] ?? knob.defaultValue)}
                  min={knob.min}
                  max={knob.max}
                  step={knob.step ?? 100}
                  onChange={(e) =>
                    setKnobState((prev) => ({
                      ...prev,
                      [knob.key]: Number(e.target.value) || 0,
                    }))
                  }
                />
              )}
              {knob.type === 'text' && (
                <input
                  type="text"
                  className="fsd-knob-input"
                  value={String(knobState[knob.key] ?? '')}
                  onChange={(e) =>
                    setKnobState((prev) => ({ ...prev, [knob.key]: e.target.value }))
                  }
                />
              )}
            </label>
          ))}
        </div>
      )}

      <div className="fsd-demo-stage">
        <div className="fsd-target-grid">
          {hasAttachTarget && (
            <button
              ref={targetRef}
              type="button"
              className="fsd-btn"
              style={{
                borderStyle: 'dashed',
                borderColor: 'var(--rp-c-brand)',
                background: 'rgba(59, 130, 246, 0.08)',
              }}
              onClick={() => actions[0]?.onRun(ctx)}
            >
              {isEn ? attachTargetLabelEn : attachTargetLabelZh}
            </button>
          )}
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              data-testid={id ? `demo-action-${id}-${action.id}` : undefined}
              className={`fsd-btn ${
                action.variant === 'primary' ? 'fsd-btn--primary' : ''
              }`}
              onClick={() => void action.onRun(ctx)}
            >
              {isEn ? action.labelEn : action.labelZh}
            </button>
          ))}
        </div>

        {renderStageExtra?.(ctx)}

        {logs.length > 0 && (
          <div className="fsd-demo-log" aria-live="polite">
            {logs.map((line, index) => (
              <div key={`${line}-${index}`}>{line}</div>
            ))}
          </div>
        )}
      </div>

      {availableTabs.length > 0 && (
        <>
          <div className="fsd-demo-toolbar">
            <div className="fsd-demo-tabs" role="tablist">
              {availableTabs.map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === key}
                  className={`fsd-tab-btn ${activeTab === key ? 'is-active' : ''}`}
                  onClick={() => {
                    setActiveTab(key);
                    setShowCode(true);
                  }}
                >
                  {TAB_LABELS[key]}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                className="fsd-btn fsd-btn--subtle"
                onClick={() => void handleCopy()}
              >
                {copied
                  ? isEn
                    ? 'Copied!'
                    : '已复制'
                  : isEn
                    ? 'Copy Code'
                    : '复制代码'}
              </button>
              <button
                type="button"
                className="fsd-btn fsd-btn--subtle"
                onClick={() => setShowCode((v) => !v)}
              >
                {showCode ? (isEn ? 'Hide Code' : '收起代码') : isEn ? 'Show Code' : '展开代码'}
              </button>
            </div>
          </div>

          {showCode && (
            <pre className="fsd-demo-code">
              <code>{activeCode}</code>
            </pre>
          )}
        </>
      )}
    </div>
  );
}
