import { SmartToastType } from '../config/enums';
import type { SmartBuilder, SmartContent } from '../types/params';
import type { MainDialogHandle } from './dialog-host';
import type { DialogProxy } from './dialog-proxy';
import type { DialogScope } from './dialog-scope';

export class ToastInfo {
  readonly type: SmartToastType;
  readonly mainDialog: MainDialogHandle;
  displayTime: number;
  readonly onShow: () => void;
  readonly refreshScope: DialogScope;
  readonly refreshBuilder: SmartBuilder<SmartContent>;

  timer: ReturnType<typeof setTimeout> | null = null;
  shown = false;
  closing = false;
  closed = false;

  private displayResolved = false;
  private displayResolve!: () => void;
  readonly displayPromise: Promise<void>;

  private closeResolved = false;
  private closeResolve!: () => void;
  readonly closePromise: Promise<void>;

  constructor(options: {
    type: SmartToastType;
    mainDialog: MainDialogHandle;
    displayTime: number;
    onShow: () => void;
    refreshScope: DialogScope;
    refreshBuilder: SmartBuilder<SmartContent>;
  }) {
    this.type = options.type;
    this.mainDialog = options.mainDialog;
    this.displayTime = options.displayTime;
    this.onShow = options.onShow;
    this.refreshScope = options.refreshScope;
    this.refreshBuilder = options.refreshBuilder;

    this.displayPromise = new Promise<void>((resolve) => {
      this.displayResolve = resolve;
    });
    this.closePromise = new Promise<void>((resolve) => {
      this.closeResolve = resolve;
    });
  }

  refresh(nextBuilder: SmartBuilder<SmartContent>): void {
    this.refreshScope.setBuilder(nextBuilder);
    this.refreshScope.refresh();
  }

  completeDisplay(): void {
    if (!this.displayResolved) {
      this.displayResolved = true;
      this.displayResolve();
    }
  }

  completeClose(): void {
    if (!this.closeResolved) {
      this.closeResolved = true;
      this.closeResolve();
    }
  }
}

export class ToastTool {
  private static _instance: ToastTool | null = null;
  private proxyRef: DialogProxy | null = null;

  readonly toastQueue: ToastInfo[] = [];
  private readonly multiToasts: ToastInfo[] = [];
  // Includes detached serial toasts until their close animations finish.
  private readonly shownToasts = new Set<ToastInfo>();

  static get instance(): ToastTool {
    return (ToastTool._instance ??= new ToastTool());
  }

  bindProxy(proxy: DialogProxy): void {
    this.proxyRef = proxy;
  }

  show(info: ToastInfo): Promise<void> {
    switch (info.type) {
      case SmartToastType.normal:
        return this.showNormal(info);
      case SmartToastType.last:
        return this.showLast(info);
      case SmartToastType.onlyRefresh:
        return this.showOnlyRefresh(info);
      case SmartToastType.multi:
        return this.showMulti(info);
    }
  }

  async dismiss(options: { closeAll?: boolean } = {}): Promise<void> {
    if (options.closeAll) {
      await this.closeAll();
      return;
    }

    const serial = this.activeSerial;
    if (serial) {
      await this.close(serial, { dispatchNext: true });
      return;
    }

    const lastMulti = this.multiToasts[this.multiToasts.length - 1];
    if (lastMulti) {
      await this.close(lastMulti);
    }
  }

  async dismissInfo(info: ToastInfo): Promise<void> {
    await this.close(info, { dispatchNext: info === this.activeSerial });
  }

  private showNormal(info: ToastInfo): Promise<void> {
    this.toastQueue.push(info);
    if (this.toastQueue.length > 1) {
      return Promise.resolve();
    }
    return this.startSerial(info);
  }

  private showLast(info: ToastInfo): Promise<void> {
    return this.replaceSerial(info);
  }

  private showOnlyRefresh(info: ToastInfo): Promise<void> {
    const active = this.activeSerial;
    if (
      active &&
      active.type === SmartToastType.onlyRefresh &&
      this.toastQueue.length === 1
    ) {
      active.refresh(info.refreshBuilder);
      active.displayTime = info.displayTime;
      this.scheduleSerialTimer(active);
      return Promise.resolve();
    }

    if (this.toastQueue.length === 0) {
      this.toastQueue.push(info);
      void this.startSerial(info);
      return Promise.resolve();
    }

    void this.replaceSerial(info);
    return Promise.resolve();
  }

  private async replaceSerial(info: ToastInfo): Promise<void> {
    const previous = this.detachSerial();
    this.toastQueue.push(info);
    if (previous) {
      await this.close(previous);
    }
    if (info.closed) return;
    await this.startSerial(info);
  }

  private showMulti(info: ToastInfo): Promise<void> {
    this.multiToasts.push(info);
    this.performShow(info);
    info.timer = setTimeout(() => {
      info.completeDisplay();
      void this.close(info);
    }, info.displayTime);
    return Promise.resolve();
  }

  private startSerial(info: ToastInfo): Promise<void> {
    this.performShow(info);
    this.scheduleSerialTimer(info);
    return info.displayPromise;
  }

  private performShow(info: ToastInfo): void {
    if (info.closed || info.shown) return;
    info.shown = true;
    info.onShow();
    this.shownToasts.add(info);
    this.syncExist();
  }

  private scheduleSerialTimer(info: ToastInfo): void {
    if (info.timer !== null) {
      clearTimeout(info.timer);
    }
    info.timer = setTimeout(() => {
      info.completeDisplay();
      void this.close(info, { dispatchNext: true });
    }, info.displayTime);
  }

  private async close(
    info: ToastInfo,
    options: { dispatchNext?: boolean } = {},
  ): Promise<void> {
    if (info.closed) return;
    if (info.closing) return info.closePromise;

    info.closing = true;
    if (info.timer !== null) {
      clearTimeout(info.timer);
      info.timer = null;
    }
    info.completeDisplay();

    if (info.shown) {
      await info.mainDialog.dismiss();
    }

    const qIdx = this.toastQueue.indexOf(info);
    if (qIdx !== -1) this.toastQueue.splice(qIdx, 1);

    const mIdx = this.multiToasts.indexOf(info);
    if (mIdx !== -1) this.multiToasts.splice(mIdx, 1);

    this.shownToasts.delete(info);
    info.closing = false;
    info.closed = true;
    info.completeClose();
    this.syncExist();

    if (options.dispatchNext && this.toastQueue.length > 0) {
      const interval = this.proxyRef?.config.toast.intervalTime ?? 100;
      await new Promise<void>((resolve) => setTimeout(resolve, interval));
      if (this.toastQueue.length === 0) return;
      const next = this.toastQueue[0];
      if (next && !next.shown && !next.closed) {
        void this.startSerial(next);
      }
    }
  }

  private detachSerial(): ToastInfo | null {
    if (this.toastQueue.length === 0) return null;
    const entries = [...this.toastQueue];
    this.toastQueue.length = 0;
    const first = entries[0];
    const active = first && first.shown ? first : null;

    for (const info of entries) {
      if (info === active) continue;
      this.cancelQueued(info);
    }
    this.syncExist();
    return active;
  }

  private async closeAll(): Promise<void> {
    const serial = [...this.toastQueue];
    this.toastQueue.length = 0;
    const first = serial[0];
    const activeSerial = first && first.shown ? first : null;

    for (const info of serial) {
      if (info === activeSerial) continue;
      this.cancelQueued(info);
    }

    const active = [...this.shownToasts];
    await Promise.all(active.map((info) => this.close(info)));
    this.syncExist();
  }

  private cancelQueued(info: ToastInfo): void {
    if (info.timer !== null) {
      clearTimeout(info.timer);
      info.timer = null;
    }
    info.completeDisplay();
    info.closed = true;
    info.completeClose();
  }

  private get activeSerial(): ToastInfo | null {
    if (this.toastQueue.length === 0) return null;
    const first = this.toastQueue[0];
    return first && first.shown && !first.closed ? first : null;
  }

  private syncExist(): void {
    if (this.proxyRef) {
      this.proxyRef.config.toast.isExist = this.shownToasts.size > 0;
    }
  }

  resetForTest(): void {
    const entries = new Set<ToastInfo>([
      ...this.toastQueue,
      ...this.multiToasts,
      ...this.shownToasts,
    ]);
    this.toastQueue.length = 0;
    this.multiToasts.length = 0;
    this.shownToasts.clear();

    for (const info of entries) {
      if (info.timer !== null) {
        clearTimeout(info.timer);
        info.timer = null;
      }
      info.mainDialog.resetForTest();
      info.completeDisplay();
      info.closed = true;
      info.completeClose();
    }
    this.syncExist();
  }
}
