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

export interface SmartConfigCustomOptions<TContent = SmartContent>
  extends SmartConfigCommonOptions<TContent> {
  debounce?: boolean;
  debounceTime?: SmartDuration;
  bindPage?: boolean;
  backType?: SmartBackType;
  isExist?: boolean;
}

/**
 * Global configuration for `SmartDialog.show`.
 */
export class SmartConfigCustom<TContent = SmartContent> {
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
  bindPage: boolean;
  awaitOverType: SmartAwaitOverType;
  maskTriggerType: SmartMaskTriggerType;
  nonAnimationTypes: SmartNonAnimationType[];
  backType: SmartBackType;
  trapFocus: boolean;
  lockScroll: boolean;
  isExist: boolean;

  constructor(options: SmartConfigCustomOptions<TContent> = {}) {
    this.alignment = options.alignment ?? Alignment.center;
    this.animationType =
      options.animationType ?? SmartAnimationType.centerScale_otherSlide;
    this.animationTime = resolveDurationMs(options.animationTime ?? 200);
    this.useAnimation = options.useAnimation ?? true;
    this.usePenetrate = options.usePenetrate ?? false;
    this.maskColor = options.maskColor ?? 'rgba(0, 0, 0, 0.46)';
    this.maskWidget = options.maskWidget;
    this.clickMaskDismiss = options.clickMaskDismiss ?? true;
    this.debounce = options.debounce ?? false;
    this.debounceTime = resolveDurationMs(options.debounceTime ?? 300);
    this.bindPage = options.bindPage ?? true;
    this.awaitOverType =
      options.awaitOverType ?? SmartAwaitOverType.dialogDismiss;
    this.maskTriggerType = options.maskTriggerType ?? SmartMaskTriggerType.up;
    this.nonAnimationTypes = options.nonAnimationTypes ?? [
      SmartNonAnimationType.routeClose_nonAnimation,
    ];
    this.backType = options.backType ?? SmartBackType.normal;
    this.trapFocus = options.trapFocus ?? true;
    this.lockScroll = options.lockScroll ?? false;
    this.isExist = options.isExist ?? false;
  }
}
