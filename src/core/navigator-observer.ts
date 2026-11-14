import { SmartAllDialogType, SmartStatus } from '../config/enums';
import type { DialogInfo } from './dialog-info';
import type { DialogProxy } from './dialog-proxy';
import { getBrowserRouteKey, RouteRecord } from './route-record';

/**
 * Web SPA route observer mirroring `SmartNavigatorObserver` (`FlutterSmartDialog.observer`).
 * Supports explicit router integration AND automatic History API / popstate / hashchange tracking.
 */
export class SmartNavigatorObserver {
  private proxyRef: DialogProxy | null = null;
  private historyStack: string[] = [];
  private trackingEnabled = false;
  private historyPatched = false;
  private origPushState: History['pushState'] | null = null;
  private origReplaceState: History['replaceState'] | null = null;
  private onPopStateHandler: ((event: PopStateEvent) => void) | null = null;
  private onHashChangeHandler: (() => void) | null = null;

  bindProxy(proxy: DialogProxy): void {
    this.proxyRef = proxy;
  }

  enableAutoTracking(): void {
    if (this.trackingEnabled || typeof window === 'undefined') return;
    this.trackingEnabled = true;

    const initialKey = RouteRecord.curRoute ?? getBrowserRouteKey();
    RouteRecord.curRoute = initialKey;
    if (this.historyStack.length === 0) {
      this.historyStack = [initialKey];
    }

    this.patchHistory();

    this.onPopStateHandler = (event: PopStateEvent) => {
      // Ignore synthetic back sentinel pops handled by MonitorPopRoute
      if (
        event.state &&
        typeof event.state === 'object' &&
        '__fsdBackSentinel' in event.state
      ) {
        return;
      }
      this.syncBrowserNavigation();
    };

    this.onHashChangeHandler = () => {
      this.syncBrowserNavigation();
    };

    window.addEventListener('popstate', this.onPopStateHandler);
    window.addEventListener('hashchange', this.onHashChangeHandler);
  }

  disableAutoTracking(): void {
    if (!this.trackingEnabled || typeof window === 'undefined') return;
    this.trackingEnabled = false;

    if (this.historyPatched) {
      if (this.origPushState) {
        window.history.pushState = this.origPushState;
      }
      if (this.origReplaceState) {
        window.history.replaceState = this.origReplaceState;
      }
      this.origPushState = null;
      this.origReplaceState = null;
      this.historyPatched = false;
    }

    if (this.onPopStateHandler) {
      window.removeEventListener('popstate', this.onPopStateHandler);
      this.onPopStateHandler = null;
    }
    if (this.onHashChangeHandler) {
      window.removeEventListener('hashchange', this.onHashChangeHandler);
      this.onHashChangeHandler = null;
    }
  }

  private patchHistory(): void {
    if (this.historyPatched || typeof window === 'undefined' || !window.history) {
      return;
    }
    const history = window.history;
    this.origPushState = history.pushState.bind(history);
    this.origReplaceState = history.replaceState.bind(history);

    history.pushState = (data: unknown, unused: string, url?: string | URL | null) => {
      const prevRoute = RouteRecord.curRoute ?? getBrowserRouteKey();
      this.origPushState!.call(history, data, unused, url);
      if (
        data &&
        typeof data === 'object' &&
        '__fsdBackSentinel' in (data as Record<string, unknown>)
      ) {
        return;
      }
      const nextRoute = getBrowserRouteKey();
      if (nextRoute !== prevRoute || this.historyStack.length === 0) {
        this.historyStack.push(nextRoute);
        this.didPush(nextRoute, prevRoute);
      }
    };

    history.replaceState = (data: unknown, unused: string, url?: string | URL | null) => {
      const oldRoute = RouteRecord.curRoute ?? getBrowserRouteKey();
      this.origReplaceState!.call(history, data, unused, url);
      const newRoute = getBrowserRouteKey();
      if (newRoute !== oldRoute) {
        if (this.historyStack.length > 0) {
          this.historyStack[this.historyStack.length - 1] = newRoute;
        } else {
          this.historyStack.push(newRoute);
        }
        this.didReplace({ newRoute, oldRoute });
      }
    };

    this.historyPatched = true;
  }

  private syncBrowserNavigation(): void {
    const nextRoute = getBrowserRouteKey();
    const curRoute = RouteRecord.curRoute;
    if (nextRoute === curRoute) return;

    const targetIndex = this.historyStack.lastIndexOf(nextRoute);
    if (targetIndex !== -1 && targetIndex < this.historyStack.length - 1) {
      // Pop all routes above targetIndex in top-down order
      while (this.historyStack.length - 1 > targetIndex) {
        const poppedRoute = this.historyStack.pop()!;
        const prevRoute = this.historyStack[this.historyStack.length - 1] ?? null;
        this.didPop(poppedRoute, prevRoute);
      }
    } else {
      const prev = curRoute;
      this.historyStack.push(nextRoute);
      this.didPush(nextRoute, prev);
    }
  }

  didPush(route: string, previousRoute: string | null = RouteRecord.curRoute): void {
    RouteRecord.curRoute = route;
    if (this.historyStack[this.historyStack.length - 1] !== route) {
      this.historyStack.push(route);
    }
    RouteRecord.instance.push(route, previousRoute);
  }

  didReplace(options: { newRoute?: string | null; oldRoute?: string | null }): void {
    const newRoute = options.newRoute ?? null;
    const oldRoute = options.oldRoute ?? null;
    RouteRecord.curRoute = newRoute;
    RouteRecord.instance.replace({ newRoute, oldRoute });
    if (oldRoute) {
      this.removeDialog(oldRoute);
    }
  }

  didRemove(route: string): void {
    RouteRecord.instance.remove(route);
    this.removeDialog(route);
  }

  didPop(route: string, previousRoute: string | null = null): void {
    RouteRecord.curRoute = previousRoute;
    RouteRecord.instance.pop(route, previousRoute);
    this.removeDialog(route);
  }

  private removeDialog(route: string | null): void {
    const proxy = this.proxyRef;
    if (!proxy || !route) return;

    const hasDialog = proxy.checkExist({
      dialogTypes: [
        SmartAllDialogType.custom,
        SmartAllDialogType.attach,
        SmartAllDialogType.loading,
      ],
    });
    if (!hasDialog) return;

    if (proxy.config.loading.isExist) {
      void proxy.dismiss({
        status: SmartStatus.loading,
        closeType: 'route',
      });
    }

    const removeList: DialogInfo[] = [];
    for (const item of proxy.dialogQueue) {
      if (item.route === route && item.bindPage) {
        removeList.push(item);
      }
    }
    for (let i = removeList.length - 1; i >= 0; i--) {
      const target = removeList[i];
      if (!target) continue;
      void proxy.dismiss({
        status: SmartStatus.dialog,
        closeType: 'route',
        tag: target.tag,
      });
    }
  }

  resetForTest(): void {
    this.disableAutoTracking();
    this.historyStack = [];
    RouteRecord.instance.resetForTest();
  }
}
