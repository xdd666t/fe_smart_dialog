import { PRESET_ALIGNMENT_ENTRIES } from './enumMaps';

const ALIGN_SHORT_LABEL: Record<string, string> = {
  topLeft: '↖ TL',
  topCenter: '↑ TC',
  topRight: '↗ TR',
  centerLeft: '← CL',
  center: '• C',
  centerRight: '→ CR',
  bottomLeft: '↙ BL',
  bottomCenter: '↓ BC',
  bottomRight: '↘ BR',
};

/**
 * Mounts an interactive 3x3 alignment matrix synced bidirectionally with a <select>.
 */
export function mountAlignMatrix(
  container: HTMLElement | null,
  selectEl: HTMLSelectElement,
): void {
  if (!container) return;

  const matrix = document.createElement('div');
  matrix.className = 'pg-align-matrix';
  matrix.setAttribute('role', 'group');
  matrix.setAttribute('aria-label', '3x3 Alignment Matrix');

  const buttons = new Map<string, HTMLButtonElement>();

  for (const entry of PRESET_ALIGNMENT_ENTRIES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pg-align-cell';
    btn.dataset.align = entry.name;
    btn.title = entry.name;
    btn.setAttribute('aria-label', entry.name);
    btn.textContent = ALIGN_SHORT_LABEL[entry.name] ?? entry.name;
    btn.addEventListener('click', () => {
      if (selectEl.value !== entry.name) {
        selectEl.value = entry.name;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
      }
      sync();
    });
    buttons.set(entry.name, btn);
    matrix.appendChild(btn);
  }

  const sync = (): void => {
    const current = selectEl.value;
    for (const [name, btn] of buttons) {
      const active = name === current;
      btn.dataset.active = String(active);
      btn.setAttribute('aria-pressed', String(active));
    }
  };

  selectEl.addEventListener('change', sync);
  sync();
  container.replaceChildren(matrix);
}
