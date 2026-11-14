import type { DomBridge } from '../core/dialog-proxy';
import {
  createDefaultLoadingWidget,
  createDefaultNotifyStyle,
  createDefaultToastWidget,
} from './default-widgets';
import { MainDialog } from './main-dialog';
import { MonitorElementHelper } from './monitor-element-helper';
import { OverlayManager } from './overlay-manager';

export function createDomBridge(): DomBridge {
  return {
    configure(options) {
      OverlayManager.instance.configure(options);
    },
    ensureInitialized(initTypes) {
      OverlayManager.instance.ensureInitialized(
        initTypes ??
          new Set(['custom', 'attach', 'notify', 'loading', 'toast']),
      );
    },
    createMainDialog(layer, extra) {
      return new MainDialog(
        // Lazily resolved in DomBridge consumer
        dialogProxyHolder.proxy!,
        layer,
        extra,
      );
    },
    monitorElementBind(info) {
      MonitorElementHelper.instance.bind(dialogProxyHolder.proxy!, info);
    },
    monitorElementUnbind(info) {
      MonitorElementHelper.instance.unbind(info);
    },
    defaultToastBuilder: createDefaultToastWidget,
    defaultLoadingBuilder: createDefaultLoadingWidget,
    defaultNotifyStyle: createDefaultNotifyStyle(),
    resetForTest() {
      MonitorElementHelper.instance.resetForTest();
      OverlayManager.instance.resetForTest();
    },
  };
}

export const dialogProxyHolder: { proxy: import('../core/dialog-proxy').DialogProxy | null } = {
  proxy: null,
};
