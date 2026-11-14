import { isValidElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  RendererRegistry,
  type MountedContentHandle,
} from '../core/renderer';

const REACT_CONTENT_FLAG = '__fsdReactContent';

export interface WrappedReactContent {
  readonly [REACT_CONTENT_FLAG]: true;
  readonly node: ReactNode;
}

export function wrapReactContent(node: ReactNode): WrappedReactContent {
  return {
    [REACT_CONTENT_FLAG]: true,
    node,
  };
}

export function isWrappedReactContent(
  value: unknown,
): value is WrappedReactContent {
  return (
    typeof value === 'object' &&
    value !== null &&
    REACT_CONTENT_FLAG in value
  );
}

export function isReactRenderable(value: unknown): boolean {
  if (isWrappedReactContent(value)) return true;
  if (isValidElement(value)) return true;
  if (Array.isArray(value) && value.some((item) => isValidElement(item))) {
    return true;
  }
  return false;
}

export interface ReactPortalSlot {
  readonly id: string;
  readonly host: HTMLElement;
  node: ReactNode;
}

type PortalSubscriber = (slots: ReactPortalSlot[]) => void;

class ReactPortalRegistry {
  private slots = new Map<string, ReactPortalSlot>();
  private subscriber: PortalSubscriber | null = null;
  private nextId = 1;

  get hasProvider(): boolean {
    return this.subscriber !== null;
  }

  subscribe(fn: PortalSubscriber): () => void {
    this.subscriber = fn;
    fn(Array.from(this.slots.values()));
    return () => {
      if (this.subscriber === fn) {
        this.subscriber = null;
      }
    };
  }

  add(host: HTMLElement, node: ReactNode): string {
    const id = `fsd-react-${this.nextId++}`;
    this.slots.set(id, { id, host, node });
    this.emit();
    return id;
  }

  update(id: string, node: ReactNode): void {
    const slot = this.slots.get(id);
    if (!slot) return;
    slot.node = node;
    this.emit();
  }

  remove(id: string): void {
    if (this.slots.delete(id)) {
      this.emit();
    }
  }

  private emit(): void {
    this.subscriber?.(Array.from(this.slots.values()));
  }
}

export const reactPortalRegistry = new ReactPortalRegistry();

let adapterRegistered = false;

export function ensureReactAdapterRegistered(): void {
  if (adapterRegistered) return;
  adapterRegistered = true;

  RendererRegistry.instance.register({
    id: 'react',
    priority: 100,
    canRender: (content) => isReactRenderable(content),
    mount: (host, content): MountedContentHandle => {
      const extract = (val: unknown): ReactNode =>
        isWrappedReactContent(val) ? val.node : (val as ReactNode);

      if (reactPortalRegistry.hasProvider) {
        const slotId = reactPortalRegistry.add(host, extract(content));
        return {
          update(nextContent) {
            reactPortalRegistry.update(slotId, extract(nextContent));
          },
          unmount() {
            reactPortalRegistry.remove(slotId);
          },
        };
      }

      // Standalone fallback when SmartDialogProvider is not mounted
      let root: Root | null = createRoot(host);
      root.render(extract(content));

      return {
        update(nextContent) {
          root?.render(extract(nextContent));
        },
        unmount() {
          const targetRoot = root;
          root = null;
          if (targetRoot) {
            queueMicrotask(() => {
              targetRoot.unmount();
            });
          }
        },
      };
    },
  });
}
