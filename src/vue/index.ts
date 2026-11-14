// Re-export all core symbols for single-import convenience in Vue 3 apps
export * from '../index';

// Override SmartDialog with Vue-typed facade and add Vue adapter exports
export {
  VueSmartDialog,
  VueSmartDialog as SmartDialog,
  type VueSmartBuilder,
  type VueSmartShowAttachOptions,
  type VueSmartShowCustomOptions,
  type VueSmartShowLoadingOptions,
  type VueSmartShowNotifyOptions,
  type VueSmartShowToastObjectOptions,
  type VueSmartShowToastOptions,
} from './vue-smart-dialog';
export { SmartDialogProvider } from './SmartDialogProvider';
export {
  SmartDialogPlugin,
  SMART_DIALOG_INJECTION_KEY,
} from './plugin';
export {
  useBindWidget,
  useSmartDialog,
  useSmartDialogController,
} from './composables';
