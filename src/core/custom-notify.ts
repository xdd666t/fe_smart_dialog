import {
  CloseType,
  DialogType,
  SmartInitType,
  SmartStatus,
} from '../config/enums';
import { validateRuntimeDialogOptions } from '../config/validation';
import { resolveDurationMs } from '../types/common';
import type { SmartShowNotifyOptions } from '../types/params';
import { DebounceUtils } from './debounce-utils';
import type { NotifyInfo } from './dialog-info';
import type { DialogProxy } from './dialog-proxy';
import { DialogScope } from './dialog-scope';
import { MonitorPopRoute } from './monitor-pop-route';
import { SmartTag } from './smart-tag';

export class CustomNotify {
  static async showNotify<T = unknown>(
    proxy: DialogProxy,
    options: SmartShowNotifyOptions,
  ): Promise<T | undefined> {
    validateRuntimeDialogOptions('SmartDialog.showNotify', options);
    const config = proxy.config.notify;
    const debounce = options.debounce ?? config.debounce;
    if (DebounceUtils.instance.banContinue('notify', debounce)) {
      return undefined;
    }

    const keepSingle = options.keepSingle ?? false;
    const displayTime =
      options.displayTime === undefined
        ? config.displayTime
        : options.displayTime === null
          ? null
          : resolveDurationMs(options.displayTime);

    const builder =
      options.builder ??
      ((ctx) => {
        const style = proxy.notifyStyle;
        switch (options.notifyType) {
          case 'success':
            return style.successBuilder?.(options.msg) ?? options.msg;
          case 'failure':
            return style.failureBuilder?.(options.msg) ?? options.msg;
          case 'warning':
            return style.warningBuilder?.(options.msg) ?? options.msg;
          case 'alert':
            return style.alertBuilder?.(options.msg) ?? options.msg;
          case 'error':
            return style.errorBuilder?.(options.msg) ?? options.msg;
        }
      });

    let notifyInfo: NotifyInfo | null = null;
    if (keepSingle) {
      notifyInfo = this.getDialog(proxy, options.tag ?? SmartTag.keepSingle);
    }

    const assignedTag =
      notifyInfo?.tag ??
      (keepSingle
        ? options.tag ?? SmartTag.keepSingle
        : options.tag ??
          `fsd-notify-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

    if (!notifyInfo) {
      const dialog = proxy.createMainDialog(SmartInitType.notify);
      notifyInfo = {
        dialog,
        tag: assignedTag,
        backType: options.backType ?? config.backType,
        onBack: options.onBack,
      };
      proxy.notifyQueue.push(notifyInfo);
    } else {
      notifyInfo.backType = options.backType ?? config.backType;
      notifyInfo.onBack = options.onBack;
    }

    proxy.config.notify.isExist = proxy.notifyQueue.length > 0;

    const scope = new DialogScope({
      controller: options.controller,
      builder,
      context: {
        controller: options.controller,
        tag: assignedTag,
        dismiss: (res) =>
          proxy.dismiss({
            status: SmartStatus.notify,
            tag: assignedTag,
            result: res,
          }),
      },
    });

    const onDismissWrapped = this.handleDismissTimer(
      proxy,
      options.onDismiss,
      displayTime,
      notifyInfo,
      keepSingle,
    );

    const clickMaskDismiss = options.clickMaskDismiss ?? config.clickMaskDismiss;

    const promise = notifyInfo.dialog.show<T>({
      scope,
      alignment: options.alignment ?? config.alignment,
      clickMaskDismiss,
      animationType: options.animationType ?? config.animationType,
      nonAnimationTypes: options.nonAnimationTypes ?? config.nonAnimationTypes,
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
      reuse: true,
      awaitOverType: config.awaitOverType,
      maskTriggerType: config.maskTriggerType,
      keepSingle,
      maskClassName: options.maskClassName,
      dialogClassName: options.dialogClassName,
      zIndex: options.zIndex,
      trapFocus: options.trapFocus ?? config.trapFocus,
      lockScroll: options.lockScroll ?? config.lockScroll,
      ariaLabel: options.ariaLabel,
      onMask: () => {
        options.onMask?.();
        if (
          !clickMaskDismiss ||
          DebounceUtils.instance.banContinue('mask', true)
        ) {
          return;
        }
        void this.dismiss(proxy, {
          closeType: CloseType.mask,
          tag: notifyInfo!.tag,
        });
      },
    });

    MonitorPopRoute.instance.syncHistorySentinel();
    return promise;
  }

  private static handleDismissTimer(
    proxy: DialogProxy,
    onDismiss: (() => void) | undefined,
    displayTime: number | null,
    notifyInfo: NotifyInfo,
    keepSingle: boolean,
  ): () => void {
    if (keepSingle && notifyInfo.displayTimer !== undefined) {
      clearTimeout(notifyInfo.displayTimer);
      notifyInfo.displayTimer = undefined;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    const tag = notifyInfo.tag;
    if (displayTime !== null && tag !== undefined) {
      timer = setTimeout(() => {
        void this.dismiss(proxy, { tag });
      }, displayTime);
      notifyInfo.displayTimer = timer;
    }

    return () => {
      if (timer !== undefined) clearTimeout(timer);
      if (notifyInfo.displayTimer !== undefined) {
        clearTimeout(notifyInfo.displayTimer);
        notifyInfo.displayTimer = undefined;
      }
      onDismiss?.();
    };
  }

  static async dismiss<T = unknown>(
    proxy: DialogProxy,
    options: {
      type?: DialogType;
      tag?: string;
      result?: T;
      closeType?: CloseType;
    } = {},
  ): Promise<void> {
    const type = options.type ?? DialogType.notify;
    const closeType = options.closeType ?? CloseType.normal;

    if (type === DialogType.notify) {
      const info = this.getDialog(proxy, options.tag);
      if (!info) return;
      await this.closeInfo(proxy, info, options.result, closeType);
      return;
    }

    const targets =
      options.tag === undefined
        ? [...proxy.notifyQueue].reverse()
        : proxy.notifyQueue.filter((item) => item.tag === options.tag);

    for (const info of targets) {
      await this.closeInfo(proxy, info, options.result, closeType);
    }
  }

  private static async closeInfo<T>(
    proxy: DialogProxy,
    info: NotifyInfo,
    result: T | undefined,
    closeType: CloseType,
  ): Promise<void> {
    const idx = proxy.notifyQueue.indexOf(info);
    if (idx !== -1) {
      proxy.notifyQueue.splice(idx, 1);
    }

    if (info.displayTimer !== undefined) {
      clearTimeout(info.displayTimer);
      info.displayTimer = undefined;
    }

    proxy.config.notify.isExist = proxy.notifyQueue.length > 0;

    await info.dialog.dismiss({
      result,
      closeType,
    });

    MonitorPopRoute.instance.syncHistorySentinel();
  }

  private static getDialog(
    proxy: DialogProxy,
    tag?: string,
  ): NotifyInfo | null {
    const queue = proxy.notifyQueue;
    if (queue.length === 0) return null;
    if (tag !== undefined) {
      return queue.find((item) => item.tag === tag) ?? null;
    }
    return queue[queue.length - 1] ?? null;
  }
}
