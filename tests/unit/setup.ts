import { afterEach, beforeEach, vi } from 'vitest';
import { DialogProxy } from '../../src/core/dialog-proxy';
import { resetStyleInjectionForTest } from '../../src/styles/inject';

// Polyfill PointerEvent for jsdom environments where it is absent
if (typeof globalThis.PointerEvent === 'undefined' && typeof MouseEvent !== 'undefined') {
  (globalThis as unknown as { PointerEvent: typeof MouseEvent }).PointerEvent =
    class PointerEvent extends MouseEvent {} as unknown as typeof MouseEvent;
}

// Polyfill HTMLDialogElement.showModal / close if running in a jsdom build that lacks them
if (typeof HTMLDialogElement !== 'undefined') {
  if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
    HTMLDialogElement.prototype.showModal = function showModal(
      this: HTMLDialogElement,
    ) {
      this.setAttribute('open', '');
      (this as unknown as { open: boolean }).open = true;
    };
  }
  if (typeof HTMLDialogElement.prototype.close !== 'function') {
    HTMLDialogElement.prototype.close = function close(
      this: HTMLDialogElement,
    ) {
      this.removeAttribute('open');
      (this as unknown as { open: boolean }).open = false;
    };
  }
}

beforeEach(() => {
  DialogProxy.instance.resetForTest();
  resetStyleInjectionForTest();
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  window.history.replaceState(null, '', '/');
});

afterEach(() => {
  DialogProxy.instance.resetForTest();
  resetStyleInjectionForTest();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
