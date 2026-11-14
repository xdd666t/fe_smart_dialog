import type {
  NotifyType,
  SmartAlignment,
  SmartAnimationType,
  SmartAwaitOverType,
  SmartBackType,
  SmartDuration,
  SmartHighlightShape,
  SmartInitType,
  SmartMaskTriggerType,
  SmartNonAnimationType,
  SmartOffset,
  SmartRect,
  SmartResolvedOffset,
  SmartSize,
  SmartStatus,
  SmartAllDialogType,
  SmartTheme,
  SmartToastType,
} from '..';
import { assertAlignment } from './common';
import type { SmartDialogController } from '../core/smart-dialog-controller';

/**
 * Extensible marker interface for framework-specific dialog content (ReactNode, Vue VNode, etc.).
 */
export interface SmartAdapterContent {}

/**
 * Renderable content supported by builders and custom masks.
 */
export type SmartContent =
  | string
  | HTMLElement
  | DocumentFragment
  | SmartAdapterContent
  | null
  | undefined;

export interface SmartDialogRenderContext {
  controller?: SmartDialogController;
  tag?: string;
  dismiss: <TResult = unknown>(result?: TResult) => Promise<void>;
}

export type SmartBuilder<TContent = SmartContent> = (
  context: SmartDialogRenderContext,
) => TContent;

export type SmartMessageBuilder<TContent = SmartContent> = (
  msg: string,
) => TContent;

export type SmartStyleBuilder<TContent = SmartContent> = (
  child: HTMLElement,
) => TContent | void;

export interface AnimationControllerLike {
  readonly element: HTMLElement;
  readonly duration: number;
  progress: number;
  forward: () => Promise<void>;
  reverse: () => Promise<void>;
  cancel: () => void;
}

export class AnimationParam {
  alignment: SmartAlignment;
  animationTime: number;
  element: HTMLElement;
  onForward?: () => void;
  onDismiss?: () => void;

  constructor(options: {
    alignment: SmartAlignment;
    animationTime: number;
    element: HTMLElement;
    onForward?: () => void;
    onDismiss?: () => void;
  }) {
    this.alignment = options.alignment;
    this.animationTime = options.animationTime;
    this.element = options.element;
    this.onForward = options.onForward;
    this.onDismiss = options.onDismiss;
  }
}

export type AnimationBuilder = (
  controller: AnimationControllerLike,
  child: HTMLElement,
  animationParam: AnimationParam,
) => HTMLElement | void;

export class AttachParam {
  readonly targetOffset: SmartOffset;
  readonly targetSize: SmartSize;
  readonly selfElement: HTMLElement;
  readonly selfWidget: HTMLElement;
  readonly selfOffset: SmartOffset;
  readonly selfSize: SmartSize;

  constructor(options: {
    targetOffset: SmartOffset;
    targetSize: SmartSize;
    selfElement: HTMLElement;
    selfOffset: SmartOffset;
    selfSize: SmartSize;
  }) {
    this.targetOffset = options.targetOffset;
    this.targetSize = options.targetSize;
    this.selfElement = options.selfElement;
    this.selfWidget = options.selfElement;
    this.selfOffset = options.selfOffset;
    this.selfSize = options.selfSize;
  }
}

export class AttachAdjustParam<TContent = SmartContent> {
  readonly builder?: SmartBuilder<TContent>;
  readonly alignment?: SmartAlignment;

  constructor(options: {
    builder?: SmartBuilder<TContent>;
    alignment?: SmartAlignment;
  } = {}) {
    this.builder = options.builder;
    this.alignment =
      options.alignment !== undefined
        ? assertAlignment(options.alignment, 'AttachAdjustParam.alignment')
        : undefined;
  }
}

export type AdjustBuilder<TContent = SmartContent> = (
  attachParam: AttachParam,
) => AttachAdjustParam<TContent>;

export type TargetBuilder = (
  targetOffset: SmartResolvedOffset,
  targetSize: SmartSize,
) => SmartOffset;

export type ScalePointBuilder = (selfSize: SmartSize) => SmartOffset;

export interface HighlightRegion {
  left: number;
  top: number;
  width: number;
  height: number;
  borderRadius?: number | string;
  shape?: SmartHighlightShape;
}

export type HighlightBuilder = (
  targetOffset: SmartResolvedOffset,
  targetSize: SmartSize,
) => HighlightRegion | HTMLElement;

export type SmartOnBack = () => boolean | Promise<boolean>;

/**
 * Target reference accepted by `targetElement`/`targetContext` and `bindWidget`/`bindElement`.
 */
export type SmartTargetRef =
  | HTMLElement
  | string
  | (() => HTMLElement | null | undefined)
  | { readonly current?: HTMLElement | null }
  | { readonly value?: HTMLElement | null }
  | null
  | undefined;

export class SmartNotifyStyle<TContent = SmartContent> {
  readonly successBuilder?: SmartMessageBuilder<TContent>;
  readonly failureBuilder?: SmartMessageBuilder<TContent>;
  readonly warningBuilder?: SmartMessageBuilder<TContent>;
  readonly alertBuilder?: SmartMessageBuilder<TContent>;
  readonly errorBuilder?: SmartMessageBuilder<TContent>;

  constructor(options: {
    successBuilder?: SmartMessageBuilder<TContent>;
    failureBuilder?: SmartMessageBuilder<TContent>;
    warningBuilder?: SmartMessageBuilder<TContent>;
    alertBuilder?: SmartMessageBuilder<TContent>;
    errorBuilder?: SmartMessageBuilder<TContent>;
  } = {}) {
    this.successBuilder = options.successBuilder;
    this.failureBuilder = options.failureBuilder;
    this.warningBuilder = options.warningBuilder;
    this.alertBuilder = options.alertBuilder;
    this.errorBuilder = options.errorBuilder;
  }
}

/**
 * Alias matching Flutter SmartDialog's class name.
 */
export const FlutterSmartNotifyStyle = SmartNotifyStyle;

export interface SmartInitOptions<TContent = SmartContent> {
  toastBuilder?: SmartMessageBuilder<TContent>;
  loadingBuilder?: SmartMessageBuilder<TContent>;
  notifyStyle?: SmartNotifyStyle<TContent>;
  styleBuilder?: SmartStyleBuilder<TContent>;
  initType?: Iterable<SmartInitType>;
  /** Custom DOM container to mount overlay layers into (defaults to document.body) */
  container?: HTMLElement | string;
  /** Base z-index for the 5 overlay layers (default: 9999) */
  zIndexBase?: number;
  /** Theme preference for built-in default widgets (default: SmartTheme.auto) */
  theme?: SmartTheme;
  /** Auto-inject default scoped CSS into document.head (default: true) */
  injectStyles?: boolean;
  /** Listen to popstate/hashchange/history changes for bindPage & back handling (default: true) */
  autoTrackHistory?: boolean;
  /** Push lightweight history sentinel for browser back-button interception (default: false) */
  enableHistoryBack?: boolean;
}

export interface SmartBaseDialogOptions<TContent = SmartContent> {
  alignment?: SmartAlignment;
  clickMaskDismiss?: boolean;
  usePenetrate?: boolean;
  useAnimation?: boolean;
  animationType?: SmartAnimationType;
  nonAnimationTypes?: SmartNonAnimationType[];
  animationBuilder?: AnimationBuilder;
  animationTime?: SmartDuration;
  maskColor?: string;
  maskWidget?: TContent;
  onDismiss?: () => void;
  onMask?: () => void;
  /** Optional custom CSS class on the overlay mask element */
  maskClassName?: string;
  /** Optional custom CSS class on the dialog wrapper element */
  dialogClassName?: string;
  /** Override z-index for this dialog instance */
  zIndex?: number;
  /** Trap keyboard Tab focus inside non-penetrating dialogs (default from config) */
  trapFocus?: boolean;
  /** Lock body scroll while dialog is visible (default from config) */
  lockScroll?: boolean;
  /** ARIA label for dialog accessibility */
  ariaLabel?: string;
}

export interface SmartShowCustomOptions<TContent = SmartContent>
  extends SmartBaseDialogOptions<TContent> {
  builder: SmartBuilder<TContent>;
  controller?: SmartDialogController;
  debounce?: boolean;
  displayTime?: SmartDuration | null;
  tag?: string;
  keepSingle?: boolean;
  permanent?: boolean;
  useSystem?: boolean;
  bindPage?: boolean;
  /** Bind dialog visibility/lifecycle to a DOM element or ref (alias: bindElement) */
  bindWidget?: SmartTargetRef;
  /** Web alias for bindWidget */
  bindElement?: SmartTargetRef;
  ignoreArea?: SmartRect;
  backType?: SmartBackType;
  onBack?: SmartOnBack;
}

export interface SmartShowAttachOptions<TContent = SmartContent>
  extends SmartBaseDialogOptions<TContent> {
  /** Target element, ref, selector, or getter (alias: targetElement) */
  targetContext?: SmartTargetRef;
  /** Web alias for targetContext */
  targetElement?: SmartTargetRef;
  builder: SmartBuilder<TContent>;
  adjustBuilder?: AdjustBuilder<TContent>;
  controller?: SmartDialogController;
  targetBuilder?: TargetBuilder;
  scalePointBuilder?: ScalePointBuilder;
  maskIgnoreArea?: SmartRect;
  highlightBuilder?: HighlightBuilder;
  debounce?: boolean;
  displayTime?: SmartDuration | null;
  tag?: string;
  keepSingle?: boolean;
  permanent?: boolean;
  useSystem?: boolean;
  bindPage?: boolean;
  bindWidget?: SmartTargetRef;
  bindElement?: SmartTargetRef;
  backType?: SmartBackType;
  onBack?: SmartOnBack;
}

export interface SmartShowNotifyOptions<TContent = SmartContent>
  extends SmartBaseDialogOptions<TContent> {
  msg: string;
  notifyType: NotifyType;
  builder?: SmartBuilder<TContent>;
  controller?: SmartDialogController;
  debounce?: boolean;
  displayTime?: SmartDuration | null;
  tag?: string;
  keepSingle?: boolean;
  backType?: SmartBackType;
  onBack?: SmartOnBack;
}

export interface SmartShowLoadingOptions<TContent = SmartContent>
  extends SmartBaseDialogOptions<TContent> {
  msg?: string;
  controller?: SmartDialogController;
  displayTime?: SmartDuration | null;
  backType?: SmartBackType;
  onBack?: SmartOnBack;
  builder?: SmartBuilder<TContent>;
}

export interface SmartShowToastOptions<TContent = SmartContent>
  extends SmartBaseDialogOptions<TContent> {
  controller?: SmartDialogController;
  displayTime?: SmartDuration;
  consumeEvent?: boolean;
  debounce?: boolean;
  displayType?: SmartToastType;
  builder?: SmartBuilder<TContent>;
}

export interface SmartShowToastObjectOptions<TContent = SmartContent>
  extends SmartShowToastOptions<TContent> {
  msg: string;
}

export interface SmartDismissOptions<TResult = unknown> {
  status?: SmartStatus;
  tag?: string;
  result?: TResult;
  force?: boolean;
}

export interface SmartCheckExistOptions {
  tag?: string;
  dialogTypes?: Iterable<SmartAllDialogType>;
}

export interface SmartConfigCommonOptions<TContent = SmartContent> {
  alignment?: SmartAlignment;
  animationType?: SmartAnimationType;
  animationTime?: SmartDuration;
  useAnimation?: boolean;
  usePenetrate?: boolean;
  maskColor?: string;
  maskWidget?: TContent;
  clickMaskDismiss?: boolean;
  awaitOverType?: SmartAwaitOverType;
  maskTriggerType?: SmartMaskTriggerType;
  nonAnimationTypes?: SmartNonAnimationType[];
  trapFocus?: boolean;
  lockScroll?: boolean;
}
