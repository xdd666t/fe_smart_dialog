import {
  Alignment,
  SmartAnimationType,
  SmartBackType,
  SmartDialog,
  SmartDialogController,
  SmartMaskTriggerType,
  SmartStatus,
  html,
  type SmartAlignment,
} from 'fe-smart-dialog';
import type { DemoEntry } from '../types/demo';
import {
  ALIGNMENT_BY_KEY,
  ANIMATION_TYPE_BY_KEY,
} from '../utils/enumMaps';

function randomHslColor(): string {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 76%, 54%)`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const DIALOG_DEMOS: DemoEntry[] = [
  {
    id: 'dialog-easy',
    className: 'CustomDialogEasy',
    category: 'dialog',
    route: '/dialog/easy',
    label: 'easy',
    description:
      '最简 Custom 弹窗 + SmartDialogController 局部刷新 + html`` 模板自动防 XSS 转义。',
    code: `import { SmartDialog, SmartDialogController, html } from 'fe-smart-dialog';

// 1. 最简一行弹出
SmartDialog.show({
  builder: () => html\`<div class="pg-dark-pill">easy custom dialog</div>\`,
});

// 2. 控制器刷新 & XSS 安全插值
const controller = new SmartDialogController();
let count = 1;

SmartDialog.show({
  tag: 'counter-card',
  controller,
  builder: ({ dismiss }) => {
    const frag = html\`<div>Count: \${count} | 输入: \${'<img src=x onerror=alert(1)>'}</div>\`;
    return frag;
  },
});

count += 1;
controller.refresh();`,
    mount(stage, ctx) {
      let ctrlCount = 1;
      const controller = new SmartDialogController();

      stage.innerHTML = `
        <button class="pg-btn pg-btn--primary pg-btn--elevated" data-testid="btn-demo-easy">click me</button>
        <div class="pg-card">
          <h4>Web 扩展快捷验证</h4>
          <p>控制器刷新状态、以及 Tagged Template 自动转义危险 HTML。</p>
          <div class="pg-actions">
            <button class="pg-btn" data-testid="btn-show-controller">Controller Refresh</button>
            <button class="pg-btn" data-testid="btn-show-xss">Safe HTML Template</button>
          </div>
        </div>
      `;

      const q = (id: string) =>
        stage.querySelector(`[data-testid="${id}"]`) as HTMLButtonElement;

      q('btn-demo-easy').onclick = () => {
        ctx.log('SmartDialog.show(easy)');
        void SmartDialog.show({
          builder: () => {
            const box = document.createElement('div');
            box.className = 'pg-dark-pill';
            box.setAttribute('data-testid', 'easy-dialog-card');
            box.textContent = 'easy custom dialog';
            return box;
          },
          onDismiss: () => ctx.log('easy dialog dismissed'),
        });
      };

      q('btn-show-controller').onclick = () => {
        ctrlCount = 1;
        ctx.log('SmartDialog.show(controller)');
        void SmartDialog.show({
          tag: 'pg-controller',
          controller,
          builder: ({ dismiss }) => {
            const card = document.createElement('div');
            card.className = 'pg-dialog-box';
            card.innerHTML = `<div data-testid="controller-value" style="font-weight:600;margin-bottom:12px;">Count: ${ctrlCount}</div>`;
            const actions = document.createElement('div');
            actions.className = 'pg-actions';
            const inc = document.createElement('button');
            inc.className = 'pg-btn pg-btn--primary';
            inc.textContent = 'Increment + Refresh';
            inc.setAttribute('data-testid', 'btn-ctrl-inc');
            inc.onclick = () => {
              ctrlCount += 1;
              controller.refresh();
              ctx.log(`controller.refresh() -> Count: ${ctrlCount}`);
            };
            const close = document.createElement('button');
            close.className = 'pg-btn';
            close.textContent = 'Dismiss';
            close.onclick = () => void dismiss();
            actions.append(inc, close);
            card.appendChild(actions);
            return card;
          },
        });
      };

      q('btn-show-xss').onclick = () => {
        const unsafeInput = '<img src=x onerror=alert(1)>';
        ctx.log('SmartDialog.show(html XSS escape)');
        void SmartDialog.show({
          builder: ({ dismiss }) => {
            const card = document.createElement('div');
            card.className = 'pg-dialog-box';
            const msg = document.createElement('div');
            msg.setAttribute('data-testid', 'xss-card');
            msg.appendChild(html`<span>${unsafeInput}</span>`);
            const closeBtn = document.createElement('button');
            closeBtn.className = 'pg-btn pg-btn--sm';
            closeBtn.style.marginTop = '12px';
            closeBtn.textContent = 'Close';
            closeBtn.setAttribute('data-testid', 'btn-close-xss');
            closeBtn.onclick = () => void dismiss();
            card.append(msg, closeBtn);
            return card;
          },
        });
      };
    },
  },

  {
    id: 'dialog-location',
    className: 'CustomDialogLocation',
    category: 'dialog',
    route: '/dialog/location',
    label: 'location',
    description:
      '参考 flutter_use CustomDialogLocation：依次从左/上/右/下/中滑入，外加 9 方位与动画组合测试。',
    code: `import { Alignment, SmartAnimationType, SmartDialog } from 'fe-smart-dialog';

async function showLocationSequence() {
  const showBand = (alignment: Alignment, width: string, height: string) => {
    void SmartDialog.show({
      alignment,
      builder: () => {
        const el = document.createElement('div');
        el.style.cssText = \`width:\${width};height:\${height};background:#3b82f6;\`;
        return el;
      },
    });
  };

  showBand(Alignment.centerLeft, '80px', '100vh');
  await delay(500);
  showBand(Alignment.topCenter, '100vw', '72px');
  await delay(500);
  showBand(Alignment.centerRight, '80px', '100vh');
  await delay(500);
  showBand(Alignment.bottomCenter, '100vw', '72px');
  await delay(500);
  showBand(Alignment.center, '140px', '140px');
}`,
    mount(stage, ctx) {
      let cancelled = false;
      stage.innerHTML = `
        <button class="pg-btn pg-btn--primary pg-btn--elevated" data-testid="btn-location-seq">click me（5 向连续弹出）</button>
        <div class="pg-card">
          <h4>单点定位 & 动画组合测试</h4>
          <p>选择任意 9 方位与内置动画，验证定位精准度。</p>
          <div class="pg-actions" style="margin-bottom: 10px;">
            <select class="pg-select" data-testid="custom-alignment-select">
              <option value="center">center</option>
              <option value="topLeft">topLeft</option>
              <option value="topCenter">topCenter</option>
              <option value="topRight">topRight</option>
              <option value="centerLeft">centerLeft</option>
              <option value="centerRight">centerRight</option>
              <option value="bottomLeft">bottomLeft</option>
              <option value="bottomCenter">bottomCenter</option>
              <option value="bottomRight">bottomRight</option>
            </select>
            <select class="pg-select" data-testid="custom-animation-select">
              <option value="centerScale_otherSlide">centerScale_otherSlide</option>
              <option value="centerFade_otherSlide">centerFade_otherSlide</option>
              <option value="fade">fade</option>
              <option value="scale">scale</option>
            </select>
          </div>
          <div class="pg-actions">
            <button class="pg-btn pg-btn--primary" data-testid="btn-show-custom">Show Custom</button>
          </div>
        </div>
      `;

      const seqBtn = stage.querySelector(
        '[data-testid="btn-location-seq"]',
      ) as HTMLButtonElement;
      const alignSel = stage.querySelector(
        '[data-testid="custom-alignment-select"]',
      ) as HTMLSelectElement;
      const animSel = stage.querySelector(
        '[data-testid="custom-animation-select"]',
      ) as HTMLSelectElement;
      const showBtn = stage.querySelector(
        '[data-testid="btn-show-custom"]',
      ) as HTMLButtonElement;

      const showBand = (
        alignment: SmartAlignment,
        width: string,
        height: string,
        label: string,
      ) => {
        if (cancelled) return;
        ctx.log(`location band -> ${label}`);
        void SmartDialog.show({
          alignment,
          builder: ({ dismiss }) => {
            const el = document.createElement('div');
            el.style.cssText = `width:${width};height:${height};background:${randomHslColor()};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;cursor:pointer;`;
            el.textContent = label;
            el.onclick = () => void dismiss();
            return el;
          },
        });
      };

      seqBtn.onclick = async () => {
        cancelled = false;
        showBand(Alignment.centerLeft, '86px', '100vh', 'LEFT');
        await delay(500);
        showBand(Alignment.topCenter, '100vw', '72px', 'TOP');
        await delay(500);
        showBand(Alignment.centerRight, '86px', '100vh', 'RIGHT');
        await delay(500);
        showBand(Alignment.bottomCenter, '100vw', '72px', 'BOTTOM');
        await delay(500);
        showBand(Alignment.center, '140px', '140px', 'CENTER');
      };

      showBtn.onclick = () => {
        const alignName = alignSel.value;
        const animName = animSel.value;
        const alignment = ALIGNMENT_BY_KEY[alignName] ?? Alignment.center;
        const animationType =
          ANIMATION_TYPE_BY_KEY[animName] ??
          SmartAnimationType.centerScale_otherSlide;
        ctx.log(`show custom(${alignName}, ${animName})`);
        void SmartDialog.show({
          tag: 'pg-custom',
          alignment,
          animationType,
          builder: ({ dismiss }) => {
            const card = document.createElement('div');
            card.className = 'pg-dialog-box';
            card.setAttribute('data-testid', 'custom-dialog-card');
            card.innerHTML = `<h4 style="margin:0 0 6px;">Custom Dialog</h4><p style="margin:0 0 12px;color:var(--pg-muted);">Alignment: ${alignName}</p>`;
            const closeBtn = document.createElement('button');
            closeBtn.className = 'pg-btn pg-btn--primary';
            closeBtn.textContent = 'Close';
            closeBtn.setAttribute('data-testid', 'btn-close-dialog');
            closeBtn.onclick = () => void dismiss();
            card.appendChild(closeBtn);
            return card;
          },
        });
      };

      return () => {
        cancelled = true;
      };
    },
  },

  {
    id: 'dialog-penetrate',
    className: 'CustomDialogPenetrate',
    category: 'dialog',
    route: '/dialog/penetrate',
    label: 'penetrate',
    description:
      '参考 flutter_use CustomDialogPenetrate：usePenetrate 交互事件穿透，并演示 down/move/up 遮罩关闭时机。',
    code: `import { Alignment, SmartDialog, SmartMaskTriggerType } from 'fe-smart-dialog';

// 打开右侧可穿透抽屉（底层按钮可正常点击）
SmartDialog.show({
  tag: 'penetrateDialog',
  keepSingle: true,
  alignment: Alignment.centerRight,
  usePenetrate: true,
  clickMaskDismiss: false,
  builder: () => drawerElement,
});

// 遮罩触发类型：down / move / up
SmartDialog.show({
  maskTriggerType: SmartMaskTriggerType.down,
  builder: () => cardElement,
});`,
    mount(stage, ctx) {
      let clickThroughCount = 0;

      stage.innerHTML = `
        <button class="pg-btn pg-btn--primary pg-btn--elevated" data-testid="btn-demo-penetrate">click me（flutter_use 同款面板）</button>
        <div class="pg-card">
          <h4>真实穿透计数 &amp; Mask Trigger 时机</h4>
          <p>打开穿透卡片后直接点击下方计分按钮，验证事件是否完全透传。</p>
          <div class="pg-actions" style="margin-bottom: 10px;">
            <button class="pg-btn" data-testid="btn-show-penetrate">Show Penetrate</button>
            <button class="pg-btn" data-testid="btn-behind-target">Behind Click (<span data-testid="behind-count">0</span>)</button>
          </div>
          <div class="pg-actions">
            <button class="pg-btn pg-btn--sm" data-testid="btn-mask-down">Trigger: down</button>
            <button class="pg-btn pg-btn--sm" data-testid="btn-mask-move">Trigger: move</button>
            <button class="pg-btn pg-btn--sm" data-testid="btn-mask-up">Trigger: up</button>
          </div>
        </div>
      `;

      const q = (id: string) =>
        stage.querySelector(`[data-testid="${id}"]`) as HTMLButtonElement;
      const behindCountEl = stage.querySelector(
        '[data-testid="behind-count"]',
      ) as HTMLElement;

      const openSidePenetrateDrawer = () => {
        ctx.log('open right penetrate drawer');
        void SmartDialog.show({
          tag: 'penetrateDialog',
          keepSingle: true,
          alignment: Alignment.centerRight,
          usePenetrate: true,
          clickMaskDismiss: false,
          builder: () => {
            const drawer = document.createElement('div');
            drawer.className = 'pg-handle-drawer pg-handle-drawer--right';
            drawer.setAttribute('data-testid', 'penetrate-drawer');
            drawer.innerHTML =
              '<h4>penetrate dialog</h4><p style="font-size:13px;color:var(--pg-muted);">左侧主界面与弹窗按钮均可自由交互！</p>';
            return drawer;
          },
        });
      };

      q('btn-demo-penetrate').onclick = () => {
        void SmartDialog.show({
          builder: ({ dismiss }) => {
            const box = document.createElement('div');
            box.className = 'pg-dialog-box';
            box.innerHTML =
              '<h4 style="margin:0 0 10px;">Penetrate Console</h4><p style="margin:0 0 14px;">先点 open 弹出右侧穿透栏，再点 close 或穿透操作。</p>';
            const actions = document.createElement('div');
            actions.className = 'pg-actions';
            const openBtn = document.createElement('button');
            openBtn.className = 'pg-btn pg-btn--primary';
            openBtn.textContent = 'open';
            openBtn.onclick = openSidePenetrateDrawer;
            const closeBtn = document.createElement('button');
            closeBtn.className = 'pg-btn';
            closeBtn.textContent = 'close';
            closeBtn.onclick = () => {
              void SmartDialog.dismiss({ tag: 'penetrateDialog' });
              void dismiss();
            };
            actions.append(openBtn, closeBtn);
            box.appendChild(actions);
            return box;
          },
        });
      };

      q('btn-show-penetrate').onclick = () => {
        void SmartDialog.show({
          tag: 'pg-penetrate',
          alignment: Alignment.topCenter,
          usePenetrate: true,
          clickMaskDismiss: false,
          builder: ({ dismiss }) => {
            const card = document.createElement('div');
            card.className = 'pg-dialog-box';
            card.setAttribute('data-testid', 'penetrate-card');
            card.innerHTML =
              '<strong>Penetrate Active</strong><p style="margin:6px 0 10px;">Background buttons remain clickable!</p>';
            const closeBtn = document.createElement('button');
            closeBtn.className = 'pg-btn pg-btn--sm';
            closeBtn.textContent = 'Close Penetrate';
            closeBtn.setAttribute('data-testid', 'btn-close-penetrate');
            closeBtn.onclick = () => void dismiss();
            card.appendChild(closeBtn);
            return card;
          },
        });
      };

      q('btn-behind-target').onclick = () => {
        clickThroughCount += 1;
        behindCountEl.textContent = String(clickThroughCount);
        ctx.log(`behind button clicked -> ${clickThroughCount}`);
      };

      const bindTriggerDemo = (
        id: string,
        trigger: SmartMaskTriggerType,
        testId: string,
      ) => {
        q(id).onclick = () => {
          SmartDialog.config.custom.maskTriggerType = trigger;
          ctx.log(`config.custom.maskTriggerType = ${trigger}`);
          void SmartDialog.show({
            onDismiss: () => {
              SmartDialog.config.custom.maskTriggerType =
                SmartMaskTriggerType.up;
            },
            builder: () => {
              const card = document.createElement('div');
              card.className = 'pg-dialog-box';
              card.setAttribute('data-testid', testId);
              card.textContent = `Mask trigger: ${trigger}`;
              return card;
            },
          });
        };
      };

      bindTriggerDemo('btn-mask-down', SmartMaskTriggerType.down, 'mask-card-down');
      bindTriggerDemo('btn-mask-move', SmartMaskTriggerType.move, 'mask-card-move');
      bindTriggerDemo('btn-mask-up', SmartMaskTriggerType.up, 'mask-card-up');

      return () => {
        SmartDialog.config.custom.maskTriggerType = SmartMaskTriggerType.up;
      };
    },
  },

  {
    id: 'dialog-single',
    className: 'CustomDialogSingle',
    category: 'dialog',
    route: '/dialog/keepSingle',
    label: 'keepSingle',
    description:
      '参考 flutter_use CustomDialogSingle：连续 7 步对比 keepSingle: true（同实例复用刷新）与 false（多实例叠加）。',
    code: `import { Alignment, SmartDialog } from 'fe-smart-dialog';

async function singleVsMultiple(keepSingle: boolean, alignment: Alignment) {
  SmartDialog.show({
    alignment,
    keepSingle,
    builder: () => badgeBox(keepSingle ? 'single' : 'multiple'),
  });
  await delay(900);
}`,
    mount(stage, ctx) {
      let cancelled = false;
      stage.innerHTML = `
        <button class="pg-btn pg-btn--primary pg-btn--elevated" data-testid="btn-demo-keep-single">click me（自动序列对比）</button>
        <div class="pg-actions">
          <button class="pg-btn" data-testid="btn-single-once">复用 single (right)</button>
          <button class="pg-btn" data-testid="btn-multi-once">叠加 multiple (left)</button>
          <button class="pg-btn pg-btn--danger" data-testid="btn-single-clear">全部关闭</button>
        </div>
      `;

      const showStep = (keepSingle: boolean, alignment: SmartAlignment) => {
        if (cancelled) return;
        const horizontal =
          alignment === Alignment.bottomCenter || alignment === Alignment.topCenter;
        ctx.log(`keepSingle=${keepSingle}`);
        void SmartDialog.show({
          alignment,
          keepSingle,
          usePenetrate: true,
          clickMaskDismiss: false,
          builder: () => {
            const el = document.createElement('div');
            el.style.cssText = `width:${horizontal ? '100vw' : '120px'};height:${horizontal ? '88px' : '100vh'};background:${randomHslColor()};color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;`;
            el.textContent = keepSingle ? 'single' : 'multiple';
            return el;
          },
        });
      };

      (
        stage.querySelector('[data-testid="btn-demo-keep-single"]') as HTMLButtonElement
      ).onclick = async () => {
        cancelled = false;
        showStep(false, Alignment.bottomCenter);
        await delay(900);
        showStep(true, Alignment.centerRight);
        await delay(900);
        showStep(true, Alignment.centerRight);
        await delay(900);
        showStep(false, Alignment.topCenter);
        await delay(900);
        showStep(false, Alignment.centerLeft);
        await delay(900);
        showStep(true, Alignment.centerRight);
        await delay(900);
        showStep(true, Alignment.centerRight);
      };

      (
        stage.querySelector('[data-testid="btn-single-once"]') as HTMLButtonElement
      ).onclick = () => showStep(true, Alignment.centerRight);
      (
        stage.querySelector('[data-testid="btn-multi-once"]') as HTMLButtonElement
      ).onclick = () => showStep(false, Alignment.centerLeft);
      (
        stage.querySelector('[data-testid="btn-single-clear"]') as HTMLButtonElement
      ).onclick = () => {
        cancelled = true;
        void SmartDialog.dismiss({ status: SmartStatus.allCustom, force: true });
      };

      return () => {
        cancelled = true;
      };
    },
  },

  {
    id: 'dialog-stack',
    className: 'CustomDialogStack',
    category: 'dialog',
    route: '/dialog/dialogStack',
    label: 'dialogStack',
    description:
      '参考 flutter_use CustomDialogStack：依次弹出 A/B/C/D 四周栈弹窗，并由中心控制台按 tag 精准拆除任意一层。',
    code: `import { Alignment, SmartDialog } from 'fe-smart-dialog';

await SmartDialog.show({ tag: 'A', alignment: Alignment.centerLeft, builder: ... });
await SmartDialog.show({ tag: 'B', alignment: Alignment.topCenter, builder: ... });
await SmartDialog.show({ tag: 'C', alignment: Alignment.centerRight, builder: ... });
await SmartDialog.show({ tag: 'D', alignment: Alignment.bottomCenter, builder: ... });

// 在任意时刻精准关闭指定层
SmartDialog.dismiss({ tag: 'B' });`,
    mount(stage, ctx) {
      let cancelled = false;
      stage.innerHTML = `
        <button class="pg-btn pg-btn--primary pg-btn--elevated" data-testid="btn-demo-stack">click me（生成 4 层栈与控制器）</button>
      `;

      const pushEdge = async (
        tag: string,
        alignment: SmartAlignment,
        horizontal: boolean,
      ) => {
        if (cancelled) return;
        ctx.log(`stack push tag='${tag}'`);
        void SmartDialog.show({
          tag,
          alignment,
          builder: () => {
            const box = document.createElement('div');
            box.style.cssText = `width:${horizontal ? '100vw' : '84px'};height:${horizontal ? '72px' : '100vh'};background:${randomHslColor()};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;`;
            box.textContent = `dialog ${tag}`;
            return box;
          },
        });
        await delay(420);
      };

      (
        stage.querySelector('[data-testid="btn-demo-stack"]') as HTMLButtonElement
      ).onclick = async () => {
        cancelled = false;
        await pushEdge('A', Alignment.centerLeft, false);
        await pushEdge('B', Alignment.topCenter, true);
        await pushEdge('C', Alignment.centerRight, false);
        await pushEdge('D', Alignment.bottomCenter, true);
        if (cancelled) return;

        void SmartDialog.show({
          alignment: Alignment.center,
          builder: () => {
            const panel = document.createElement('div');
            panel.className = 'pg-dialog-box';
            panel.innerHTML =
              '<h4 style="margin:0 0 10px;">Stack Handler</h4><p style="margin:0 0 12px;">点击任意按钮通过 tag 关闭对应栈层：</p>';
            const actions = document.createElement('div');
            actions.className = 'pg-actions';
            for (const tag of ['A', 'B', 'C', 'D']) {
              const b = document.createElement('button');
              b.className = 'pg-btn';
              b.textContent = `close dialog ${tag}`;
              b.onclick = () => {
                ctx.log(`SmartDialog.dismiss({ tag: '${tag}' })`);
                void SmartDialog.dismiss({ tag });
              };
              actions.appendChild(b);
            }
            panel.appendChild(actions);
            return panel;
          },
        });
      };

      return () => {
        cancelled = true;
      };
    },
  },

  {
    id: 'dialog-system',
    className: 'CustomDialogSystem',
    category: 'dialog',
    route: '/dialog/useSystem',
    label: 'useSystem',
    description:
      '基于原生 <dialog>.showModal() Top Layer：自带原生焦点锁定/Esc 取消/焦点回溯，支持跨路由保活对比。',
    code: `import { SmartDialog } from 'fe-smart-dialog';

const res = await SmartDialog.show<string>({
  useSystem: true, // 原生 <dialog>.showModal() Top Layer
  ariaLabel: 'System Confirmation Modal',
  builder: ({ dismiss }) => formElement,
});`,
    mount(stage, ctx) {
      stage.innerHTML = `
        <button class="pg-btn pg-btn--primary pg-btn--elevated" data-testid="btn-show-system">Open useSystem Modal</button>
        <div class="pg-badge" data-testid="system-result">Result: none</div>
      `;

      const sysBtn = stage.querySelector(
        '[data-testid="btn-show-system"]',
      ) as HTMLButtonElement;
      const resultEl = stage.querySelector(
        '[data-testid="system-result"]',
      ) as HTMLElement;

      sysBtn.onclick = async () => {
        ctx.log('SmartDialog.show({ useSystem: true })');
        const res = await SmartDialog.show<string>({
          useSystem: true,
          ariaLabel: 'System Confirmation Modal',
          builder: ({ dismiss }) => {
            const box = document.createElement('div');
            box.className = 'pg-dialog-box';
            box.setAttribute('data-testid', 'system-dialog-card');
            box.innerHTML =
              '<h4 style="margin:0 0 8px;">Native Top-Layer Modal</h4><p style="margin:0 0 10px;">Esc 会取消并把焦点精准还给触发按钮。</p>';
            const input = document.createElement('input');
            input.className = 'pg-input';
            input.placeholder = 'Focus trapped input';
            input.setAttribute('data-testid', 'system-input');
            input.style.cssText = 'width:100%;margin-bottom:12px;';

            const actions = document.createElement('div');
            actions.className = 'pg-actions';
            const okBtn = document.createElement('button');
            okBtn.className = 'pg-btn pg-btn--primary';
            okBtn.textContent = 'Confirm';
            okBtn.setAttribute('data-testid', 'btn-system-confirm');
            okBtn.onclick = () => void dismiss('confirmed');

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'pg-btn';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.onclick = () => void dismiss('cancelled');

            actions.append(okBtn, cancelBtn);
            box.append(input, actions);
            return box;
          },
        });
        resultEl.textContent = `Result: ${res ?? 'closed'}`;
        ctx.log(`useSystem resolved -> ${res ?? 'closed'}`);
      };
    },
  },

  {
    id: 'dialog-bindpage',
    className: 'CustomDialogBindPage',
    category: 'dialog',
    route: '/dialog/bindPage',
    label: 'bindPage',
    description:
      '参考 flutter_use CustomDialogBindPage：绑定当前浏览器路径，pushState 进入子路由时自动隐藏，popstate 返回时自动恢复显示。',
    code: `import { Alignment, SmartDialog } from 'fe-smart-dialog';

SmartDialog.show({
  tag: 'pg-bindpage',
  bindPage: true, // 默认已为 true
  alignment: Alignment.bottomLeft,
  usePenetrate: true,
  clickMaskDismiss: false,
  builder: () => pageCard,
});

// 前进到子页面 -> 自动隐藏
history.pushState({}, '', '/sub-page');
// 返回原页面 -> 自动恢复显示
history.back();`,
    mount(stage, ctx) {
      const initialHref = window.location.href;
      stage.innerHTML = `
        <div class="pg-card">
          <h4>SPA History 绑定体验</h4>
          <p>当前路由路径：<code data-testid="cur-route">${window.location.pathname}</code></p>
          <div class="pg-actions">
            <button class="pg-btn pg-btn--primary" data-testid="btn-bindpage-dialog">1. Open bindPage Dialog</button>
            <button class="pg-btn" data-testid="btn-push-route">2. Push /sub-page</button>
            <button class="pg-btn" data-testid="btn-back-route">3. Browser Back</button>
          </div>
        </div>
      `;

      const routeLabel = stage.querySelector(
        '[data-testid="cur-route"]',
      ) as HTMLElement;
      const syncRouteLabel = () => {
        routeLabel.textContent = window.location.pathname;
      };
      window.addEventListener('popstate', syncRouteLabel);

      const q = (id: string) =>
        stage.querySelector(`[data-testid="${id}"]`) as HTMLButtonElement;

      q('btn-bindpage-dialog').onclick = () => {
        ctx.log(`open bindPage dialog on ${window.location.pathname}`);
        void SmartDialog.show({
          tag: 'pg-bindpage',
          bindPage: true,
          clickMaskDismiss: false,
          alignment: Alignment.bottomLeft,
          usePenetrate: true,
          builder: () => {
            const el = document.createElement('div');
            el.className = 'pg-dialog-box';
            el.setAttribute('data-testid', 'bindpage-dialog-card');
            el.textContent = `Bound to ${window.location.pathname}`;
            return el;
          },
        });
      };

      q('btn-push-route').onclick = () => {
        window.history.pushState({ pg: 'sub' }, '', '/sub-page');
        syncRouteLabel();
        ctx.log('pushState -> /sub-page');
      };

      q('btn-back-route').onclick = () => {
        window.history.back();
        ctx.log('history.back()');
      };

      return () => {
        window.removeEventListener('popstate', syncRouteLabel);
        if (window.location.pathname === '/sub-page') {
          window.history.replaceState(null, '', initialHref);
        }
        void SmartDialog.dismiss({ tag: 'pg-bindpage', force: true });
      };
    },
  },

  {
    id: 'dialog-carry-result',
    className: 'CustomDialogCarryResult',
    category: 'dialog',
    route: '/dialog/carryResult',
    label: 'carryResult',
    description:
      '参考 flutter_use CustomDialogCarryResult：await SmartDialog.show<string>() 接收关闭时回传的数据并以 Toast 提示。',
    code: `import { SmartDialog } from 'fe-smart-dialog';

const result = await SmartDialog.show<string>({
  builder: ({ dismiss }) => {
    // 关闭并回传结果：dismiss(input.value)
    return resultDialogCard;
  },
});

if (result !== undefined) {
  await SmartDialog.showToast(\`返回值: \${result}\`);
}`,
    mount(stage, ctx) {
      stage.innerHTML = `
        <button class="pg-btn pg-btn--primary pg-btn--elevated" data-testid="btn-demo-carry-result">click me</button>
        <div class="pg-badge pg-badge--subtle" data-testid="carry-result-output">Last Result: (none)</div>
      `;

      const outEl = stage.querySelector(
        '[data-testid="carry-result-output"]',
      ) as HTMLElement;

      (
        stage.querySelector('[data-testid="btn-demo-carry-result"]') as HTMLButtonElement
      ).onclick = async () => {
        const result = await SmartDialog.show<string>({
          builder: ({ dismiss }) => {
            const card = document.createElement('div');
            card.className = 'pg-dialog-box';
            card.innerHTML =
              '<h4 style="margin:0 0 8px;">输入并返回结果</h4><p style="margin:0 0 10px;">点击下方按钮会把文本作为 Promise 返回值。</p>';
            const input = document.createElement('input');
            input.className = 'pg-input';
            input.placeholder = '输入任意消息，例如 hello smart';
            input.value = 'hello fe-smart-dialog';
            input.setAttribute('data-testid', 'carry-result-input');
            input.style.cssText = 'width:100%;margin-bottom:12px;';

            const okBtn = document.createElement('button');
            okBtn.className = 'pg-btn pg-btn--primary';
            okBtn.textContent = 'show result';
            okBtn.setAttribute('data-testid', 'btn-carry-confirm');
            okBtn.onclick = () => void dismiss(input.value);

            card.append(input, okBtn);
            return card;
          },
        });

        outEl.textContent = `Last Result: ${result ?? 'undefined'}`;
        ctx.log(`carryResult -> ${String(result)}`);
        if (result !== undefined) {
          void SmartDialog.showToast(result || '(empty string)');
        }
      };
    },
  },

  {
    id: 'dialog-permanent',
    className: 'CustomDialogPermanent',
    category: 'dialog',
    route: '/dialog/permanent',
    label: 'permanent',
    description:
      '参考 flutter_use CustomDialogPermanent：常驻弹窗不受遮罩点击、Esc 或普通 dismiss 影响，仅 force: true 可强行关闭。',
    code: `import { Alignment, SmartDialog } from 'fe-smart-dialog';

SmartDialog.show({
  tag: 'pg-permanent',
  keepSingle: true,
  permanent: true,
  alignment: Alignment.centerRight,
  usePenetrate: true,
  clickMaskDismiss: false,
  builder: () => permanentSidebar,
});

// 无效：SmartDialog.dismiss({ tag: 'pg-permanent' });
// 有效：
SmartDialog.dismiss({ tag: 'pg-permanent', force: true });`,
    mount(stage, ctx) {
      stage.innerHTML = `
        <button class="pg-btn pg-btn--primary pg-btn--elevated" data-testid="btn-show-permanent">click me（开启常驻弹窗）</button>
        <div class="pg-actions">
          <button class="pg-btn" data-testid="btn-perm-stage-normal">尝试普通 Dismiss（应无效）</button>
          <button class="pg-btn pg-btn--danger" data-testid="btn-force-dismiss">Force Dismiss All</button>
        </div>
      `;

      const q = (id: string) =>
        stage.querySelector(`[data-testid="${id}"]`) as HTMLButtonElement;

      q('btn-show-permanent').onclick = () => {
        ctx.log('open permanent dialog');
        void SmartDialog.show({
          tag: 'pg-permanent',
          keepSingle: true,
          permanent: true,
          alignment: Alignment.centerRight,
          usePenetrate: true,
          clickMaskDismiss: false,
          builder: () => {
            const box = document.createElement('div');
            box.className = 'pg-handle-drawer pg-handle-drawer--right';
            box.setAttribute('data-testid', 'permanent-card');
            box.innerHTML =
              '<h4 style="margin:0;">Permanent Sidebar</h4><p style="font-size:13px;color:var(--pg-muted);">遮罩点击 / 返回按键 / 普通 dismiss 都无法关闭我。</p>';

            const normalBtn = document.createElement('button');
            normalBtn.className = 'pg-btn';
            normalBtn.textContent = 'Normal Dismiss (No-op)';
            normalBtn.setAttribute('data-testid', 'btn-perm-normal-dismiss');
            normalBtn.onclick = () =>
              void SmartDialog.dismiss({ tag: 'pg-permanent' });

            const forceBtn = document.createElement('button');
            forceBtn.className = 'pg-btn pg-btn--danger';
            forceBtn.textContent = 'Force Close (force: true)';
            forceBtn.setAttribute('data-testid', 'btn-perm-force-dismiss');
            forceBtn.onclick = () =>
              void SmartDialog.dismiss({ tag: 'pg-permanent', force: true });

            box.append(normalBtn, forceBtn);
            return box;
          },
        });
      };

      q('btn-perm-stage-normal').onclick = () => {
        ctx.log('dismiss without force -> blocked by permanent');
        void SmartDialog.dismiss({ tag: 'pg-permanent' });
      };

      q('btn-force-dismiss').onclick = () => {
        ctx.log('dismiss({ force: true })');
        void SmartDialog.dismiss({ status: SmartStatus.allDialog, force: true });
      };

      return () => {
        void SmartDialog.dismiss({ tag: 'pg-permanent', force: true });
      };
    },
  },

  {
    id: 'dialog-animation',
    className: 'CustomDialogAnimation',
    category: 'dialog',
    route: '/dialog/animationBuilder',
    label: 'animationBuilder',
    description:
      '参考 flutter_use CustomDialogAnimation：通过 animationBuilder 接入原生 Web Animations API 实现自定义弹性旋转进出场。',
    code: `import { SmartDialog } from 'fe-smart-dialog';

SmartDialog.show({
  animationTime: 900,
  animationBuilder: (_controller, child, param) => {
    param.onForward = () => {
      child.animate(
        [
          { transform: 'rotate(-180deg) scale(0.4)', opacity: 0 },
          { transform: 'rotate(0deg) scale(1)', opacity: 1 },
        ],
        { duration: param.animationTime, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'both' },
      );
    };
    param.onDismiss = () => {
      child.animate(
        [
          { transform: 'rotate(0deg) scale(1)', opacity: 1 },
          { transform: 'rotate(180deg) scale(0.4)', opacity: 0 },
        ],
        { duration: param.animationTime, easing: 'ease-in', fill: 'both' },
      );
    };
  },
  builder: () => customAnimatedCard,
});`,
    mount(stage, ctx) {
      stage.innerHTML = `
        <div class="pg-actions">
          <select class="pg-select" data-testid="anim-duration-select">
            <option value="800">800ms</option>
            <option value="2000">2000ms (慢动作观察)</option>
          </select>
          <button class="pg-btn pg-btn--primary pg-btn--elevated" data-testid="btn-demo-animation">click me</button>
        </div>
      `;

      const durSel = stage.querySelector(
        '[data-testid="anim-duration-select"]',
      ) as HTMLSelectElement;

      (
        stage.querySelector('[data-testid="btn-demo-animation"]') as HTMLButtonElement
      ).onclick = () => {
        const ms = Number(durSel.value) || 800;
        ctx.log(`custom animationBuilder (${ms}ms)`);
        void SmartDialog.show({
          animationTime: ms,
          animationBuilder: (_ctrl, child, param) => {
            param.onForward = () => {
              child.animate?.(
                [
                  { transform: 'rotate(-180deg) scale(0.45)', opacity: 0 },
                  { transform: 'rotate(0deg) scale(1)', opacity: 1 },
                ],
                {
                  duration: param.animationTime,
                  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                  fill: 'both',
                },
              );
            };
            param.onDismiss = () => {
              child.animate?.(
                [
                  { transform: 'rotate(0deg) scale(1)', opacity: 1 },
                  { transform: 'rotate(180deg) scale(0.45)', opacity: 0 },
                ],
                {
                  duration: param.animationTime,
                  easing: 'ease-in',
                  fill: 'both',
                },
              );
            };
          },
          builder: ({ dismiss }) => {
            const box = document.createElement('div');
            box.className = 'pg-dialog-box';
            box.innerHTML =
              '<h4 style="margin:0 0 8px;">Custom Spin-Elastic Animation</h4><p style="margin:0 0 12px;">由 animationBuilder + WAAPI 驱动双向动画。</p>';
            const btn = document.createElement('button');
            btn.className = 'pg-btn pg-btn--primary';
            btn.textContent = 'Close with reverse spin';
            btn.onclick = () => void dismiss();
            box.appendChild(btn);
            return box;
          },
        });
      };
    },
  },

  {
    id: 'dialog-bindwidget',
    className: 'CustomDialogBindWidget',
    category: 'dialog',
    route: '/dialog/bindWidget',
    label: 'bindWidget',
    description:
      '参考 flutter_use CustomDialogBindWidget：将弹窗生命周期/可见性绑定到具体 DOM 宿主或 Tab 子视图，切换隐藏、节点销毁自动关闭。',
    code: `import { SmartDialog, SmartStatus } from 'fe-smart-dialog';

// 绑定到某局部面板 / Tab 视图节点
SmartDialog.show({
  tag: 'panel-a',
  bindElement: panelNode, // 别名：bindWidget
  usePenetrate: true,
  clickMaskDismiss: false,
  builder: () => floatingWidget,
});

// 当 panelNode 被 display:none 隐藏 -> 弹窗自动隐藏
// 当切回可见 -> 弹窗自动重现
// 当 panelNode.remove() 被卸载 -> 弹窗自动销毁！`,
    mount(stage, ctx) {
      stage.innerHTML = `
        <div class="pg-card" style="display:flex;flex-direction:column;gap:12px;">
          <div class="pg-actions" style="justify-content:flex-start;">
            <button class="pg-btn pg-btn--sm pg-btn--primary" data-testid="bw-tab-0">Tab Home</button>
            <button class="pg-btn pg-btn--sm" data-testid="bw-tab-1">Tab Profile</button>
          </div>
          <div data-testid="bound-panel" style="padding:12px;border-radius:8px;border:1px solid var(--pg-border);background:var(--pg-surface-subtle);">
            <strong style="display:block;margin-bottom:8px;">Tab Home 宿主面板 (bound-panel)</strong>
            <div class="pg-actions" style="justify-content:flex-start;">
              <button class="pg-btn pg-btn--primary pg-btn--sm" data-testid="btn-bindwidget-open">Bind Floating Dialog</button>
              <button class="pg-btn pg-btn--danger pg-btn--sm" data-testid="btn-bindwidget-remove">Remove Host Node</button>
            </div>
          </div>
          <div data-testid="other-panel" style="display:none;padding:12px;border-radius:8px;border:1px solid var(--pg-border);background:var(--pg-surface-subtle);">
            <strong>Tab Profile 面板</strong> — 此时 Home 面板的绑定弹窗已自动隐藏！切回 Tab Home 自动重现。
          </div>
        </div>
      `;

      const q = (id: string) => stage.querySelector(`[data-testid="${id}"]`) as HTMLElement;
      const tab0 = q('bw-tab-0');
      const tab1 = q('bw-tab-1');
      const boundPanel = q('bound-panel');
      const otherPanel = q('other-panel');

      tab0.onclick = () => {
        tab0.classList.add('pg-btn--primary');
        tab1.classList.remove('pg-btn--primary');
        boundPanel.style.display = 'block';
        otherPanel.style.display = 'none';
        ctx.log('switch to Tab Home -> bound dialog visible');
      };

      tab1.onclick = () => {
        tab1.classList.add('pg-btn--primary');
        tab0.classList.remove('pg-btn--primary');
        boundPanel.style.display = 'none';
        otherPanel.style.display = 'block';
        ctx.log('switch to Tab Profile -> bound dialog auto-hidden');
      };

      q('btn-bindwidget-open').onclick = () => {
        if (!boundPanel.isConnected) return;
        ctx.log('SmartDialog.show({ bindElement: boundPanel })');
        void SmartDialog.show({
          tag: 'pg-bindwidget',
          bindElement: boundPanel,
          clickMaskDismiss: false,
          alignment: Alignment.bottomRight,
          usePenetrate: true,
          builder: () => {
            const el = document.createElement('div');
            el.className = 'pg-dialog-box';
            el.setAttribute('data-testid', 'bindwidget-dialog-card');
            el.textContent = 'Listening to bound-panel (Tab Home)';
            return el;
          },
        });
      };

      q('btn-bindwidget-remove').onclick = () => {
        ctx.log('boundPanel.remove() -> triggers auto-dismiss');
        boundPanel.remove();
      };

      return () => {
        void SmartDialog.dismiss({ tag: 'pg-bindwidget', force: true });
      };
    },
  },

  {
    id: 'dialog-hardclose',
    className: 'OtherHardClose',
    category: 'dialog',
    route: '/dialog/hardClose',
    label: 'hardClose & onBack',
    description:
      '参考 flutter_use OtherHardClose + onBack 拦截：演示只能由内部按钮关闭的强提示公告，及按两次 Esc 才放行的拦截守卫。',
    code: `import { SmartBackType, SmartDialog } from 'fe-smart-dialog';

// 1. 强锁定弹窗：遮罩与返回均屏蔽，必须点内部按钮关闭
SmartDialog.show({
  backType: SmartBackType.block,
  clickMaskDismiss: false,
  builder: ({ dismiss }) => noticeCard,
});

// 2. onBack 守卫：第一次按 Esc 拦截提示，第二次放行
let presses = 0;
SmartDialog.show({
  onBack: () => {
    presses += 1;
    if (presses < 2) {
      SmartDialog.showToast('再按一次 Esc 确认关闭');
      return true; // 拦截
    }
    return false; // 放行关闭
  },
  builder: () => card,
});`,
    mount(stage, ctx) {
      stage.innerHTML = `
        <div class="pg-actions">
          <button class="pg-btn pg-btn--primary pg-btn--elevated" data-testid="btn-hard-close">HardClose 强提醒公告</button>
          <button class="pg-btn" data-testid="btn-onback-guard">onBack Guard（按两次 Esc）</button>
        </div>
      `;

      const q = (id: string) =>
        stage.querySelector(`[data-testid="${id}"]`) as HTMLButtonElement;

      q('btn-hard-close').onclick = () => {
        ctx.log('open hardClose notice');
        void SmartDialog.show({
          backType: SmartBackType.block,
          clickMaskDismiss: false,
          builder: ({ dismiss }) => {
            const box = document.createElement('div');
            box.className = 'pg-dialog-box';
            box.innerHTML = `
              <h3 style="margin:0 0 10px;text-align:center;">特大公告</h3>
              <p style="margin:0 0 10px;">backType: SmartBackType.block 且 clickMaskDismiss: false。</p>
              <p style="margin:0 0 16px;">此时点击外部遮罩或按 Esc 键都无法关闭，必须点击下方确认按钮！</p>
            `;
            const ok = document.createElement('button');
            ok.className = 'pg-btn pg-btn--primary';
            ok.style.width = '100%';
            ok.textContent = '我已阅知并关闭';
            ok.onclick = () => void dismiss();
            box.appendChild(ok);
            return box;
          },
        });
      };

      q('btn-onback-guard').onclick = () => {
        let presses = 0;
        ctx.log('open onBack guard dialog');
        void SmartDialog.show({
          tag: 'pg-onback',
          backType: SmartBackType.normal,
          onBack: () => {
            presses += 1;
            ctx.log(`onBack pressed #${presses}`);
            if (presses < 2) {
              void SmartDialog.showToast('再按一次 Esc 即可关闭');
              return true;
            }
            return false;
          },
          builder: ({ dismiss }) => {
            const el = document.createElement('div');
            el.className = 'pg-dialog-box';
            el.setAttribute('data-testid', 'onback-dialog-card');
            el.innerHTML =
              '<h4 style="margin:0 0 8px;">onBack Guard</h4><p style="margin:0 0 12px;">Press Esc twice to dismiss</p>';
            const btn = document.createElement('button');
            btn.className = 'pg-btn';
            btn.textContent = 'Close';
            btn.onclick = () => void dismiss();
            el.appendChild(btn);
            return el;
          },
        });
      };
    },
  },
];
