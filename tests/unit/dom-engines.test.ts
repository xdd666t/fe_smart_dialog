import { describe, expect, it, vi } from 'vitest';
import {
  Rect,
  SmartDialog,
  SmartMaskTriggerType,
  SmartNonAnimationType,
  SmartTheme,
} from '../../src';

describe('Web DOM Engines (Mask, Highlight, BindWidget, VisualViewport, Styles)', () => {
  it('auto-injects scoped CSS styles into document.head by default and honors theme/zIndexBase', () => {
    SmartDialog.init({ theme: SmartTheme.light, zIndexBase: 15000 });
    const styleEl = document.head.querySelector('#fe-smart-dialog-styles');
    expect(styleEl).not.toBeNull();
    expect(styleEl?.textContent).toContain('.fsd-root');

    const root = document.querySelector('.fsd-root') as HTMLElement;
    expect(root.getAttribute('data-fsd-theme')).toBe('light');
    expect(Number(root.style.zIndex)).toBe(15000);

    void SmartDialog.show({ useAnimation: false, builder: () => 'Layer Check' });
    const customLayer = document.querySelector('.fsd-layer--custom') as HTMLElement;
    expect(Number(customLayer.style.zIndex)).toBeGreaterThanOrEqual(15000);
  });

  it('supports SmartMaskTriggerType down, move, and up', async () => {
    vi.useFakeTimers();

    // 1. DOWN trigger
    SmartDialog.config.custom.maskTriggerType = SmartMaskTriggerType.down;
    const onMaskDown = vi.fn();
    void SmartDialog.show({
      useAnimation: false,
      clickMaskDismiss: true,
      onMask: onMaskDown,
      builder: () => 'Down Mask',
    });

    const maskDown = document.querySelector('.fsd-mask') as HTMLElement;
    maskDown.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await Promise.resolve();
    expect(onMaskDown).toHaveBeenCalledTimes(1);
    expect(SmartDialog.checkExist()).toBe(false);

    // Advance past mask debounce window (500ms)
    await vi.advanceTimersByTimeAsync(550);

    // 2. MOVE trigger
    SmartDialog.config.custom.maskTriggerType = SmartMaskTriggerType.move;
    const onMaskMove = vi.fn();
    void SmartDialog.show({
      useAnimation: false,
      clickMaskDismiss: true,
      onMask: onMaskMove,
      builder: () => 'Move Mask',
    });

    const maskMove = document.querySelector('.fsd-mask') as HTMLElement;
    maskMove.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(onMaskMove).not.toHaveBeenCalled();
    maskMove.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
    await Promise.resolve();
    expect(onMaskMove).toHaveBeenCalledTimes(1);
    expect(SmartDialog.checkExist()).toBe(false);

    await vi.advanceTimersByTimeAsync(550);

    // 3. UP trigger
    SmartDialog.config.custom.maskTriggerType = SmartMaskTriggerType.up;
    const onMaskUp = vi.fn();
    void SmartDialog.show({
      useAnimation: false,
      clickMaskDismiss: true,
      onMask: onMaskUp,
      builder: () => 'Up Mask',
    });

    const maskUp = document.querySelector('.fsd-mask') as HTMLElement;
    maskUp.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(onMaskUp).not.toHaveBeenCalled();
    maskUp.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    await Promise.resolve();
    expect(onMaskUp).toHaveBeenCalledTimes(1);
    expect(SmartDialog.checkExist()).toBe(false);
  });

  it('handles usePenetrate click-through and ignoreArea', async () => {
    const onMask = vi.fn();
    void SmartDialog.show({
      useAnimation: false,
      usePenetrate: true,
      clickMaskDismiss: true,
      ignoreArea: Rect.fromLTRB(0, 80, 0, 0),
      onMask,
      builder: () => {
        const box = document.createElement('div');
        box.textContent = 'Penetrate';
        return box;
      },
    });

    // Click inside top 80px ignored bar -> does NOT dismiss
    document.dispatchEvent(
      new PointerEvent('pointerup', {
        bubbles: true,
        clientX: 25,
        clientY: 25,
      }),
    );
    await Promise.resolve();
    expect(onMask).not.toHaveBeenCalled();
    expect(SmartDialog.checkExist()).toBe(true);

    // Click outside ignoreArea and dialog body -> triggers translucent mask dismiss
    document.dispatchEvent(
      new PointerEvent('pointerup', {
        bubbles: true,
        clientX: 400,
        clientY: 400,
      }),
    );
    await Promise.resolve();
    expect(onMask).toHaveBeenCalledTimes(1);
    expect(SmartDialog.checkExist()).toBe(false);
  });

  it('renders SVG evenodd spotlight cutout via highlightBuilder and applies maskIgnoreArea', async () => {
    const target = document.createElement('button');
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 120,
      width: 80,
      height: 36,
      right: 180,
      bottom: 156,
      x: 100,
      y: 120,
      toJSON: () => ({}),
    });
    document.body.appendChild(target);

    void SmartDialog.showAttach({
      targetContext: target,
      useAnimation: false,
      maskIgnoreArea: Rect.fromLTRB(0, 10, 0, 0),
      nonAnimationTypes: [SmartNonAnimationType.highlightMask_nonAnimation],
      highlightBuilder: (offset, size) => ({
        left: offset.dx - 4,
        top: offset.dy - 4,
        width: size.width + 8,
        height: size.height + 8,
        borderRadius: 8,
      }),
      builder: () => 'Spotlight Tip',
    });

    const mask = document.querySelector('.fsd-mask') as HTMLElement;
    expect(mask.style.top).toBe('10px');
    const svg = mask.querySelector('svg');
    const path = svg?.querySelector('path');
    expect(svg).not.toBeNull();
    expect(path?.getAttribute('fill-rule')).toBe('evenodd');

    await SmartDialog.dismiss();
  });

  it('adjusts toast marginBottom on VisualViewport resize (mobile keyboard avoidance)', async () => {
    const listeners = new Map<string, Set<() => void>>();
    const mockViewport = {
      height: 800,
      offsetTop: 0,
      addEventListener: (type: string, fn: () => void) => {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type)!.add(fn);
      },
      removeEventListener: (type: string, fn: () => void) => {
        listeners.get(type)?.delete(fn);
      },
    };
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: mockViewport,
    });

    void SmartDialog.showToast('Keyboard Test', {
      displayTime: 5000,
      useAnimation: false,
    });

    const bodyEl = document.querySelector(
      '[data-fsd-layer="toast"] .fsd-content',
    ) as HTMLElement;
    vi.spyOn(bodyEl, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 720,
      width: 200,
      height: 40,
      right: 300,
      bottom: 760,
      x: 100,
      y: 720,
      toJSON: () => ({}),
    });

    // Shrink visualViewport to simulate 300px virtual keyboard opening
    mockViewport.height = 500;
    listeners.get('resize')?.forEach((fn) => fn());

    expect(parseFloat(bodyEl.style.marginBottom)).toBeGreaterThan(200);

    // Keyboard closes -> marginBottom clears
    mockViewport.height = 800;
    listeners.get('resize')?.forEach((fn) => fn());
    expect(bodyEl.style.marginBottom).toBe('');

    await SmartDialog.dismiss();
  });

  it('automatically dismisses bindElement dialog when bound element leaves DOM', async () => {
    const hostPanel = document.createElement('section');
    document.body.appendChild(hostPanel);

    const onDismiss = vi.fn();
    void SmartDialog.show({
      tag: 'panel-bound',
      bindElement: hostPanel,
      useAnimation: false,
      onDismiss,
      builder: () => 'Bound to panel',
    });

    expect(SmartDialog.checkExist({ tag: 'panel-bound' })).toBe(true);

    hostPanel.remove();
    // Wait for MutationObserver + requestAnimationFrame
    await new Promise((r) => setTimeout(r, 60));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(SmartDialog.checkExist({ tag: 'panel-bound' })).toBe(false);
  });

  it('aligns default center-scale animation with Flutter (200ms, linear easing, scale 0 -> 1)', async () => {
    const animateCalls: Array<{
      keyframes: Keyframe[] | PropertyIndexedKeyframes | null;
      options: number | KeyframeAnimationOptions | undefined;
    }> = [];
    const originalAnimate = HTMLElement.prototype.animate;
    HTMLElement.prototype.animate = vi.fn(function (
      this: HTMLElement,
      keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
      options?: number | KeyframeAnimationOptions,
    ) {
      animateCalls.push({ keyframes, options });
      const stub = {
        onfinish: null as ((this: Animation, ev: AnimationPlaybackEvent) => void) | null,
        oncancel: null as ((this: Animation, ev: AnimationPlaybackEvent) => void) | null,
        cancel: vi.fn(),
      } as unknown as Animation;
      queueMicrotask(() => stub.onfinish?.call(stub, {} as AnimationPlaybackEvent));
      return stub;
    });

    try {
      void SmartDialog.show({ builder: () => 'Flutter Curve Check' });
      expect(animateCalls.length).toBeGreaterThanOrEqual(2);
      const bodyCall = animateCalls[1]!;
      expect(bodyCall.options).toMatchObject({ duration: 200, easing: 'linear' });
      expect(bodyCall.keyframes).toEqual([
        { transform: 'scale(0)', transformOrigin: 'center center' },
        { transform: 'scale(1)', transformOrigin: 'center center' },
      ]);
      await SmartDialog.dismiss({ force: true });
    } finally {
      HTMLElement.prototype.animate = originalAnimate;
    }
  });

  it('rejects invalid HighlightRegion.shape enum strings at runtime', async () => {
    const target = document.createElement('button');
    document.body.appendChild(target);
    await expect(
      SmartDialog.showAttach({
        targetContext: target,
        useAnimation: false,
        highlightBuilder: () => ({
          left: 0,
          top: 0,
          width: 40,
          height: 40,
          shape: 'hexagon' as unknown as import('../../src').SmartHighlightShape,
        }),
        builder: () => 'Spotlight',
      }),
    ).rejects.toThrow(TypeError);
    await SmartDialog.dismiss({ force: true });
    target.remove();
  });
});
