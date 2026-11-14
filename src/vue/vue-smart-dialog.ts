import type { VNodeChild } from 'vue';
import { SmartDialog as CoreSmartDialog } from '../smart-dialog';
import type {
  AttachAdjustParam,
  AttachParam,
  SmartBuilder,
  SmartCheckExistOptions,
  SmartContent,
  SmartDismissOptions,
  SmartInitOptions,
  SmartShowAttachOptions,
  SmartShowCustomOptions,
  SmartShowLoadingOptions,
  SmartShowNotifyOptions,
  SmartShowToastOptions,
} from '../types/params';
import { normalizeVueInitOptions } from './SmartDialogProvider';
import { ensureVueAdapterRegistered, wrapVueContent } from './vue-adapter';

export type VueSmartBuilder = SmartBuilder<VNodeChild>;

function wrapBuilder(builder: VueSmartBuilder): SmartBuilder<SmartContent> {
  return (ctx) => {
    const result = builder(ctx);
    if (typeof Node !== 'undefined' && result instanceof Node) {
      return result as unknown as SmartContent;
    }
    return wrapVueContent(result);
  };
}

function wrapMask(maskWidget?: VNodeChild): SmartContent | undefined {
  if (maskWidget === undefined) return undefined;
  if (typeof Node !== 'undefined' && maskWidget instanceof Node) {
    return maskWidget as unknown as SmartContent;
  }
  return wrapVueContent(maskWidget);
}

export interface VueSmartShowCustomOptions
  extends Omit<SmartShowCustomOptions<VNodeChild>, 'builder' | 'maskWidget'> {
  builder: VueSmartBuilder;
  maskWidget?: VNodeChild;
}

export interface VueSmartShowAttachOptions
  extends Omit<
    SmartShowAttachOptions<VNodeChild>,
    'builder' | 'adjustBuilder' | 'maskWidget'
  > {
  builder: VueSmartBuilder;
  adjustBuilder?: (param: AttachParam) => AttachAdjustParam<VNodeChild>;
  maskWidget?: VNodeChild;
}

export interface VueSmartShowNotifyOptions
  extends Omit<SmartShowNotifyOptions<VNodeChild>, 'builder' | 'maskWidget'> {
  builder?: VueSmartBuilder;
  maskWidget?: VNodeChild;
}

export interface VueSmartShowLoadingOptions
  extends Omit<SmartShowLoadingOptions<VNodeChild>, 'builder' | 'maskWidget'> {
  builder?: VueSmartBuilder;
  maskWidget?: VNodeChild;
}

export interface VueSmartShowToastOptions
  extends Omit<SmartShowToastOptions<VNodeChild>, 'builder' | 'maskWidget'> {
  builder?: VueSmartBuilder;
  maskWidget?: VNodeChild;
}

export interface VueSmartShowToastObjectOptions
  extends VueSmartShowToastOptions {
  msg: string;
}

/**
 * Vue 3-typed SmartDialog facade. Supports returning VNodes/JSX/render results directly.
 */
export class VueSmartDialog {
  private constructor() {}

  static get config() {
    return CoreSmartDialog.config;
  }

  static set config(value) {
    CoreSmartDialog.config = value;
  }

  static get observer() {
    return CoreSmartDialog.observer;
  }

  static init(options: SmartInitOptions<VNodeChild> = {}): void {
    ensureVueAdapterRegistered();
    CoreSmartDialog.init(normalizeVueInitOptions(options));
  }

  static show<T = unknown>(
    options: VueSmartShowCustomOptions,
  ): Promise<T | undefined> {
    ensureVueAdapterRegistered();
    return CoreSmartDialog.show<T>({
      ...options,
      builder: wrapBuilder(options.builder),
      maskWidget: wrapMask(options.maskWidget),
    });
  }

  static showAttach<T = unknown>(
    options: VueSmartShowAttachOptions,
  ): Promise<T | undefined> {
    ensureVueAdapterRegistered();
    const { adjustBuilder, ...rest } = options;
    return CoreSmartDialog.showAttach<T>({
      ...rest,
      builder: wrapBuilder(options.builder),
      maskWidget: wrapMask(options.maskWidget),
      adjustBuilder: adjustBuilder
        ? (attachParam) => {
            const adj = adjustBuilder(attachParam);
            return {
              alignment: adj.alignment,
              builder: adj.builder ? wrapBuilder(adj.builder) : undefined,
            };
          }
        : undefined,
    });
  }

  static showNotify<T = unknown>(
    options: VueSmartShowNotifyOptions,
  ): Promise<T | undefined> {
    ensureVueAdapterRegistered();
    return CoreSmartDialog.showNotify<T>({
      ...options,
      builder: options.builder ? wrapBuilder(options.builder) : undefined,
      maskWidget: wrapMask(options.maskWidget),
    });
  }

  static showLoading<T = unknown>(
    options: VueSmartShowLoadingOptions = {},
  ): Promise<T | undefined> {
    ensureVueAdapterRegistered();
    return CoreSmartDialog.showLoading<T>({
      ...options,
      builder: options.builder ? wrapBuilder(options.builder) : undefined,
      maskWidget: wrapMask(options.maskWidget),
    });
  }

  static showToast(
    msgOrOptions: string | VueSmartShowToastObjectOptions,
    options?: VueSmartShowToastOptions,
  ): Promise<void> {
    ensureVueAdapterRegistered();
    if (typeof msgOrOptions === 'string') {
      return CoreSmartDialog.showToast(msgOrOptions, {
        ...options,
        builder: options?.builder ? wrapBuilder(options.builder) : undefined,
        maskWidget: wrapMask(options?.maskWidget),
      });
    }
    const { msg, ...rest } = msgOrOptions;
    return CoreSmartDialog.showToast(msg, {
      ...rest,
      builder: rest.builder ? wrapBuilder(rest.builder) : undefined,
      maskWidget: wrapMask(rest.maskWidget),
    });
  }

  static dismiss<T = unknown>(options?: SmartDismissOptions<T>): Promise<void> {
    return CoreSmartDialog.dismiss<T>(options);
  }

  static checkExist(options?: SmartCheckExistOptions): boolean {
    return CoreSmartDialog.checkExist(options);
  }
}
