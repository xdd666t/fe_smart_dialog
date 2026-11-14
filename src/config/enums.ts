/**
 * Targeted close modes for `SmartDialog.dismiss`.
 *
 * 关闭弹窗的状态分类。
 */
export const SmartStatus = {
  /** Close single dialog in priority order: loading -> notify -> custom/attach */
  smart: 'smart',
  /** Close the active serial toast, or the newest multi toast when no serial toast is active */
  toast: 'toast',
  /** Close all displayed toasts and cancel queued serial toasts */
  allToast: 'allToast',
  /** Close loading (showLoading) */
  loading: 'loading',
  /** Close single custom dialog (show) */
  custom: 'custom',
  /** Close single attach dialog (showAttach) */
  attach: 'attach',
  /** Close single dialog (attach or custom) */
  dialog: 'dialog',
  /** Close single notify */
  notify: 'notify',
  /** Close all custom dialogs, keeping toast, loading, and attach dialogs */
  allCustom: 'allCustom',
  /** Close all attach dialogs, keeping toast, loading, and custom dialogs */
  allAttach: 'allAttach',
  /** Close all dialogs (attach and custom), keeping toast and loading */
  allDialog: 'allDialog',
  /** Close all notify dialogs */
  allNotify: 'allNotify',
} as const;
export type SmartStatus = (typeof SmartStatus)[keyof typeof SmartStatus];

/**
 * Dialog categories for `SmartDialog.checkExist`.
 *
 * 用于存在性检查的弹窗类型。
 */
export const SmartAllDialogType = {
  custom: 'custom',
  attach: 'attach',
  notify: 'notify',
  loading: 'loading',
  toast: 'toast',
} as const;
export type SmartAllDialogType =
  (typeof SmartAllDialogType)[keyof typeof SmartAllDialogType];

/**
 * Toast queue and replacement behavior modes.
 *
 * Toast 队列与展示策略。
 */
export const SmartToastType = {
  /** Each toast is displayed sequentially in FIFO order */
  normal: 'normal',
  /** Replaces the previous serial toast and clears pending queued serial toasts */
  last: 'last',
  /** Refreshes the active toast content and resets display timer without re-opening */
  onlyRefresh: 'onlyRefresh',
  /** Displays multiple independent toasts concurrently */
  multi: 'multi',
} as const;
export type SmartToastType =
  (typeof SmartToastType)[keyof typeof SmartToastType];

/**
 * Built-in enter/exit animation types.
 *
 * 内置弹窗进出场动画类型。
 */
export const SmartAnimationType = {
  /** Fade transition for all alignments */
  fade: 'fade',
  /** Scale transition for all alignments */
  scale: 'scale',
  /** Fade when centered, slide from edge for non-center alignments */
  centerFade_otherSlide: 'centerFade_otherSlide',
  /** Scale when centered, slide/expand from edge for non-center alignments */
  centerScale_otherSlide: 'centerScale_otherSlide',
} as const;
export type SmartAnimationType =
  (typeof SmartAnimationType)[keyof typeof SmartAnimationType];

/**
 * Controls when `await SmartDialog.show*()` resolves.
 *
 * 控制弹窗调用返回的 Promise 在何时 resolve。
 */
export const SmartAwaitOverType = {
  /** Resolves when the dialog has completely dismissed */
  dialogDismiss: 'dialogDismiss',
  /** Resolves when the dialog open animation finishes */
  dialogAppear: 'dialogAppear',
  /** Resolves after ~10ms */
  none: 'none',
} as const;
export type SmartAwaitOverType =
  (typeof SmartAwaitOverType)[keyof typeof SmartAwaitOverType];

/**
 * Pointer event phase that triggers `onMask` and `clickMaskDismiss`.
 *
 * 遮罩点击触发时机。
 */
export const SmartMaskTriggerType = {
  /** Trigger on pointerdown */
  down: 'down',
  /** Trigger on pointermove, falling back to pointerup if no move occurs */
  move: 'move',
  /** Trigger on pointerup (default) */
  up: 'up',
} as const;
export type SmartMaskTriggerType =
  (typeof SmartMaskTriggerType)[keyof typeof SmartMaskTriggerType];

/**
 * Dynamically disables animations for specific lifecycle scenarios.
 *
 * 按场景动态关闭动画的开关枚举。
 */
export const SmartNonAnimationType = {
  /** Disable opening animation */
  openDialog_nonAnimation: 'openDialog_nonAnimation',
  /** Disable closing animation across all close triggers */
  closeDialog_nonAnimation: 'closeDialog_nonAnimation',
  /** Disable closing animation when closed due to route change */
  routeClose_nonAnimation: 'routeClose_nonAnimation',
  /** Disable closing animation when closed via mask click */
  maskClose_nonAnimation: 'maskClose_nonAnimation',
  /** Disable closing animation when closed via back/Escape event */
  backClose_nonAnimation: 'backClose_nonAnimation',
  /** Disable mask fade animation when attach highlight cutout is active */
  highlightMask_nonAnimation: 'highlightMask_nonAnimation',
  /** Disable opening flicker when calling showLoading repeatedly */
  continueLoading_nonAnimation: 'continueLoading_nonAnimation',
  /** Disable opening animation when updating an active keepSingle dialog */
  continueKeepSingle: 'continueKeepSingle',
} as const;
export type SmartNonAnimationType =
  (typeof SmartNonAnimationType)[keyof typeof SmartNonAnimationType];

/**
 * Horizontal alignment mode relative to the target edge in `showAttach`.
 *
 * Attach 定位弹窗相对目标控件边缘的对齐方式。
 */
export const SmartAttachAlignmentType = {
  /** Align dialog inner edge with target edge */
  inside: 'inside',
  /** Align dialog center with target edge */
  center: 'center',
  /** Align dialog outer edge with target edge */
  outside: 'outside',
} as const;
export type SmartAttachAlignmentType =
  (typeof SmartAttachAlignmentType)[keyof typeof SmartAttachAlignmentType];

/**
 * Overlay layers initialized by `SmartDialog.init`.
 *
 * 初始化启用的弹窗层级分类。
 */
export const SmartInitType = {
  custom: 'custom',
  attach: 'attach',
  notify: 'notify',
  loading: 'loading',
  toast: 'toast',
} as const;
export type SmartInitType = (typeof SmartInitType)[keyof typeof SmartInitType];

/**
 * Back / Escape key handling policy when a dialog is open.
 *
 * 返回事件 / Esc 键拦截策略。
 */
export const SmartBackType = {
  /** Intercept back/Esc event and dismiss the dialog */
  normal: 'normal',
  /** Intercept back/Esc event without dismissing the dialog */
  block: 'block',
  /** Ignore back/Esc event and let it propagate */
  ignore: 'ignore',
} as const;
export type SmartBackType = (typeof SmartBackType)[keyof typeof SmartBackType];

/**
 * Built-in semantic notification types for `SmartDialog.showNotify`.
 *
 * `showNotify` 的内置通知语义类型。
 */
export const NotifyType = {
  success: 'success',
  failure: 'failure',
  warning: 'warning',
  error: 'error',
  alert: 'alert',
} as const;
export type NotifyType = (typeof NotifyType)[keyof typeof NotifyType];

/**
 * Internal close reasons used for non-animation resolution.
 */
export type CloseType = 'back' | 'route' | 'mask' | 'normal';

/**
 * Internal stack classification for custom/attach/notify queues.
 */
export type DialogType =
  | 'dialog'
  | 'custom'
  | 'attach'
  | 'notify'
  | 'allDialog'
  | 'allCustom'
  | 'allAttach'
  | 'allNotify';
