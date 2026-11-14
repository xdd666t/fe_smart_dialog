import {
  SmartAnimationType,
  SmartAwaitOverType,
  SmartMaskTriggerType,
  SmartNonAnimationType,
  SmartToastType,
} from './enums';
import type { SmartAlignment, SmartDuration } from '../types/common';
import { Alignment, resolveDurationMs } from '../types/common';
import type { SmartConfigCommonOptions, SmartContent } from '../types/params';

export interface SmartConfigToastOptions<TContent = SmartContent>
  extends SmartConfigCommonOptions<TContent> {
  debounce?: boolean;
  debounceTime?: SmartDuration;
  displayType?: SmartToastType;
  consumeEvent?: boolean;
  displayTime?: SmartDuration;
  intervalTime?: SmartDuration;
  isExist?: boolean;
}

/**
 * Global configuration for `SmartDialog.showToast`.
 */
export class SmartConfigToast<TContent = SmartContent> {
  alignment: SmartAlignment;
  animationTime: number;
  animationType: SmartAnimationType;
  useAnimation: boolean;
  usePenetrate: boolean;
  maskColor: string;
  maskWidget?: TContent;
  clickMaskDismiss: boolean;
  debounce: boolean;
  debounceTime: number;
  displayType: SmartToastType;
  consumeEvent: boolean;
  displayTime: number;
  intervalTime: number;
  awaitOverType: SmartAwaitOverType;
  maskTriggerType: SmartMaskTriggerType;
  nonAnimationTypes: SmartNonAnimationType[];
  trapFocus: boolean;
  lockScroll: boolean;
  isExist: boolean;

  constructor(options: SmartConfigToastOptions<TContent> = {}) {
    this.alignment = options.alignment ?? Alignment.bottomCenter;
    this.animationType = options.animationType ?? SmartAnimationType.fade;
    this.animationTime = resolveDurationMs(options.animationTime ?? 200);
    this.useAnimation = options.useAnimation ?? true;
    this.usePenetrate = options.usePenetrate ?? true;
    this.maskColor = options.maskColor ?? 'rgba(0, 0, 0, 0.46)';
    this.maskWidget = options.maskWidget;
    this.clickMaskDismiss = options.clickMaskDismiss ?? false;
    this.debounce = options.debounce ?? false;
    this.debounceTime = resolveDurationMs(options.debounceTime ?? 300);
    this.displayType = options.displayType ?? SmartToastType.normal;
    this.consumeEvent = options.consumeEvent ?? false;
    this.displayTime = resolveDurationMs(options.displayTime ?? 2000);
    this.intervalTime = resolveDurationMs(options.intervalTime ?? 100);
    this.awaitOverType =
      options.awaitOverType ?? SmartAwaitOverType.dialogDismiss;
    this.maskTriggerType = options.maskTriggerType ?? SmartMaskTriggerType.up;
    this.nonAnimationTypes = options.nonAnimationTypes ?? [];
    this.trapFocus = options.trapFocus ?? false;
    this.lockScroll = options.lockScroll ?? false;
    this.isExist = options.isExist ?? false;
  }
}
