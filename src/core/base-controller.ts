import type { MountedContentHandle } from './renderer';

/**
 * Abstract host controller implemented by DOM dialog widgets for exit animation coordination.
 */
export interface BaseDialogWidgetController {
  dismiss: (closeType: import('../config/enums').CloseType) => Promise<void>;
}

export interface DialogMountBinding {
  hostElement: HTMLElement;
  handle: MountedContentHandle | null;
}
