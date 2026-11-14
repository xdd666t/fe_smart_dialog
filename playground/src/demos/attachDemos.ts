import {
  Alignment,
  AttachAdjustParam,
  Offset,
  SmartAnimationType,
  SmartAttachAlignmentType,
  SmartDialog,
  SmartNonAnimationType,
  SmartStatus,
  type SmartPresetAlignment,
} from 'fe-smart-dialog';
import type { DemoEntry } from '../types/demo';

function randomHslColor(): string {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 76%, 52%)`;
}

export const ATTACH_DEMOS: DemoEntry[] = [
  {
    id: 'attach-location',
    className: 'AttachDialogLocation',
    category: 'attach',
    route: '/attach/location',
    label: 'location',
    description:
      '参考 flutter_use AttachDialogLocation：9 方位贴靠 + SmartAttachAlignmentType (inside/center/outside) + allOpen/allClose + 可滚动锚点跟随。',
    code: `import { Alignment, SmartAttachAlignmentType, SmartDialog } from 'fe-smart-dialog';

SmartDialog.config.attach.attachAlignmentType = SmartAttachAlignmentType.outside;

SmartDialog.showAttach({
  targetContext: anchorElement, // 别名：targetElement
  alignment: Alignment.topLeft,
  usePenetrate: true,
  clickMaskDismiss: false,
  builder: () => popoverEl,
});`,
    mount(stage, ctx) {
      stage.innerHTML = `
        <div class="pg-card">
          <h4>9 方位 &amp; AlignmentType 快捷触发</h4>
          <div class="pg-actions" style="margin-bottom: 10px;">
            <select class="pg-select" data-testid="attach-alignment-select">
              <option value="bottomCenter">bottomCenter</option>
              <option value="topLeft">topLeft</option>
              <option value="topCenter">topCenter</option>
              <option value="topRight">topRight</option>
              <option value="centerLeft">centerLeft</option>
              <option value="center">center</option>
              <option value="centerRight">centerRight</option>
              <option value="bottomLeft">bottomLeft</option>
              <option value="bottomRight">bottomRight</option>
            </select>
            <select class="pg-select" data-testid="attach-mode-select">
              <option value="center">center</option>
              <option value="inside">inside</option>
              <option value="outside">outside</option>
            </select>
            <button class="pg-btn pg-btn--primary" data-testid="attach-anchor-btn">Attach Anchor</button>
          </div>
          <div class="pg-actions">
            <button class="pg-btn pg-btn--sm" data-testid="btn-attach-modal-grid">打开 flutter_use 九宫格控制台</button>
          </div>
        </div>

        <div class="pg-scroll-box" data-testid="attach-scroll-box">
          <div class="pg-scroll-spacer">
            <span>Top of Scroll Container</span>
            <button class="pg-btn" data-testid="scroll-attach-anchor">Scrollable Anchor</button>
            <span>Bottom of Scroll Container</span>
          </div>
        </div>
      `;

      const alignSel = stage.querySelector(
        '[data-testid="attach-alignment-select"]',
      ) as HTMLSelectElement;
      const modeSel = stage.querySelector(
        '[data-testid="attach-mode-select"]',
      ) as HTMLSelectElement;
      const anchorBtn = stage.querySelector(
        '[data-testid="attach-anchor-btn"]',
      ) as HTMLButtonElement;
      const scrollAnchor = stage.querySelector(
        '[data-testid="scroll-attach-anchor"]',
      ) as HTMLButtonElement;
      const openGridBtn = stage.querySelector(
        '[data-testid="btn-attach-modal-grid"]',
      ) as HTMLButtonElement;

      anchorBtn.onclick = () => {
        SmartDialog.config.attach.attachAlignmentType =
          modeSel.value as SmartAttachAlignmentType;
        const align = alignSel.value as SmartPresetAlignment;
        ctx.log(`showAttach(${align}, ${modeSel.value})`);
        void SmartDialog.showAttach({
          targetContext: anchorBtn,
          alignment: Alignment[align],
          useAnimation: false,
          builder: () => {
            const pop = document.createElement('div');
            pop.className = 'pg-popover';
            pop.setAttribute('data-testid', 'attach-popover');
            pop.textContent = `Attach (${align} / ${modeSel.value})`;
            return pop;
          },
        });
      };

      scrollAnchor.onclick = () => {
        ctx.log('showAttach(scroll tracking)');
        void SmartDialog.showAttach({
          targetContext: scrollAnchor,
          alignment: Alignment.topCenter,
          usePenetrate: true,
          clickMaskDismiss: false,
          useAnimation: false,
          adjustBuilder: (param) => {
            if (param.selfOffset.y < 10) {
              return new AttachAdjustParam({ alignment: Alignment.bottomCenter });
            }
            return new AttachAdjustParam();
          },
          builder: () => {
            const pop = document.createElement('div');
            pop.className = 'pg-popover';
            pop.setAttribute('data-testid', 'scroll-attach-popover');
            pop.textContent = 'Tracks scroll automatically';
            return pop;
          },
        });
      };

      openGridBtn.onclick = () => {
        const alignNames: SmartPresetAlignment[] = [
          'topLeft',
          'topCenter',
          'topRight',
          'centerLeft',
          'center',
          'centerRight',
          'bottomLeft',
          'bottomCenter',
          'bottomRight',
        ];
        void SmartDialog.show({
          onDismiss: () => {
            SmartDialog.config.attach.attachAlignmentType =
              SmartAttachAlignmentType.center;
            void SmartDialog.dismiss({ status: SmartStatus.allAttach });
          },
          builder: () => {
            const wrap = document.createElement('div');
            wrap.className = 'pg-dialog-box';
            wrap.style.maxWidth = '540px';
            wrap.innerHTML = '<h4 style="margin:0 0 10px;">SmartAttach 9-Location Matrix</h4>';

            const radioBar = document.createElement('div');
            radioBar.className = 'pg-actions';
            radioBar.style.marginBottom = '14px';
            for (const mode of Object.values(SmartAttachAlignmentType)) {
              const label = document.createElement('label');
              label.style.cssText = 'display:inline-flex;align-items:center;gap:4px;font-size:12px;cursor:pointer;';
              const input = document.createElement('input');
              input.type = 'radio';
              input.name = 'attach-type-radio';
              input.checked = SmartDialog.config.attach.attachAlignmentType === mode;
              input.onchange = () => {
                SmartDialog.config.attach.attachAlignmentType = mode;
              };
              label.append(input, document.createTextNode(mode));
              radioBar.appendChild(label);
            }
            wrap.appendChild(radioBar);

            const grid = document.createElement('div');
            grid.style.cssText =
              'display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:14px;';
            const btnEls: Array<{ btn: HTMLButtonElement; align: SmartPresetAlignment }> = [];

            for (const name of alignNames) {
              const btn = document.createElement('button');
              btn.className = 'pg-btn pg-btn--sm';
              btn.textContent = name;
              btn.onclick = () => {
                void SmartDialog.showAttach({
                  targetContext: btn,
                  alignment: Alignment[name],
                  usePenetrate: true,
                  clickMaskDismiss: false,
                  builder: () => {
                    const dot = document.createElement('div');
                    dot.style.cssText = `width:56px;height:56px;border-radius:8px;background:${randomHslColor()};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;`;
                    dot.textContent = name;
                    return dot;
                  },
                });
              };
              btnEls.push({ btn, align: name });
              grid.appendChild(btn);
            }

            const footer = document.createElement('div');
            footer.className = 'pg-actions';
            const allOpen = document.createElement('button');
            allOpen.className = 'pg-btn pg-btn--primary pg-btn--sm';
            allOpen.textContent = 'allOpen';
            allOpen.onclick = async () => {
              for (const item of btnEls) {
                item.btn.click();
                await new Promise((r) => setTimeout(r, 120));
              }
            };
            const allClose = document.createElement('button');
            allClose.className = 'pg-btn pg-btn--danger pg-btn--sm';
            allClose.textContent = 'allClose';
            allClose.onclick = () =>
              void SmartDialog.dismiss({ status: SmartStatus.allAttach });
            footer.append(allOpen, allClose);

            wrap.append(grid, footer);
            return wrap;
          },
        });
      };

      return () => {
        SmartDialog.config.attach.attachAlignmentType =
          SmartAttachAlignmentType.center;
        void SmartDialog.dismiss({ status: SmartStatus.allAttach, force: true });
      };
    },
  },

  {
    id: 'attach-point',
    className: 'AttachDialogPoint',
    category: 'attach',
    route: '/attach/point',
    label: 'point',
    description:
      '参考 flutter_use AttachDialogPoint：无需指定 DOM 元素，直接在画布任意坐标触发 targetBuilder 坐标定位气泡。',
    code: `import { Alignment, Offset, SmartDialog } from 'fe-smart-dialog';

padElement.addEventListener('pointerdown', (e) => {
  SmartDialog.showAttach({
    targetContext: null,
    targetBuilder: () => new Offset(e.clientX, e.clientY),
    alignment: Alignment.topCenter,
    keepSingle: true,
    usePenetrate: true,
    clickMaskDismiss: false,
    builder: () => dotBox,
  });
});`,
    mount(stage, ctx) {
      stage.innerHTML = `
        <div class="pg-inline-point-pad" data-testid="point-pad">
          <strong>click anywhere in this box</strong>
          <span style="font-size:12px;">以鼠标坐标为目标位置通过 targetBuilder 弹出随机方框</span>
        </div>
        <button class="pg-btn pg-btn--sm" data-testid="btn-point-modal">打开大尺寸弹窗画布</button>
      `;

      const spawnAtPoint = (clientX: number, clientY: number) => {
        const alignments = [
          Alignment.topCenter,
          Alignment.centerLeft,
          Alignment.center,
          Alignment.centerRight,
          Alignment.bottomCenter,
        ];
        const align =
          alignments[Math.floor(Math.random() * alignments.length)]!;
        ctx.log(`point (${Math.round(clientX)}, ${Math.round(clientY)})`);
        void SmartDialog.showAttach({
          targetContext: null,
          targetBuilder: () => new Offset(clientX, clientY),
          usePenetrate: true,
          clickMaskDismiss: false,
          alignment: align,
          keepSingle: true,
          builder: () => {
            const box = document.createElement('div');
            box.style.cssText = `width:76px;height:76px;border-radius:10px;background:${randomHslColor()};box-shadow:0 8px 20px rgba(0,0,0,0.2);`;
            return box;
          },
        });
      };

      const inlinePad = stage.querySelector(
        '[data-testid="point-pad"]',
      ) as HTMLElement;
      inlinePad.addEventListener('pointerdown', (e) => {
        spawnAtPoint(e.clientX, e.clientY);
      });

      (
        stage.querySelector('[data-testid="btn-point-modal"]') as HTMLButtonElement
      ).onclick = () => {
        void SmartDialog.show({
          clickMaskDismiss: false,
          onMask: () => void SmartDialog.dismiss({ status: SmartStatus.allDialog }),
          builder: () => {
            const wrap = document.createElement('div');
            wrap.className = 'pg-dialog-box';
            wrap.style.maxWidth = '520px';
            const pad = document.createElement('div');
            pad.className = 'pg-point-canvas';
            pad.textContent = 'click me anywhere (点空白遮罩退出)';
            pad.addEventListener('pointerdown', (e) =>
              spawnAtPoint(e.clientX, e.clientY),
            );
            wrap.appendChild(pad);
            return wrap;
          },
        });
      };

      return () => {
        void SmartDialog.dismiss({ status: SmartStatus.allAttach, force: true });
      };
    },
  },

  {
    id: 'attach-target',
    className: 'AttachDialogTarget',
    category: 'attach',
    route: '/attach/target',
    label: 'target',
    description:
      '参考 flutter_use AttachDialogTarget：凭空定位到视口左右缘指定坐标序列滑出，不依赖真实宿主组件。',
    code: `import { Alignment, Offset, SmartDialog } from 'fe-smart-dialog';

SmartDialog.showAttach({
  targetContext: null,
  targetBuilder: () => new Offset(0, 140),
  alignment: Alignment.centerRight,
  usePenetrate: true,
  builder: () => floatingTagCard,
});`,
    mount(stage, ctx) {
      let cancelled = false;
      stage.innerHTML = `
        <button class="pg-btn pg-btn--primary pg-btn--elevated" data-testid="btn-attach-target">click me（从视口左右边缘滑出）</button>
      `;

      const titles = [
        'Layer 1 · Custom Stack',
        'Layer 2 · Attach Anchor',
        'Layer 3 · Semantic Notify',
        'Layer 4 · Singleton Loading',
        'Edge Right · Top Toast Viewport',
      ];

      (
        stage.querySelector('[data-testid="btn-attach-target"]') as HTMLButtonElement
      ).onclick = async () => {
        cancelled = false;
        const positions = [120, 200, 280, 360, 440];
        for (let i = 0; i < positions.length; i += 1) {
          if (cancelled) return;
          const left = i < 4;
          const x = left ? 0 : window.innerWidth;
          const y = positions[i]!;
          ctx.log(`target Offset(${x}, ${y})`);
          void SmartDialog.showAttach({
            targetContext: null,
            targetBuilder: () => new Offset(x, y),
            usePenetrate: true,
            clickMaskDismiss: false,
            alignment: left ? Alignment.centerRight : Alignment.centerLeft,
            builder: ({ dismiss }) => {
              const card = document.createElement('div');
              card.className = 'pg-dialog-box';
              card.style.cssText = `min-width:190px;padding:10px 14px;border-radius:${left ? '0 16px 16px 0' : '16px 0 0 16px'};border-left:${left ? 'none' : '4px solid var(--pg-primary)'};border-right:${left ? '4px solid var(--pg-primary)' : 'none'};cursor:pointer;`;
              card.textContent = titles[i]!;
              card.onclick = () => void dismiss();
              return card;
            },
          });
          await new Promise((r) => setTimeout(r, 420));
        }
      };

      return () => {
        cancelled = true;
        void SmartDialog.dismiss({ status: SmartStatus.allAttach, force: true });
      };
    },
  },

  {
    id: 'attach-imitate',
    className: 'AttachDialogImitate',
    category: 'attach',
    route: '/attach/imitate',
    label: 'imitate',
    description:
      '参考 flutter_use AttachDialogImitate：使用 showAttach 高仿下拉选择菜单，支持点击遮罩零闪烁直关 (maskClose_nonAnimation)。',
    code: `import { Alignment, SmartDialog, SmartNonAnimationType } from 'fe-smart-dialog';

SmartDialog.showAttach({
  targetContext: triggerEl,
  alignment: Alignment.bottomCenter,
  nonAnimationTypes: [SmartNonAnimationType.maskClose_nonAnimation],
  maskColor: 'transparent',
  builder: ({ dismiss }) => dropdownMenuList,
});`,
    mount(stage, ctx) {
      let current = '小呆呆';
      const choices = ['小呆呆', '小菲菲', '小猪猪', '懒羊羊'];

      stage.innerHTML = `
        <div class="pg-card">
          <h4>对比原生 Select vs SmartAttach 下拉器</h4>
          <div class="pg-actions" style="justify-content:space-around;">
            <select class="pg-select">
              <option>原生: 小呆呆</option>
              <option>原生: 小菲菲</option>
              <option>原生: 小猪猪</option>
            </select>
            <button class="pg-btn pg-btn--primary" data-testid="btn-imitate-dropdown">
              Attach: <span data-testid="imitate-val">${current}</span> ▾
            </button>
          </div>
        </div>
      `;

      const trigger = stage.querySelector(
        '[data-testid="btn-imitate-dropdown"]',
      ) as HTMLButtonElement;
      const valSpan = stage.querySelector(
        '[data-testid="imitate-val"]',
      ) as HTMLElement;

      trigger.onclick = () => {
        ctx.log('open imitate Dropdown Attach');
        void SmartDialog.showAttach({
          targetContext: trigger,
          alignment: Alignment.bottomCenter,
          maskColor: 'transparent',
          nonAnimationTypes: [SmartNonAnimationType.maskClose_nonAnimation],
          builder: ({ dismiss }) => {
            const menu = document.createElement('div');
            menu.className = 'pg-dialog-box';
            menu.style.cssText =
              'min-width:160px;padding:6px;display:flex;flex-direction:column;gap:4px;';
            for (const item of choices) {
              const row = document.createElement('button');
              row.className = `pg-btn pg-btn--sm ${item === current ? 'pg-btn--primary' : ''}`;
              row.style.justifyContent = 'flex-start';
              row.textContent = item;
              row.onclick = () => {
                current = item;
                valSpan.textContent = item;
                ctx.log(`selected: ${item}`);
                void dismiss();
              };
              menu.appendChild(row);
            }
            return menu;
          },
        });
      };
    },
  },

  {
    id: 'attach-business',
    className: 'AttachDialogBusiness',
    category: 'attach',
    route: '/attach/business',
    label: 'business',
    description:
      '参考 flutter_use AttachDialogBusiness：常见业务双栏演示——上方筛选 bar 下拉展开，下方栏上拉展开，配合 highlightBuilder 高亮保留栏区域。',
    code: `import { Alignment, SmartDialog } from 'fe-smart-dialog';

// 下拉筛选面板，并用 highlightBuilder 保持顶部操作栏高亮不暗
SmartDialog.showAttach({
  targetContext: topBarEl,
  alignment: Alignment.bottomCenter,
  highlightBuilder: (offset, size) => ({
    left: offset.dx,
    top: offset.dy,
    width: size.width,
    height: size.height,
  }),
  builder: () => listPanel,
});`,
    mount(stage, ctx) {
      stage.innerHTML = `
        <button class="pg-btn pg-btn--primary pg-btn--elevated" data-testid="btn-attach-business">click me（打开双业务模拟屏）</button>
      `;

      const items = ['小呆呆', '小菲菲', '小猪猪', '懒羊羊', '慢羊羊'];

      const buildListCard = (width: number) => {
        const list = document.createElement('div');
        list.className = 'pg-dialog-box';
        list.style.cssText = `width:${width}px;min-width:${width}px;padding:8px;border-radius:0;`;
        for (const name of items) {
          const row = document.createElement('div');
          row.style.cssText =
            'padding:8px 12px;border-bottom:1px solid var(--pg-border);text-align:center;cursor:pointer;';
          row.textContent = name;
          row.onclick = () => {
            void SmartDialog.showToast(`Selected ${name}`);
            void SmartDialog.dismiss({ status: SmartStatus.allAttach });
          };
          list.appendChild(row);
        }
        return list;
      };

      (
        stage.querySelector('[data-testid="btn-attach-business"]') as HTMLButtonElement
      ).onclick = () => {
        void SmartDialog.show({
          builder: () => {
            const split = document.createElement('div');
            split.className = 'pg-biz-split';

            // Business A (Top Bar Dropdown)
            const phoneA = document.createElement('div');
            phoneA.className = 'pg-biz-phone';
            phoneA.innerHTML = '<div class="pg-biz-header">Business A（顶栏下拉）</div>';
            const barA = document.createElement('div');
            barA.className = 'pg-biz-bar';
            barA.textContent = '下拉弹窗 ▾';
            barA.onclick = () => {
              const rect = phoneA.getBoundingClientRect();
              const barRect = barA.getBoundingClientRect();
              ctx.log('Business A dropdown attached');
              void SmartDialog.showAttach({
                targetContext: barA,
                alignment: Alignment.bottomCenter,
                highlightBuilder: () => ({
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: barRect.bottom - rect.top,
                }),
                builder: () => buildListCard(280),
              });
            };
            phoneA.appendChild(barA);

            // Business B (Bottom Bar Dropup)
            const phoneB = document.createElement('div');
            phoneB.className = 'pg-biz-phone';
            phoneB.innerHTML =
              '<div class="pg-biz-header">Business B（底栏上弹）</div><div style="flex:1;"></div>';
            const barB = document.createElement('div');
            barB.className = 'pg-biz-bar';
            barB.textContent = '上弹弹窗 ▴';
            barB.onclick = () => {
              const rect = barB.getBoundingClientRect();
              ctx.log('Business B dropup attached');
              void SmartDialog.showAttach({
                targetContext: barB,
                alignment: Alignment.topCenter,
                highlightBuilder: () => ({
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height,
                }),
                builder: () => buildListCard(280),
              });
            };
            phoneB.appendChild(barB);

            split.append(phoneA, phoneB);
            return split;
          },
        });
      };
    },
  },

  {
    id: 'attach-guide',
    className: 'AttachDialogGuide',
    category: 'attach',
    route: '/attach/guide',
    label: 'guide',
    description:
      '参考 flutter_use AttachDialogGuide：两步 SVG evenodd 聚光灯高亮引导（圆形切口 -> 圆角矩形切口），使用 keepSingle 丝滑切换。',
    code: `import { Alignment, SmartDialog, SmartNonAnimationType } from 'fe-smart-dialog';

SmartDialog.showAttach({
  tag: 'spotlight-tour',
  keepSingle: true,
  targetContext: stepTargetEl,
  alignment: Alignment.bottomCenter,
  nonAnimationTypes: [
    SmartNonAnimationType.highlightMask_nonAnimation,
    SmartNonAnimationType.continueKeepSingle,
  ],
  highlightBuilder: (offset, size) => ({
    left: offset.dx - 6,
    top: offset.dy - 6,
    width: size.width + 12,
    height: size.height + 12,
    borderRadius: 10,
    shape: step === 1 ? 'circle' : 'rect',
  }),
  builder: () => tourPopoverCard,
});`,
    mount(stage, ctx) {
      stage.innerHTML = `
        <div class="pg-card">
          <h4>SVG Spotlight 镂空引导</h4>
          <p>点击 Start 2-Step Tour 体验圆形高亮与圆角矩形高亮平滑衔接。</p>
          <div class="pg-actions" style="margin-bottom: 16px;">
            <button class="pg-btn pg-btn--primary" data-testid="btn-start-tour">Start 2-Step Tour</button>
          </div>
          <div class="pg-actions" style="justify-content: space-between;">
            <button class="pg-btn" data-testid="tour-step-1">Feature Button (Circle)</button>
            <button class="pg-btn" data-testid="tour-step-2">Export Report (Rect)</button>
          </div>
        </div>
      `;

      const step1Btn = stage.querySelector(
        '[data-testid="tour-step-1"]',
      ) as HTMLButtonElement;
      const step2Btn = stage.querySelector(
        '[data-testid="tour-step-2"]',
      ) as HTMLButtonElement;

      const showTourStep = (step: 1 | 2) => {
        const target = step === 1 ? step1Btn : step2Btn;
        ctx.log(`tour step ${step}/2`);
        void SmartDialog.showAttach({
          tag: 'spotlight-tour',
          keepSingle: true,
          targetContext: target,
          alignment: Alignment.bottomCenter,
          useAnimation: false,
          nonAnimationTypes: [
            SmartNonAnimationType.highlightMask_nonAnimation,
            SmartNonAnimationType.continueKeepSingle,
          ],
          highlightBuilder: (offset, size) => ({
            left: offset.dx - 6,
            top: offset.dy - 6,
            width: size.width + 12,
            height: size.height + 12,
            borderRadius: 10,
            shape: step === 1 ? 'circle' : 'rect',
          }),
          builder: ({ dismiss }) => {
            const box = document.createElement('div');
            box.className = 'pg-dialog-box';
            box.setAttribute('data-testid', `tour-card-${step}`);
            box.innerHTML = `<h4 style="margin:0 0 6px;">Tour Step ${step} of 2</h4><p style="margin:0 0 12px;">${step === 1 ? 'Circular Spotlight Cutout' : 'Rounded Rect Cutout'}</p>`;
            const actionBtn = document.createElement('button');
            actionBtn.className = 'pg-btn pg-btn--primary pg-btn--sm';
            actionBtn.setAttribute('data-testid', 'btn-tour-next');
            actionBtn.textContent = step === 1 ? 'Next ->' : 'Finish Tour';
            actionBtn.onclick = () => {
              if (step === 1) {
                showTourStep(2);
              } else {
                void dismiss();
              }
            };
            box.appendChild(actionBtn);
            return box;
          },
        });
      };

      (
        stage.querySelector('[data-testid="btn-start-tour"]') as HTMLButtonElement
      ).onclick = () => showTourStep(1);
    },
  },

  {
    id: 'attach-scale-point',
    className: 'AttachDialogScalePoint',
    category: 'attach',
    route: '/attach/scalePointBuilder',
    label: 'scalePointBuilder',
    description:
      '参考 flutter_use AttachDialogScalePoint：实时输入缩放原点偏移 (dx, dy)，观察 SmartAnimationType.scale 展开原点位置变化。',
    code: `import { Alignment, Offset, SmartAnimationType, SmartDialog } from 'fe-smart-dialog';

SmartDialog.showAttach({
  targetContext: iconButton,
  alignment: Alignment.bottomCenter,
  animationType: SmartAnimationType.scale,
  animationTime: 450,
  scalePointBuilder: (selfSize) => new Offset(dx ?? selfSize.width / 2, dy ?? 0),
  builder: () => popupCard,
});`,
    mount(stage, ctx) {
      stage.innerHTML = `
        <div class="pg-card">
          <h4>调整 Scale 展开原点 (dx, dy)</h4>
          <div class="pg-actions" style="margin-bottom: 14px;">
            <label style="font-size:12px;">dx: <input class="pg-input" style="width:68px;" type="number" value="25" data-testid="scale-dx" /></label>
            <label style="font-size:12px;">dy: <input class="pg-input" style="width:68px;" type="number" value="0" data-testid="scale-dy" /></label>
          </div>
          <div class="pg-actions">
            <button class="pg-btn pg-btn--primary" data-testid="btn-scale-plus">＋ 点击展开缩放气泡</button>
          </div>
        </div>
      `;

      const dxInput = stage.querySelector(
        '[data-testid="scale-dx"]',
      ) as HTMLInputElement;
      const dyInput = stage.querySelector(
        '[data-testid="scale-dy"]',
      ) as HTMLInputElement;
      const plusBtn = stage.querySelector(
        '[data-testid="btn-scale-plus"]',
      ) as HTMLButtonElement;

      plusBtn.onclick = () => {
        const dx = Number(dxInput.value);
        const dy = Number(dyInput.value);
        ctx.log(`scalePointBuilder -> Offset(${dx}, ${dy})`);
        void SmartDialog.showAttach({
          targetContext: plusBtn,
          alignment: Alignment.bottomCenter,
          animationType: SmartAnimationType.scale,
          animationTime: 450,
          scalePointBuilder: (selfSize) =>
            new Offset(
              Number.isFinite(dx) ? dx : selfSize.width / 2,
              Number.isFinite(dy) ? dy : 0,
            ),
          builder: () => {
            const box = document.createElement('div');
            box.className = 'pg-dialog-box';
            box.style.cssText = 'min-width:110px;text-align:center;';
            box.innerHTML = `<strong>缩放中心</strong><div style="font-size:12px;color:var(--pg-muted);margin-top:4px;">(${dx}, ${dy})</div>`;
            return box;
          },
        });
      };
    },
  },

  {
    id: 'attach-adjust',
    className: 'AttachDialogAdjust',
    category: 'attach',
    route: '/attach/attachAdjustBuilder',
    label: 'attachAdjustBuilder',
    description:
      '参考 flutter_use AttachDialogAdjust：当贴靠目标靠近边缘空间不足时，经由 adjustBuilder 自动切换成对称方位与微调偏移。',
    code: `import { Alignment, AttachAdjustParam, SmartDialog } from 'fe-smart-dialog';

SmartDialog.showAttach({
  targetContext: btnEl,
  alignment: Alignment.bottomCenter,
  adjustBuilder: (attachParam) => {
    // 底部空间不够时，自动翻转为 topCenter 并通过 builder 包装间距
    if (attachParam.selfOffset.y + attachParam.selfSize.height > window.innerHeight - 20) {
      return new AttachAdjustParam({
        alignment: Alignment.topCenter,
        builder: () => wrappedWidget(attachParam.selfWidget),
      });
    }
    return new AttachAdjustParam();
  },
  builder: () => tooltipEl,
});`,
    mount(stage, ctx) {
      stage.innerHTML = `
        <div class="pg-card" style="display:flex;flex-direction:column;justify-content:space-between;height:190px;">
          <p>测试边缘防溢出：默认请求 <code>bottomCenter</code>，顶部/底部按钮演示 <code>adjustBuilder</code> 自动翻转。</p>
          <div class="pg-actions" style="justify-content:space-between;">
            <button class="pg-btn pg-btn--primary" data-testid="btn-adjust-normal">普通位置触发 (bottomCenter)</button>
            <button class="pg-btn" data-testid="btn-adjust-flip">模拟底缘自动翻转 (-> topCenter)</button>
          </div>
        </div>
      `;

      const normalBtn = stage.querySelector(
        '[data-testid="btn-adjust-normal"]',
      ) as HTMLButtonElement;
      const flipBtn = stage.querySelector(
        '[data-testid="btn-adjust-flip"]',
      ) as HTMLButtonElement;

      const trigger = (btn: HTMLButtonElement, forceFlip: boolean) => {
        void SmartDialog.showAttach({
          targetContext: btn,
          alignment: Alignment.bottomCenter,
          adjustBuilder: (param) => {
            const overflowBottom =
              forceFlip ||
              param.selfOffset.y + param.selfSize.height > window.innerHeight - 24;
            if (overflowBottom) {
              ctx.log('adjustBuilder flipped bottomCenter -> topCenter');
              return new AttachAdjustParam({
                alignment: Alignment.topCenter,
              });
            }
            return new AttachAdjustParam();
          },
          builder: () => {
            const pop = document.createElement('div');
            pop.className = 'pg-popover';
            pop.textContent = forceFlip
              ? 'Flipped to topCenter by adjustBuilder!'
              : 'Normal bottomCenter Attach';
            return pop;
          },
        });
      };

      normalBtn.onclick = () => trigger(normalBtn, false);
      flipBtn.onclick = () => trigger(flipBtn, true);
    },
  },
];
