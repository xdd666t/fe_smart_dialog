import { SmartMaskTriggerType } from '../config/enums';
import type { SmartRect } from '../types/common';

export interface MaskEventBinding {
  update: (options: MaskEventOptions) => void;
  dispose: () => void;
}

export interface MaskEventOptions {
  maskElement: HTMLElement;
  isInsideContent: (target: EventTarget | null) => boolean;
  ignoreArea?: SmartRect;
  triggerType: SmartMaskTriggerType;
  usePenetrate: boolean;
  onMask: () => void;
}

function isInsideIgnoredInsets(event: Event, ignoreArea?: SmartRect): boolean {
  if (!ignoreArea || typeof window === 'undefined') return false;
  if (!('clientX' in event) || !('clientY' in event)) return false;
  const { clientX, clientY } = event as MouseEvent;
  const left = ignoreArea.left ?? 0;
  const top = ignoreArea.top ?? 0;
  const right = ignoreArea.right ?? 0;
  const bottom = ignoreArea.bottom ?? 0;
  return (
    clientX < left ||
    clientY < top ||
    clientX > window.innerWidth - right ||
    clientY > window.innerHeight - bottom
  );
}

/**
 * Attaches mask pointer interaction matching `SmartMaskTriggerType` (`down`, `move`, `up`)
 * and translucent click detection when `usePenetrate` is enabled.
 */
export function bindMaskEvents(options: MaskEventOptions): MaskEventBinding {
  let current = options;
  let movedTriggered = false;
  let pointerDownStartedOutside = false;

  const fireMask = () => {
    current.onMask();
  };

  const isIgnoredEvent = (event: Event): boolean => {
    if (current.isInsideContent(event.target)) return true;
    if (current.usePenetrate && isInsideIgnoredInsets(event, current.ignoreArea)) {
      return true;
    }
    return false;
  };

  const onDown = (event: Event) => {
    if (isIgnoredEvent(event)) {
      pointerDownStartedOutside = false;
      return;
    }
    pointerDownStartedOutside = true;
    movedTriggered = false;

    if (current.triggerType === SmartMaskTriggerType.down) {
      movedTriggered = true;
      fireMask();
    }
  };

  const onMove = (event: Event) => {
    if (!pointerDownStartedOutside) return;
    if (isIgnoredEvent(event)) return;
    if (
      current.triggerType === SmartMaskTriggerType.move &&
      !movedTriggered
    ) {
      movedTriggered = true;
      fireMask();
    }
  };

  const onUp = (event: Event) => {
    const startedOutside = pointerDownStartedOutside;
    pointerDownStartedOutside = false;
    if (!startedOutside && current.triggerType !== SmartMaskTriggerType.up) {
      return;
    }
    if (isIgnoredEvent(event)) return;

    if (current.triggerType === SmartMaskTriggerType.up) {
      fireMask();
    } else if (
      current.triggerType === SmartMaskTriggerType.move &&
      !movedTriggered
    ) {
      // Fallback to up when move wasn't triggered (same as Flutter MaskEvent)
      fireMask();
    }
    movedTriggered = false;
  };

  let attachedTarget: HTMLElement | Document | null = null;

  const attach = () => {
    detach();
    const target: HTMLElement | Document = current.usePenetrate
      ? document
      : current.maskElement;
    target.addEventListener('pointerdown', onDown, current.usePenetrate);
    target.addEventListener('pointermove', onMove, current.usePenetrate);
    target.addEventListener('pointerup', onUp, current.usePenetrate);
    attachedTarget = target;
  };

  const detach = () => {
    if (!attachedTarget) return;
    attachedTarget.removeEventListener('pointerdown', onDown, true);
    attachedTarget.removeEventListener('pointerdown', onDown, false);
    attachedTarget.removeEventListener('pointermove', onMove, true);
    attachedTarget.removeEventListener('pointermove', onMove, false);
    attachedTarget.removeEventListener('pointerup', onUp, true);
    attachedTarget.removeEventListener('pointerup', onUp, false);
    attachedTarget = null;
  };

  attach();

  return {
    update(nextOptions: MaskEventOptions) {
      const targetChanged =
        nextOptions.usePenetrate !== current.usePenetrate ||
        nextOptions.maskElement !== current.maskElement;
      current = nextOptions;
      if (targetChanged) {
        attach();
      }
    },
    dispose() {
      detach();
    },
  };
}
