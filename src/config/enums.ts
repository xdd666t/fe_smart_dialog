/**
 * Targeted close modes for `SmartDialog.dismiss`.
 *
 * 关闭弹窗的状态分类。
 */
export enum SmartStatus {
  /** Close single dialog in priority order: loading -> notify -> custom/attach */
  smart = 'smart',
  /** Close the active serial toast, or the newest multi toast when no serial toast is active */
  toast = 'toast',
  /** Close all displayed toasts and cancel queued serial toasts */
  allToast = 'allToast',
  /** Close loading (showLoading) */
  loading = 'loading',
  /** Close single custom dialog (show) */
  custom = 'custom',
  /** Close single attach dialog (showAttach) */
  attach = 'attach',
  /** Close single dialog (attach or custom) */
  dialog = 'dialog',
  /** Close single notify */
  notify = 'notify',
  /** Close all custom dialogs, keeping toast, loading, and attach dialogs */
  allCustom = 'allCustom',
  /** Close all attach dialogs, keeping toast, loading, and custom dialogs */
  allAttach = 'allAttach',
  /** Close all dialogs (attach and custom), keeping toast and loading */
  allDialog = 'allDialog',
  /** Close all notify dialogs */
  allNotify = 'allNotify',
}

/**
 * Dialog categories for `SmartDialog.checkExist`.
 *
 * 用于存在性检查的弹窗类型。
 */
export enum SmartAllDialogType {
  custom = 'custom',
  attach = 'attach',
  notify = 'notify',
  loading = 'loading',
  toast = 'toast',
}

/**
 * Toast queue and replacement behavior modes.
 *
 * Toast 队列与展示策略。
 */
export enum SmartToastType {
  /** Each toast is displayed sequentially in FIFO order */
  normal = 'normal',
  /** Replaces the previous serial toast and clears pending queued serial toasts */
  last = 'last',
  /** Refreshes the active toast content and resets display timer without re-opening */
  onlyRefresh = 'onlyRefresh',
  /** Displays multiple independent toasts concurrently */
  multi = 'multi',
}

/**
 * Built-in enter/exit animation types.
 *
 * 内置弹窗进出场动画类型。
 */
export enum SmartAnimationType {
  /** Fade transition for all alignments */
  fade = 'fade',
  /** Scale transition for all alignments */
  scale = 'scale',
  /** Fade when centered, slide from edge for non-center alignments */
  centerFade_otherSlide = 'centerFade_otherSlide',
  /** Scale when centered, slide/expand from edge for non-center alignments */
  centerScale_otherSlide = 'centerScale_otherSlide',
}

/**
 * Controls when `await SmartDialog.show*()` resolves.
 *
 * 控制弹窗调用返回的 Promise 在何时 resolve。
 */
export enum SmartAwaitOverType {
  /** Resolves when the dialog has completely dismissed */
  dialogDismiss = 'dialogDismiss',
  /** Resolves when the dialog open animation finishes */
  dialogAppear = 'dialogAppear',
  /** Resolves after ~10ms */
  none = 'none',
}

/**
 * Pointer event phase that triggers `onMask` and `clickMaskDismiss`.
 *
 * 遮罩点击触发时机。
 */
export enum SmartMaskTriggerType {
  /** Trigger on pointerdown */
  down = 'down',
  /** Trigger on pointermove, falling back to pointerup if no move occurs */
  move = 'move',
  /** Trigger on pointerup (default) */
  up = 'up',
}

/**
 * Dynamically disables animations for specific lifecycle scenarios.
 *
 * 按场景动态关闭动画的开关枚举。
 */
export enum SmartNonAnimationType {
  /** Disable opening animation */
  openDialog_nonAnimation = 'openDialog_nonAnimation',
  /** Disable closing animation across all close triggers */
  closeDialog_nonAnimation = 'closeDialog_nonAnimation',
  /** Disable closing animation when closed due to route change */
  routeClose_nonAnimation = 'routeClose_nonAnimation',
  /** Disable closing animation when closed via mask click */
  maskClose_nonAnimation = 'maskClose_nonAnimation',
  /** Disable closing animation when closed via back/Escape event */
  backClose_nonAnimation = 'backClose_nonAnimation',
  /** Disable mask fade animation when attach highlight cutout is active */
  highlightMask_nonAnimation = 'highlightMask_nonAnimation',
  /** Disable opening flicker when calling showLoading repeatedly */
  continueLoading_nonAnimation = 'continueLoading_nonAnimation',
  /** Disable opening animation when updating an active keepSingle dialog */
  continueKeepSingle = 'continueKeepSingle',
}

/**
 * Horizontal alignment mode relative to the target edge in `showAttach`.
 *
 * Attach 定位弹窗相对目标控件边缘的对齐方式。
 */
export enum SmartAttachAlignmentType {
  /** Align dialog inner edge with target edge */
  inside = 'inside',
  /** Align dialog center with target edge */
  center = 'center',
  /** Align dialog outer edge with target edge */
  outside = 'outside',
}

/**
 * Overlay layers initialized by `SmartDialog.init`.
 *
 * 初始化启用的弹窗层级分类。
 */
export enum SmartInitType {
  custom = 'custom',
  attach = 'attach',
  notify = 'notify',
  loading = 'loading',
  toast = 'toast',
}

/**
 * Back / Escape key handling policy when a dialog is open.
 *
 * 返回事件 / Esc 键拦截策略。
 */
export enum SmartBackType {
  /** Intercept back/Esc event and dismiss the dialog */
  normal = 'normal',
  /** Intercept back/Esc event without dismissing the dialog */
  block = 'block',
  /** Ignore back/Esc event and let it propagate */
  ignore = 'ignore',
}

/**
 * Built-in semantic notification types for `SmartDialog.showNotify`.
 *
 * `showNotify` 的内置通知语义类型。
 */
export enum NotifyType {
  success = 'success',
  failure = 'failure',
  warning = 'warning',
  error = 'error',
  alert = 'alert',
}

/**
 * Highlight spotlight cutout shape for `showAttach` (`highlightBuilder`).
 *
 * `highlightBuilder` 镂空高亮形状枚举。
 */
export enum SmartHighlightShape {
  rect = 'rect',
  circle = 'circle',
}

/**
 * Built-in UI theme mode for `SmartDialog.init`.
 *
 * 内置组件外观主题模式。
 */
export enum SmartTheme {
  auto = 'auto',
  light = 'light',
  dark = 'dark',
}

/**
 * Internal close reasons used for non-animation resolution.
 */
export enum CloseType {
  back = 'back',
  route = 'route',
  mask = 'mask',
  normal = 'normal',
}

/**
 * Internal stack classification for custom/attach/notify queues.
 */
export enum DialogType {
  dialog = 'dialog',
  custom = 'custom',
  attach = 'attach',
  notify = 'notify',
  allDialog = 'allDialog',
  allCustom = 'allCustom',
  allAttach = 'allAttach',
  allNotify = 'allNotify',
}

const enumValuesCache = new WeakMap<object, Set<unknown>>();

function getEnumValueSet<T extends Record<string, string | number>>(
  enumObj: T,
): Set<unknown> {
  let cached = enumValuesCache.get(enumObj);
  if (!cached) {
    cached = new Set(Object.values(enumObj));
    enumValuesCache.set(enumObj, cached);
  }
  return cached;
}

/**
 * Runtime guard enforcing valid enum membership on strict enum parameters.
 */
export function assertEnumValue<T extends Record<string, string | number>>(
  enumObj: T,
  value: unknown,
  name: string,
): T[keyof T] {
  const valid = getEnumValueSet(enumObj);
  if (!valid.has(value)) {
    const allowed = Array.from(valid).join(', ');
    throw new TypeError(
      `Invalid ${name}: ${JSON.stringify(value)}. Expected a valid enum member (${allowed}).`,
    );
  }
  return value as T[keyof T];
}

/**
 * Runtime guard enforcing an array of valid enum members.
 */
export function assertEnumArray<T extends Record<string, string | number>>(
  enumObj: T,
  values: unknown,
  name: string,
): T[keyof T][] {
  if (!Array.isArray(values)) {
    throw new TypeError(`Invalid ${name}: expected an array of enum members.`);
  }
  return values.map((item, idx) =>
    assertEnumValue(enumObj, item, `${name}[${idx}]`),
  );
}

/**
 * Runtime guard enforcing an Iterable (Set/Array/etc.) of valid enum members.
 */
export function assertEnumIterable<T extends Record<string, string | number>>(
  enumObj: T,
  values: unknown,
  name: string,
): T[keyof T][] {
  if (
    values == null ||
    typeof values === 'string' ||
    typeof (values as Iterable<unknown>)[Symbol.iterator] !== 'function'
  ) {
    throw new TypeError(
      `Invalid ${name}: expected an Iterable of enum members.`,
    );
  }
  const result: T[keyof T][] = [];
  let idx = 0;
  for (const item of values as Iterable<unknown>) {
    result.push(assertEnumValue(enumObj, item, `${name}[${idx}]`));
    idx += 1;
  }
  return result;
}
