import { SmartInitType } from '../config/enums';
import { RendererRegistry } from '../core/renderer';
import { injectDefaultStyles } from '../styles/inject';
import type { SmartInitOptions, SmartStyleBuilder } from '../types/params';

const LAYER_ORDER: readonly SmartInitType[] = [
  SmartInitType.custom,
  SmartInitType.attach,
  SmartInitType.notify,
  SmartInitType.loading,
  SmartInitType.toast,
];

const LAYER_OFFSETS: Record<SmartInitType, number> = {
  custom: 0,
  attach: 10,
  notify: 20,
  loading: 30,
  toast: 40,
};

export class OverlayManager {
  private static _instance: OverlayManager | null = null;

  private rootEl: HTMLElement | null = null;
  private styledWrapperEl: HTMLElement | null = null;
  private layers = new Map<SmartInitType, HTMLElement>();

  private containerRef: HTMLElement | string | undefined;
  private zIndexBase = 9999;
  private theme: 'auto' | 'light' | 'dark' = 'auto';
  private shouldInjectStyles = true;
  private styleBuilder: SmartStyleBuilder | undefined;
  private scrollLockOwners = new Set<object>();
  private savedOverflow: { body: string; html: string } | null = null;

  static get instance(): OverlayManager {
    return (OverlayManager._instance ??= new OverlayManager());
  }

  configure(options: SmartInitOptions): void {
    if (options.container !== undefined) {
      this.containerRef = options.container;
    }
    if (options.zIndexBase !== undefined) {
      this.zIndexBase = options.zIndexBase;
    }
    if (options.theme !== undefined) {
      this.theme = options.theme;
    }
    if (options.injectStyles !== undefined) {
      this.shouldInjectStyles = options.injectStyles;
    }
    if (options.styleBuilder !== undefined) {
      this.styleBuilder = options.styleBuilder;
    }

    if (this.rootEl) {
      this.rootEl.setAttribute('data-fsd-theme', this.theme);
      this.applyLayerZIndexes();
    }
  }

  ensureInitialized(enabledTypes: Set<SmartInitType>): void {
    if (typeof document === 'undefined') return;

    if (this.shouldInjectStyles) {
      injectDefaultStyles();
    }

    const host = this.resolveContainer();
    if (!this.rootEl || !this.rootEl.isConnected) {
      this.layers.clear();
      const root = document.createElement('div');
      root.className = 'fsd-root';
      if (host !== document.body && host !== document.documentElement) {
        root.classList.add('fsd-root--scoped');
      }
      root.setAttribute('data-fsd-theme', this.theme);
      root.style.zIndex = String(this.zIndexBase);
      this.rootEl = root;

      if (this.styleBuilder) {
        const innerContainer = document.createElement('div');
        innerContainer.className = 'fsd-style-scope';
        const wrapped = this.styleBuilder(innerContainer);
        if (wrapped instanceof HTMLElement) {
          root.appendChild(wrapped);
          this.styledWrapperEl = innerContainer;
        } else if (wrapped !== undefined && wrapped !== null) {
          const holder = document.createElement('div');
          holder.className = 'fsd-style-scope';
          RendererRegistry.instance.mount(holder, wrapped);
          root.appendChild(holder);
          this.styledWrapperEl = holder;
        } else {
          root.appendChild(innerContainer);
          this.styledWrapperEl = innerContainer;
        }
      } else {
        this.styledWrapperEl = root;
      }

      host.appendChild(root);
    }

    const mountTarget = this.styledWrapperEl ?? this.rootEl;
    for (const layerType of LAYER_ORDER) {
      if (!enabledTypes.has(layerType)) continue;
      if (!this.layers.has(layerType)) {
        const layerEl = document.createElement('div');
        layerEl.className = `fsd-layer fsd-layer--${layerType}`;
        layerEl.setAttribute('data-layer', layerType);
        layerEl.style.zIndex = String(
          this.zIndexBase + LAYER_OFFSETS[layerType],
        );
        this.layers.set(layerType, layerEl);
      }
    }

    // Ensure DOM order matches LAYER_ORDER
    for (const layerType of LAYER_ORDER) {
      const layerEl = this.layers.get(layerType);
      if (layerEl && layerEl.parentElement !== mountTarget) {
        mountTarget.appendChild(layerEl);
      }
    }
  }

  getLayerElement(layerType: SmartInitType): HTMLElement {
    const layer = this.layers.get(layerType);
    if (!layer) {
      this.ensureInitialized(new Set(LAYER_ORDER));
      return this.layers.get(layerType)!;
    }
    return layer;
  }

  getLayerZIndex(layerType: SmartInitType): number {
    return this.zIndexBase + LAYER_OFFSETS[layerType];
  }

  getRootElement(): HTMLElement | null {
    return this.rootEl;
  }

  acquireScrollLock(owner: object): void {
    if (typeof document === 'undefined') return;
    if (this.scrollLockOwners.size === 0) {
      this.savedOverflow = {
        html: document.documentElement.style.overflow,
        body: document.body?.style.overflow ?? '',
      };
      document.documentElement.style.overflow = 'hidden';
      if (document.body) {
        document.body.style.overflow = 'hidden';
      }
    }
    this.scrollLockOwners.add(owner);
  }

  releaseScrollLock(owner: object): void {
    if (typeof document === 'undefined') return;
    this.scrollLockOwners.delete(owner);
    if (this.scrollLockOwners.size === 0 && this.savedOverflow) {
      document.documentElement.style.overflow = this.savedOverflow.html;
      if (document.body) {
        document.body.style.overflow = this.savedOverflow.body;
      }
      this.savedOverflow = null;
    }
  }

  private applyLayerZIndexes(): void {
    if (this.rootEl) {
      this.rootEl.style.zIndex = String(this.zIndexBase);
    }
    for (const [layerType, el] of this.layers.entries()) {
      el.style.zIndex = String(this.zIndexBase + LAYER_OFFSETS[layerType]);
    }
  }

  private resolveContainer(): HTMLElement {
    if (typeof this.containerRef === 'string') {
      const found = document.querySelector(this.containerRef);
      if (found instanceof HTMLElement) return found;
    } else if (
      this.containerRef instanceof HTMLElement &&
      this.containerRef.isConnected
    ) {
      return this.containerRef;
    }
    return document.body ?? document.documentElement;
  }

  resetForTest(): void {
    for (const owner of [...this.scrollLockOwners]) {
      this.releaseScrollLock(owner);
    }
    this.scrollLockOwners.clear();
    this.rootEl?.remove();
    this.rootEl = null;
    this.styledWrapperEl = null;
    this.layers.clear();
    this.containerRef = undefined;
    this.zIndexBase = 9999;
    this.theme = 'auto';
    this.shouldInjectStyles = true;
    this.styleBuilder = undefined;
  }
}
