import type { SmartTargetRef } from '../types/params';

/**
 * Resolves a flexible frontend target reference (`HTMLElement`, selector,
 * getter function, React Ref, or Vue Ref) into a connected `HTMLElement`.
 */
export function resolveTargetElement(
  ref: SmartTargetRef,
  options: { requireConnected?: boolean } = { requireConnected: true },
): HTMLElement | null {
  if (!ref) return null;

  let resolved: HTMLElement | null | undefined = null;

  if (typeof ref === 'string') {
    if (typeof document !== 'undefined') {
      const found = document.querySelector(ref);
      resolved = found instanceof HTMLElement ? found : null;
    }
  } else if (typeof ref === 'function') {
    resolved = ref();
  } else if (typeof HTMLElement !== 'undefined' && ref instanceof HTMLElement) {
    resolved = ref;
  } else if (typeof ref === 'object') {
    if ('current' in ref) {
      resolved = ref.current;
    } else if ('value' in ref) {
      resolved = ref.value;
    }
  }

  if (!resolved) return null;
  if (options.requireConnected !== false && !resolved.isConnected) {
    return null;
  }
  return resolved;
}
