import {
  Fragment,
  createCommentVNode,
  createTextVNode,
  createVNode,
  defineComponent,
  isVNode,
  markRaw,
  render,
  type AppContext,
  type PropType,
  type VNode,
  type VNodeChild,
} from 'vue';
import {
  RendererRegistry,
  type MountedContentHandle,
} from '../core/renderer';

const VUE_CONTENT_FLAG = '__fsdVueContent';

export interface WrappedVueContent {
  readonly [VUE_CONTENT_FLAG]: true;
  readonly node: VNodeChild;
}

export function wrapVueContent(node: VNodeChild): WrappedVueContent {
  return {
    [VUE_CONTENT_FLAG]: true,
    node,
  };
}

export function isWrappedVueContent(
  value: unknown,
): value is WrappedVueContent {
  return (
    typeof value === 'object' &&
    value !== null &&
    VUE_CONTENT_FLAG in value
  );
}

export function isVueRenderable(value: unknown): boolean {
  if (isWrappedVueContent(value)) return true;
  if (isVNode(value)) return true;
  if (Array.isArray(value) && value.some((item) => isVNode(item))) {
    return true;
  }
  return false;
}

export function normalizeToVNode(value: VNodeChild): VNode {
  if (isVNode(value)) {
    return value;
  }
  if (Array.isArray(value)) {
    return createVNode(Fragment, null, value);
  }
  if (value === null || value === undefined || typeof value === 'boolean') {
    return createCommentVNode('fsd-empty');
  }
  return createTextVNode(String(value));
}

export interface VuePortalSlot {
  readonly id: string;
  readonly host: HTMLElement;
  version: number;
  node: VNodeChild;
}

type VuePortalSubscriber = (slots: VuePortalSlot[]) => void;

class VuePortalRegistry {
  private slots = new Map<string, VuePortalSlot>();
  private subscriber: VuePortalSubscriber | null = null;
  private nextId = 1;

  get hasProvider(): boolean {
    return this.subscriber !== null;
  }

  subscribe(fn: VuePortalSubscriber): () => void {
    this.subscriber = fn;
    fn(this.snapshot());
    return () => {
      if (this.subscriber === fn) {
        this.subscriber = null;
      }
    };
  }

  add(host: HTMLElement, node: VNodeChild): string {
    const id = `fsd-vue-${this.nextId++}`;
    this.slots.set(
      id,
      markRaw({
        id,
        host: markRaw(host),
        version: 1,
        node: isVNode(node) ? markRaw(node) : node,
      }),
    );
    this.emit();
    return id;
  }

  update(id: string, node: VNodeChild): void {
    const slot = this.slots.get(id);
    if (!slot) return;
    slot.node = isVNode(node) ? markRaw(node) : node;
    slot.version += 1;
    this.emit();
  }

  remove(id: string): void {
    if (this.slots.delete(id)) {
      this.emit();
    }
  }

  private snapshot(): VuePortalSlot[] {
    return Array.from(this.slots.values());
  }

  private emit(): void {
    this.subscriber?.(this.snapshot());
  }
}

export const vuePortalRegistry = new VuePortalRegistry();

let storedAppContext: AppContext | null = null;

export function setVueAppContext(appContext: AppContext | null): void {
  storedAppContext = appContext;
}

export function getVueAppContext(): AppContext | null {
  return storedAppContext;
}

const VueDialogShell = defineComponent({
  name: 'FsdVueDialogShell',
  props: {
    node: {
      type: null as unknown as PropType<VNodeChild>,
      required: false,
    },
  },
  setup(props) {
    return () => normalizeToVNode(props.node);
  },
});

let adapterRegistered = false;

export function ensureVueAdapterRegistered(): void {
  if (adapterRegistered) return;
  adapterRegistered = true;

  RendererRegistry.instance.register({
    id: 'vue',
    priority: 95,
    canRender: (content) => isVueRenderable(content),
    mount: (host, content): MountedContentHandle => {
      const extract = (val: unknown): VNodeChild =>
        isWrappedVueContent(val) ? val.node : (val as VNodeChild);

      if (vuePortalRegistry.hasProvider) {
        const slotId = vuePortalRegistry.add(host, extract(content));
        return {
          update(nextContent) {
            vuePortalRegistry.update(slotId, extract(nextContent));
          },
          unmount() {
            vuePortalRegistry.remove(slotId);
          },
        };
      }

      const mountShell = (node: VNodeChild) => {
        const vnode = createVNode(VueDialogShell, { node });
        if (storedAppContext) {
          vnode.appContext = storedAppContext;
        }
        render(vnode, host);
      };

      mountShell(extract(content));

      return {
        update(nextContent) {
          mountShell(extract(nextContent));
        },
        unmount() {
          render(null, host);
        },
      };
    },
  });
}
