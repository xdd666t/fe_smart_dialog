import { useMemo, useRef, type RefObject } from 'react';
import { SmartDialogController } from '../core/smart-dialog-controller';
import { ReactSmartDialog } from './react-smart-dialog';

export function useSmartDialog() {
  return ReactSmartDialog;
}

export function useSmartDialogController(): SmartDialogController {
  return useMemo(() => new SmartDialogController(), []);
}

export function useBindWidget<
  T extends HTMLElement = HTMLElement,
>(): RefObject<T | null> {
  return useRef<T | null>(null);
}
