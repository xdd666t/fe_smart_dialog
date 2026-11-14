// Core enums
export {
  NotifyType,
  SmartAllDialogType,
  SmartAnimationType,
  SmartAttachAlignmentType,
  SmartAwaitOverType,
  SmartBackType,
  SmartInitType,
  SmartMaskTriggerType,
  SmartNonAnimationType,
  SmartStatus,
  SmartToastType,
} from './config/enums';

// Config classes
export { SmartConfig } from './config/smart-config';
export {
  SmartConfigAttach,
  type SmartConfigAttachOptions,
} from './config/smart-config-attach';
export {
  SmartConfigCustom,
  type SmartConfigCustomOptions,
} from './config/smart-config-custom';
export {
  SmartConfigLoading,
  type SmartConfigLoadingOptions,
} from './config/smart-config-loading';
export {
  SmartConfigNotify,
  type SmartConfigNotifyOptions,
} from './config/smart-config-notify';
export {
  SmartConfigToast,
  type SmartConfigToastOptions,
} from './config/smart-config-toast';

// Geometry & helper types
export {
  Alignment,
  Duration,
  Offset,
  Rect,
  Size,
  isCenterAlignment,
  resolveAlignment,
  resolveDurationMs,
  type OffsetConstructor,
  type ResolvedAlignment,
  type SizeConstructor,
  type SmartAlignment,
  type SmartCoordinateAlignment,
  type SmartDuration,
  type SmartOffset,
  type SmartPresetAlignment,
  type SmartRect,
  type SmartResolvedOffset,
  type SmartSize,
} from './types/common';

// Parameter & model exports
export {
  AnimationParam,
  AttachAdjustParam,
  AttachParam,
  FlutterSmartNotifyStyle,
  SmartNotifyStyle,
  type AdjustBuilder,
  type AnimationBuilder,
  type AnimationControllerLike,
  type HighlightBuilder,
  type HighlightRegion,
  type ScalePointBuilder,
  type SmartAdapterContent,
  type SmartBaseDialogOptions,
  type SmartBuilder,
  type SmartCheckExistOptions,
  type SmartContent,
  type SmartDialogRenderContext,
  type SmartDismissOptions,
  type SmartInitOptions,
  type SmartMessageBuilder,
  type SmartOnBack,
  type SmartShowAttachOptions,
  type SmartShowCustomOptions,
  type SmartShowLoadingOptions,
  type SmartShowNotifyOptions,
  type SmartShowToastObjectOptions,
  type SmartShowToastOptions,
  type SmartStyleBuilder,
  type SmartTargetRef,
  type TargetBuilder,
} from './types/params';

// Controller, Observer, HTML helper & Main facade
export { SmartDialogController } from './core/smart-dialog-controller';
export { SmartNavigatorObserver } from './core/navigator-observer';
export { html } from './dom/html';
export { FeSmartDialog, SmartDialog } from './smart-dialog';
