import { SmartStatus } from '../config/enums';
import type { DialogInfo } from '../core/dialog-info';
import type { DialogProxy } from '../core/dialog-proxy';
import { RouteRecord } from '../core/route-record';
import { resolveTargetElement } from './target-resolver';

interface MonitoredEntry {
  info: DialogInfo;
  cleanup: () => void;
}

/**
 * Monitors DOM element lifecycle & visibility for `bindWidget` / `bindElement`.
 * Automatically dismisses when removed from DOM, and hides/appears when hidden in Tabs/Scroll views.
 */
export class MonitorElementHelper {
  private static _instance: MonitorElementHelper | null = null;
  private entries = new Map<DialogInfo, MonitoredEntry>();

  static get instance(): MonitorElementHelper {
    return (MonitorElementHelper._instance ??= new MonitorElementHelper());
  }

  bind(proxy: DialogProxy, info: DialogInfo): void {
    this.unbind(info);
    if (!info.bindWidget || typeof document === 'undefined') return;

    const target = resolveTargetElement(info.bindWidget, {
      requireConnected: false,
    });
    if (!target || !target.isConnected) {
      void proxy.dismiss({
        status: SmartStatus.dialog,
        tag: info.tag,
        closeType: 'route',
      });
      return;
    }

    let intersectionVisible = true;
    let rafId: number | null = null;

    const evaluate = () => {
      rafId = null;
      if (!target.isConnected) {
        this.unbind(info);
        void proxy.dismiss({
          status: SmartStatus.dialog,
          tag: info.tag,
          closeType: 'route',
        });
        return;
      }

      if (RouteRecord.curRoute !== null && RouteRecord.curRoute !== info.route) {
        info.dialog.hide();
        return;
      }

      const styleVisible = this.isElementLayoutVisible(target);
      if (styleVisible && intersectionVisible) {
        info.dialog.appear();
      } else {
        info.dialog.hide();
      }
    };

    const scheduleEval = () => {
      if (rafId !== null) return;
      if (typeof requestAnimationFrame === 'function') {
        rafId = requestAnimationFrame(evaluate);
      } else {
        evaluate();
      }
    };

    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (items) => {
          const entry = items[0];
          if (entry) {
            intersectionVisible = entry.isIntersecting;
            scheduleEval();
          }
        },
        { threshold: 0.01 },
      );
      intersectionObserver.observe(target);
    }

    let mutationObserver: MutationObserver | null = null;
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        scheduleEval();
      });
      mutationObserver.observe(document.body ?? document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'hidden', 'aria-hidden'],
      });
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        scheduleEval();
      });
      resizeObserver.observe(target);
    }

    // Immediate initial evaluation
    evaluate();

    this.entries.set(info, {
      info,
      cleanup: () => {
        if (rafId !== null && typeof cancelAnimationFrame === 'function') {
          cancelAnimationFrame(rafId);
        }
        intersectionObserver?.disconnect();
        mutationObserver?.disconnect();
        resizeObserver?.disconnect();
      },
    });
  }

  unbind(info: DialogInfo): void {
    const existing = this.entries.get(info);
    if (existing) {
      existing.cleanup();
      this.entries.delete(info);
    }
  }

  private isElementLayoutVisible(el: HTMLElement): boolean {
    let cur: HTMLElement | null = el;
    while (cur && cur !== document.documentElement) {
      if (cur.hasAttribute('hidden')) return false;
      const style = window.getComputedStyle(cur);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
      }
      cur = cur.parentElement;
    }
    return true;
  }

  resetForTest(): void {
    for (const entry of this.entries.values()) {
      entry.cleanup();
    }
    this.entries.clear();
  }
}
