import { SmartAllDialogType, SmartStatus } from './config/enums';
import type { SmartConfig } from './config/smart-config';
import { DialogProxy } from './core/dialog-proxy';
import type { SmartNavigatorObserver } from './core/navigator-observer';
import { createDomBridge, dialogProxyHolder } from './dom/dom-bridge';
import type {
  SmartCheckExistOptions,
  SmartDismissOptions,
  SmartInitOptions,
  SmartShowAttachOptions,
  SmartShowCustomOptions,
  SmartShowLoadingOptions,
  SmartShowNotifyOptions,
  SmartShowToastObjectOptions,
  SmartShowToastOptions,
} from './types/params';

// Register DOM bridge on module load
dialogProxyHolder.proxy = DialogProxy.instance;
DialogProxy.instance.registerDomBridge(createDomBridge());

/**
 * Primary SmartDialog facade mirroring `flutter_smart_dialog`'s API surface.
 */
export class SmartDialog {
  private constructor() {}

  /**
   * Global SmartDialog configuration (`custom`, `attach`, `notify`, `loading`, `toast`).
   */
  static get config(): SmartConfig {
    return DialogProxy.instance.config;
  }

  static set config(value: SmartConfig) {
    DialogProxy.instance.config = value;
  }

  /**
   * Route observer for explicit SPA router binding (`didPush`, `didReplace`, `didPop`, `didRemove`).
   */
  static get observer(): SmartNavigatorObserver {
    return DialogProxy.instance.observer;
  }

  /**
   * Optional global initialization for custom default Toast/Loading/Notify templates,
   * theme, container, z-index base, and history tracking options.
   */
  static init(options: SmartInitOptions = {}): void {
    DialogProxy.instance.init(options);
  }

  /**
   * Displays a customizable dialog.
   */
  static show<T = unknown>(
    options: SmartShowCustomOptions,
  ): Promise<T | undefined> {
    return DialogProxy.instance.show<T>(options);
  }

  /**
   * Displays a dialog anchored to a target element or custom coordinates,
   * optionally highlighting the target area with a cutout mask.
   */
  static showAttach<T = unknown>(
    options: SmartShowAttachOptions,
  ): Promise<T | undefined> {
    return DialogProxy.instance.showAttach<T>(options);
  }

  /**
   * Displays a semantic notification (`success`, `failure`, `warning`, `error`, `alert`).
   */
  static showNotify<T = unknown>(
    options: SmartShowNotifyOptions,
  ): Promise<T | undefined> {
    return DialogProxy.instance.showNotify<T>(options);
  }

  /**
   * Displays the singleton loading overlay.
   */
  static showLoading<T = unknown>(
    options: SmartShowLoadingOptions = {},
  ): Promise<T | undefined> {
    return DialogProxy.instance.showLoading<T>(options);
  }

  /**
   * Displays a toast message. Accepts either `(msg, options?)` or `({ msg, ...options })`.
   */
  static showToast(
    msgOrOptions: string | SmartShowToastObjectOptions,
    options?: SmartShowToastOptions,
  ): Promise<void> {
    if (typeof msgOrOptions === 'string') {
      return DialogProxy.instance.showToast(msgOrOptions, options);
    }
    const { msg, ...rest } = msgOrOptions;
    return DialogProxy.instance.showToast(msg, rest);
  }

  /**
   * Dismisses one or more dialogs according to `status`, `tag`, `result`, and `force`.
   */
  static dismiss<T = unknown>(
    options: SmartDismissOptions<T> = {},
  ): Promise<void> {
    return DialogProxy.instance.dismiss<T>({
      status: options.status ?? SmartStatus.smart,
      tag: options.tag,
      result: options.result,
      force: options.force ?? false,
    });
  }

  /**
   * Checks whether any dialog matching `tag` or `dialogTypes` is currently active.
   */
  static checkExist(options: SmartCheckExistOptions = {}): boolean {
    return DialogProxy.instance.checkExist({
      tag: options.tag,
      dialogTypes: options.dialogTypes ?? [
        SmartAllDialogType.custom,
        SmartAllDialogType.attach,
        SmartAllDialogType.loading,
      ],
    });
  }
}

/**
 * Compatibility alias mirroring `FlutterSmartDialog.init` and `FlutterSmartDialog.observer`.
 */
export const FeSmartDialog = {
  init: SmartDialog.init,
  get observer() {
    return SmartDialog.observer;
  },
} as const;
