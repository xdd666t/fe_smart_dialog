import type {
  CloseType,
  SmartAnimationType,
  SmartAwaitOverType,
  SmartMaskTriggerType,
  SmartNonAnimationType,
} from '../config/enums';
import type { SmartAlignment, SmartRect } from '../types/common';
import type {
  AdjustBuilder,
  AnimationBuilder,
  HighlightBuilder,
  ScalePointBuilder,
  SmartContent,
  TargetBuilder,
} from '../types/params';
import type { SmartTargetRef } from '../types/params';
import type { DialogScope } from './dialog-scope';

export interface MainDialogShowParam {
  scope: DialogScope;
  alignment: SmartAlignment;
  clickMaskDismiss: boolean;
  animationType: SmartAnimationType;
  nonAnimationTypes: SmartNonAnimationType[];
  animationBuilder?: AnimationBuilder;
  usePenetrate: boolean;
  useAnimation: boolean;
  animationTime: number;
  maskColor: string;
  maskWidget?: SmartContent;
  onDismiss?: () => void;
  onMask?: () => void;
  useSystem: boolean;
  reuse: boolean;
  awaitOverType: SmartAwaitOverType;
  maskTriggerType: SmartMaskTriggerType;
  ignoreArea?: SmartRect;
  keepSingle: boolean;
  maskClassName?: string;
  dialogClassName?: string;
  zIndex?: number;
  trapFocus: boolean;
  lockScroll: boolean;
  ariaLabel?: string;
}

export interface MainAttachShowParam extends MainDialogShowParam {
  targetContext?: SmartTargetRef;
  targetBuilder?: TargetBuilder;
  adjustBuilder?: AdjustBuilder<SmartContent>;
  scalePointBuilder?: ScalePointBuilder;
  maskIgnoreArea?: SmartRect;
  highlightBuilder?: HighlightBuilder;
}

export interface MainDialogHandle {
  visible: boolean;
  show: <T = unknown>(param: MainDialogShowParam) => Promise<T | undefined>;
  showAttach: <T = unknown>(param: MainAttachShowParam) => Promise<T | undefined>;
  dismiss: <T = unknown>(options?: {
    useSystem?: boolean;
    result?: T;
    closeType?: CloseType;
  }) => Promise<void>;
  appear: () => void;
  hide: () => void;
  resetForTest: () => void;
}
