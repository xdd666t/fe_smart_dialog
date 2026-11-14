import {
  SmartAnimationType,
  SmartAwaitOverType,
  SmartBackType,
  SmartMaskTriggerType,
  SmartNonAnimationType,
  assertEnumValue,
} from './enums';
import {
  bindCommonValidatedConfigFields,
  bindValidatedProperty,
} from './validation';
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
  declare alignment: SmartAlignment;
  animationTime: number;
  declare animationType: SmartAnimationType;
  useAnimation: boolean;
  usePenetrate: boolean;
  maskColor: string;
  maskWidget?: TContent;
  clickMaskDismiss: boolean;
  leastLoadingTime: number;
  declare awaitOverType: SmartAwaitOverType;
  declare maskTriggerType: SmartMaskTriggerType;
  declare nonAnimationTypes: SmartNonAnimationType[];
  declare backType: SmartBackType;
  trapFocus: boolean;
  lockScroll: boolean;
  isExist: boolean;

  constructor(options: SmartConfigLoadingOptions<TContent> = {}) {
    bindCommonValidatedConfigFields(this, 'SmartConfigLoading', {
      alignment: options.alignment ?? Alignment.center,
      animationType: options.animationType ?? SmartAnimationType.fade,
      awaitOverType:
        options.awaitOverType ?? SmartAwaitOverType.dialogDismiss,
      maskTriggerType: options.maskTriggerType ?? SmartMaskTriggerType.up,
      nonAnimationTypes: options.nonAnimationTypes ?? [
        SmartNonAnimationType.routeClose_nonAnimation,
        SmartNonAnimationType.continueLoading_nonAnimation,
      ],
    });
    bindValidatedProperty(
      this,
      'backType',
      options.backType ?? SmartBackType.normal,
      (v, n) => assertEnumValue(SmartBackType, v, n),
      'SmartConfigLoading.backType',
    );
    this.animationTime = resolveDurationMs(options.animationTime ?? 200);
    this.useAnimation = options.useAnimation ?? true;
    this.usePenetrate = options.usePenetrate ?? false;
    this.maskColor = options.maskColor ?? 'rgba(0, 0, 0, 0.46)';
    this.maskWidget = options.maskWidget;
    this.clickMaskDismiss = options.clickMaskDismiss ?? false;
    this.leastLoadingTime = resolveDurationMs(options.leastLoadingTime ?? 0);
    this.trapFocus = options.trapFocus ?? false;
    this.lockScroll = options.lockScroll ?? false;
    this.isExist = options.isExist ?? false;
  }
}
