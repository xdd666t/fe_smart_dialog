import type { DialogInfo } from './dialog-info';
import type { DialogProxy } from './dialog-proxy';

/**
 * Tracks active route tokens and toggles visibility of `bindPage` dialogs.
 */
export class RouteRecord {
  private static _instance: RouteRecord | null = null;
  static curRoute: string | null = null;

  readonly routeQueue: string[] = [];
  private proxyRef: DialogProxy | null = null;

  static get instance(): RouteRecord {
    return (RouteRecord._instance ??= new RouteRecord());
  }

  bindProxy(proxy: DialogProxy): void {
    this.proxyRef = proxy;
  }

  ensureCurrentRoute(): string | null {
    if (RouteRecord.curRoute === null && typeof window !== 'undefined') {
      RouteRecord.curRoute = getBrowserRouteKey();
    }
    return RouteRecord.curRoute;
  }

  push(route: string, previousRoute: string | null): void {
    this.hideDialog(previousRoute, route);
    if (!this.proxyRef || this.proxyRef.dialogQueue.length === 0) return;
    this.routeQueue.push(route);
  }

  replace(options: { newRoute?: string | null; oldRoute?: string | null }): void {
    if (!this.proxyRef || this.proxyRef.dialogQueue.length === 0) return;
    if (options.oldRoute) {
      this.removeFromQueue(options.oldRoute);
    }
    if (options.newRoute) {
      this.routeQueue.push(options.newRoute);
    }
  }

  pop(route: string, previousRoute: string | null): void {
    this.appearDialog(route, previousRoute);
    if (this.routeQueue.length === 0) return;
    this.removeFromQueue(route);
  }

  remove(route: string): void {
    if (this.routeQueue.length === 0) return;
    this.removeFromQueue(route);
  }

  private removeFromQueue(route: string): void {
    const idx = this.routeQueue.lastIndexOf(route);
    if (idx !== -1) {
      this.routeQueue.splice(idx, 1);
    }
  }

  private hideDialog(curRoute: string | null, nextRoute: string | null): void {
    if (this.banContinue(nextRoute) || !this.proxyRef) return;
    for (const item of this.proxyRef.dialogQueue) {
      if (this.needHandle(item, curRoute)) {
        item.dialog.hide();
      }
    }
  }

  private appearDialog(curRoute: string | null, preRoute: string | null): void {
    if (this.banContinue(curRoute) || !this.proxyRef) return;
    for (const item of this.proxyRef.dialogQueue) {
      if (this.needHandle(item, preRoute)) {
        item.dialog.appear();
      }
    }
  }

  private banContinue(route: string | null): boolean {
    return (
      route === null ||
      !this.proxyRef ||
      this.proxyRef.dialogQueue.length === 0
    );
  }

  private needHandle(item: DialogInfo, route: string | null): boolean {
    if (item.useSystem || item.permanent) {
      return false;
    }
    return item.route === route && item.bindPage;
  }

  resetForTest(): void {
    this.routeQueue.length = 0;
    RouteRecord.curRoute = null;
  }
}

export function getBrowserRouteKey(): string {
  if (typeof window === 'undefined' || !window.location) {
    return '/';
  }
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}
