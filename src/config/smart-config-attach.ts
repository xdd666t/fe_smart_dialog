import {
  SmartAnimationType,
  SmartAttachAlignmentType,
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

export interface SmartConfigAttachOptions<TContent = SmartContent>
  extends SmartConfigCommonOptions<TContent> {
  debounce?: boolean;
  debounceTime?: SmartDuration;
  bindPage?: boolean;
  attachAlignmentType?: SmartAttachAlignmentType;
  backType?: SmartBackType;
  isExist?: boolean;
}

/**
 * Global configuration for `SmartDialog.showAttach`.
 */
export class SmartConfigAttach<TContent = SmartContent> {
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
  bindPage: boolean;
  declare awaitOverType: SmartAwaitOverType;
  declare maskTriggerType: SmartMaskTriggerType;
  declare nonAnimationTypes: SmartNonAnimationType[];
  declare attachAlignmentType: SmartAttachAlignmentType;
  declare backType: SmartBackType;
  trapFocus: boolean;
  lockScroll: boolean;
  isExist: boolean;

  constructor(options: SmartConfigAttachOptions<TContent> = {}) {
    bindCommonValidatedConfigFields(this, 'SmartConfigAttach', {
      alignment: options.alignment ?? Alignment.bottomCenter,
      animationType:
        options.animationType ?? SmartAnimationType.centerScale_otherSlide,
      awaitOverType:
        options.awaitOverType ?? SmartAwaitOverType.dialogDismiss,
      maskTriggerType: options.maskTriggerType ?? SmartMaskTriggerType.up,
      nonAnimationTypes: options.nonAnimationTypes ?? [
        SmartNonAnimationType.routeClose_nonAnimation,
        SmartNonAnimationType.highlightMask_nonAnimation,
      ],
    });
    bindValidatedProperty(
      this,
      'attachAlignmentType',
      options.attachAlignmentType ?? SmartAttachAlignmentType.center,
      (v, n) => assertEnumValue(SmartAttachAlignmentType, v, n),
      'SmartConfigAttach.attachAlignmentType',
    );
    bindValidatedProperty(
      this,
      'backType',
      options.backType ?? SmartBackType.normal,
      (v, n) => assertEnumValue(SmartBackType, v, n),
      'SmartConfigAttach.backType',
    );
    this.animationTime = resolveDurationMs(options.animationTime ?? 200);
    this.useAnimation = options.useAnimation ?? true;
    this.usePenetrate = options.usePenetrate ?? false;
    this.maskColor = options.maskColor ?? 'rgba(0, 0, 0, 0.46)';
    this.maskWidget = options.maskWidget;
    this.clickMaskDismiss = options.clickMaskDismiss ?? true;
    this.debounce = options.debounce ?? false;
    this.debounceTime = resolveDurationMs(options.debounceTime ?? 300);
    this.bindPage = options.bindPage ?? true;
    this.trapFocus = options.trapFocus ?? false;
    this.lockScroll = options.lockScroll ?? false;
    this.isExist = options.isExist ?? false;
  }
}
