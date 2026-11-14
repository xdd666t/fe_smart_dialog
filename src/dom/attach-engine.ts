import { SmartAttachAlignmentType } from '../config/enums';
import type { DialogProxy } from '../core/dialog-proxy';
import type { DialogScope } from '../core/dialog-scope';
import {
  Alignment,
  Offset,
  Size,
  assertAlignment,
  resolveAlignment,
  type SmartAlignment,
  type SmartOffset,
  type SmartSize,
} from '../types/common';
import {
  AttachParam,
  type AdjustBuilder,
  type ScalePointBuilder,
  type SmartContent,
  type TargetBuilder,
} from '../types/params';
import { resolveTargetElement } from './target-resolver';

interface RectBox {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

export interface AttachLayoutResult {
  targetOffset: SmartOffset;
  targetSize: SmartSize;
  resolvedAlignment: SmartAlignment;
  scaleOrigin: string;
}

export class AttachEngine {
  private readonly proxy: DialogProxy;
  private targetEl: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private rafId: number | null = null;
  private cleanupListeners: (() => void) | null = null;

  private lastParams: {
    overlayEl: HTMLElement;
    positionerEl: HTMLElement;
    bodyEl: HTMLElement;
    scope: DialogScope;
    mountContent: () => void;
    targetContext?: Parameters<typeof resolveTargetElement>[0];
    targetBuilder?: TargetBuilder;
    adjustBuilder?: AdjustBuilder<SmartContent>;
    scalePointBuilder?: ScalePointBuilder;
    alignment: SmartAlignment;
    onReposition?: (layout: AttachLayoutResult) => void;
  } | null = null;

  constructor(proxy: DialogProxy) {
    this.proxy = proxy;
  }

  computeAndObserve(params: {
    overlayEl: HTMLElement;
    positionerEl: HTMLElement;
    bodyEl: HTMLElement;
    scope: DialogScope;
    mountContent: () => void;
    targetContext?: Parameters<typeof resolveTargetElement>[0];
    targetBuilder?: TargetBuilder;
    adjustBuilder?: AdjustBuilder<SmartContent>;
    scalePointBuilder?: ScalePointBuilder;
    alignment: SmartAlignment;
    onReposition?: (layout: AttachLayoutResult) => void;
  }): AttachLayoutResult {
    this.lastParams = params;
    const layout = this.recalculate(params);
    this.attachObservers();
    return layout;
  }

  private recalculate(
    params: NonNullable<AttachEngine['lastParams']>,
    pass = 0,
    overrideAlignment?: SmartAlignment,
  ): AttachLayoutResult {
    const {
      overlayEl,
      positionerEl,
      bodyEl,
      scope,
      mountContent,
      targetContext,
      targetBuilder,
      adjustBuilder,
      scalePointBuilder,
    } = params;

    const overlayRect = this.getSafeOverlayRect(overlayEl);
    this.targetEl = resolveTargetElement(targetContext);

    let targetOffset = Offset.zero;
    let targetSize: SmartSize = Size.zero;
    let hasTargetInfo = false;

    if (this.targetEl) {
      const rect = this.targetEl.getBoundingClientRect();
      if (
        Number.isFinite(rect.left) &&
        Number.isFinite(rect.top) &&
        Number.isFinite(rect.width) &&
        Number.isFinite(rect.height)
      ) {
        targetOffset = Offset(
          rect.left - overlayRect.widthOffsetLeft,
          rect.top - overlayRect.heightOffsetTop,
        );
        targetSize = Size(rect.width, rect.height);
        hasTargetInfo = true;
      }
    }

    if (targetBuilder) {
      const customPoint = targetBuilder(targetOffset, targetSize);
      if (Number.isFinite(customPoint.x) && Number.isFinite(customPoint.y)) {
        targetOffset = Offset(customPoint.x, customPoint.y);
      } else if (!hasTargetInfo) {
        targetOffset = Offset.zero;
        targetSize = Size.zero;
      }
    } else if (!hasTargetInfo && targetContext !== undefined && targetContext !== null) {
      // Target element unavailable / disconnected: keep offscreen safely without errors
      positionerEl.style.visibility = 'hidden';
      return {
        targetOffset,
        targetSize,
        resolvedAlignment: overrideAlignment ?? params.alignment,
        scaleOrigin: 'center center',
      };
    }

    positionerEl.style.visibility = 'visible';

    const selfRect = positionerEl.getBoundingClientRect();
    const selfSize: SmartSize = {
      width: Number.isFinite(selfRect.width) && selfRect.width > 0
        ? selfRect.width
        : positionerEl.offsetWidth || 0,
      height: Number.isFinite(selfRect.height) && selfRect.height > 0
        ? selfRect.height
        : positionerEl.offsetHeight || 0,
    };

    const currentAlignment = overrideAlignment ?? params.alignment;
    const screenW = overlayRect.width;
    const screenH = overlayRect.height;

    const rectBox = this.computeRectBox({
      alignment: currentAlignment,
      targetOffset,
      targetSize,
      selfSize,
      screenW,
      screenH,
    });

    const selfOffset: SmartOffset = {
      x:
        rectBox.left !== undefined
          ? rectBox.left
          : screenW - ((rectBox.right ?? 0) + selfSize.width),
      y:
        rectBox.top !== undefined
          ? rectBox.top
          : screenH - ((rectBox.bottom ?? 0) + selfSize.height),
    };

    if (adjustBuilder && pass === 0) {
      const adjustParam = adjustBuilder(
        new AttachParam({
          targetOffset,
          targetSize,
          selfElement: bodyEl,
          selfOffset,
          selfSize,
        }),
      );

      let needsRecompute = false;
      if (adjustParam.builder) {
        scope.setBuilder(adjustParam.builder);
        mountContent();
        needsRecompute = true;
      }

      const nextAlignment =
        adjustParam.alignment !== undefined
          ? assertAlignment(adjustParam.alignment, 'adjustBuilder().alignment')
          : currentAlignment;
      if (nextAlignment !== currentAlignment || needsRecompute) {
        return this.recalculate(params, 1, nextAlignment);
      }
    }

    // Apply CSS positioning
    positionerEl.style.left = rectBox.left !== undefined ? `${rectBox.left}px` : '';
    positionerEl.style.right =
      rectBox.right !== undefined ? `${rectBox.right}px` : '';
    positionerEl.style.top = rectBox.top !== undefined ? `${rectBox.top}px` : '';
    positionerEl.style.bottom =
      rectBox.bottom !== undefined ? `${rectBox.bottom}px` : '';

    let scaleOrigin = 'center center';
    if (scalePointBuilder) {
      const pt = scalePointBuilder(selfSize);
      if (Number.isFinite(pt.x) && Number.isFinite(pt.y)) {
        scaleOrigin = `${pt.x}px ${pt.y}px`;
      }
    }

    return {
      targetOffset,
      targetSize,
      resolvedAlignment: currentAlignment,
      scaleOrigin,
    };
  }

  private computeRectBox(options: {
    alignment: SmartAlignment;
    targetOffset: SmartOffset;
    targetSize: SmartSize;
    selfSize: SmartSize;
    screenW: number;
    screenH: number;
  }): RectBox {
    const { alignment, targetOffset, targetSize, selfSize, screenW, screenH } =
      options;
    const resolved = resolveAlignment(alignment);
    const preset = resolved.preset;

    if (preset === 'topLeft') {
      return this.clampRectBox({
        bottom: screenH - targetOffset.y,
        left: targetOffset.x + this.calculateDx('topLeft', selfSize),
        fixedVertical: true,
        selfSize,
        screenW,
        screenH,
      });
    }
    if (preset === 'topCenter') {
      return this.clampRectBox({
        bottom: screenH - targetOffset.y,
        left: targetOffset.x + targetSize.width / 2 - selfSize.width / 2,
        fixedVertical: true,
        selfSize,
        screenW,
        screenH,
      });
    }
    if (preset === 'topRight') {
      return this.clampRectBox({
        bottom: screenH - targetOffset.y,
        left:
          targetOffset.x +
          targetSize.width +
          this.calculateDx('topRight', selfSize),
        fixedVertical: true,
        selfSize,
        screenW,
        screenH,
      });
    }
    if (preset === 'centerLeft') {
      return this.clampRectBox({
        right: screenW - targetOffset.x,
        top: targetOffset.y + targetSize.height / 2 - selfSize.height / 2,
        fixedHorizontal: true,
        selfSize,
        screenW,
        screenH,
      });
    }
    if (preset === 'center') {
      return this.clampRectBox({
        left: targetOffset.x + targetSize.width / 2 - selfSize.width / 2,
        top: targetOffset.y + targetSize.height / 2 - selfSize.height / 2,
        fixedHorizontal: true,
        selfSize,
        screenW,
        screenH,
      });
    }
    if (preset === 'centerRight') {
      return this.clampRectBox({
        left: targetOffset.x + targetSize.width,
        top: targetOffset.y + targetSize.height / 2 - selfSize.height / 2,
        fixedHorizontal: true,
        selfSize,
        screenW,
        screenH,
      });
    }
    if (preset === 'bottomLeft') {
      return this.clampRectBox({
        top: targetOffset.y + targetSize.height,
        left: targetOffset.x + this.calculateDx('bottomLeft', selfSize),
        fixedVertical: true,
        selfSize,
        screenW,
        screenH,
      });
    }
    if (preset === 'bottomCenter') {
      return this.clampRectBox({
        top: targetOffset.y + targetSize.height,
        left: targetOffset.x + targetSize.width / 2 - selfSize.width / 2,
        fixedVertical: true,
        selfSize,
        screenW,
        screenH,
      });
    }
    if (preset === 'bottomRight') {
      return this.clampRectBox({
        top: targetOffset.y + targetSize.height,
        left:
          targetOffset.x +
          targetSize.width +
          this.calculateDx('bottomRight', selfSize),
        fixedVertical: true,
        selfSize,
        screenW,
        screenH,
      });
    }

    // Custom fractional coordinate alignment fallback relative to target bounds
    const anchorX =
      targetOffset.x + ((resolved.x + 1) / 2) * targetSize.width;
    const anchorY =
      targetOffset.y + ((resolved.y + 1) / 2) * targetSize.height;
    return this.clampRectBox({
      left: anchorX - selfSize.width / 2,
      top: anchorY - selfSize.height / 2,
      selfSize,
      screenW,
      screenH,
    });
  }

  private calculateDx(
    preset: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight',
    selfSize: SmartSize,
  ): number {
    const type = this.proxy.config.attach.attachAlignmentType;
    if (preset === 'topLeft' || preset === 'bottomLeft') {
      if (type === SmartAttachAlignmentType.inside) return 0;
      if (type === SmartAttachAlignmentType.outside) return -selfSize.width;
      return -(selfSize.width / 2);
    }

    if (type === SmartAttachAlignmentType.inside) return -selfSize.width;
    if (type === SmartAttachAlignmentType.outside) return 0;
    return -(selfSize.width / 2);
  }

  private clampRectBox(options: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
    fixedHorizontal?: boolean;
    fixedVertical?: boolean;
    selfSize: SmartSize;
    screenW: number;
    screenH: number;
  }): RectBox {
    const box: RectBox = {
      left: options.left,
      right: options.right,
      top: options.top,
      bottom: options.bottom,
    };

    if (!options.fixedHorizontal && box.left !== undefined && options.screenW > 0) {
      if (box.left < 0) {
        box.left = 0;
        box.right = undefined;
      } else if (options.screenW - box.left - options.selfSize.width < 0) {
        box.left = undefined;
        box.right = 0;
      }
    }

    if (!options.fixedVertical && box.top !== undefined && options.screenH > 0) {
      if (box.top < 0) {
        box.top = 0;
        box.bottom = undefined;
      } else if (options.screenH - box.top - options.selfSize.height < 0) {
        box.top = undefined;
        box.bottom = 0;
      }
    }

    return box;
  }

  private getSafeOverlayRect(overlayEl: HTMLElement): {
    width: number;
    height: number;
    widthOffsetLeft: number;
    heightOffsetTop: number;
  } {
    const rect = overlayEl.getBoundingClientRect();
    const width =
      rect.width > 0
        ? rect.width
        : typeof window !== 'undefined'
          ? window.innerWidth
          : 0;
    const height =
      rect.height > 0
        ? rect.height
        : typeof window !== 'undefined'
          ? window.innerHeight
          : 0;
    return {
      width,
      height,
      widthOffsetLeft: Number.isFinite(rect.left) ? rect.left : 0,
      heightOffsetTop: Number.isFinite(rect.top) ? rect.top : 0,
    };
  }

  private scheduleReposition = (): void => {
    if (this.rafId !== null || !this.lastParams) return;
    const schedule =
      typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame
        : (cb: FrameRequestCallback) => setTimeout(() => cb(0), 16) as unknown as number;

    this.rafId = schedule(() => {
      this.rafId = null;
      if (!this.lastParams || !this.lastParams.overlayEl.isConnected) return;
      const layout = this.recalculate(this.lastParams);
      this.lastParams.onReposition?.(layout);
    });
  };

  private attachObservers(): void {
    this.detachObservers();
    if (typeof window === 'undefined' || !this.lastParams) return;

    window.addEventListener('resize', this.scheduleReposition);
    window.addEventListener('scroll', this.scheduleReposition, true);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.scheduleReposition);
      this.resizeObserver.observe(this.lastParams.positionerEl);
      if (this.targetEl) {
        this.resizeObserver.observe(this.targetEl);
      }
    }

    this.cleanupListeners = () => {
      window.removeEventListener('resize', this.scheduleReposition);
      window.removeEventListener('scroll', this.scheduleReposition, true);
      this.resizeObserver?.disconnect();
      this.resizeObserver = null;
    };
  }

  private detachObservers(): void {
    if (this.rafId !== null) {
      if (typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(this.rafId);
      } else {
        clearTimeout(this.rafId);
      }
      this.rafId = null;
    }
    this.cleanupListeners?.();
    this.cleanupListeners = null;
  }

  dispose(): void {
    this.detachObservers();
    this.lastParams = null;
    this.targetEl = null;
  }
}
