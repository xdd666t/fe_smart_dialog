import { SmartInitType, SmartStatus } from '../config/enums';
import { validateRuntimeDialogOptions } from '../config/validation';
import { resolveDurationMs } from '../types/common';
import type { SmartShowToastOptions } from '../types/params';
import { DebounceUtils } from './debounce-utils';
import type { DialogProxy } from './dialog-proxy';
import { DialogScope } from './dialog-scope';
import { ToastInfo, ToastTool } from './toast-tool';

export class CustomToast {
  static async showToast(
    proxy: DialogProxy,
    msg: string,
    options: SmartShowToastOptions = {},
  ): Promise<void> {
    validateRuntimeDialogOptions('SmartDialog.showToast', options);
    const config = proxy.config.toast;
    const debounce = options.debounce ?? config.debounce;
    if (DebounceUtils.instance.banContinue('toast', debounce)) {
      return;
    }

    const mainDialog = proxy.createMainDialog(SmartInitType.toast, {
      consumeEvent: options.consumeEvent ?? config.consumeEvent,
    });

    const builder = options.builder ?? (() => proxy.toastBuilder(msg));
    const scope = new DialogScope({
      controller: options.controller,
      builder,
      context: {
        controller: options.controller,
        dismiss: () => proxy.dismiss({ status: SmartStatus.toast }),
      },
    });

    const displayTime = resolveDurationMs(
      options.displayTime ?? config.displayTime,
    );
    const displayType = options.displayType ?? config.displayType;
    const clickMaskDismiss = options.clickMaskDismiss ?? config.clickMaskDismiss;

    const info = new ToastInfo({
      type: displayType,
      mainDialog,
      displayTime,
      refreshScope: scope,
      refreshBuilder: builder,
      onShow: () => {
        void mainDialog.show({
          scope,
          alignment: options.alignment ?? config.alignment,
          clickMaskDismiss,
          animationType: options.animationType ?? config.animationType,
          nonAnimationTypes:
            options.nonAnimationTypes ?? config.nonAnimationTypes,
          animationBuilder: options.animationBuilder,
          usePenetrate: options.usePenetrate ?? config.usePenetrate,
          useAnimation: options.useAnimation ?? config.useAnimation,
          animationTime: resolveDurationMs(
            options.animationTime ?? config.animationTime,
          ),
          maskColor: options.maskColor ?? config.maskColor,
          maskWidget: options.maskWidget ?? config.maskWidget,
          onDismiss: options.onDismiss,
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
            if (
              !clickMaskDismiss ||
              DebounceUtils.instance.banContinue('mask', true)
            ) {
              return;
            }
            void ToastTool.instance.dismissInfo(info);
          },
        });
      },
    });

    return ToastTool.instance.show(info);
  }

  static async dismiss(options: { closeAll?: boolean } = {}): Promise<void> {
    await ToastTool.instance.dismiss({ closeAll: options.closeAll });
  }
}
