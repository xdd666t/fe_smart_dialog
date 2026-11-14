import { inject, shallowRef, type ShallowRef } from 'vue';
import { SmartDialogController } from '../core/smart-dialog-controller';
import { SMART_DIALOG_INJECTION_KEY } from './plugin';
import { VueSmartDialog } from './vue-smart-dialog';

export function useSmartDialog(): typeof VueSmartDialog {
  return inject(SMART_DIALOG_INJECTION_KEY, VueSmartDialog);
}

export function useSmartDialogController(): SmartDialogController {
  return new SmartDialogController();
}

export function useBindWidget<
  T extends HTMLElement = HTMLElement,
>(): ShallowRef<T | null> {
  return shallowRef<T | null>(null);
}
