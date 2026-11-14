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

export interface SmartConfigLoadingOptions<TContent = SmartContent>
  extends SmartConfigCommonOptions<TContent> {
  leastLoadingTime?: SmartDuration;
  backType?: SmartBackType;
  isExist?: boolean;
}

/**
 * Global configuration for `SmartDialog.showLoading`.
 */
export class SmartConfigLoading<TContent = SmartContent> {
  alignment: SmartAlignment;
  animationTime: number;
  animationType: SmartAnimationType;
  useAnimation: boolean;
  usePenetrate: boolean;
  maskColor: string;
  maskWidget?: TContent;
  clickMaskDismiss: boolean;
  leastLoadingTime: number;
  awaitOverType: SmartAwaitOverType;
  maskTriggerType: SmartMaskTriggerType;
  nonAnimationTypes: SmartNonAnimationType[];
  backType: SmartBackType;
  trapFocus: boolean;
  lockScroll: boolean;
  isExist: boolean;

  constructor(options: SmartConfigLoadingOptions<TContent> = {}) {
    this.alignment = options.alignment ?? Alignment.center;
    this.animationType = options.animationType ?? SmartAnimationType.fade;
    this.animationTime = resolveDurationMs(options.animationTime ?? 200);
    this.useAnimation = options.useAnimation ?? true;
    this.usePenetrate = options.usePenetrate ?? false;
    this.maskColor = options.maskColor ?? 'rgba(0, 0, 0, 0.46)';
    this.maskWidget = options.maskWidget;
    this.clickMaskDismiss = options.clickMaskDismiss ?? false;
    this.leastLoadingTime = resolveDurationMs(options.leastLoadingTime ?? 0);
    this.awaitOverType =
      options.awaitOverType ?? SmartAwaitOverType.dialogDismiss;
    this.maskTriggerType = options.maskTriggerType ?? SmartMaskTriggerType.up;
    this.nonAnimationTypes = options.nonAnimationTypes ?? [
      SmartNonAnimationType.routeClose_nonAnimation,
      SmartNonAnimationType.continueLoading_nonAnimation,
    ];
    this.backType = options.backType ?? SmartBackType.normal;
    this.trapFocus = options.trapFocus ?? false;
    this.lockScroll = options.lockScroll ?? false;
    this.isExist = options.isExist ?? false;
  }
}
