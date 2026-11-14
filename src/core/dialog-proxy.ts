import {
  CloseType,
  DialogType,
  SmartAllDialogType,
  SmartInitType,
  SmartStatus,
} from '../config/enums';
import { SmartConfig } from '../config/smart-config';
import type {
  SmartInitOptions,
  SmartMessageBuilder,
  SmartNotifyStyle,
  SmartShowAttachOptions,
  SmartShowCustomOptions,
  SmartShowLoadingOptions,
  SmartShowNotifyOptions,
  SmartShowToastOptions,
} from '../types/params';
import { SmartNotifyStyle as NotifyStyleClass } from '../types/params';
import { CustomDialog } from './custom-dialog';
import { CustomLoading } from './custom-loading';
import { CustomNotify } from './custom-notify';
import { CustomToast } from './custom-toast';
import { DebounceUtils } from './debounce-utils';
import type { MainDialogHandle } from './dialog-host';
import type { DialogInfo, LoadingInfo, NotifyInfo } from './dialog-info';
import { DialogKit } from './dialog-kit';
import { MonitorPopRoute } from './monitor-pop-route';
import { SmartNavigatorObserver } from './navigator-observer';
import { RouteRecord } from './route-record';
import { ToastTool } from './toast-tool';

export interface DomBridge {
  configure: (options: SmartInitOptions) => void;
  ensureInitialized: (initTypes?: Set<SmartInitType>) => void;
  createMainDialog: (
    layer: SmartInitType,
    extra?: { consumeEvent?: boolean },
  ) => MainDialogHandle;
  monitorElementBind: (info: DialogInfo) => void;
  monitorElementUnbind: (info: DialogInfo) => void;
  defaultToastBuilder: SmartMessageBuilder;
  defaultLoadingBuilder: SmartMessageBuilder;
  defaultNotifyStyle: SmartNotifyStyle;
  resetForTest: () => void;
}

export class DialogProxy {
  private static _instance: DialogProxy | null = null;

  config: SmartConfig = new SmartConfig();
  readonly dialogQueue: DialogInfo[] = [];
  readonly notifyQueue: NotifyInfo[] = [];
  readonly loadingInfo: LoadingInfo = {};
  readonly loadingController = new CustomLoading();
  readonly observer = new SmartNavigatorObserver();

  toastBuilder!: SmartMessageBuilder;
  loadingBuilder!: SmartMessageBuilder;
  notifyStyle!: SmartNotifyStyle;

  private initialized = false;
  private domBridge: DomBridge | null = null;
  private enabledInitTypes = new Set<SmartInitType>([
    SmartInitType.custom,
    SmartInitType.attach,
    SmartInitType.notify,
    SmartInitType.loading,
    SmartInitType.toast,
  ]);

  static get instance(): DialogProxy {
    return (DialogProxy._instance ??= new DialogProxy());
  }

  private constructor() {
    DebounceUtils.instance.bindProxy(this);
    ToastTool.instance.bindProxy(this);
    RouteRecord.instance.bindProxy(this);
    this.observer.bindProxy(this);
    MonitorPopRoute.instance.bindProxy(this);
  }

  registerDomBridge(bridge: DomBridge): void {
    this.domBridge = bridge;
    if (!this.toastBuilder) {
      this.toastBuilder = bridge.defaultToastBuilder;
    }
    if (!this.loadingBuilder) {
      this.loadingBuilder = bridge.defaultLoadingBuilder;
    }
    if (!this.notifyStyle) {
      this.notifyStyle = bridge.defaultNotifyStyle;
    }
  }

  init(options: SmartInitOptions = {}): void {
    const bridge = this.requireBridge();
    this.enabledInitTypes = new Set<SmartInitType>(
      options.initType ?? [
        SmartInitType.custom,
        SmartInitType.attach,
        SmartInitType.notify,
        SmartInitType.loading,
        SmartInitType.toast,
      ],
    );

    if (this.enabledInitTypes.has(SmartInitType.toast)) {
      this.toastBuilder = options.toastBuilder ?? bridge.defaultToastBuilder;
    }
    if (this.enabledInitTypes.has(SmartInitType.loading)) {
      this.loadingBuilder =
        options.loadingBuilder ?? bridge.defaultLoadingBuilder;
    }
    if (this.enabledInitTypes.has(SmartInitType.notify)) {
      const defaults = bridge.defaultNotifyStyle;
      const custom = options.notifyStyle;
      this.notifyStyle = new NotifyStyleClass({
        successBuilder: custom?.successBuilder ?? defaults.successBuilder,
        failureBuilder: custom?.failureBuilder ?? defaults.failureBuilder,
        warningBuilder: custom?.warningBuilder ?? defaults.warningBuilder,
        alertBuilder: custom?.alertBuilder ?? defaults.alertBuilder,
        errorBuilder: custom?.errorBuilder ?? defaults.errorBuilder,
      });
    }

    bridge.configure(options);
    bridge.ensureInitialized(this.enabledInitTypes);

    if (options.autoTrackHistory !== false) {
      this.observer.enableAutoTracking();
    } else {
      this.observer.disableAutoTracking();
    }

    MonitorPopRoute.instance.initialize({
      enableHistoryBack: options.enableHistoryBack ?? false,
    });

    this.initialized = true;
  }

  private ensureReady(requiredLayer?: SmartInitType): void {
    if (!this.initialized) {
      this.init();
    } else {
      this.requireBridge().ensureInitialized(this.enabledInitTypes);
    }

    if (requiredLayer && !this.enabledInitTypes.has(requiredLayer)) {
      this.enabledInitTypes.add(requiredLayer);
      this.requireBridge().ensureInitialized(this.enabledInitTypes);
      const bridge = this.requireBridge();
      if (requiredLayer === 'toast' && !this.toastBuilder) {
        this.toastBuilder = bridge.defaultToastBuilder;
      }
      if (requiredLayer === 'loading' && !this.loadingBuilder) {
        this.loadingBuilder = bridge.defaultLoadingBuilder;
      }
      if (requiredLayer === 'notify' && !this.notifyStyle) {
        this.notifyStyle = bridge.defaultNotifyStyle;
      }
    }
  }

  private requireBridge(): DomBridge {
    if (!this.domBridge) {
      throw new Error(
        'SmartDialog: DOM bridge is not registered. Make sure you are importing from `fe-smart-dialog`.',
      );
    }
    return this.domBridge;
  }

  createMainDialog(
    layer: SmartInitType,
    extra?: { consumeEvent?: boolean },
  ): MainDialogHandle {
    return this.requireBridge().createMainDialog(layer, extra);
  }

  monitorElementBind(info: DialogInfo): void {
    this.domBridge?.monitorElementBind(info);
  }

  monitorElementUnbind(info: DialogInfo): void {
    this.domBridge?.monitorElementUnbind(info);
  }

  show<T = unknown>(options: SmartShowCustomOptions): Promise<T | undefined> {
    this.ensureReady(SmartInitType.custom);
    return CustomDialog.show<T>(this, options);
  }

  showAttach<T = unknown>(
    options: SmartShowAttachOptions,
  ): Promise<T | undefined> {
    this.ensureReady(SmartInitType.attach);
    return CustomDialog.showAttach<T>(this, options);
  }

  showNotify<T = unknown>(
    options: SmartShowNotifyOptions,
  ): Promise<T | undefined> {
    this.ensureReady(SmartInitType.notify);
    return CustomNotify.showNotify<T>(this, options);
  }

  showLoading<T = unknown>(
    options: SmartShowLoadingOptions = {},
  ): Promise<T | undefined> {
    this.ensureReady(SmartInitType.loading);
    return this.loadingController.showLoading<T>(this, options);
  }

  showToast(msg: string, options?: SmartShowToastOptions): Promise<void> {
    this.ensureReady(SmartInitType.toast);
    return CustomToast.showToast(this, msg, options);
  }

  async dismiss<T = unknown>(
    options: {
      status?: SmartStatus;
      tag?: string;
      result?: T;
      force?: boolean;
      closeType?: CloseType;
    } = {},
  ): Promise<void> {
    const status = options.status ?? SmartStatus.smart;
    const tag = options.tag;
    const result = options.result;
    const force = options.force ?? false;
    const closeType = options.closeType ?? 'normal';

    if (status === SmartStatus.smart) {
      const loading = this.config.loading.isExist;
      if (
        loading &&
        (tag === undefined ||
          (this.dialogQueue.length === 0 && this.notifyQueue.length === 0))
      ) {
        return this.loadingController.dismiss(this, { closeType, result });
      }

      if (this.notifyQueue.length > 0) {
        let useNotify = tag === undefined;
        if (tag !== undefined) {
          useNotify = this.notifyQueue.some((item) => item.tag === tag);
        }
        if (useNotify) {
          return CustomNotify.dismiss(this, {
            type: 'notify',
            tag,
            result,
            closeType,
          });
        }
      }

      if (this.dialogQueue.length > 0) {
        return CustomDialog.dismiss(this, {
          type: 'dialog',
          tag,
          result,
          force,
          closeType,
        });
      }
      return;
    }

    if (status === SmartStatus.toast) {
      return CustomToast.dismiss();
    }
    if (status === SmartStatus.allToast) {
      return CustomToast.dismiss({ closeAll: true });
    }
    if (status === SmartStatus.loading) {
      return this.loadingController.dismiss(this, { closeType, result });
    }
    if (status === SmartStatus.notify || status === SmartStatus.allNotify) {
      const type = this.convertStatus(status);
      if (!type) return;
      return CustomNotify.dismiss(this, {
        type,
        tag,
        result,
        closeType,
      });
    }

    const type = this.convertStatus(status);
    if (!type) return;
    return CustomDialog.dismiss(this, {
      type,
      tag,
      result,
      force,
      closeType,
    });
  }

  checkExist(options: {
    tag?: string;
    dialogTypes?: Iterable<SmartAllDialogType>;
  } = {}): boolean {
    return DialogKit.instance.checkExist(this, options);
  }

  private convertStatus(status: SmartStatus): DialogType | null {
    switch (status) {
      case SmartStatus.dialog:
        return 'dialog';
      case SmartStatus.custom:
        return 'custom';
      case SmartStatus.attach:
        return 'attach';
      case SmartStatus.notify:
        return 'notify';
      case SmartStatus.allDialog:
        return 'allDialog';
      case SmartStatus.allCustom:
        return 'allCustom';
      case SmartStatus.allAttach:
        return 'allAttach';
      case SmartStatus.allNotify:
        return 'allNotify';
      case SmartStatus.smart:
      case SmartStatus.toast:
      case SmartStatus.allToast:
      case SmartStatus.loading:
        return null;
    }
  }

  resetForTest(): void {
    for (const info of this.dialogQueue) {
      if (info.displayTimer !== undefined) clearTimeout(info.displayTimer);
      this.domBridge?.monitorElementUnbind(info);
      info.dialog.resetForTest();
    }
    this.dialogQueue.length = 0;

    for (const info of this.notifyQueue) {
      if (info.displayTimer !== undefined) clearTimeout(info.displayTimer);
      info.dialog.resetForTest();
    }
    this.notifyQueue.length = 0;

    this.loadingController.resetForTest();
    this.loadingInfo.backType = undefined;
    this.loadingInfo.onBack = undefined;

    ToastTool.instance.resetForTest();
    DebounceUtils.instance.resetForTest();
    this.observer.resetForTest();
    MonitorPopRoute.instance.resetForTest();

    this.config = new SmartConfig();
    this.initialized = false;
    this.enabledInitTypes = new Set<SmartInitType>([
      SmartInitType.custom,
      SmartInitType.attach,
      SmartInitType.notify,
      SmartInitType.loading,
      SmartInitType.toast,
    ]);

    if (this.domBridge) {
      this.toastBuilder = this.domBridge.defaultToastBuilder;
      this.loadingBuilder = this.domBridge.defaultLoadingBuilder;
      this.notifyStyle = this.domBridge.defaultNotifyStyle;
      this.domBridge.resetForTest();
    }
  }
}
