import {
  Alignment,
  NotifyType,
  SmartAllDialogType,
  SmartAnimationType,
  SmartBackType,
  SmartConfigLoading,
  SmartConfigToast,
  SmartDialog,
  SmartStatus,
  SmartToastType,
} from 'fe-smart-dialog';
import type { DemoEntry } from '../types/demo';

function createNotifyBar(ctxLog: (m: string) => void): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'pg-card';
  bar.innerHTML = '<h4>5 种内置 Notify 语义速览</h4><p>点击对比不同 NotifyType 视觉样式：</p>';
  const actions = document.createElement('div');
  actions.className = 'pg-actions';
  for (const type of Object.values(NotifyType)) {
    const btn = document.createElement('button');
    btn.className = 'pg-btn pg-btn--sm';
    btn.textContent = type;
    btn.setAttribute('data-testid', `btn-notify-${type}`);
    btn.onclick = () => {
      ctxLog(`showNotify(${type})`);
      void SmartDialog.showNotify({
        notifyType: type,
        msg: `${type.toUpperCase()} message`,
        displayTime: 2200,
      });
    };
    actions.appendChild(btn);
  }
  bar.appendChild(actions);
  return bar;
}

function makeNotifyDemo(
  id: string,
  className: string,
  label: string,
  notifyType: NotifyType,
  sampleMsg: string,
): DemoEntry {
  return {
    id,
    className,
    category: 'notify',
    route: `/notify/${label}`,
    label,
    description: `参考 flutter_use ${className}：展示 NotifyType.${notifyType} 内置语义通知卡片。`,
    code: `import { NotifyType, SmartDialog } from 'fe-smart-dialog';

SmartDialog.showNotify({
  msg: '${sampleMsg}',
  notifyType: NotifyType.${notifyType},
});`,
    mount(stage, ctx) {
      const btn = document.createElement('button');
      btn.className = 'pg-btn pg-btn--primary pg-btn--elevated';
      btn.textContent = `click me (${label})`;
      btn.setAttribute('data-testid', `btn-demo-${id}`);
      btn.onclick = () => {
        ctx.log(`SmartDialog.showNotify(${notifyType})`);
        void SmartDialog.showNotify({
          msg: sampleMsg,
          notifyType,
          displayTime: 2200,
        });
      };
      stage.append(btn, createNotifyBar(ctx.log));
    },
  };
}

export const FEEDBACK_DEMOS: DemoEntry[] = [
  // Notify (5)
  makeNotifyDemo(
    'notify-success',
    'NotifyDialogSuccess',
    'success',
    NotifyType.success,
    '操作成功，变更已即时同步。',
  ),
  makeNotifyDemo(
    'notify-failure',
    'NotifyDialogFailure',
    'failure',
    NotifyType.failure,
    '提交失败，请检查表单必填字段。',
  ),
  makeNotifyDemo(
    'notify-warning',
    'NotifyDialogWaring',
    'warning',
    NotifyType.warning,
    '请注意：当前配额接近阈值上限。',
  ),
  makeNotifyDemo(
    'notify-error',
    'NotifyDialogError',
    'error',
    NotifyType.error,
    '发生异常错误，请稍后重试。',
  ),
  makeNotifyDemo(
    'notify-alter',
    'NotifyDialogAlter',
    'alter',
    NotifyType.alert,
    '系统将于今晚 23:00 进行例行维护。',
  ),

  // Loading (4)
  {
    id: 'loading-default',
    className: 'LoadingDefault',
    category: 'loading',
    route: '/loading/default',
    label: 'default',
    description:
      '参考 flutter_use LoadingDefault：默认加载浮层，展示 2 秒后自动调用 dismiss() 关闭。',
    code: `import { SmartDialog } from 'fe-smart-dialog';

async function showDefaultLoading() {
  SmartDialog.showLoading();
  await new Promise((r) => setTimeout(r, 2000));
  SmartDialog.dismiss();
}`,
    mount(stage, ctx) {
      stage.innerHTML = `
        <button class="pg-btn pg-btn--primary pg-btn--elevated" data-testid="btn-loading-default">click me</button>
      `;
      (
        stage.querySelector('[data-testid="btn-loading-default"]') as HTMLButtonElement
      ).onclick = async () => {
        ctx.log('showLoading() for 2000ms');
        void SmartDialog.showLoading();
        await new Promise((r) => setTimeout(r, 2000));
        void SmartDialog.dismiss();
      };
    },
  },

  {
    id: 'loading-param',
    className: 'LoadingParam',
    category: 'loading',
    route: '/loading/param',
    label: 'param',
    description:
      '参考 flutter_use LoadingParam：右侧打开操作面板，分别测试 maskWidget、随机 maskColor、SmartAnimationType.scale 与 usePenetrate。',
    code: `import { Alignment, SmartAnimationType, SmartDialog, SmartStatus } from 'fe-smart-dialog';

SmartDialog.showLoading({ maskWidget: gradientOverlay });
SmartDialog.showLoading({ maskColor: 'rgba(59, 130, 246, 0.32)' });
SmartDialog.showLoading({ animationType: SmartAnimationType.scale });
SmartDialog.showLoading({ usePenetrate: true });

await new Promise((r) => setTimeout(r, 1800));
SmartDialog.dismiss({ status: SmartStatus.loading });`,
    mount(stage, ctx) {
      const paramOptions = [
        'maskWidget',
        'maskColor',
        'SmartAnimationType.scale',
        'usePenetrate',
      ] as const;

      stage.innerHTML = `
        <button class="pg-btn pg-btn--primary pg-btn--elevated" data-testid="btn-loading-param">click me（打开左侧控制栏）</button>
      `;

      const runOption = async (label: string) => {
        ctx.log(`loading param -> ${label}`);
        if (label === 'maskWidget') {
          const customMask = document.createElement('div');
          customMask.style.cssText =
            'width:100%;height:100%;opacity:0.65;background:radial-gradient(circle at 30% 30%, #60a5fa, #7c3aed 45%, #0f172a 90%);background-image:repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0 12px, transparent 12px 24px), radial-gradient(circle at 30% 30%, #60a5fa, #7c3aed 45%, #0f172a 90%);';
          void SmartDialog.showLoading({ maskWidget: customMask });
        } else if (label === 'maskColor') {
          const hue = Math.floor(Math.random() * 360);
          void SmartDialog.showLoading({ maskColor: `hsla(${hue}, 80%, 50%, 0.34)` });
        } else if (label === 'SmartAnimationType.scale') {
          void SmartDialog.showLoading({ animationType: SmartAnimationType.scale });
        } else {
          void SmartDialog.showLoading({ usePenetrate: true });
        }

        await new Promise((r) => setTimeout(r, 1800));
        void SmartDialog.dismiss({ status: SmartStatus.loading });
      };

      (
        stage.querySelector('[data-testid="btn-loading-param"]') as HTMLButtonElement
      ).onclick = () => {
        void SmartDialog.show({
          alignment: Alignment.centerLeft,
          builder: () => {
            const drawer = document.createElement('div');
            drawer.className = 'pg-handle-drawer';
            drawer.innerHTML =
              '<h4 style="margin:0;">Loading 参数切换</h4><p style="font-size:12.5px;color:var(--pg-muted);margin:0;">点击任一参数将在 Loading 层展示 1.8s：</p>';
            for (const item of paramOptions) {
              const btn = document.createElement('button');
              btn.className = 'pg-btn';
              btn.textContent = item;
              btn.onclick = () => void runOption(item);
              drawer.appendChild(btn);
            }
            return drawer;
          },
        });
      };
    },
  },

  {
    id: 'loading-custom',
    className: 'LoadingCustom',
    category: 'loading',
    route: '/loading/custom',
    label: 'custom',
    description:
      '参考 flutter_use LoadingCustom：内置 3 种自定义矢量/CSS 动效（Smile 旋转环 / Pulse Orbit / Card Spinner），零外链图片依赖。',
    code: `import { Alignment, SmartAnimationType, SmartDialog, SmartStatus } from 'fe-smart-dialog';

SmartDialog.showLoading({
  animationType: SmartAnimationType.scale,
  builder: () => customSvgSpinnerElement,
});`,
    mount(stage, ctx) {
      stage.innerHTML = `
        <button class="pg-btn pg-btn--primary pg-btn--elevated" data-testid="btn-loading-custom">click me（打开右侧款式栏）</button>
      `;

      const createCustomSpinner = (variant: 'smile' | 'orbit' | 'card') => {
        const el = document.createElement('div');
        if (variant === 'smile') {
          el.style.cssText =
            'width:96px;height:96px;display:flex;align-items:center;justify-content:center;position:relative;';
          el.innerHTML = `
            <svg width="92" height="92" viewBox="0 0 92 92" class="pg-spin" style="position:absolute;">
              <circle cx="46" cy="46" r="40" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="6"/>
              <path d="M46 6 a40 40 0 0 1 40 40" fill="none" stroke="#38bdf8" stroke-width="6" stroke-linecap="round"/>
            </svg>
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          `;
        } else if (variant === 'orbit') {
          el.style.cssText =
            'width:96px;height:96px;display:flex;align-items:center;justify-content:center;position:relative;';
          el.innerHTML = `
            <svg width="84" height="84" viewBox="0 0 84 84" class="pg-spin" style="position:absolute;">
              <circle cx="42" cy="42" r="36" fill="none" stroke="#a855f7" stroke-width="4" stroke-dasharray="90 140" stroke-linecap="round"/>
            </svg>
            <svg width="56" height="56" viewBox="0 0 56 56" class="pg-spin-reverse" style="position:absolute;">
              <circle cx="28" cy="28" r="22" fill="none" stroke="#38bdf8" stroke-width="4" stroke-dasharray="50 90" stroke-linecap="round"/>
            </svg>
          `;
        } else {
          el.className = 'pg-dialog-box';
          el.style.cssText =
            'min-width:160px;padding:18px;display:flex;flex-direction:column;align-items:center;gap:10px;';
          el.innerHTML = `
            <svg width="38" height="38" viewBox="0 0 38 38" class="pg-spin">
              <circle cx="19" cy="19" r="15" fill="none" stroke="var(--pg-border-strong)" stroke-width="4"/>
              <path d="M19 4 a15 15 0 0 1 15 15" fill="none" stroke="var(--pg-primary)" stroke-width="4" stroke-linecap="round"/>
            </svg>
            <span style="font-size:13px;font-weight:600;">loading...</span>
          `;
        }
        return el;
      };

      const openVariant = async (variant: 'smile' | 'orbit' | 'card') => {
        ctx.log(`custom loading -> ${variant}`);
        void SmartDialog.showLoading({
          animationType: SmartAnimationType.scale,
          builder: () => createCustomSpinner(variant),
        });
        await new Promise((r) => setTimeout(r, 1800));
        void SmartDialog.dismiss({ status: SmartStatus.loading });
      };

      (
        stage.querySelector('[data-testid="btn-loading-custom"]') as HTMLButtonElement
      ).onclick = () => {
        void SmartDialog.show({
          alignment: Alignment.centerRight,
          builder: () => {
            const drawer = document.createElement('div');
            drawer.className = 'pg-handle-drawer pg-handle-drawer--right';
            drawer.innerHTML =
              '<h4 style="margin:0;">Custom Loading 样式</h4><p style="font-size:12.5px;color:var(--pg-muted);margin:0;">选择任意矢量动效展示 1.8s：</p>';
            for (const item of ['smile', 'orbit', 'card'] as const) {
              const btn = document.createElement('button');
              btn.className = 'pg-btn';
              btn.textContent = item;
              btn.onclick = () => void openVariant(item);
              drawer.appendChild(btn);
            }
            return drawer;
          },
        });
      };
    },
  },

  {
    id: 'loading-least-time',
    className: 'LoadingLeastTime',
    category: 'loading',
    route: '/loading/leastTime',
    label: 'leastTime & block',
    description:
      '参考 flutter_use LoadingLeastTime：开启 leastLoadingTime 保护，即时发起 dismiss 也会保留到最小时长；另含 Esc 返回拦截测试。',
    code: `import { SmartBackType, SmartConfigLoading, SmartDialog, SmartStatus } from 'fe-smart-dialog';

SmartDialog.config.loading.leastLoadingTime = 450;
void SmartDialog.showLoading({ msg: 'Min 450ms Loading' });
setTimeout(() => {
  // 50ms 后即发起 dismiss，框架仍将保证至少展示满 450ms
  void SmartDialog.dismiss({ status: SmartStatus.loading });
}, 50);

// 阻塞 Esc 键
void SmartDialog.showLoading({
  backType: SmartBackType.block,
  usePenetrate: true,
});`,
    mount(stage, ctx) {
      stage.innerHTML = `
        <div class="pg-actions">
          <button class="pg-btn pg-btn--primary" data-testid="btn-loading-min">Loading (leastLoadingTime)</button>
          <button class="pg-btn" data-testid="btn-loading-block">Loading (Esc blocked)</button>
          <button class="pg-btn pg-btn--danger" data-testid="btn-loading-dismiss">Dismiss Loading</button>
        </div>
      `;

      const q = (id: string) =>
        stage.querySelector(`[data-testid="${id}"]`) as HTMLButtonElement;

      q('btn-loading-min').onclick = () => {
        SmartDialog.config.loading.leastLoadingTime = 450;
        ctx.log('showLoading(leastLoadingTime=450), calling dismiss at 50ms');
        void SmartDialog.showLoading({
          msg: 'Min 450ms Loading',
        });
        setTimeout(() => {
          void SmartDialog.dismiss({ status: SmartStatus.loading });
        }, 50);
      };

      q('btn-loading-block').onclick = () => {
        SmartDialog.config.loading = new SmartConfigLoading({
          leastLoadingTime: 0,
        });
        ctx.log('showLoading(backType=block)');
        void SmartDialog.showLoading({
          msg: 'Esc Blocked Loading',
          backType: SmartBackType.block,
          usePenetrate: true,
        });
      };

      q('btn-loading-dismiss').onclick = () => {
        ctx.log('manual dismiss(loading)');
        void SmartDialog.dismiss({ status: SmartStatus.loading });
      };

      return () => {
        SmartDialog.config.loading = new SmartConfigLoading();
      };
    },
  },

  // Toast (5)
  {
    id: 'toast-default',
    className: 'ToastDefault',
    category: 'toast',
    route: '/toast/default',
    label: 'default',
    description: '参考 flutter_use ToastDefault：最简一行默认 Toast 弹出体验。',
    code: `import { SmartDialog } from 'fe-smart-dialog';

SmartDialog.showToast('test toast');`,
    mount(stage, ctx) {
      stage.innerHTML = `
        <button class="pg-btn pg-btn--primary pg-btn--elevated" data-testid="btn-toast-default">click me</button>
      `;
      (
        stage.querySelector('[data-testid="btn-toast-default"]') as HTMLButtonElement
      ).onclick = () => {
        ctx.log("showToast('test toast')");
        void SmartDialog.showToast('test toast');
      };
    },
  },

  {
    id: 'toast-custom',
    className: 'ToastCustom',
    category: 'toast',
    route: '/toast/custom',
    label: 'custom',
    description:
      '参考 flutter_use ToastCustom：完全自定义 Toast 外观，带随机胶囊渐变色与矢量盾牌徽标。',
    code: `import { SmartDialog } from 'fe-smart-dialog';

SmartDialog.showToast('custom toast', {
  builder: (msg) => customPillBadge(msg),
});`,
    mount(stage, ctx) {
      stage.innerHTML = `
        <button class="pg-btn pg-btn--primary pg-btn--elevated" data-testid="btn-toast-custom">click me</button>
      `;
      (
        stage.querySelector('[data-testid="btn-toast-custom"]') as HTMLButtonElement
      ).onclick = () => {
        const hue = Math.floor(Math.random() * 360);
        const accent = (hue + 140) % 360;
        ctx.log('showToast(custom builder)');
        void SmartDialog.showToast('custom toast', {
          builder: () => {
            const pill = document.createElement('div');
            pill.style.cssText = `margin-bottom:28px;padding:8px 18px;border-radius:999px;background:hsl(${hue},78%,44%);color:#fff;display:inline-flex;align-items:center;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,0.22);font-weight:600;`;
            pill.innerHTML = `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="hsl(${accent},90%,70%)" stroke="none"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"/></svg>
              <span>custom toast</span>
            `;
            return pill;
          },
        });
      };
    },
  },

  {
    id: 'toast-type',
    className: 'ToastType',
    category: 'toast',
    route: '/toast/type',
    label: 'type (4 modes)',
    description:
      '参考 flutter_use ToastType：对比 SmartToastType 全部 4 种策略（normal / last / onlyRefresh / multi）。',
    code: `import { SmartDialog, SmartToastType } from 'fe-smart-dialog';

for (const n of ['1', '2', '3']) {
  SmartDialog.showToast(n, { displayType: SmartToastType.onlyRefresh });
}`,
    mount(stage, ctx) {
      stage.innerHTML = `
        <div class="pg-card">
          <h4>SmartToastType 四模式对比</h4>
          <p>连续发送多条消息观察队列表现或打开左侧面板连续体验：</p>
          <div class="pg-actions" style="margin-bottom: 10px;">
            <button class="pg-btn pg-btn--sm" data-testid="btn-toast-normal">normal x2</button>
            <button class="pg-btn pg-btn--sm" data-testid="btn-toast-last">last (Replace)</button>
            <button class="pg-btn pg-btn--sm" data-testid="btn-toast-refresh">onlyRefresh</button>
            <button class="pg-btn pg-btn--sm" data-testid="btn-toast-multi">multi (Stack)</button>
          </div>
          <div class="pg-actions">
            <button class="pg-btn pg-btn--primary pg-btn--sm" data-testid="btn-toast-panel">打开 flutter_use 面板</button>
            <button class="pg-btn pg-btn--danger pg-btn--sm" data-testid="btn-toast-clear">Clear Toasts</button>
          </div>
        </div>
      `;

      const q = (id: string) =>
        stage.querySelector(`[data-testid="${id}"]`) as HTMLButtonElement;

      q('btn-toast-normal').onclick = () => {
        ctx.log('Toast: normal x2');
        void SmartDialog.showToast('Toast Normal 1', {
          displayType: SmartToastType.normal,
          displayTime: 400,
        });
        void SmartDialog.showToast('Toast Normal 2', {
          displayType: SmartToastType.normal,
          displayTime: 600,
        });
      };

      q('btn-toast-last').onclick = () => {
        ctx.log('Toast: last replace');
        void SmartDialog.showToast('Last Old', {
          displayType: SmartToastType.last,
          displayTime: 2500,
        });
        void SmartDialog.showToast('Last New', {
          displayType: SmartToastType.last,
          displayTime: 2500,
        });
      };

      q('btn-toast-refresh').onclick = () => {
        ctx.log('Toast: onlyRefresh');
        void SmartDialog.showToast('Progress 10%', {
          displayType: SmartToastType.onlyRefresh,
          displayTime: 2500,
        });
        void SmartDialog.showToast('Progress 50%', {
          displayType: SmartToastType.onlyRefresh,
          displayTime: 2500,
        });
      };

      q('btn-toast-multi').onclick = () => {
        ctx.log('Toast: multi stack');
        void SmartDialog.showToast('Stacked Toast A', {
          displayType: SmartToastType.multi,
          alignment: Alignment.bottomCenter,
          displayTime: 2500,
        });
        void SmartDialog.showToast('Stacked Toast B', {
          displayType: SmartToastType.multi,
          alignment: Alignment.bottomCenter,
          displayTime: 2500,
        });
      };

      q('btn-toast-clear').onclick = () => {
        void SmartDialog.dismiss({ status: SmartStatus.allToast });
      };

      q('btn-toast-panel').onclick = () => {
        const types = [
          SmartToastType.normal,
          SmartToastType.last,
          SmartToastType.onlyRefresh,
          SmartToastType.multi,
        ];
        void SmartDialog.show({
          alignment: Alignment.centerLeft,
          builder: () => {
            const drawer = document.createElement('div');
            drawer.className = 'pg-handle-drawer';
            drawer.innerHTML =
              '<h4 style="margin:0;">Toast Type Console</h4><p style="font-size:12.5px;color:var(--pg-muted);margin:0;">点击任一类型连续弹出 1, 2, 3：</p>';
            for (const type of types) {
              const btn = document.createElement('button');
              btn.className = 'pg-btn';
              btn.textContent = type;
              btn.onclick = () => {
                ctx.log(`burst 1,2,3 (${type})`);
                void SmartDialog.showToast('1', { displayType: type });
                void SmartDialog.showToast('2', { displayType: type });
                void SmartDialog.showToast('3', { displayType: type });
              };
              drawer.appendChild(btn);
            }
            return drawer;
          },
        });
      };
    },
  },

  {
    id: 'toast-smart',
    className: 'ToastSmart',
    category: 'toast',
    route: '/toast/smart',
    label: 'smart & viewport',
    description:
      '参考 flutter_use ToastSmart：搭配可穿透输入弹窗与 checkExist() 防重复打开，并支持 VisualViewport 软键盘高度自动避让。',
    code: `import { SmartDialog } from 'fe-smart-dialog';

SmartDialog.showToast("I'm a smart toast", { displayTime: 6000 });
if (SmartDialog.checkExist()) return;

SmartDialog.show({
  usePenetrate: true,
  clickMaskDismiss: false,
  builder: () => inputBarEl,
});`,
    mount(stage, ctx) {
      stage.innerHTML = `
        <button class="pg-btn pg-btn--primary pg-btn--elevated" data-testid="btn-toast-smart">click me</button>
      `;
      (
        stage.querySelector('[data-testid="btn-toast-smart"]') as HTMLButtonElement
      ).onclick = () => {
        ctx.log('show smart toast + checkExist input dialog');
        void SmartDialog.showToast("I'm a smart toast", { displayTime: 4500 });
        if (SmartDialog.checkExist()) return;

        void SmartDialog.show({
          usePenetrate: true,
          clickMaskDismiss: false,
          builder: ({ dismiss }) => {
            const bar = document.createElement('div');
            bar.className = 'pg-dialog-box';
            bar.style.cssText = 'display:flex;gap:8px;align-items:center;';
            const input = document.createElement('input');
            input.className = 'pg-input';
            input.placeholder = '移动端聚焦时 Toast 自动上移避让';
            const close = document.createElement('button');
            close.className = 'pg-btn pg-btn--sm';
            close.textContent = 'Close';
            close.onclick = () => void dismiss();
            bar.append(input, close);
            return bar;
          },
        });
      };
    },
  },

  {
    id: 'toast-interval',
    className: 'ToastIntervalTime',
    category: 'toast',
    route: '/toast/intervalTime',
    label: 'intervalTime',
    description:
      '参考 flutter_use ToastIntervalTime：设置 intervalTime: 800ms 让队列内连续 Toast 错峰展示并在清空后复位配置。',
    code: `import { SmartAllDialogType, SmartConfigToast, SmartDialog } from 'fe-smart-dialog';

SmartDialog.config.toast = new SmartConfigToast({ intervalTime: 800 });
for (let i = 0; i < 3; i++) {
  SmartDialog.showToast(\`toast \${i}\`).then(() => {
    if (!SmartDialog.checkExist({ dialogTypes: [SmartAllDialogType.toast] })) {
      SmartDialog.config.toast = new SmartConfigToast();
    }
  });
}`,
    mount(stage, ctx) {
      stage.innerHTML = `
        <button class="pg-btn pg-btn--primary pg-btn--elevated" data-testid="btn-toast-interval">click me（3 连发间隔 800ms）</button>
      `;
      (
        stage.querySelector('[data-testid="btn-toast-interval"]') as HTMLButtonElement
      ).onclick = () => {
        SmartDialog.config.toast = new SmartConfigToast({
          intervalTime: 800,
          displayTime: 700,
        });
        ctx.log('show 3 staggered toasts (intervalTime: 800ms)');
        for (let i = 0; i < 3; i += 1) {
          void SmartDialog.showToast(`toast ${i}`).then(() => {
            if (
              !SmartDialog.checkExist({
                dialogTypes: [SmartAllDialogType.toast],
              })
            ) {
              SmartDialog.config.toast = new SmartConfigToast();
            }
          });
        }
      };

      return () => {
        SmartDialog.config.toast = new SmartConfigToast();
      };
    },
  },
];
