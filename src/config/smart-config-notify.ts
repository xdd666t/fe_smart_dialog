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
  declare alignment: SmartAlignment;
  animationTime: number;
  declare animationType: SmartAnimationType;
  useAnimation: boolean;
  usePenetrate: boolean;
  maskColor: string;
  maskWidget?: TContent;
  clickMaskDismiss: boolean;
  debounce: boolean;
  debounceTime: number;
  displayTime: number | null;
  declare awaitOverType: SmartAwaitOverType;
  declare maskTriggerType: SmartMaskTriggerType;
  declare nonAnimationTypes: SmartNonAnimationType[];
  declare backType: SmartBackType;
  trapFocus: boolean;
  lockScroll: boolean;
  isExist: boolean;

  constructor(options: SmartConfigNotifyOptions<TContent> = {}) {
    bindCommonValidatedConfigFields(this, 'SmartConfigNotify', {
      alignment: options.alignment ?? Alignment.center,
      animationType: options.animationType ?? SmartAnimationType.fade,
      awaitOverType:
        options.awaitOverType ?? SmartAwaitOverType.dialogDismiss,
      maskTriggerType: options.maskTriggerType ?? SmartMaskTriggerType.up,
      nonAnimationTypes: options.nonAnimationTypes ?? [],
    });
    bindValidatedProperty(
      this,
      'backType',
      options.backType ?? SmartBackType.ignore,
      (v, n) => assertEnumValue(SmartBackType, v, n),
      'SmartConfigNotify.backType',
    );
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
    this.trapFocus = options.trapFocus ?? false;
    this.lockScroll = options.lockScroll ?? false;
    this.isExist = options.isExist ?? false;
  }
}
