import {
  CloseType,
  SmartAnimationType,
  SmartNonAnimationType,
} from '../config/enums';
import {
  isCenterAlignment,
  resolveAlignment,
  type SmartAlignment,
} from '../types/common';
import {
  AnimationParam,
  type AnimationBuilder,
  type AnimationControllerLike,
} from '../types/params';

export function resolveOpenAnimationDuration(options: {
  animationTime: number;
  useAnimation: boolean;
  nonAnimationTypes: SmartNonAnimationType[];
}): number {
  if (
    !options.useAnimation ||
    options.nonAnimationTypes.includes(
      SmartNonAnimationType.openDialog_nonAnimation,
    )
  ) {
    return 0;
  }
  return options.animationTime;
}

export function resolveDismissAnimationDuration(options: {
  animationTime: number;
  useAnimation: boolean;
  nonAnimationTypes: SmartNonAnimationType[];
  closeType: CloseType;
}): number {
  if (!options.useAnimation) return 0;

  for (const type of options.nonAnimationTypes) {
    if (type === SmartNonAnimationType.closeDialog_nonAnimation) return 0;
    if (
      options.closeType === CloseType.route &&
      type === SmartNonAnimationType.routeClose_nonAnimation
    ) {
      return 0;
    }
    if (
      options.closeType === CloseType.mask &&
      type === SmartNonAnimationType.maskClose_nonAnimation
    ) {
      return 0;
    }
    if (
      options.closeType === CloseType.back &&
      type === SmartNonAnimationType.backClose_nonAnimation
    ) {
      return 0;
    }
  }
  return options.animationTime;
}

function getSlideTransform(alignment: SmartAlignment): string {
  const { x, y } = resolveAlignment(alignment);
  if (y > 0) return 'translate3d(0, 100%, 0)';
  if (y < 0) return 'translate3d(0, -100%, 0)';
  if (x < 0) return 'translate3d(-100%, 0, 0)';
  if (x > 0) return 'translate3d(100%, 0, 0)';
  return 'translate3d(0, 0, 0)';
}

function getAttachAxisSizeKeyframes(alignment: SmartAlignment): Keyframe[] {
  const { x, y } = resolveAlignment(alignment);
  const horizontal = y === 0 && x !== 0;
  if (horizontal) {
    const origin = x < 0 ? 'right center' : 'left center';
    return [
      { transform: 'scaleX(0)', transformOrigin: origin },
      { transform: 'scaleX(1)', transformOrigin: origin },
    ];
  }
  const origin = y < 0 ? 'center bottom' : 'center top';
  return [
    { transform: 'scaleY(0)', transformOrigin: origin },
    { transform: 'scaleY(1)', transformOrigin: origin },
  ];
}

function buildKeyframes(options: {
  animationType: SmartAnimationType;
  alignment: SmartAlignment;
  isAttach: boolean;
  scaleOrigin?: string;
}): Keyframe[] {
  const centered = isCenterAlignment(options.alignment);

  const fadeFrames: Keyframe[] = [{ opacity: 0 }, { opacity: 1 }];
  const scaleFrames: Keyframe[] = [
    {
      transform: 'scale(0)',
      transformOrigin: options.scaleOrigin ?? 'center center',
    },
    {
      transform: 'scale(1)',
      transformOrigin: options.scaleOrigin ?? 'center center',
    },
  ];
  const slideFrames: Keyframe[] = options.isAttach
    ? getAttachAxisSizeKeyframes(options.alignment)
    : [
        { transform: getSlideTransform(options.alignment) },
        { transform: 'translate3d(0, 0, 0)' },
      ];

  switch (options.animationType) {
    case SmartAnimationType.fade:
      return fadeFrames;
    case SmartAnimationType.scale:
      return scaleFrames;
    case SmartAnimationType.centerFade_otherSlide:
      return centered ? fadeFrames : slideFrames;
    case SmartAnimationType.centerScale_otherSlide:
      return centered ? scaleFrames : slideFrames;
  }
}

async function runWebAnimation(
  element: HTMLElement,
  keyframes: Keyframe[],
  duration: number,
  direction: 'normal' | 'reverse',
  activeAnimations: Set<Animation>,
): Promise<void> {
  if (duration <= 0) return;

  if (typeof element.animate === 'function') {
    const orderedFrames =
      direction === 'reverse' ? [...keyframes].reverse() : keyframes;
    const anim = element.animate(orderedFrames, {
      duration,
      easing: 'linear',
      fill: 'forwards',
    });
    activeAnimations.add(anim);
    try {
      await new Promise<void>((resolve) => {
        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          activeAnimations.delete(anim);
          resolve();
        };
        anim.onfinish = done;
        anim.oncancel = done;
        setTimeout(done, duration + 32);
      });
      return;
    } catch {
      activeAnimations.delete(anim);
    }
  }

  await new Promise<void>((resolve) => setTimeout(resolve, duration));
}

export class DialogAnimationLifecycle {
  private readonly activeAnimations = new Set<Animation>();
  private animationParam: AnimationParam | null = null;
  private customController: AnimationControllerLike | null = null;

  async playEnter(options: {
    maskEl: HTMLElement;
    bodyEl: HTMLElement;
    alignment: SmartAlignment;
    animationType: SmartAnimationType;
    animationTime: number;
    useAnimation: boolean;
    nonAnimationTypes: SmartNonAnimationType[];
    skipMaskAnimation?: boolean;
    isAttach?: boolean;
    scaleOrigin?: string;
    animationBuilder?: AnimationBuilder;
    usePenetrate: boolean;
  }): Promise<void> {
    this.cancelAll();

    const duration = resolveOpenAnimationDuration({
      animationTime: options.animationTime,
      useAnimation: options.useAnimation,
      nonAnimationTypes: options.nonAnimationTypes,
    });

    if (options.animationBuilder) {
      let currentProgress = 0;
      const controller: AnimationControllerLike = {
        element: options.bodyEl,
        duration,
        get progress() {
          return currentProgress;
        },
        set progress(val: number) {
          currentProgress = Math.max(0, Math.min(1, val));
        },
        forward: async () => {
          currentProgress = 1;
          await runWebAnimation(
            options.bodyEl,
            [{ opacity: 0 }, { opacity: 1 }],
            duration,
            'normal',
            this.activeAnimations,
          );
        },
        reverse: async () => {
          currentProgress = 0;
          await runWebAnimation(
            options.bodyEl,
            [{ opacity: 0 }, { opacity: 1 }],
            duration,
            'reverse',
            this.activeAnimations,
          );
        },
        cancel: () => this.cancelAll(),
      };
      this.customController = controller;
      this.animationParam = new AnimationParam({
        alignment: options.alignment,
        animationTime: options.animationTime,
        element: options.bodyEl,
      });

      const returned = options.animationBuilder(
        controller,
        options.bodyEl,
        this.animationParam,
      );
      if (returned instanceof HTMLElement && returned !== options.bodyEl) {
        options.bodyEl.replaceChildren(returned);
      }

      const maskTask =
        options.usePenetrate || options.skipMaskAnimation
          ? Promise.resolve()
          : runWebAnimation(
              options.maskEl,
              [{ opacity: 0 }, { opacity: 1 }],
              duration,
              'normal',
              this.activeAnimations,
            );

      if (this.animationParam.onForward) {
        this.animationParam.onForward();
        await maskTask;
      } else {
        await Promise.all([
          maskTask,
          runWebAnimation(
            options.bodyEl,
            buildKeyframes({
              animationType: options.animationType,
              alignment: options.alignment,
              isAttach: options.isAttach ?? false,
              scaleOrigin: options.scaleOrigin,
            }),
            duration,
            'normal',
            this.activeAnimations,
          ),
        ]);
      }
      return;
    }

    const maskTask =
      options.usePenetrate || options.skipMaskAnimation
        ? Promise.resolve()
        : runWebAnimation(
            options.maskEl,
            [{ opacity: 0 }, { opacity: 1 }],
            duration,
            'normal',
            this.activeAnimations,
          );

    const bodyTask = runWebAnimation(
      options.bodyEl,
      buildKeyframes({
        animationType: options.animationType,
        alignment: options.alignment,
        isAttach: options.isAttach ?? false,
        scaleOrigin: options.scaleOrigin,
      }),
      duration,
      'normal',
      this.activeAnimations,
    );

    await Promise.all([maskTask, bodyTask]);
  }

  async playExit(options: {
    maskEl: HTMLElement;
    bodyEl: HTMLElement;
    alignment: SmartAlignment;
    animationType: SmartAnimationType;
    animationTime: number;
    useAnimation: boolean;
    nonAnimationTypes: SmartNonAnimationType[];
    closeType: CloseType;
    skipMaskAnimation?: boolean;
    isAttach?: boolean;
    scaleOrigin?: string;
    usePenetrate: boolean;
  }): Promise<void> {
    this.cancelAll();

    const duration = resolveDismissAnimationDuration({
      animationTime: options.animationTime,
      useAnimation: options.useAnimation,
      nonAnimationTypes: options.nonAnimationTypes,
      closeType: options.closeType,
    });

    if (duration <= 0) {
      this.animationParam?.onDismiss?.();
      return;
    }

    const maskTask =
      options.usePenetrate || options.skipMaskAnimation
        ? Promise.resolve()
        : runWebAnimation(
            options.maskEl,
            [{ opacity: 0 }, { opacity: 1 }],
            duration,
            'reverse',
            this.activeAnimations,
          );

    if (this.animationParam?.onDismiss) {
      this.animationParam.onDismiss();
      await Promise.all([
        maskTask,
        new Promise<void>((resolve) => setTimeout(resolve, duration)),
      ]);
      return;
    }

    const bodyTask = runWebAnimation(
      options.bodyEl,
      buildKeyframes({
        animationType: options.animationType,
        alignment: options.alignment,
        isAttach: options.isAttach ?? false,
        scaleOrigin: options.scaleOrigin,
      }),
      duration,
      'reverse',
      this.activeAnimations,
    );

    await Promise.all([maskTask, bodyTask]);
  }

  cancelAll(): void {
    for (const anim of this.activeAnimations) {
      try {
        anim.cancel();
      } catch {
        // Ignore already finished animations
      }
    }
    this.activeAnimations.clear();
  }

  dispose(): void {
    this.cancelAll();
    this.animationParam = null;
    this.customController = null;
  }
}
