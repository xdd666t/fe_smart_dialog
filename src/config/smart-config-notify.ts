import {
  SmartAnimationType,
  SmartAwaitOverType,
  SmartBackType,
  SmartMaskTriggerType,
  SmartNonAnimationType,
} from './enums';
import type { SmartAlignment, SmartDuration } from '../types/common';
import { Alignment, resolveDurationMs } from '../types/common';
import type { SmartConfigCommonOptions, SmartContent } from '../types/params';

export interface SmartConfigNotifyOptions<TContent = SmartContent>
  extends SmartConfigCommonOptions<TContent> {
  debounce?: boolean;
  debounceTime?: SmartDuration;
  displayTime?: SmartDuration | null;
  backType?: SmartBackType;
  isExist?: boolean;
}

/**
 * Global configuration for `SmartDialog.showNotify`.
 */
export class SmartConfigNotify<TContent = SmartContent> {
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
  displayTime: number | null;
  awaitOverType: SmartAwaitOverType;
  maskTriggerType: SmartMaskTriggerType;
  nonAnimationTypes: SmartNonAnimationType[];
  backType: SmartBackType;
  trapFocus: boolean;
  lockScroll: boolean;
  isExist: boolean;

  constructor(options: SmartConfigNotifyOptions<TContent> = {}) {
    this.alignment = options.alignment ?? Alignment.center;
    this.animationType = options.animationType ?? SmartAnimationType.fade;
    this.animationTime = resolveDurationMs(options.animationTime ?? 200);
    this.useAnimation = options.useAnimation ?? true;
    this.usePenetrate = options.usePenetrate ?? true;
    this.maskColor = options.maskColor ?? 'rgba(0, 0, 0, 0.46)';
    this.maskWidget = options.maskWidget;
    this.clickMaskDismiss = options.clickMaskDismiss ?? false;
    this.debounce = options.debounce ?? false;
    this.debounceTime = resolveDurationMs(options.debounceTime ?? 300);
    this.displayTime =
      options.displayTime === null
        ? null
        : resolveDurationMs(options.displayTime ?? 2500);
    this.awaitOverType =
      options.awaitOverType ?? SmartAwaitOverType.dialogDismiss;
    this.maskTriggerType = options.maskTriggerType ?? SmartMaskTriggerType.up;
    this.nonAnimationTypes = options.nonAnimationTypes ?? [];
    this.backType = options.backType ?? SmartBackType.ignore;
    this.trapFocus = options.trapFocus ?? false;
    this.lockScroll = options.lockScroll ?? false;
    this.isExist = options.isExist ?? false;
  }
}
