import { CloseType, SmartBackType, SmartStatus } from '../config/enums';
import type { DialogProxy } from './dialog-proxy';
import { RouteRecord } from './route-record';

/**
 * Coordinates Esc key & optional browser back-button interception for open dialogs.
 */
export class MonitorPopRoute {
  private static _instance: MonitorPopRoute | null = null;
  private proxyRef: DialogProxy | null = null;
  private initialized = false;
  private enableHistoryBack = false;
  private sentinelActive = false;
  private ignoringNextSentinelPop = false;
  private handledInCurrentTick = false;

  private onKeyDownHandler: ((event: KeyboardEvent) => void) | null = null;
  private onPopStateHandler: ((event: PopStateEvent) => void) | null = null;

  static get instance(): MonitorPopRoute {
    return (MonitorPopRoute._instance ??= new MonitorPopRoute());
  }

  bindProxy(proxy: DialogProxy): void {
    this.proxyRef = proxy;
  }

  initialize(options: { enableHistoryBack?: boolean } = {}): void {
    if (options.enableHistoryBack !== undefined) {
      this.enableHistoryBack = options.enableHistoryBack;
    }
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    this.onKeyDownHandler = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (this.handledInCurrentTick) return;
      void this.handleEscapeEvent(event);
    };

    this.onPopStateHandler = (event: PopStateEvent) => {
      if (!this.enableHistoryBack) return;
      if (this.ignoringNextSentinelPop) {
        this.ignoringNextSentinelPop = false;
        return;
      }
      if (!this.hasInterceptableDialog()) return;
      void this.handleBackNavigation(event);
    };

    window.addEventListener('keydown', this.onKeyDownHandler, true);
    window.addEventListener('popstate', this.onPopStateHandler);
  }

  markEscapeHandledInTick(): void {
    this.handledInCurrentTick = true;
    setTimeout(() => {
      this.handledInCurrentTick = false;
    }, 0);
  }

  private async handleEscapeEvent(event: KeyboardEvent): Promise<void> {
    if (!this.hasInterceptableDialog()) return;
    event.preventDefault();
    const intercepted = await this.handBackEvent();
    if (intercepted) {
      event.stopPropagation();
    }
  }

  private async handleBackNavigation(_event: PopStateEvent): Promise<void> {
    const intercepted = await this.handBackEvent();
    if (intercepted) {
      this.sentinelActive = false;
      this.syncHistorySentinel();
    }
  }

  syncHistorySentinel(): void {
    if (!this.enableHistoryBack || typeof window === 'undefined' || !window.history) {
      return;
    }
    const shouldHold = this.hasInterceptableDialog();
    if (shouldHold && !this.sentinelActive) {
      this.sentinelActive = true;
      window.history.pushState({ __fsdBackSentinel: true }, '');
    } else if (!shouldHold && this.sentinelActive) {
      this.sentinelActive = false;
      const state = window.history.state;
      if (state && typeof state === 'object' && '__fsdBackSentinel' in state) {
        this.ignoringNextSentinelPop = true;
        window.history.back();
      }
    }
  }

  hasInterceptableDialog(): boolean {
    const proxy = this.proxyRef;
    if (!proxy) return false;
    if (proxy.config.loading.isExist) return true;
    if (proxy.config.notify.isExist && proxy.notifyQueue.length > 0) return true;
    return this.handleSmartDialog();
  }

  /**
   * Mirrors `MonitorPopRoute.handBackEvent()`.
   * Returns `true` if the back event was intercepted, `false` otherwise.
   */
  async handBackEvent(): Promise<boolean> {
    const proxy = this.proxyRef;
    if (!proxy) return false;

    // 1. Loading
    if (proxy.config.loading.isExist) {
      const loadingInfo = proxy.loadingInfo;
      if ((await loadingInfo.onBack?.()) === true) {
        return true;
      }
      if (loadingInfo.backType === SmartBackType.normal) {
        void proxy.dismiss({
          status: SmartStatus.loading,
          closeType: CloseType.back,
        });
        return true;
      }
      if (loadingInfo.backType === SmartBackType.block) {
        return true;
      }
    }

    // 2. Notify (topmost down)
    if (proxy.config.notify.isExist) {
      const notifyQueue = proxy.notifyQueue;
      for (let i = notifyQueue.length - 1; i >= 0; i--) {
        const item = notifyQueue[i];
        if (!item) continue;
        if ((await item.onBack?.()) === true) {
          return true;
        }
        if (item.backType === SmartBackType.normal) {
          void proxy.dismiss({
            status: SmartStatus.notify,
            closeType: CloseType.back,
            tag: item.tag,
          });
          return true;
        }
        if (item.backType === SmartBackType.block) {
          return true;
        }
      }
    }

    // 3. Dialog (custom / attach)
    if (this.handleSmartDialog()) {
      const lastDialog = proxy.dialogQueue[proxy.dialogQueue.length - 1];
      if (!lastDialog) return false;
      if ((await lastDialog.onBack?.()) === true) {
        return true;
      }
      if (lastDialog.backType === SmartBackType.normal) {
        void proxy.dismiss({
          status: SmartStatus.dialog,
          closeType: CloseType.back,
        });
        return true;
      }
      if (lastDialog.backType === SmartBackType.block) {
        return true;
      }
    }

    return false;
  }

  handleSmartDialog(): boolean {
    const proxy = this.proxyRef;
    if (!proxy) return false;

    const routeQueue = RouteRecord.instance.routeQueue;
    if (proxy.dialogQueue.length === 0) {
      if (routeQueue.length > 0) {
        routeQueue.length = 0;
      }
      return false;
    }

    const info = proxy.dialogQueue[proxy.dialogQueue.length - 1];
    if (!info) return false;

    if (!info.dialog.visible || info.permanent) {
      return false;
    }

    return true;
  }

  resetForTest(): void {
    if (typeof window !== 'undefined') {
      if (this.onKeyDownHandler) {
        window.removeEventListener('keydown', this.onKeyDownHandler, true);
      }
      if (this.onPopStateHandler) {
        window.removeEventListener('popstate', this.onPopStateHandler);
      }
    }
    this.onKeyDownHandler = null;
    this.onPopStateHandler = null;
    this.initialized = false;
    this.enableHistoryBack = false;
    this.sentinelActive = false;
    this.ignoringNextSentinelPop = false;
    this.handledInCurrentTick = false;
  }
}
