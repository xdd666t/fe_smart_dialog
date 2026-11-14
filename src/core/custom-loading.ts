import {
  CloseType,
  SmartInitType,
  SmartNonAnimationType,
  SmartStatus,
} from '../config/enums';
import { validateRuntimeDialogOptions } from '../config/validation';
import { resolveDurationMs } from '../types/common';
import type { SmartShowLoadingOptions } from '../types/params';
import type { MainDialogHandle } from './dialog-host';
import type { DialogProxy } from './dialog-proxy';
import { DialogScope } from './dialog-scope';
import { MonitorPopRoute } from './monitor-pop-route';

export class CustomLoading {
  private mainDialog: MainDialogHandle | null = null;
  private leastTimer: ReturnType<typeof setTimeout> | null = null;
  private displayTimer: ReturnType<typeof setTimeout> | null = null;
  private canDismiss = true;
  private pendingDismiss: (() => Promise<void>) | null = null;
  private pendingDismissPromise: Promise<void> | null = null;
  private pendingDismissResolve: (() => void) | null = null;

  async showLoading<T = unknown>(
    proxy: DialogProxy,
    options: SmartShowLoadingOptions,
  ): Promise<T | undefined> {
    validateRuntimeDialogOptions('SmartDialog.showLoading', options);
    const config = proxy.config.loading;
    const msg = options.msg ?? 'loading...';

    const nonAnimationTypes = [
      ...(options.nonAnimationTypes ?? config.nonAnimationTypes),
    ];
    if (
      config.isExist &&
      nonAnimationTypes.includes(
        SmartNonAnimationType.continueLoading_nonAnimation,
      ) &&
      !nonAnimationTypes.includes(SmartNonAnimationType.openDialog_nonAnimation)
    ) {
      nonAnimationTypes.push(SmartNonAnimationType.openDialog_nonAnimation);
    }

    config.isExist = true;
    proxy.loadingInfo.backType = options.backType ?? config.backType;
    proxy.loadingInfo.onBack = options.onBack;

    this.clearLeastTimer();
    this.pendingDismiss = null;
    if (this.pendingDismissResolve) {
      this.pendingDismissResolve();
      this.pendingDismissResolve = null;
      this.pendingDismissPromise = null;
    }

    const leastTime = resolveDurationMs(config.leastLoadingTime);
    if (leastTime <= 0) {
      this.canDismiss = true;
    } else {
      this.canDismiss = false;
      this.leastTimer = setTimeout(() => {
        this.leastTimer = null;
        this.canDismiss = true;
        const callback = this.pendingDismiss;
        this.pendingDismiss = null;
        if (callback) {
          void callback();
        }
      }, leastTime);
    }

    if (!this.mainDialog) {
      this.mainDialog = proxy.createMainDialog(SmartInitType.loading);
    }

    const builder =
      options.builder ?? (() => proxy.loadingBuilder(msg));

    const scope = new DialogScope({
      controller: options.controller,
      builder,
      context: {
        controller: options.controller,
        dismiss: (res) =>
          proxy.dismiss({ status: SmartStatus.loading, result: res }),
      },
    });

    const displayTime =
      options.displayTime === null || options.displayTime === undefined
        ? null
        : resolveDurationMs(options.displayTime);

    const onDismissWrapped = this.handleDisplayTimer(
      proxy,
      options.onDismiss,
      displayTime,
    );

    const clickMaskDismiss = options.clickMaskDismiss ?? config.clickMaskDismiss;

    const promise = this.mainDialog.show<T>({
      scope,
      alignment: options.alignment ?? config.alignment,
      clickMaskDismiss,
      animationType: options.animationType ?? config.animationType,
      nonAnimationTypes,
      animationBuilder: options.animationBuilder,
      usePenetrate: options.usePenetrate ?? config.usePenetrate,
      useAnimation: options.useAnimation ?? config.useAnimation,
      animationTime: resolveDurationMs(
        options.animationTime ?? config.animationTime,
      ),
      maskColor: options.maskColor ?? config.maskColor,
      maskWidget: options.maskWidget ?? config.maskWidget,
      onDismiss: onDismissWrapped,
      useSystem: false,
      reuse: false,
      awaitOverType: config.awaitOverType,
      maskTriggerType: config.maskTriggerType,
      keepSingle: false,
      maskClassName: options.maskClassName,
      dialogClassName: options.dialogClassName,
      zIndex: options.zIndex,
      trapFocus: options.trapFocus ?? config.trapFocus,
      lockScroll: options.lockScroll ?? config.lockScroll,
      ariaLabel: options.ariaLabel,
      onMask: () => {
        options.onMask?.();
        if (!clickMaskDismiss) return;
        void this.realDismiss(proxy, CloseType.mask);
      },
    });

    MonitorPopRoute.instance.syncHistorySentinel();
    return promise;
  }

  private handleDisplayTimer(
    proxy: DialogProxy,
    onDismiss: (() => void) | undefined,
    displayTime: number | null,
  ): () => void {
    this.clearDisplayTimer();
    if (displayTime !== null) {
      this.displayTimer = setTimeout(() => {
        this.displayTimer = null;
        void this.dismiss(proxy);
      }, displayTime);
    }

    return () => {
      this.clearDisplayTimer();
      onDismiss?.();
    };
  }

  private async realDismiss<T>(
    proxy: DialogProxy,
    closeType: CloseType = CloseType.normal,
    result?: T,
  ): Promise<void> {
    proxy.config.loading.isExist = false;
    this.clearLeastTimer();
    this.clearDisplayTimer();
    await this.mainDialog?.dismiss({ closeType, result });
    MonitorPopRoute.instance.syncHistorySentinel();
  }

  async dismiss<T = unknown>(
    proxy: DialogProxy,
    options: { closeType?: CloseType; result?: T } = {},
  ): Promise<void> {
    const closeType = options.closeType ?? CloseType.normal;
    if (!proxy.config.loading.isExist && !this.mainDialog?.visible) {
      return;
    }

    if (this.canDismiss) {
      this.canDismiss = false;
      this.pendingDismiss = null;
      await this.realDismiss(proxy, closeType, options.result);
      return;
    }

    if (!this.pendingDismissPromise) {
      this.pendingDismissPromise = new Promise<void>((resolve) => {
        this.pendingDismissResolve = resolve;
      });
    }

    this.pendingDismiss = async () => {
      try {
        await this.realDismiss(proxy, closeType, options.result);
      } finally {
        this.pendingDismissResolve?.();
        this.pendingDismissResolve = null;
        this.pendingDismissPromise = null;
      }
    };

    await this.pendingDismissPromise;
  }

  resetForTest(): void {
    this.clearLeastTimer();
    this.clearDisplayTimer();
    this.canDismiss = true;
    this.pendingDismiss = null;
    if (this.pendingDismissResolve) {
      this.pendingDismissResolve();
      this.pendingDismissResolve = null;
      this.pendingDismissPromise = null;
    }
    this.mainDialog?.resetForTest();
    this.mainDialog = null;
  }

  private clearLeastTimer(): void {
    if (this.leastTimer !== null) {
      clearTimeout(this.leastTimer);
      this.leastTimer = null;
    }
  }

  private clearDisplayTimer(): void {
    if (this.displayTimer !== null) {
      clearTimeout(this.displayTimer);
      this.displayTimer = null;
    }
  }
}
