import type { DialogType, SmartBackType } from '../config/enums';
import type { SmartOnBack, SmartTargetRef } from '../types/params';
import type { MainDialogHandle } from './dialog-host';

export interface DialogInfo {
  readonly dialog: MainDialogHandle;
  readonly type: DialogType;
  tag?: string;
  readonly permanent: boolean;
  readonly useSystem: boolean;
  readonly bindPage: boolean;
  readonly route: string | null;
  readonly bindWidget?: SmartTargetRef;
  displayTimer?: ReturnType<typeof setTimeout>;
  backType?: SmartBackType;
  onBack?: SmartOnBack;
}

export interface NotifyInfo {
  readonly dialog: MainDialogHandle;
  tag?: string;
  backType: SmartBackType;
  displayTimer?: ReturnType<typeof setTimeout>;
  onBack?: SmartOnBack;
}

export interface LoadingInfo {
  backType?: SmartBackType;
  onBack?: SmartOnBack;
}
