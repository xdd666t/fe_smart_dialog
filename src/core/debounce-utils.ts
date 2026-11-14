import type { DialogProxy } from './dialog-proxy';

export type DebounceType = 'custom' | 'attach' | 'notify' | 'toast' | 'mask';

/**
 * Leading-edge debounce utility matching Flutter SmartDialog's behavior.
 */
export class DebounceUtils {
  private static _instance: DebounceUtils | null = null;
  private readonly timestamps = new Map<DebounceType, number>();
  private proxyRef: DialogProxy | null = null;

  static get instance(): DebounceUtils {
    return (DebounceUtils._instance ??= new DebounceUtils());
  }

  bindProxy(proxy: DialogProxy): void {
    this.proxyRef = proxy;
  }

  banContinue(type: DebounceType, debounce: boolean): boolean {
    if (!debounce) return false;

    const config = this.proxyRef?.config;
    const limitTime = (() => {
      switch (type) {
        case 'custom':
          return config?.custom.debounceTime ?? 300;
        case 'attach':
          return config?.attach.debounceTime ?? 300;
        case 'notify':
          return config?.notify.debounceTime ?? 300;
        case 'toast':
          return config?.toast.debounceTime ?? 300;
        case 'mask':
          return 500;
      }
    })();

    const now = Date.now();
    const lastTime = this.timestamps.get(type);
    this.timestamps.set(type, now);

    if (lastTime !== undefined) {
      return now - lastTime < limitTime;
    }
    return false;
  }

  resetForTest(): void {
    this.timestamps.clear();
  }
}
