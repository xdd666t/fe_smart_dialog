import { SmartNonAnimationType } from '../config/enums';
import { RendererRegistry, type MountedContentHandle } from '../core/renderer';
import type {
  SmartOffset,
  SmartRect,
  SmartResolvedOffset,
  SmartSize,
} from '../types/common';
import type { HighlightBuilder, HighlightRegion, SmartContent } from '../types/params';

const SVG_NS = 'http://www.w3.org/2000/svg';

export class HighlightMaskRenderer {
  private customHandle: MountedContentHandle | null = null;
  private renderedMaskEl: HTMLElement | null = null;
  private generatedSvgEl: SVGSVGElement | null = null;
  private generatedCustomEl: HTMLElement | null = null;

  render(options: {
    maskEl: HTMLElement;
    maskColor: string;
    maskWidget?: SmartContent;
    usePenetrate: boolean;
    maskIgnoreArea?: SmartRect;
    highlightBuilder?: HighlightBuilder;
    nonAnimationTypes: SmartNonAnimationType[];
    targetOffset: SmartOffset | SmartResolvedOffset;
    targetSize: SmartSize;
    overlayWidth: number;
    overlayHeight: number;
  }): { skipMaskAnimation: boolean } {
    const {
      maskEl,
      maskColor,
      maskWidget,
      usePenetrate,
      maskIgnoreArea,
      highlightBuilder,
      nonAnimationTypes,
      targetOffset,
      targetSize,
      overlayWidth,
      overlayHeight,
    } = options;

    this.dispose();
    this.renderedMaskEl = maskEl;

    maskEl.style.top = `${maskIgnoreArea?.top ?? 0}px`;
    maskEl.style.right = `${maskIgnoreArea?.right ?? 0}px`;
    maskEl.style.bottom = `${maskIgnoreArea?.bottom ?? 0}px`;
    maskEl.style.left = `${maskIgnoreArea?.left ?? 0}px`;

    if (usePenetrate) {
      maskEl.classList.add('fsd-mask--penetrate');
      maskEl.style.backgroundColor = 'transparent';
      return { skipMaskAnimation: false };
    }

    maskEl.classList.remove('fsd-mask--penetrate');

    if (maskWidget !== undefined && maskWidget !== null) {
      maskEl.style.backgroundColor = 'transparent';
      this.customHandle = RendererRegistry.instance.mount(maskEl, maskWidget);
      return { skipMaskAnimation: false };
    }

    if (!highlightBuilder) {
      maskEl.style.backgroundColor = maskColor;
      return { skipMaskAnimation: false };
    }

    // Spotlight cutout mask via SVG evenodd path
    maskEl.style.backgroundColor = 'transparent';
    const resolvedOffset: SmartResolvedOffset = {
      x: targetOffset.x,
      y: targetOffset.y,
      dx: targetOffset.dx ?? targetOffset.x,
      dy: targetOffset.dy ?? targetOffset.y,
    };
    const region = highlightBuilder(resolvedOffset, targetSize);

    if (typeof HTMLElement !== 'undefined' && region instanceof HTMLElement) {
      this.generatedCustomEl = region;
      maskEl.appendChild(region);
    } else {
      const svg = this.createSvgCutout(
        maskColor,
        region as HighlightRegion,
        maskIgnoreArea,
        overlayWidth,
        overlayHeight,
      );
      this.generatedSvgEl = svg;
      maskEl.appendChild(svg);
    }

    const skipMaskAnimation = nonAnimationTypes.includes(
      SmartNonAnimationType.highlightMask_nonAnimation,
    );
    return { skipMaskAnimation };
  }

  private createSvgCutout(
    maskColor: string,
    region: HighlightRegion,
    maskIgnoreArea: SmartRect | undefined,
    overlayWidth: number,
    overlayHeight: number,
  ): SVGSVGElement {
    const ignoreLeft = maskIgnoreArea?.left ?? 0;
    const ignoreTop = maskIgnoreArea?.top ?? 0;
    const ignoreRight = maskIgnoreArea?.right ?? 0;
    const ignoreBottom = maskIgnoreArea?.bottom ?? 0;

    const width = Math.max(0, overlayWidth - ignoreLeft - ignoreRight);
    const height = Math.max(0, overlayHeight - ignoreTop - ignoreBottom);

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'fsd-mask-svg');
    if (width > 0 && height > 0) {
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.setAttribute('preserveAspectRatio', 'none');
    }

    const x = region.left - ignoreLeft;
    const y = region.top - ignoreTop;
    const w = Math.max(0, region.width);
    const h = Math.max(0, region.height);

    const outerPath = `M 0 0 H ${width} V ${height} H 0 Z`;
    let holePath = '';

    if (region.shape === 'circle') {
      const r = Math.max(w, h) / 2;
      const cx = x + w / 2;
      const cy = y + h / 2;
      if (r > 0) {
        holePath = `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0 Z`;
      }
    } else if (w > 0 && h > 0) {
      const rawRadius =
        typeof region.borderRadius === 'number'
          ? region.borderRadius
          : typeof region.borderRadius === 'string'
            ? parseFloat(region.borderRadius) || 0
            : 0;
      const r = Math.max(0, Math.min(rawRadius, w / 2, h / 2));
      if (r === 0) {
        holePath = `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`;
      } else {
        holePath = [
          `M ${x + r} ${y}`,
          `H ${x + w - r}`,
          `A ${r} ${r} 0 0 1 ${x + w} ${y + r}`,
          `V ${y + h - r}`,
          `A ${r} ${r} 0 0 1 ${x + w - r} ${y + h}`,
          `H ${x + r}`,
          `A ${r} ${r} 0 0 1 ${x} ${y + h - r}`,
          `V ${y + r}`,
          `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
          'Z',
        ].join(' ');
      }
    }

    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('class', 'fsd-mask-svg-path');
    path.setAttribute('fill', maskColor);
    path.setAttribute('fill-rule', 'evenodd');
    path.setAttribute('d', `${outerPath} ${holePath}`.trim());

    svg.appendChild(path);
    return svg;
  }

  dispose(): void {
    this.customHandle?.unmount();
    this.customHandle = null;
    this.generatedSvgEl?.remove();
    this.generatedSvgEl = null;
    this.generatedCustomEl?.remove();
    this.generatedCustomEl = null;
    if (this.renderedMaskEl) {
      this.renderedMaskEl.replaceChildren();
      this.renderedMaskEl = null;
    }
  }
}
