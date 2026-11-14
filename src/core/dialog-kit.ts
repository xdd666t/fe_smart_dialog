import { SmartAllDialogType } from '../config/enums';
import type { DialogProxy } from './dialog-proxy';

export class DialogKit {
  private static _instance: DialogKit | null = null;

  static get instance(): DialogKit {
    return (DialogKit._instance ??= new DialogKit());
  }

  checkExist(
    proxy: DialogProxy,
    options: {
      tag?: string;
      dialogTypes?: Iterable<SmartAllDialogType>;
    } = {},
  ): boolean {
    const { tag } = options;
    if (tag !== undefined) {
      for (const item of proxy.dialogQueue) {
        if (item.tag === tag) return true;
      }
      for (const item of proxy.notifyQueue) {
        if (item.tag === tag) return true;
      }
      return false;
    }

    const types = new Set<SmartAllDialogType>(
      options.dialogTypes ?? [
        SmartAllDialogType.custom,
        SmartAllDialogType.attach,
        SmartAllDialogType.loading,
      ],
    );

    let result = false;
    if (types.has(SmartAllDialogType.custom)) {
      result = proxy.config.custom.isExist || result;
    }
    if (types.has(SmartAllDialogType.attach)) {
      result = proxy.config.attach.isExist || result;
    }
    if (types.has(SmartAllDialogType.notify)) {
      result = proxy.config.notify.isExist || result;
    }
    if (types.has(SmartAllDialogType.loading)) {
      result = proxy.config.loading.isExist || result;
    }
    if (types.has(SmartAllDialogType.toast)) {
      result = proxy.config.toast.isExist || result;
    }
    return result;
  }
}
