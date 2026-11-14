// Re-export all core symbols for single-import convenience in React apps
export * from '../index';

// Override SmartDialog with React-typed facade and add React adapter exports
export {
  ReactSmartDialog,
  ReactSmartDialog as SmartDialog,
  type ReactSmartBuilder,
  type ReactSmartShowAttachOptions,
  type ReactSmartShowCustomOptions,
  type ReactSmartShowLoadingOptions,
  type ReactSmartShowNotifyOptions,
  type ReactSmartShowToastObjectOptions,
  type ReactSmartShowToastOptions,
} from './react-smart-dialog';
export {
  SmartDialogProvider,
  type SmartDialogProviderProps,
} from './SmartDialogProvider';
export {
  useBindWidget,
  useSmartDialog,
  useSmartDialogController,
} from './hooks';
