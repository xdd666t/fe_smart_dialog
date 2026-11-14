import cssText from './smart-dialog.css';

const STYLE_ELEMENT_ID = 'fe-smart-dialog-styles';
let injected = false;

export function injectDefaultStyles(): void {
  if (typeof document === 'undefined') return;
  if (injected && document.getElementById(STYLE_ELEMENT_ID)) return;
  if (document.getElementById(STYLE_ELEMENT_ID)) {
    injected = true;
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.textContent = cssText;
  (document.head ?? document.documentElement).appendChild(style);
  injected = true;
}

export function resetStyleInjectionForTest(): void {
  if (typeof document !== 'undefined') {
    document.getElementById(STYLE_ELEMENT_ID)?.remove();
  }
  injected = false;
}
