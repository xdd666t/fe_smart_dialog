import type { SmartContent } from '../types/params';

export interface MountedContentHandle {
  update: (content: SmartContent) => void;
  unmount: () => void;
}

export interface FrameworkRendererAdapter {
  readonly id: string;
  readonly priority: number;
  canRender: (content: unknown) => boolean;
  mount: (host: HTMLElement, content: unknown) => MountedContentHandle;
}

/**
 * Pluggable content renderer registry allowing Vanilla DOM/HTML, React Portals,
 * and Vue Teleports to share one core dialog engine.
 */
export class RendererRegistry {
  private static _instance: RendererRegistry | null = null;
  private adapters: FrameworkRendererAdapter[] = [];

  static get instance(): RendererRegistry {
    return (RendererRegistry._instance ??= new RendererRegistry());
  }

  register(adapter: FrameworkRendererAdapter): () => void {
    this.adapters = this.adapters
      .filter((item) => item.id !== adapter.id)
      .concat(adapter)
      .sort((a, b) => b.priority - a.priority);

    return () => {
      this.adapters = this.adapters.filter((item) => item.id !== adapter.id);
    };
  }

  mount(host: HTMLElement, content: SmartContent): MountedContentHandle {
    let activeAdapterId = this.resolveAdapterId(content);
    let innerHandle = this.mountWithAdapter(activeAdapterId, host, content);

    return {
      update: (nextContent: SmartContent) => {
        const nextAdapterId = this.resolveAdapterId(nextContent);
        if (nextAdapterId === activeAdapterId) {
          innerHandle.update(nextContent);
          return;
        }
        innerHandle.unmount();
        activeAdapterId = nextAdapterId;
        innerHandle = this.mountWithAdapter(nextAdapterId, host, nextContent);
      },
      unmount: () => {
        innerHandle.unmount();
      },
    };
  }

  private resolveAdapterId(content: unknown): string {
    for (const adapter of this.adapters) {
      if (adapter.canRender(content)) {
        return adapter.id;
      }
    }
    return 'vanilla';
  }

  private mountWithAdapter(
    adapterId: string,
    host: HTMLElement,
    content: SmartContent,
  ): MountedContentHandle {
    if (adapterId !== 'vanilla') {
      const adapter = this.adapters.find((item) => item.id === adapterId);
      if (adapter) {
        return adapter.mount(host, content);
      }
    }
    return mountVanillaContent(host, content);
  }
}

export function mountVanillaContent(
  host: HTMLElement,
  initialContent: SmartContent,
): MountedContentHandle {
  const apply = (content: SmartContent) => {
    host.replaceChildren();
    if (content === null || content === undefined) {
      return;
    }
    if (typeof Node !== 'undefined' && content instanceof Node) {
      host.appendChild(content);
      return;
    }
    if (typeof content === 'string') {
      const span = document.createElement('span');
      span.className = 'fsd-text-node';
      span.textContent = content;
      host.appendChild(span);
      return;
    }
    // Fallback stringification for unexpected objects without adapter
    const span = document.createElement('span');
    span.className = 'fsd-text-node';
    span.textContent = String(content);
    host.appendChild(span);
  };

  apply(initialContent);

  return {
    update(nextContent: SmartContent) {
      apply(nextContent);
    },
    unmount() {
      host.replaceChildren();
    },
  };
}
