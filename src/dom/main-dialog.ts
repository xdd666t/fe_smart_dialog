import {
  CloseType,
  SmartInitType,
  SmartNonAnimationType,
} from '../config/enums';
import type {
  MainAttachShowParam,
  MainDialogHandle,
  MainDialogShowParam,
} from '../core/dialog-host';
import type { DialogProxy } from '../core/dialog-proxy';
import type { DialogScope } from '../core/dialog-scope';
import { MonitorPopRoute } from '../core/monitor-pop-route';
import { RendererRegistry, type MountedContentHandle } from '../core/renderer';
import { resolveAlignment, type SmartAlignment } from '../types/common';
import { DialogAnimationLifecycle } from './animation-engine';
import { AttachEngine } from './attach-engine';
import { HighlightMaskRenderer } from './highlight-mask';
import { bindMaskEvents, type MaskEventBinding } from './mask-event';
import { OverlayManager } from './overlay-manager';
import { ToastViewportHelper } from './toast-viewport-helper';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export class MainDialog implements MainDialogHandle {
  visible = true;

  private readonly proxy: DialogProxy;
  private readonly layer: SmartInitType;
  private readonly consumeEvent: boolean;

  private nativeDialogEl: HTMLDialogElement | null = null;
  private overlayEl: HTMLElement | null = null;
  private maskEl: HTMLElement | null = null;
  private bodyWrapEl: HTMLElement | null = null;
  private positionerEl: HTMLElement | null = null;
  private bodyEl: HTMLElement | null = null;

  private currentScope: DialogScope | null = null;
  private contentHandle: MountedContentHandle | null = null;
  private maskEventBinding: MaskEventBinding | null = null;
  private highlightRenderer = new HighlightMaskRenderer();
  private animationLifecycle = new DialogAnimationLifecycle();
  private attachEngine: AttachEngine | null = null;
  private toastViewportHelper: ToastViewportHelper | null = null;

  private dismissCompleters: Array<(value: unknown) => void> = [];
  private onDismissCallback?: () => void;
  private currentParam: MainDialogShowParam | MainAttachShowParam | null = null;
  private isAttachMode = false;
  private resolvedAttachAlignment: SmartAlignment | null = null;
  private scaleOrigin = 'center center';
  private skipMaskAnimation = false;
  private hasShown = false;
  private dismissingPromise: Promise<void> | null = null;

  private previousActiveElement: HTMLElement | null = null;
  private focusTrapCleanup: (() => void) | null = null;
  private nativeCancelCleanup: (() => void) | null = null;
  private scrollLocked = false;

  constructor(
    proxy: DialogProxy,
    layer: SmartInitType,
    options: { consumeEvent?: boolean } = {},
  ) {
    this.proxy = proxy;
    this.layer = layer;
    this.consumeEvent = options.consumeEvent ?? false;
  }

  show<T = unknown>(param: MainDialogShowParam): Promise<T | undefined> {
    this.isAttachMode = false;
    return this.present<T>(param);
  }

  showAttach<T = unknown>(param: MainAttachShowParam): Promise<T | undefined> {
    this.isAttachMode = true;
    return this.present<T>(param);
  }

  private present<T>(
    param: MainDialogShowParam | MainAttachShowParam,
  ): Promise<T | undefined> {
    const effectiveNonAnimationTypes = this.processNonAnimationTypes(
      param.nonAnimationTypes,
      param.keepSingle,
    );
    const effectiveParam = {
      ...param,
      nonAnimationTypes: effectiveNonAnimationTypes,
    };

    const isReusingExisting = this.hasShown && this.overlayEl !== null;
    this.currentParam = effectiveParam;
    this.onDismissCallback = effectiveParam.onDismiss;
    this.hasShown = true;

    const promise = new Promise<T | undefined>((resolve) => {
      switch (effectiveParam.awaitOverType) {
        case 'none':
          setTimeout(() => resolve(undefined), 10);
          break;
        case 'dialogAppear':
          setTimeout(() => resolve(undefined), effectiveParam.animationTime);
          break;
        case 'dialogDismiss':
          this.dismissCompleters.push(resolve as (value: unknown) => void);
          break;
      }
    });

    if (typeof document === 'undefined') {
      return promise;
    }

    if (!isReusingExisting) {
      this.buildDomTree(effectiveParam);
    }

    this.applyScope(effectiveParam.scope);
    this.applyCommonLayout(effectiveParam);

    if (this.isAttachMode) {
      this.setupAttach(effectiveParam as MainAttachShowParam);
    } else {
      this.setupStandardLayout(effectiveParam);
    }

    if (this.layer === SmartInitType.toast) {
      this.toastViewportHelper ??= new ToastViewportHelper();
      if (this.bodyEl) {
        this.toastViewportHelper.bind({
          bodyEl: this.bodyEl,
          consumeEvent: this.consumeEvent,
        });
      }
    }

    if (effectiveParam.lockScroll && !this.scrollLocked) {
      OverlayManager.instance.acquireScrollLock(this);
      this.scrollLocked = true;
    }

    if (!isReusingExisting) {
      this.setupAccessibility(effectiveParam);
    }

    if (this.maskEl && this.bodyEl) {
      const enterAlignment = this.isAttachMode
        ? this.resolvedAttachAlignment ?? effectiveParam.alignment
        : effectiveParam.alignment;

      void this.animationLifecycle.playEnter({
        maskEl: this.maskEl,
        bodyEl: this.bodyEl,
        alignment: enterAlignment,
        animationType: effectiveParam.animationType,
        animationTime: effectiveParam.animationTime,
        useAnimation: effectiveParam.useAnimation,
        nonAnimationTypes: effectiveParam.nonAnimationTypes,
        skipMaskAnimation: this.skipMaskAnimation,
        isAttach: this.isAttachMode,
        scaleOrigin: this.scaleOrigin,
        animationBuilder: effectiveParam.animationBuilder,
        usePenetrate: effectiveParam.usePenetrate,
      });
    }

    return promise;
  }

  private processNonAnimationTypes(
    nonAnimationTypes: MainDialogShowParam['nonAnimationTypes'],
    keepSingle: boolean,
  ): MainDialogShowParam['nonAnimationTypes'] {
    const list = [...nonAnimationTypes];
    if (
      list.includes(SmartNonAnimationType.continueKeepSingle) &&
      keepSingle &&
      this.hasShown &&
      !list.includes(SmartNonAnimationType.openDialog_nonAnimation)
    ) {
      list.push(SmartNonAnimationType.openDialog_nonAnimation);
    }
    return list;
  }

  private buildDomTree(param: MainDialogShowParam): void {
    const layerEl = OverlayManager.instance.getLayerElement(this.layer);

    const overlay = document.createElement('div');
    overlay.className = 'fsd-overlay';
    overlay.setAttribute('data-fsd-layer', this.layer);

    const mask = document.createElement('div');
    mask.className = 'fsd-mask';

    const bodyWrap = document.createElement('div');
    bodyWrap.className = 'fsd-body-wrap';

    const body = document.createElement('div');
    body.className = 'fsd-content';

    overlay.appendChild(mask);

    if (this.isAttachMode) {
      const positioner = document.createElement('div');
      positioner.className = 'fsd-attach-positioner';
      positioner.appendChild(body);
      overlay.appendChild(positioner);
      this.positionerEl = positioner;
    } else {
      bodyWrap.appendChild(body);
      overlay.appendChild(bodyWrap);
      this.positionerEl = null;
    }

    this.overlayEl = overlay;
    this.maskEl = mask;
    this.bodyWrapEl = bodyWrap;
    this.bodyEl = body;

    if (param.useSystem) {
      const dialogEl = document.createElement('dialog');
      dialogEl.className = 'fsd-native-dialog';
      dialogEl.appendChild(overlay);
      layerEl.appendChild(dialogEl);
      this.nativeDialogEl = dialogEl;

      const onCancel = (e: Event) => {
        e.preventDefault();
        MonitorPopRoute.instance.markEscapeHandledInTick();
        void MonitorPopRoute.instance.handBackEvent();
      };
      dialogEl.addEventListener('cancel', onCancel);
      this.nativeCancelCleanup = () => {
        dialogEl.removeEventListener('cancel', onCancel);
      };

      if (typeof dialogEl.showModal === 'function') {
        try {
          dialogEl.showModal();
        } catch {
          dialogEl.setAttribute('open', '');
        }
      } else {
        dialogEl.setAttribute('open', '');
      }
    } else {
      layerEl.appendChild(overlay);
    }
  }

  private applyScope(scope: DialogScope): void {
    if (this.currentScope && this.currentScope !== scope) {
      this.currentScope.dispose();
    }
    this.currentScope = scope;
    scope.setListener({
      onUpdate: () => {
        this.mountScopeContent();
        if (this.isAttachMode && this.attachEngine && this.currentParam) {
          this.setupAttach(this.currentParam as MainAttachShowParam);
        }
      },
    });
    this.mountScopeContent();
  }

  private mountScopeContent(): void {
    if (!this.bodyEl || !this.currentScope) return;
    const content = this.currentScope.render();
    if (this.contentHandle) {
      this.contentHandle.update(content);
    } else {
      this.contentHandle = RendererRegistry.instance.mount(this.bodyEl, content);
    }
  }

  private applyCommonLayout(param: MainDialogShowParam): void {
    if (!this.overlayEl || !this.maskEl || !this.bodyEl) return;

    this.overlayEl.style.left = `${param.ignoreArea?.left ?? 0}px`;
    this.overlayEl.style.top = `${param.ignoreArea?.top ?? 0}px`;
    this.overlayEl.style.right = `${param.ignoreArea?.right ?? 0}px`;
    this.overlayEl.style.bottom = `${param.ignoreArea?.bottom ?? 0}px`;

    if (param.zIndex !== undefined) {
      const target = this.nativeDialogEl ?? this.overlayEl;
      target.style.zIndex = String(param.zIndex);
    }

    this.maskEl.className = param.maskClassName
      ? `fsd-mask ${param.maskClassName}`
      : 'fsd-mask';

    this.bodyEl.className = param.dialogClassName
      ? `fsd-content ${param.dialogClassName}`
      : 'fsd-content';

    if (!this.visible) {
      this.overlayEl.classList.add('fsd-overlay--offstage');
      this.nativeDialogEl?.classList.add('fsd-native-dialog--offstage');
    }

    const maskEventOptions = {
      maskElement: this.maskEl,
      isInsideContent: (target: EventTarget | null) => {
        if (!this.bodyEl || !(target instanceof Node)) return false;
        return this.bodyEl.contains(target);
      },
      ignoreArea: this.isAttachMode
        ? (param as MainAttachShowParam).maskIgnoreArea
        : param.ignoreArea,
      triggerType: param.maskTriggerType,
      usePenetrate: param.usePenetrate,
      onMask: () => param.onMask?.(),
    };

    if (this.maskEventBinding) {
      this.maskEventBinding.update(maskEventOptions);
    } else {
      this.maskEventBinding = bindMaskEvents(maskEventOptions);
    }
  }

  private setupStandardLayout(param: MainDialogShowParam): void {
    if (!this.bodyWrapEl || !this.maskEl || !this.bodyEl) return;

    const resolved = resolveAlignment(param.alignment);
    if (resolved.preset) {
      this.bodyWrapEl.style.justifyContent =
        resolved.x < 0 ? 'flex-start' : resolved.x > 0 ? 'flex-end' : 'center';
      this.bodyWrapEl.style.alignItems =
        resolved.y < 0 ? 'flex-start' : resolved.y > 0 ? 'flex-end' : 'center';
      this.bodyEl.style.position = 'relative';
      this.bodyEl.style.left = '';
      this.bodyEl.style.top = '';
      this.bodyEl.style.transform = '';
    } else {
      this.bodyWrapEl.style.justifyContent = 'flex-start';
      this.bodyWrapEl.style.alignItems = 'flex-start';
      const pctX = ((resolved.x + 1) / 2) * 100;
      const pctY = ((resolved.y + 1) / 2) * 100;
      this.bodyEl.style.position = 'absolute';
      this.bodyEl.style.left = `${pctX}%`;
      this.bodyEl.style.top = `${pctY}%`;
      this.bodyEl.style.transform = `translate(${-pctX}%, ${-pctY}%)`;
    }

    this.scaleOrigin = 'center center';
    const rect = this.overlayEl?.getBoundingClientRect();
    const { skipMaskAnimation } = this.highlightRenderer.render({
      maskEl: this.maskEl,
      maskColor: param.maskColor,
      maskWidget: param.maskWidget,
      usePenetrate: param.usePenetrate,
      maskIgnoreArea: param.ignoreArea,
      nonAnimationTypes: param.nonAnimationTypes,
      targetOffset: { x: 0, y: 0 },
      targetSize: { width: 0, height: 0 },
      overlayWidth: rect?.width || window.innerWidth,
      overlayHeight: rect?.height || window.innerHeight,
    });
    this.skipMaskAnimation = skipMaskAnimation;
  }

  private setupAttach(param: MainAttachShowParam): void {
    if (
      !this.overlayEl ||
      !this.positionerEl ||
      !this.bodyEl ||
      !this.maskEl ||
      !this.currentScope
    ) {
      return;
    }

    this.attachEngine ??= new AttachEngine(this.proxy);

    const renderMaskForLayout = (
      targetOffset: { x: number; y: number },
      targetSize: { width: number; height: number },
    ) => {
      if (!this.maskEl || !this.overlayEl) return;
      const overlayRect = this.overlayEl.getBoundingClientRect();
      const { skipMaskAnimation } = this.highlightRenderer.render({
        maskEl: this.maskEl,
        maskColor: param.maskColor,
        maskWidget: param.maskWidget,
        usePenetrate: param.usePenetrate,
        maskIgnoreArea: param.maskIgnoreArea,
        highlightBuilder: param.highlightBuilder,
        nonAnimationTypes: param.nonAnimationTypes,
        targetOffset,
        targetSize,
        overlayWidth: overlayRect.width || window.innerWidth,
        overlayHeight: overlayRect.height || window.innerHeight,
      });
      this.skipMaskAnimation = skipMaskAnimation;
    };

    const layout = this.attachEngine.computeAndObserve({
      overlayEl: this.overlayEl,
      positionerEl: this.positionerEl,
      bodyEl: this.bodyEl,
      scope: this.currentScope,
      mountContent: () => this.mountScopeContent(),
      targetContext: param.targetContext,
      targetBuilder: param.targetBuilder,
      adjustBuilder: param.adjustBuilder,
      scalePointBuilder: param.scalePointBuilder,
      alignment: param.alignment,
      onReposition: (updated) => {
        this.resolvedAttachAlignment = updated.resolvedAlignment;
        this.scaleOrigin = updated.scaleOrigin;
        renderMaskForLayout(updated.targetOffset, updated.targetSize);
      },
    });

    this.resolvedAttachAlignment = layout.resolvedAlignment;
    this.scaleOrigin = layout.scaleOrigin;
    renderMaskForLayout(layout.targetOffset, layout.targetSize);
  }

  private setupAccessibility(param: MainDialogShowParam): void {
    if (!this.bodyEl) return;

    if (this.layer === 'custom' || this.layer === 'attach') {
      this.bodyEl.setAttribute('role', 'dialog');
      if (!param.usePenetrate) {
        this.bodyEl.setAttribute('aria-modal', 'true');
      }
      if (param.ariaLabel) {
        this.bodyEl.setAttribute('aria-label', param.ariaLabel);
      }
    }

    if (param.trapFocus || param.useSystem) {
      this.previousActiveElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    }

    if (param.trapFocus && !param.useSystem && !param.usePenetrate) {
      const focusTarget = this.findFirstFocusable(this.bodyEl) ?? this.bodyEl;
      if (focusTarget === this.bodyEl && !this.bodyEl.hasAttribute('tabindex')) {
        this.bodyEl.tabIndex = -1;
      }
      focusTarget.focus({ preventScroll: true });

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Tab' || !this.bodyEl) return;
        const focusables = this.getFocusableElements(this.bodyEl);
        if (focusables.length === 0) {
          event.preventDefault();
          this.bodyEl.focus({ preventScroll: true });
          return;
        }
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        if (event.shiftKey) {
          if (
            document.activeElement === first ||
            !this.bodyEl.contains(document.activeElement)
          ) {
            event.preventDefault();
            last.focus({ preventScroll: true });
          }
        } else if (
          document.activeElement === last ||
          !this.bodyEl.contains(document.activeElement)
        ) {
          event.preventDefault();
          first.focus({ preventScroll: true });
        }
      };

      document.addEventListener('keydown', onKeyDown, true);
      this.focusTrapCleanup = () => {
        document.removeEventListener('keydown', onKeyDown, true);
      };
    }
  }

  private getFocusableElements(root: HTMLElement): HTMLElement[] {
    return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  }

  private findFirstFocusable(root: HTMLElement): HTMLElement | null {
    return root.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
  }

  async dismiss<T = unknown>(
    options: {
      useSystem?: boolean;
      result?: T;
      closeType?: CloseType;
    } = {},
  ): Promise<void> {
    if (this.dismissingPromise) {
      await this.dismissingPromise;
      return;
    }

    this.dismissingPromise = this.performDismiss(options);
    try {
      await this.dismissingPromise;
    } finally {
      this.dismissingPromise = null;
    }
  }

  private async performDismiss<T>(options: {
    useSystem?: boolean;
    result?: T;
    closeType?: CloseType;
  }): Promise<void> {
    const closeType = options.closeType ?? 'normal';
    const onDismiss = this.onDismissCallback;
    this.onDismissCallback = undefined;
    onDismiss?.();

    const param = this.currentParam;
    if (param && this.maskEl && this.bodyEl) {
      const exitAlignment = this.isAttachMode
        ? this.resolvedAttachAlignment ?? param.alignment
        : param.alignment;
      await this.animationLifecycle.playExit({
        maskEl: this.maskEl,
        bodyEl: this.bodyEl,
        alignment: exitAlignment,
        animationType: param.animationType,
        animationTime: param.animationTime,
        useAnimation: param.useAnimation,
        nonAnimationTypes: param.nonAnimationTypes,
        closeType,
        skipMaskAnimation: this.skipMaskAnimation,
        isAttach: this.isAttachMode,
        scaleOrigin: this.scaleOrigin,
        usePenetrate: param.usePenetrate,
      });
    }

    this.teardownDom();

    const completers = [...this.dismissCompleters];
    this.dismissCompleters.length = 0;
    for (const resolve of completers) {
      resolve(options.result);
    }
  }

  appear(): void {
    if (this.visible) return;
    this.visible = true;
    this.overlayEl?.classList.remove('fsd-overlay--offstage');
    this.nativeDialogEl?.classList.remove('fsd-native-dialog--offstage');
    if (this.currentParam?.lockScroll && !this.scrollLocked) {
      OverlayManager.instance.acquireScrollLock(this);
      this.scrollLocked = true;
    }
  }

  hide(): void {
    if (!this.visible) return;
    this.visible = false;
    this.overlayEl?.classList.add('fsd-overlay--offstage');
    this.nativeDialogEl?.classList.add('fsd-native-dialog--offstage');
    if (this.scrollLocked) {
      OverlayManager.instance.releaseScrollLock(this);
      this.scrollLocked = false;
    }
  }

  resetForTest(): void {
    this.teardownDom();
    const completers = [...this.dismissCompleters];
    this.dismissCompleters.length = 0;
    for (const resolve of completers) {
      resolve(undefined);
    }
    this.onDismissCallback = undefined;
    this.currentParam = null;
    this.hasShown = false;
    this.visible = true;
    this.dismissingPromise = null;
  }

  private teardownDom(): void {
    this.animationLifecycle.dispose();
    this.attachEngine?.dispose();
    this.attachEngine = null;
    this.highlightRenderer.dispose();
    this.maskEventBinding?.dispose();
    this.maskEventBinding = null;
    this.toastViewportHelper?.dispose();
    this.toastViewportHelper = null;
    this.focusTrapCleanup?.();
    this.focusTrapCleanup = null;
    this.nativeCancelCleanup?.();
    this.nativeCancelCleanup = null;

    if (this.scrollLocked) {
      OverlayManager.instance.releaseScrollLock(this);
      this.scrollLocked = false;
    }

    this.contentHandle?.unmount();
    this.contentHandle = null;
    this.currentScope?.dispose();
    this.currentScope = null;

    if (this.nativeDialogEl) {
      if (
        this.nativeDialogEl.open &&
        typeof this.nativeDialogEl.close === 'function'
      ) {
        try {
          this.nativeDialogEl.close();
        } catch {
          // Ignore close error if already closed
        }
      }
      this.nativeDialogEl.remove();
      this.nativeDialogEl = null;
    }

    this.overlayEl?.remove();
    this.overlayEl = null;
    this.maskEl = null;
    this.bodyWrapEl = null;
    this.positionerEl = null;
    this.bodyEl = null;

    if (this.previousActiveElement && this.previousActiveElement.isConnected) {
      this.previousActiveElement.focus({ preventScroll: true });
    }
    this.previousActiveElement = null;
  }
}
