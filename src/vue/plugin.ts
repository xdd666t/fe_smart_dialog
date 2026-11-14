import type { App, InjectionKey, Plugin, VNodeChild } from 'vue';
import { SmartDialog as CoreSmartDialog } from '../smart-dialog';
import type { SmartInitOptions } from '../types/params';
import {
  SmartDialogProvider,
  normalizeVueInitOptions,
} from './SmartDialogProvider';
import { ensureVueAdapterRegistered, setVueAppContext } from './vue-adapter';
import { VueSmartDialog } from './vue-smart-dialog';

export const SMART_DIALOG_INJECTION_KEY: InjectionKey<typeof VueSmartDialog> =
  Symbol('fe-smart-dialog');

/**
 * Vue 3 plugin (`app.use(SmartDialogPlugin, options?)`) registering SmartDialog
 * global context, `$smartDialog`, `<SmartDialogProvider />`, and `provide/inject`.
 */
export const SmartDialogPlugin: Plugin<[SmartInitOptions<VNodeChild>?]> = {
  install(app: App, options?: SmartInitOptions<VNodeChild>) {
    ensureVueAdapterRegistered();
    setVueAppContext(app._context);
    if (options) {
      CoreSmartDialog.init(normalizeVueInitOptions(options));
    }
    app.config.globalProperties.$smartDialog = VueSmartDialog;
    app.provide(SMART_DIALOG_INJECTION_KEY, VueSmartDialog);
    app.component('SmartDialogProvider', SmartDialogProvider);
  },
};

declare module 'vue' {
  export interface ComponentCustomProperties {
    $smartDialog: typeof VueSmartDialog;
  }
}
