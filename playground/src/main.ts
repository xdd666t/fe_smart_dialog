import './styles.css';
import { SmartDialog, SmartStatus, SmartTheme } from 'fe-smart-dialog';
import { ATTACH_DEMOS } from './demos/attachDemos';
import { DIALOG_DEMOS } from './demos/dialogDemos';
import { FEEDBACK_DEMOS } from './demos/feedbackDemos';
import { OTHER_AND_FRAMEWORK_DEMOS } from './demos/otherFrameworkDemos';
import type { DemoCategoryId, DemoCategoryMeta, DemoEntry } from './types/demo';
import { THEME_BY_KEY } from './utils/enumMaps';
import { renderHighlightedCode } from './utils/highlight';

const CATEGORIES: DemoCategoryMeta[] = [
  {
    id: 'dialog',
    label: 'Dialog',
    iconSvg:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 20h8"/></svg>',
  },
  {
    id: 'attach',
    label: 'Attach',
    iconSvg:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v6"/><circle cx="12" cy="11" r="3"/><rect x="4" y="16" width="16" height="6" rx="2"/></svg>',
  },
  {
    id: 'notify',
    label: 'Notify',
    iconSvg:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  },
  {
    id: 'loading',
    label: 'Loading',
    iconSvg:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>',
  },
  {
    id: 'toast',
    label: 'Toast',
    iconSvg:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="14" width="18" height="6" rx="3"/><path d="M7 10h10"/></svg>',
  },
  {
    id: 'other',
    label: 'Other & Frameworks',
    iconSvg:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  },
];

const ALL_DEMOS: DemoEntry[] = [
  ...DIALOG_DEMOS,
  ...ATTACH_DEMOS,
  ...FEEDBACK_DEMOS,
  ...OTHER_AND_FRAMEWORK_DEMOS,
];

const DIALOG_PARAM = 'dialogType';

const rootEl = document.documentElement;
let currentTheme: SmartTheme = SmartTheme.auto;
rootEl.setAttribute('data-pg-theme', currentTheme);

const appEl = document.getElementById('app')!;
appEl.innerHTML = `
  <div class="pg-app">
    <header class="pg-topbar">
      <div class="pg-brand">
        <button class="pg-btn pg-btn--sm pg-sidebar-toggle" data-testid="btn-toggle-sidebar" aria-label="Toggle Menu">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="pg-brand-mark" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 10h8"/><path d="M8 14h5"/></svg>
        </div>
        <h1 class="pg-title">fe-smart-dialog</h1>
        <span class="pg-badge">${ALL_DEMOS.length} Demos</span>
      </div>

      <div class="pg-topbar-controls">
        <div class="pg-segmented" role="group" aria-label="Theme Switch">
          <button type="button" data-theme-opt="auto" data-testid="btn-theme-auto" aria-pressed="true">Auto</button>
          <button type="button" data-theme-opt="light" data-testid="btn-theme-light" aria-pressed="false">Light</button>
          <button type="button" data-theme-opt="dark" data-testid="btn-theme-dark" aria-pressed="false">Dark</button>
        </div>
        <button class="pg-btn pg-btn--danger pg-btn--sm" data-testid="global-force-clear">Dismiss Everything</button>
      </div>
    </header>

    <div class="pg-workspace">
      <aside class="pg-sidebar" data-testid="playground-sidebar" data-mobile-open="false">
        <div class="pg-sidebar-search">
          <div class="pg-search-wrap">
            <span class="pg-search-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input
              type="search"
              class="pg-search-input"
              placeholder="筛选演示，例如 guide / toast / react..."
              data-testid="sidebar-search"
            />
          </div>
        </div>
        <nav class="pg-tree-scroll" aria-label="Demo Navigation" data-testid="demo-tree"></nav>
      </aside>

      <section class="pg-code-pane">
        <div class="pg-demo-header">
          <div>
            <div class="pg-demo-title-row">
              <h2 class="pg-demo-name" data-testid="demo-title">-</h2>
              <code class="pg-demo-route" data-testid="demo-route">/</code>
            </div>
            <p class="pg-demo-desc" data-testid="demo-desc"></p>
          </div>
        </div>

        <div class="pg-code-card">
          <div class="pg-code-toolbar">
            <div class="pg-code-dots">
              <span class="pg-dot" style="background:#ef4444;"></span>
              <span class="pg-dot" style="background:#f59e0b;"></span>
              <span class="pg-dot" style="background:#22c55e;"></span>
              <span class="pg-code-filename" data-testid="code-filename">Example.ts</span>
            </div>
            <button type="button" class="pg-copy-btn" data-testid="copy-code-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span data-testid="copy-btn-label">Copy</span>
            </button>
          </div>
          <div class="pg-code-scroll" data-testid="code-scroll">
            <pre class="pg-code-pre"><code data-testid="code-preview"></code></pre>
          </div>
        </div>
      </section>

      <section class="pg-demo-pane">
        <div class="pg-stage-card">
          <div class="pg-stage-head">
            <span>Interactive Live Demo</span>
            <span class="pg-badge pg-badge--subtle" data-testid="stage-classname">-</span>
          </div>
          <div class="pg-stage-body" data-testid="demo-stage"></div>
        </div>

        <div class="pg-inspector" data-testid="playground-status">
          <div class="pg-status-pills">
            <span class="pg-pill" data-pill="st-custom">custom: <strong data-testid="st-custom">false</strong></span>
            <span class="pg-pill" data-pill="st-attach">attach: <strong data-testid="st-attach">false</strong></span>
            <span class="pg-pill" data-pill="st-notify">notify: <strong data-testid="st-notify">false</strong></span>
            <span class="pg-pill" data-pill="st-loading">loading: <strong data-testid="st-loading">false</strong></span>
            <span class="pg-pill" data-pill="st-toast">toast: <strong data-testid="st-toast">false</strong></span>
          </div>
          <div class="pg-log-box" data-testid="event-log">
            <div class="pg-log-entry">[ready] 选择左侧菜单并点击右侧按钮交互</div>
          </div>
        </div>
      </section>
    </div>
  </div>
`;

const sidebarEl = appEl.querySelector('[data-testid="playground-sidebar"]') as HTMLElement;
const treeEl = appEl.querySelector('[data-testid="demo-tree"]') as HTMLElement;
const searchInput = appEl.querySelector('[data-testid="sidebar-search"]') as HTMLInputElement;
const titleEl = appEl.querySelector('[data-testid="demo-title"]') as HTMLElement;
const routeEl = appEl.querySelector('[data-testid="demo-route"]') as HTMLElement;
const descEl = appEl.querySelector('[data-testid="demo-desc"]') as HTMLElement;
const codeFilenameEl = appEl.querySelector('[data-testid="code-filename"]') as HTMLElement;
const codeScrollEl = appEl.querySelector('[data-testid="code-scroll"]') as HTMLElement;
const codePreviewEl = appEl.querySelector('[data-testid="code-preview"]') as HTMLElement;
const stageClassEl = appEl.querySelector('[data-testid="stage-classname"]') as HTMLElement;
const stageBodyEl = appEl.querySelector('[data-testid="demo-stage"]') as HTMLElement;
const logBoxEl = appEl.querySelector('[data-testid="event-log"]') as HTMLElement;
const copyBtn = appEl.querySelector('[data-testid="copy-code-btn"]') as HTMLButtonElement;
const copyBtnLabel = appEl.querySelector('[data-testid="copy-btn-label"]') as HTMLElement;
const clearAllBtn = appEl.querySelector('[data-testid="global-force-clear"]') as HTMLButtonElement;
const toggleSidebarBtn = appEl.querySelector('[data-testid="btn-toggle-sidebar"]') as HTMLButtonElement;

const expandedCategories = new Set<DemoCategoryId>(['dialog']);
let activeDemo: DemoEntry = ALL_DEMOS[0]!;
let activeCleanup: (() => void) | null = null;
let searchKeyword = '';

function appendLog(msg: string): void {
  const row = document.createElement('div');
  row.className = 'pg-log-entry';
  const now = new Date();
  const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  row.textContent = `[${ts}] ${msg}`;
  logBoxEl.appendChild(row);
  while (logBoxEl.children.length > 40) {
    logBoxEl.firstElementChild?.remove();
  }
  logBoxEl.scrollTop = logBoxEl.scrollHeight;
}

function dismissAllOverlays(): Promise<void> {
  return Promise.all([
    SmartDialog.dismiss({ status: SmartStatus.allDialog, force: true }),
    SmartDialog.dismiss({ status: SmartStatus.allNotify, force: true }),
    SmartDialog.dismiss({ status: SmartStatus.loading, force: true }),
    SmartDialog.dismiss({ status: SmartStatus.allToast, force: true }),
  ]).then(() => undefined);
}

clearAllBtn.onclick = () => {
  appendLog('Dismiss Everything');
  void dismissAllOverlays();
};

toggleSidebarBtn.onclick = () => {
  const open = sidebarEl.getAttribute('data-mobile-open') === 'true';
  sidebarEl.setAttribute('data-mobile-open', open ? 'false' : 'true');
};

for (const themeBtn of appEl.querySelectorAll<HTMLButtonElement>('[data-theme-opt]')) {
  themeBtn.onclick = () => {
    const raw = themeBtn.getAttribute('data-theme-opt') ?? 'auto';
    const theme = THEME_BY_KEY[raw] ?? SmartTheme.auto;
    currentTheme = theme;
    rootEl.setAttribute('data-pg-theme', raw);
    SmartDialog.init({ theme });
    for (const btn of appEl.querySelectorAll<HTMLButtonElement>('[data-theme-opt]')) {
      btn.setAttribute(
        'aria-pressed',
        btn.getAttribute('data-theme-opt') === raw ? 'true' : 'false',
      );
    }
    appendLog(`theme -> SmartTheme.${raw}`);
  };
}

copyBtn.onclick = async () => {
  try {
    await navigator.clipboard.writeText(activeDemo.code);
    copyBtnLabel.textContent = 'Copied!';
  } catch {
    copyBtnLabel.textContent = 'Copied!';
  }
  setTimeout(() => {
    copyBtnLabel.textContent = 'Copy';
  }, 1500);
};

function renderMenuTree(): void {
  const q = searchKeyword.trim().toLowerCase();
  treeEl.innerHTML = '';

  for (const cat of CATEGORIES) {
    const items = ALL_DEMOS.filter((d) => {
      if (d.category !== cat.id) return false;
      if (!q) return true;
      return (
        d.label.toLowerCase().includes(q) ||
        d.className.toLowerCase().includes(q) ||
        d.route.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
      );
    });

    if (q && items.length === 0) continue;

    const isExpanded = Boolean(q) || expandedCategories.has(cat.id);
    const groupEl = document.createElement('div');
    groupEl.className = 'pg-tree-group';
    groupEl.setAttribute('data-category', cat.id);
    groupEl.setAttribute('data-expanded', String(isExpanded));

    const groupBtn = document.createElement('button');
    groupBtn.type = 'button';
    groupBtn.className = 'pg-tree-group-btn';
    groupBtn.setAttribute('data-testid', `nav-group-${cat.id}`);
    groupBtn.innerHTML = `
      <span class="pg-tree-group-left">
        <span class="pg-tree-group-icon">${cat.iconSvg}</span>
        <span>${cat.label}</span>
        <span class="pg-tree-count">${items.length}</span>
      </span>
      <span class="pg-tree-chevron">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </span>
    `;
    groupBtn.onclick = () => {
      if (expandedCategories.has(cat.id)) {
        expandedCategories.delete(cat.id);
      } else {
        expandedCategories.add(cat.id);
      }
      renderMenuTree();
    };

    const listEl = document.createElement('div');
    listEl.className = 'pg-tree-children';

    for (const demo of items) {
      const itemBtn = document.createElement('button');
      itemBtn.type = 'button';
      itemBtn.className = 'pg-tree-item';
      itemBtn.setAttribute('data-testid', `nav-item-${demo.id}`);
      if (demo.id === activeDemo.id) {
        itemBtn.setAttribute('aria-current', 'page');
      }
      const badgeHtml = demo.badge
        ? `<span class="pg-tree-item-code">${demo.badge}</span>`
        : '';
      itemBtn.innerHTML = `<span>${demo.label}</span>${badgeHtml}`;
      itemBtn.onclick = () => {
        sidebarEl.setAttribute('data-mobile-open', 'false');
        selectDemo(demo, true);
      };
      listEl.appendChild(itemBtn);
    }

    groupEl.append(groupBtn, listEl);
    treeEl.appendChild(groupEl);
  }
}

function selectDemo(demo: DemoEntry, updateUrl: boolean): void {
  activeCleanup?.();
  activeCleanup = null;
  void dismissAllOverlays();

  activeDemo = demo;
  expandedCategories.add(demo.category);

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set(DIALOG_PARAM, demo.className);
    window.history.replaceState(window.history.state, '', url.toString());
  }

  titleEl.textContent = demo.className;
  routeEl.textContent = demo.route;
  descEl.textContent = demo.description;
  codeFilenameEl.textContent = `${demo.className}.ts`;
  stageClassEl.textContent = demo.className;

  // Trigger subtle code fade-in (mirrors flutter_use codeAnimationCtl)
  codeScrollEl.style.animation = 'none';
  void codeScrollEl.offsetWidth;
  codeScrollEl.style.animation = '';
  codePreviewEl.innerHTML = renderHighlightedCode(demo.code);

  stageBodyEl.innerHTML = '';
  const cleanup = demo.mount(stageBodyEl, {
    log: appendLog,
  });
  activeCleanup = cleanup ?? null;

  renderMenuTree();
}

function resolveInitialDemo(): DemoEntry {
  const params = new URLSearchParams(window.location.search);
  const targetName = params.get(DIALOG_PARAM);
  if (targetName) {
    const matched = ALL_DEMOS.find(
      (d) =>
        d.className.toLowerCase() === targetName.toLowerCase() ||
        d.id.toLowerCase() === targetName.toLowerCase(),
    );
    if (matched) return matched;
  }
  return ALL_DEMOS[0]!;
}

searchInput.oninput = () => {
  searchKeyword = searchInput.value;
  renderMenuTree();
};

const syncStatusBar = () => {
  const map: Record<string, boolean> = {
    'st-custom': SmartDialog.config.custom.isExist,
    'st-attach': SmartDialog.config.attach.isExist,
    'st-notify': SmartDialog.config.notify.isExist,
    'st-loading': SmartDialog.config.loading.isExist,
    'st-toast': SmartDialog.config.toast.isExist,
  };
  for (const [key, val] of Object.entries(map)) {
    const node = appEl.querySelector(`[data-testid="${key}"]`);
    const pill = appEl.querySelector(`[data-pill="${key}"]`);
    if (node) node.textContent = String(val);
    if (pill) pill.setAttribute('data-active', String(val));
  }
  window.requestAnimationFrame(syncStatusBar);
};

selectDemo(resolveInitialDemo(), false);
window.requestAnimationFrame(syncStatusBar);
