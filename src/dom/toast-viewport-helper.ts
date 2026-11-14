/**
 * Adjusts Toast bottom margin when mobile soft keyboard reduces `visualViewport` height,
 * and manages toast pointer-event consumption (`consumeEvent`).
 */
export class ToastViewportHelper {
  private cleanupFn: (() => void) | null = null;

  bind(options: {
    bodyEl: HTMLElement;
    consumeEvent: boolean;
  }): void {
    this.dispose();

    const { bodyEl, consumeEvent } = options;
    bodyEl.classList.toggle('fsd-content--passthrough', !consumeEvent);

    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    const viewport = window.visualViewport;
    const updateMargin = () => {
      const keyboardInset = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );
      if (keyboardInset <= 0) {
        bodyEl.style.marginBottom = '';
        return;
      }

      const rect = bodyEl.getBoundingClientRect();
      const childToBottom = window.innerHeight - rect.bottom;
      if (childToBottom < 0) {
        bodyEl.style.marginBottom = `${keyboardInset}px`;
        return;
      }
      if (childToBottom - keyboardInset > -30) {
        return;
      }
      bodyEl.style.marginBottom = `${Math.max(0, keyboardInset - childToBottom)}px`;
    };

    viewport.addEventListener('resize', updateMargin);
    viewport.addEventListener('scroll', updateMargin);
    updateMargin();

    this.cleanupFn = () => {
      viewport.removeEventListener('resize', updateMargin);
      viewport.removeEventListener('scroll', updateMargin);
      bodyEl.style.marginBottom = '';
    };
  }

  dispose(): void {
    this.cleanupFn?.();
    this.cleanupFn = null;
  }
}
