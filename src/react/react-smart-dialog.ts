import type { ReactNode } from 'react';
import { SmartDialog as CoreSmartDialog } from '../smart-dialog';
import type {
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
import { normalizeReactInitOptions } from './SmartDialogProvider';
import {
  ensureReactAdapterRegistered,
  wrapReactContent,
} from './react-adapter';

export type ReactSmartBuilder = SmartBuilder<ReactNode>;

function wrapBuilder(builder: ReactSmartBuilder): SmartBuilder<SmartContent> {
  return (ctx) => {
    const result = builder(ctx);
    if (
      typeof Node !== 'undefined' &&
      result instanceof Node
    ) {
      return result as unknown as SmartContent;
    }
    return wrapReactContent(result);
  };
}

export interface ReactSmartShowCustomOptions
  extends Omit<SmartShowCustomOptions<ReactNode>, 'builder' | 'maskWidget'> {
  builder: ReactSmartBuilder;
  maskWidget?: ReactNode;
}

export interface ReactSmartShowAttachOptions
  extends Omit<
    SmartShowAttachOptions<ReactNode>,
    'builder' | 'adjustBuilder' | 'maskWidget'
  > {
  builder: ReactSmartBuilder;
  adjustBuilder?: (
    param: import('../types/params').AttachParam,
  ) => import('../types/params').AttachAdjustParam<ReactNode>;
  maskWidget?: ReactNode;
}

export interface ReactSmartShowNotifyOptions
  extends Omit<SmartShowNotifyOptions<ReactNode>, 'builder' | 'maskWidget'> {
  builder?: ReactSmartBuilder;
  maskWidget?: ReactNode;
}

export interface ReactSmartShowLoadingOptions
  extends Omit<SmartShowLoadingOptions<ReactNode>, 'builder' | 'maskWidget'> {
  builder?: ReactSmartBuilder;
  maskWidget?: ReactNode;
}

export interface ReactSmartShowToastOptions
  extends Omit<SmartShowToastOptions<ReactNode>, 'builder' | 'maskWidget'> {
  builder?: ReactSmartBuilder;
  maskWidget?: ReactNode;
}

export interface ReactSmartShowToastObjectOptions
  extends ReactSmartShowToastOptions {
  msg: string;
}

function wrapMask(maskWidget?: ReactNode): SmartContent | undefined {
  if (maskWidget === undefined) return undefined;
  if (typeof Node !== 'undefined' && maskWidget instanceof Node) {
    return maskWidget as unknown as SmartContent;
  }
  return wrapReactContent(maskWidget);
}

/**
 * React-typed SmartDialog facade. Supports returning JSX directly in `builder` and `maskWidget`.
 */
export class ReactSmartDialog {
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

  static init(options: SmartInitOptions<ReactNode> = {}): void {
    ensureReactAdapterRegistered();
    CoreSmartDialog.init(normalizeReactInitOptions(options));
  }

  static show<T = unknown>(
    options: ReactSmartShowCustomOptions,
  ): Promise<T | undefined> {
    ensureReactAdapterRegistered();
    return CoreSmartDialog.show<T>({
      ...options,
      builder: wrapBuilder(options.builder),
      maskWidget: wrapMask(options.maskWidget),
    });
  }

  static showAttach<T = unknown>(
    options: ReactSmartShowAttachOptions,
  ): Promise<T | undefined> {
    ensureReactAdapterRegistered();
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
    options: ReactSmartShowNotifyOptions,
  ): Promise<T | undefined> {
    ensureReactAdapterRegistered();
    return CoreSmartDialog.showNotify<T>({
      ...options,
      builder: options.builder ? wrapBuilder(options.builder) : undefined,
      maskWidget: wrapMask(options.maskWidget),
    });
  }

  static showLoading<T = unknown>(
    options: ReactSmartShowLoadingOptions = {},
  ): Promise<T | undefined> {
    ensureReactAdapterRegistered();
    return CoreSmartDialog.showLoading<T>({
      ...options,
      builder: options.builder ? wrapBuilder(options.builder) : undefined,
      maskWidget: wrapMask(options.maskWidget),
    });
  }

  static showToast(
    msgOrOptions: string | ReactSmartShowToastObjectOptions,
    options?: ReactSmartShowToastOptions,
  ): Promise<void> {
    ensureReactAdapterRegistered();
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
