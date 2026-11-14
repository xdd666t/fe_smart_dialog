import {
  CloseType,
  DialogType,
  SmartBackType,
  SmartInitType,
  SmartNonAnimationType,
  SmartStatus,
} from '../config/enums';
import { validateRuntimeDialogOptions } from '../config/validation';
import { resolveDurationMs } from '../types/common';
import type {
  SmartShowAttachOptions,
  SmartShowCustomOptions,
  SmartTargetRef,
} from '../types/params';
import { DebounceUtils } from './debounce-utils';
import type { MainDialogHandle } from './dialog-host';
import type { DialogInfo } from './dialog-info';
import type { DialogProxy } from './dialog-proxy';
import { DialogScope } from './dialog-scope';
import { MonitorPopRoute } from './monitor-pop-route';
import { RouteRecord } from './route-record';
import { SmartTag } from './smart-tag';

export class CustomDialog {
  static async show<T = unknown>(
    proxy: DialogProxy,
    options: SmartShowCustomOptions,
  ): Promise<T | undefined> {
    validateRuntimeDialogOptions('SmartDialog.show', options);
    if (options.useSystem) {
      if (
        options.tag !== undefined ||
        options.permanent !== undefined ||
        options.keepSingle !== undefined
      ) {
        throw new Error(
          'SmartDialog: when `useSystem` is true, `tag`, `keepSingle`, and `permanent` cannot be set.',
        );
      }
    }

    const config = proxy.config.custom;
    const debounce = options.debounce ?? config.debounce;
    if (DebounceUtils.instance.banContinue('custom', debounce)) {
      return undefined;
    }

    const bindWidget = options.bindWidget ?? options.bindElement;
    const bindPage = (options.bindPage ?? config.bindPage) && !bindWidget;
    const keepSingle = options.keepSingle ?? false;
    const permanent = options.permanent ?? false;
    const useSystem = options.useSystem ?? false;
    const displayTime =
      options.displayTime === null || options.displayTime === undefined
        ? null
        : resolveDurationMs(options.displayTime);

    const { dialogInfo, scope, isReuse } = this.prepareDialogInfo(proxy, {
      type: DialogType.custom,
      tag: options.tag,
      keepSingle,
      permanent,
      useSystem,
      bindPage,
      bindWidget,
      backType: options.backType ?? config.backType,
      onBack: options.onBack,
      controller: options.controller,
      builder: options.builder,
    });

    const onDismissWrapped = this.handleDismissTimer(
      proxy,
      options.onDismiss,
      displayTime,
      dialogInfo,
      keepSingle,
    );

    const clickMaskDismiss = options.clickMaskDismiss ?? config.clickMaskDismiss;

    const promise = dialogInfo.dialog.show<T>({
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
      useSystem,
      reuse: !isReuse ? true : true,
      awaitOverType: config.awaitOverType,
      maskTriggerType: config.maskTriggerType,
      ignoreArea: options.ignoreArea,
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
          DebounceUtils.instance.banContinue('mask', true) ||
          permanent
        ) {
          return;
        }
        void this.dismiss(proxy, {
          closeType: CloseType.mask,
          tag: dialogInfo.tag,
        });
      },
    });

    MonitorPopRoute.instance.syncHistorySentinel();
    return promise;
  }

  static async showAttach<T = unknown>(
    proxy: DialogProxy,
    options: SmartShowAttachOptions,
  ): Promise<T | undefined> {
    validateRuntimeDialogOptions('SmartDialog.showAttach', options);
    const targetContext = options.targetContext ?? options.targetElement;
    if (targetContext === undefined && options.targetBuilder === undefined) {
      throw new Error(
        'SmartDialog.showAttach: `targetContext`/`targetElement` and `targetBuilder` cannot both be omitted.',
      );
    }
    if (options.useSystem) {
      if (
        options.tag !== undefined ||
        options.permanent !== undefined ||
        options.keepSingle !== undefined
      ) {
        throw new Error(
          'SmartDialog: when `useSystem` is true, `tag`, `keepSingle`, and `permanent` cannot be set.',
        );
      }
    }

    const config = proxy.config.attach;
    const debounce = options.debounce ?? config.debounce;
    if (DebounceUtils.instance.banContinue('attach', debounce)) {
      return undefined;
    }

    const bindWidget = options.bindWidget ?? options.bindElement;
    const bindPage = (options.bindPage ?? config.bindPage) && !bindWidget;
    const keepSingle = options.keepSingle ?? false;
    const permanent = options.permanent ?? false;
    const useSystem = options.useSystem ?? false;
    const displayTime =
      options.displayTime === null || options.displayTime === undefined
        ? null
        : resolveDurationMs(options.displayTime);

    const { dialogInfo, scope } = this.prepareDialogInfo(proxy, {
      type: DialogType.attach,
      tag: options.tag,
      keepSingle,
      permanent,
      useSystem,
      bindPage,
      bindWidget,
      backType: options.backType ?? config.backType,
      onBack: options.onBack,
      controller: options.controller,
      builder: options.builder,
    });

    const onDismissWrapped = this.handleDismissTimer(
      proxy,
      options.onDismiss,
      displayTime,
      dialogInfo,
      keepSingle,
    );

    const clickMaskDismiss = options.clickMaskDismiss ?? config.clickMaskDismiss;

    const promise = dialogInfo.dialog.showAttach<T>({
      scope,
      targetContext,
      targetBuilder: options.targetBuilder,
      adjustBuilder: options.adjustBuilder,
      scalePointBuilder: options.scalePointBuilder,
      maskIgnoreArea: options.maskIgnoreArea,
      highlightBuilder: options.highlightBuilder,
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
      useSystem,
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
          DebounceUtils.instance.banContinue('mask', true) ||
          permanent
        ) {
          return;
        }
        void this.dismiss(proxy, {
          closeType: CloseType.mask,
          tag: dialogInfo.tag,
        });
      },
    });

    MonitorPopRoute.instance.syncHistorySentinel();
    return promise;
  }

  private static prepareDialogInfo(
    proxy: DialogProxy,
    params: {
      type: DialogType.custom | DialogType.attach;
      tag?: string;
      keepSingle: boolean;
      permanent: boolean;
      useSystem: boolean;
      bindPage: boolean;
      bindWidget?: SmartTargetRef;
      backType?: SmartBackType;
      onBack?: () => boolean | Promise<boolean>;
      controller?: SmartShowCustomOptions['controller'];
      builder: SmartShowCustomOptions['builder'];
    },
  ): { dialogInfo: DialogInfo; scope: DialogScope; isReuse: boolean } {
    const route = RouteRecord.instance.ensureCurrentRoute();

    if (params.keepSingle) {
      const lookupTag = params.tag ?? SmartTag.keepSingle;
      const existing = this.getDialog(proxy, { tag: lookupTag });
      if (existing) {
        existing.backType = params.backType;
        existing.onBack = params.onBack;
        const scope = new DialogScope({
          controller: params.controller,
          builder: params.builder,
          context: {
            controller: params.controller,
            tag: existing.tag,
            dismiss: (res) =>
              proxy.dismiss({
                status: SmartStatus.dialog,
                tag: existing.tag,
                result: res,
              }),
          },
        });
        return { dialogInfo: existing, scope, isReuse: true };
      }
    }

    const assignedTag = params.keepSingle
      ? params.tag ?? SmartTag.keepSingle
      : params.tag ?? `fsd-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const layer =
      params.type === DialogType.attach
        ? SmartInitType.attach
        : SmartInitType.custom;
    const dialog: MainDialogHandle = proxy.createMainDialog(layer);
    const dialogInfo: DialogInfo = {
      dialog,
      type: params.type,
      tag: assignedTag,
      permanent: params.permanent,
      useSystem: params.useSystem,
      bindPage: params.bindPage,
      route,
      bindWidget: params.bindWidget,
      backType: params.backType,
      onBack: params.onBack,
    };

    if (dialogInfo.permanent) {
      proxy.dialogQueue.unshift(dialogInfo);
    } else {
      proxy.dialogQueue.push(dialogInfo);
    }

    this.syncDialogExist(proxy);

    if (dialogInfo.bindWidget !== undefined) {
      proxy.monitorElementBind(dialogInfo);
    }

    const scope = new DialogScope({
      controller: params.controller,
      builder: params.builder,
      context: {
        controller: params.controller,
        tag: assignedTag,
        dismiss: (res) =>
          proxy.dismiss({
            status: SmartStatus.dialog,
            tag: assignedTag,
            result: res,
          }),
      },
    });

    return { dialogInfo, scope, isReuse: false };
  }

  private static handleDismissTimer(
    proxy: DialogProxy,
    onDismiss: (() => void) | undefined,
    displayTime: number | null,
    dialogInfo: DialogInfo,
    keepSingle: boolean,
  ): () => void {
    if (keepSingle && dialogInfo.displayTimer !== undefined) {
      clearTimeout(dialogInfo.displayTimer);
      dialogInfo.displayTimer = undefined;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    const tag = dialogInfo.tag;
    if (displayTime !== null && tag !== undefined) {
      timer = setTimeout(() => {
        void this.dismiss(proxy, { tag });
      }, displayTime);
      dialogInfo.displayTimer = timer;
    }

    return () => {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
      if (dialogInfo.displayTimer !== undefined) {
        clearTimeout(dialogInfo.displayTimer);
        dialogInfo.displayTimer = undefined;
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
      force?: boolean;
      closeType?: CloseType;
    } = {},
  ): Promise<void> {
    const type = options.type ?? DialogType.dialog;
    const force = options.force ?? false;
    const closeType = options.closeType ?? CloseType.normal;

    if (
      type === DialogType.dialog ||
      type === DialogType.custom ||
      type === DialogType.attach
    ) {
      await this.closeSingle(proxy, {
        type,
        tag: options.tag,
        result: options.result,
        force,
        closeType,
      });
      return;
    }

    let allType: DialogType.dialog | DialogType.custom | DialogType.attach | null =
      null;
    if (type === DialogType.allDialog) allType = DialogType.dialog;
    if (type === DialogType.allCustom) allType = DialogType.custom;
    if (type === DialogType.allAttach) allType = DialogType.attach;
    if (!allType) return;

    await this.closeAll(proxy, {
      type: allType,
      tag: options.tag,
      result: options.result,
      force,
      closeType,
    });
  }

  private static async closeAll<T>(
    proxy: DialogProxy,
    options: {
      type: DialogType.dialog | DialogType.custom | DialogType.attach;
      tag?: string;
      result?: T;
      force: boolean;
      closeType: CloseType;
    },
  ): Promise<void> {
    const dialogs = this.getDialogsForCloseAll(
      proxy,
      options.type,
      options.tag,
      options.force,
    );
    for (const info of dialogs) {
      await this.closeInfo(proxy, info, options.result, options.closeType);
    }
  }

  private static async closeSingle<T>(
    proxy: DialogProxy,
    options: {
      type: DialogType.dialog | DialogType.custom | DialogType.attach;
      tag?: string;
      result?: T;
      force: boolean;
      closeType: CloseType;
    },
  ): Promise<void> {
    const info = this.getDialog(proxy, {
      type: options.type,
      tag: options.tag,
      force: options.force,
    });
    if (!info || (info.permanent && !options.force)) return;
    await this.closeInfo(proxy, info, options.result, options.closeType);
  }

  private static async closeInfo<T>(
    proxy: DialogProxy,
    info: DialogInfo,
    result: T | undefined,
    closeType: CloseType,
  ): Promise<void> {
    const idx = proxy.dialogQueue.indexOf(info);
    if (idx !== -1) {
      proxy.dialogQueue.splice(idx, 1);
    }

    if (info.displayTimer !== undefined) {
      clearTimeout(info.displayTimer);
      info.displayTimer = undefined;
    }

    if (info.bindWidget !== undefined) {
      proxy.monitorElementUnbind(info);
    }

    this.syncDialogExist(proxy);

    await info.dialog.dismiss({
      useSystem: info.useSystem,
      result,
      closeType,
    });

    MonitorPopRoute.instance.syncHistorySentinel();
  }

  private static syncDialogExist(proxy: DialogProxy): void {
    proxy.config.custom.isExist = proxy.dialogQueue.some(
      (item) => item.type === DialogType.custom,
    );
    proxy.config.attach.isExist = proxy.dialogQueue.some(
      (item) => item.type === DialogType.attach,
    );
  }

  private static getDialogsForCloseAll(
    proxy: DialogProxy,
    type: DialogType.dialog | DialogType.custom | DialogType.attach,
    tag: string | undefined,
    force: boolean,
  ): DialogInfo[] {
    const queue = proxy.dialogQueue;
    if (tag !== undefined) {
      const matches: DialogInfo[] = [];
      for (const info of queue) {
        if (info.tag !== tag) continue;
        if (info.permanent && !force) break;
        matches.push(info);
      }
      return matches;
    }

    const reversed = [...queue].reverse();
    const matches: DialogInfo[] = [];
    if (force) {
      for (const info of reversed) {
        if (info.permanent) {
          matches.push(info);
        }
      }
    }

    for (const info of reversed) {
      if (info.permanent) {
        if (
          !force &&
          info.dialog.visible &&
          (type === DialogType.dialog || info.type === type)
        ) {
          break;
        }
        continue;
      }
      if (!info.dialog.visible && !info.useSystem) continue;
      if (type === DialogType.dialog || info.type === type) {
        matches.push(info);
      }
    }
    return matches;
  }

  static getDialog(
    proxy: DialogProxy,
    options: {
      type?: DialogType;
      tag?: string;
      force?: boolean;
    } = {},
  ): DialogInfo | null {
    const queue = proxy.dialogQueue;
    if (queue.length === 0) return null;

    if (options.tag !== undefined) {
      for (const item of queue) {
        if (item.tag === options.tag) return item;
      }
      return null;
    }

    if (options.force) {
      let lastPermanent: DialogInfo | null = null;
      for (const item of queue) {
        if (item.permanent) lastPermanent = item;
      }
      if (lastPermanent) return lastPermanent;
    }

    const type = options.type ?? DialogType.dialog;
    let target: DialogInfo | null = null;
    for (const item of queue) {
      if (!item.dialog.visible && !item.useSystem) continue;
      if (type === DialogType.dialog || item.type === type) {
        target = item;
      }
    }
    return target;
  }
}
