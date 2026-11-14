import React, { useEffect, useRef, useState } from 'react';
import { useLang } from '@rspress/core/runtime';
import {
  Alignment,
  AttachAdjustParam,
  Duration,
  NotifyType,
  Offset,
  SmartAnimationType,
  SmartAttachAlignmentType,
  SmartBackType,
  SmartDialog,
  SmartDialogController,
  SmartHighlightShape,
  SmartMaskTriggerType,
  SmartStatus,
  SmartTheme,
  SmartToastType,
  html,
} from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/react';
import {
  SmartDialogProvider as VueSmartDialogProvider,
  VueSmartDialog,
} from 'fe-smart-dialog/vue';
import { createApp, defineComponent, h, ref as vueRef } from 'vue';
import { LiveDemoCard } from './LiveDemoCard';
import { getWorkbenchHref } from './workbenchUrl';

const ALIGNMENT_MAP: Record<string, Alignment> = {
  center: Alignment.center,
  bottomCenter: Alignment.bottomCenter,
  topCenter: Alignment.topCenter,
  centerLeft: Alignment.centerLeft,
  centerRight: Alignment.centerRight,
  topLeft: Alignment.topLeft,
  topRight: Alignment.topRight,
  bottomLeft: Alignment.bottomLeft,
  bottomRight: Alignment.bottomRight,
};

const ANIMATION_MAP: Record<string, SmartAnimationType> = {
  centerScale_otherSlide: SmartAnimationType.centerScale_otherSlide,
  centerFade_otherSlide: SmartAnimationType.centerFade_otherSlide,
  scale: SmartAnimationType.scale,
  fade: SmartAnimationType.fade,
};

const cardStyle =
  'background:var(--fsd-bg,#fff);color:var(--fsd-text,#0f172a);border:1px solid var(--fsd-border,rgba(15,23,42,.12));border-radius:14px;padding:18px 20px;box-shadow:var(--fsd-shadow,0 14px 36px rgba(15,23,42,.16));min-width:260px;max-width:360px;';

export function HomeLiveDeck() {
  const lang = useLang();
  const isEn = lang === 'en';
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [statusMsg, setStatusMsg] = useState(
    isEn
      ? 'Click any layer button above to trigger a live overlay on this page.'
      : '点击上方任意按钮，直接在本页触发五层弹窗实景交互。',
  );

  const fireCustom = async () => {
    const result = await SmartDialog.show<string>({
      alignment: Alignment.center,
      animationType: SmartAnimationType.centerScale_otherSlide,
      builder: ({ dismiss }) => {
        const frag = html`
          <div style="${cardStyle}">
            <h4 style="margin:0 0 8px;font-size:15px;">${isEn ? 'Layer 1 · Custom Dialog' : 'Layer 1 · Custom 自定义弹窗'}</h4>
            <p style="margin:0 0 14px;font-size:13px;opacity:.8;line-height:1.5;">
              ${isEn
                ? 'Triggered from docs runtime. Resolves async result on close.'
                : '文档页真实挂载运行。点击下方按钮将通过 dismiss(result) 异步回传结果。'}
            </p>
            <div style="display:flex;gap:8px;justify-content:flex-end;">
              <button data-action="cancel" class="fsd-btn">Cancel</button>
              <button data-action="ok" class="fsd-btn fsd-btn--primary">Confirm</button>
            </div>
          </div>
        `;
        frag.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
          void dismiss('cancelled');
        });
        frag.querySelector('[data-action="ok"]')?.addEventListener('click', () => {
          void dismiss('confirmed');
        });
        return frag;
      },
    });
    setStatusMsg(`Custom resolved: ${String(result ?? 'mask/esc')}`);
  };

  const fireAttach = () => {
    if (!anchorRef.current) return;
    void SmartDialog.showAttach({
      targetElement: anchorRef.current,
      alignment: Alignment.bottomCenter,
      builder: ({ dismiss }) => {
        const frag = html`
          <div style="${cardStyle}padding:12px 14px;min-width:210px;">
            <div style="font-weight:700;font-size:13px;margin-bottom:4px;">Layer 2 · Attach Popover</div>
            <div style="font-size:12px;opacity:.8;margin-bottom:10px;">
              ${isEn ? 'Anchored cleanly to the trigger button.' : '精准贴靠触发按钮边缘。'}
            </div>
            <button data-action="close" class="fsd-btn fsd-btn--subtle">Dismiss</button>
          </div>
        `;
        frag.querySelector('[data-action="close"]')?.addEventListener('click', () => {
          void dismiss();
        });
        return frag;
      },
    });
    setStatusMsg(isEn ? 'Layer 2 Attach opened' : 'Layer 2 Attach 锚点气泡已弹出');
  };

  const fireNotify = () => {
    void SmartDialog.showNotify({
      notifyType: NotifyType.success,
      msg: isEn
        ? 'Notify layer stays above Custom & Attach!'
        : 'Notify 层始终浮于 Custom / Attach 之上！',
    });
    setStatusMsg('showNotify(NotifyType.success)');
  };

  const fireLoading = async () => {
    void SmartDialog.showLoading({ msg: isEn ? 'Loading Layer 4...' : 'Layer 4 加载中...' });
    setStatusMsg('showLoading() -> auto dismiss after 1.1s');
    setTimeout(() => {
      void SmartDialog.dismiss({ status: SmartStatus.loading });
    }, 1100);
  };

  const fireToast = () => {
    void SmartDialog.showToast(
      isEn ? 'Toast Layer 5 stays on top of everything!' : 'Toast 层始终处于最高层级！',
    );
    setStatusMsg('showToast()');
  };

  return (
    <section className="fsd-home-deck" data-testid="home-live-deck">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '14px',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>
            {isEn ? '60-Second Interactive 5-Layer Live Tryout' : '60 秒实景体验：五层独立弹窗栈'}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: 'var(--rp-c-text-2)' }}>
            {isEn
              ? 'Stack priority from top to bottom: Toast > Loading > Notify > Attach > Custom.'
              : '层级固定由高到低：Toast > Loading > Notify > Attach > Custom，互不踩踏 z-index。'}
          </p>
        </div>
        <a
          href={getWorkbenchHref()}
          data-testid="home-open-workbench"
          className="fsd-btn fsd-btn--primary"
        >
          {isEn ? 'Explore 37 Interactive Demos ->' : '打开 37 个全量工作台 ->'}
        </a>
      </div>

      <div className="fsd-target-grid">
        <button
          type="button"
          className="fsd-btn fsd-btn--primary"
          data-testid="home-deck-custom"
          onClick={() => void fireCustom()}
        >
          1. Custom Modal
        </button>
        <button
          ref={anchorRef}
          type="button"
          className="fsd-btn"
          data-testid="home-deck-attach"
          onClick={fireAttach}
        >
          2. Attach Popover
        </button>
        <button
          type="button"
          className="fsd-btn"
          data-testid="home-deck-notify"
          onClick={fireNotify}
        >
          3. Notify Banner
        </button>
        <button
          type="button"
          className="fsd-btn"
          data-testid="home-deck-loading"
          onClick={() => void fireLoading()}
        >
          4. Loading Spinner
        </button>
        <button
          type="button"
          className="fsd-btn"
          data-testid="home-deck-toast"
          onClick={fireToast}
        >
          5. Top Toast
        </button>
        <button
          type="button"
          className="fsd-btn"
          onClick={() => void SmartDialog.dismiss({ status: SmartStatus.allDialog, force: true })}
        >
          {isEn ? 'Force Dismiss All' : '强制清空全部'}
        </button>
      </div>

      <div className="fsd-demo-log" data-testid="home-deck-status">
        {statusMsg}
      </div>
    </section>
  );
}

export function QuickStartCard() {
  return (
    <LiveDemoCard
      id="quick-start"
      titleZh="试一试：第一行可用代码（异步返回值 + Toast）"
      titleEn="Try It Live: Your First Async Modal & Toast"
      descZh="无需写挂载节点：导入 SmartDialog 后即可随时随地调用，关闭弹窗时可直接 await 拿到返回值。"
      descEn="Zero mount boilerplate: call SmartDialog anywhere and await typed user results."
      workbenchId="CustomDialogEasy"
      actions={[
        {
          id: 'open-confirm',
          labelZh: '弹出确认框 (await 返回结果)',
          labelEn: 'Open Async Confirm',
          variant: 'primary',
          onRun: async (ctx) => {
            const answer = await SmartDialog.show<'agree' | 'later'>({
              builder: ({ dismiss }) => {
                const frag = html`
                  <div style="${cardStyle}">
                    <h4 style="margin:0 0 8px;font-size:15px;">${ctx.isEn ? 'Publish release?' : '确认发布当前版本？'}</h4>
                    <p style="margin:0 0 14px;font-size:13px;opacity:.8;">
                      ${ctx.isEn ? 'Choosing an option resolves await SmartDialog.show().' : '点击任一按钮都会结束 Promise 并返回结果。'}
                    </p>
                    <div style="display:flex;gap:8px;justify-content:flex-end;">
                      <button data-res="later" class="fsd-btn">${ctx.isEn ? 'Later' : '稍后'}</button>
                      <button data-res="agree" class="fsd-btn fsd-btn--primary">${ctx.isEn ? 'Publish' : '立即发布'}</button>
                    </div>
                  </div>
                `;
                frag.querySelector('[data-res="later"]')?.addEventListener('click', () => void dismiss('later'));
                frag.querySelector('[data-res="agree"]')?.addEventListener('click', () => void dismiss('agree'));
                return frag;
              },
            });
            ctx.log(`await SmartDialog.show() -> ${String(answer ?? 'dismissed')}`);
            if (answer === 'agree') {
              void SmartDialog.showToast(ctx.isEn ? 'Published!' : '已发布！');
            }
          },
        },
        {
          id: 'quick-toast',
          labelZh: '触发 Toast',
          labelEn: 'Show Toast',
          onRun: (ctx) => {
            void SmartDialog.showToast(ctx.isEn ? 'Saved to cloud!' : '已自动保存到云端');
            ctx.log('SmartDialog.showToast(...)');
          },
        },
      ]}
      snippets={{
        vanilla: `import { SmartDialog, html } from 'fe-smart-dialog';

const action = await SmartDialog.show<'agree' | 'later'>({
  builder: ({ dismiss }) => {
    const frag = html\`
      <div class="card">
        <h4>确认发布当前版本？</h4>
        <button data-ok>立即发布</button>
      </div>
    \`;
    frag.querySelector('[data-ok]')?.addEventListener('click', () => dismiss('agree'));
    return frag;
  },
});

if (action === 'agree') {
  SmartDialog.showToast('已发布！');
}`,
        react: `import { SmartDialogProvider, useSmartDialog } from 'fe-smart-dialog/react';

// 1) Wrap root once: <SmartDialogProvider><App /></SmartDialogProvider>
function PublishButton() {
  const smartDialog = useSmartDialog();

  const onClick = async () => {
    const res = await smartDialog.show<'agree' | 'later'>({
      builder: ({ dismiss }) => (
        <div className="card">
          <h4>Publish release?</h4>
          <button onClick={() => dismiss('agree')}>Confirm</button>
        </div>
      ),
    });
    if (res === 'agree') smartDialog.showToast('Published!');
  };

  return <button onClick={onClick}>Publish</button>;
}`,
        vue: `import { SmartDialogPlugin, useSmartDialog } from 'fe-smart-dialog/vue';
import { h } from 'vue';

// main.ts: app.use(SmartDialogPlugin)
const smartDialog = useSmartDialog();

const action = await smartDialog.show<'agree' | 'later'>({
  builder: ({ dismiss }) =>
    h('div', { class: 'card' }, [
      h('h4', 'Publish release?'),
      h('button', { onClick: () => dismiss('agree') }, 'Confirm'),
    ]),
});`,
        cdn: `<script src="https://unpkg.com/fe-smart-dialog/dist/index.global.js"></script>
<script>
  const { SmartDialog } = window.FeSmartDialog;
  SmartDialog.showToast('Hello from UMD CDN!');
</script>`,
      }}
    />
  );
}

export function FrameworkBridgeCard() {
  const reactSmartDialog = useSmartDialog();
  const vueMountRef = useRef<HTMLDivElement | null>(null);
  const vueTriggerRef = useRef<(() => void) | null>(null);
  const [vueReady, setVueReady] = useState(false);

  useEffect(() => {
    const host = vueMountRef.current;
    if (!host) return;
    const Child = defineComponent({
      setup() {
        const count = vueRef(1);
        vueTriggerRef.current = () => {
          void VueSmartDialog.show({
            builder: ({ dismiss }) =>
              h(
                'div',
                {
                  style: cardStyle,
                },
                [
                  h('h4', { style: 'margin:0 0 8px;font-size:15px;' }, 'Vue 3 Teleport Modal'),
                  h(
                    'p',
                    { style: 'margin:0 0 12px;font-size:13px;opacity:.85;' },
                    `Reactive count inside Vue VNode: ${count.value}`,
                  ),
                  h('div', { style: 'display:flex;gap:8px;justify-content:flex-end;' }, [
                    h(
                      'button',
                      {
                        class: 'fsd-btn',
                        onClick: () => {
                          count.value += 1;
                        },
                      },
                      `+1 (${count.value})`,
                    ),
                    h(
                      'button',
                      {
                        class: 'fsd-btn fsd-btn--primary',
                        onClick: () => void dismiss(),
                      },
                      'Close',
                    ),
                  ]),
                ],
              ),
          });
        };
        return () => h(VueSmartDialogProvider);
      },
    });
    const app = createApp(Child);
    app.mount(host);
    setVueReady(true);
    return () => {
      vueTriggerRef.current = null;
      app.unmount();
    };
  }, []);

  return (
    <LiveDemoCard
      id="framework-bridge"
      titleZh="框架桥接实操：React JSX / Vue 3 VNode / Vanilla TS"
      titleEn="Multi-Framework Bridge: React JSX, Vue 3 VNode & Vanilla TS"
      descZh="在同一个页面里同时验证原生 DOM、React 19 JSX Portal 与 Vue 3 VNode Teleport。"
      descEn="Trigger real Vanilla DOM, React 19 JSX Portal, and Vue 3 Teleport modals side-by-side."
      workbenchId="ReactSandbox"
      renderStageExtra={() => <div ref={vueMountRef} style={{ display: 'none' }} />}
      actions={[
        {
          id: 'open-react',
          labelZh: '弹出 React JSX 弹窗',
          labelEn: 'Open React JSX Modal',
          variant: 'primary',
          onRun: (ctx) => {
            ctx.log('ReactSmartDialog.show({ builder: JSX })');
            void reactSmartDialog.show({
              builder: ({ dismiss }) => (
                <div
                  style={{
                    background: 'var(--fsd-bg, #fff)',
                    color: 'var(--fsd-text, #0f172a)',
                    border: '1px solid var(--fsd-border, rgba(15,23,42,.12))',
                    borderRadius: 14,
                    padding: '18px 20px',
                    boxShadow: 'var(--fsd-shadow, 0 14px 36px rgba(15,23,42,.16))',
                    minWidth: 260,
                  }}
                >
                  <h4 style={{ margin: '0 0 8px', fontSize: 15 }}>React Portal Dialog</h4>
                  <p style={{ margin: '0 0 14px', fontSize: 13, opacity: 0.85 }}>
                    {ctx.isEn
                      ? 'Rendered inside SmartDialogProvider so React context works seamlessly.'
                      : '渲染于 SmartDialogProvider Portal 内，天然继承主题/路由/状态 Context。'}
                  </p>
                  <button
                    type="button"
                    className="fsd-btn fsd-btn--primary"
                    onClick={() => void dismiss()}
                  >
                    {ctx.isEn ? 'Close React Dialog' : '关闭 React 弹窗'}
                  </button>
                </div>
              ),
            });
          },
        },
        {
          id: 'open-vue',
          labelZh: vueReady ? '弹出 Vue 3 VNode 弹窗' : '初始化 Vue...',
          labelEn: vueReady ? 'Open Vue 3 VNode Modal' : 'Mounting Vue...',
          onRun: (ctx) => {
            ctx.log('VueSmartDialog.show({ builder: () => h(...) })');
            vueTriggerRef.current?.();
          },
        },
      ]}
      snippets={{
        react: `import { SmartDialogProvider, useSmartDialog } from 'fe-smart-dialog/react';

export function Root() {
  return (
    <SmartDialogProvider>
      <MyPage />
    </SmartDialogProvider>
  );
}

function MyPage() {
  const dialog = useSmartDialog();
  return (
    <button
      onClick={() =>
        dialog.show({
          builder: ({ dismiss }) => (
            <div className="modal">
              <h3>React JSX Modal</h3>
              <button onClick={() => dismiss('ok')}>Done</button>
            </div>
          ),
        })
      }
    >
      Open
    </button>
  );
}`,
        vue: `import { createApp, h } from 'vue';
import { SmartDialogPlugin, useSmartDialog } from 'fe-smart-dialog/vue';

const app = createApp(App);
app.use(SmartDialogPlugin); // Registers <SmartDialogProvider /> & $smartDialog

// Inside setup():
const dialog = useSmartDialog();
dialog.show({
  builder: ({ dismiss }) =>
    h('div', { class: 'modal' }, [
      h('h3', 'Vue 3 Modal'),
      h('button', { onClick: () => dismiss('ok') }, 'Done'),
    ]),
});`,
        vanilla: `import { SmartDialog, html } from 'fe-smart-dialog';

SmartDialog.show({
  builder: ({ dismiss }) => {
    const frag = html\`<div class="modal"><h3>Vanilla TS</h3><button data-ok>Done</button></div>\`;
    frag.querySelector('[data-ok]')?.addEventListener('click', () => dismiss('ok'));
    return frag;
  },
});`,
      }}
    />
  );
}

export function ConceptsLayerCard() {
  return (
    <LiveDemoCard
      id="concepts-layer"
      titleZh="栈管理实战：tag 定点关闭、keepSingle 与 permanent"
      titleEn="Stack Control: tag, keepSingle & permanent"
      descZh="依次压入带 tag 的栈层并用 SmartDialog.dismiss({ tag }) 定点拆除，对比 keepSingle 复用与 permanent 常驻保护。"
      descEn="Push tagged layers, dismiss a middle tag precisely, or toggle keepSingle / permanent protection."
      workbenchId="CustomDialogStack"
      actions={[
        {
          id: 'push-two',
          labelZh: '压入 Bottom + Center 两层 (tag)',
          labelEn: 'Push Bottom & Center (Tagged)',
          variant: 'primary',
          onRun: (ctx) => {
            ctx.log("show tag='drawer-bottom' + tag='modal-center'");
            void SmartDialog.show({
              tag: 'drawer-bottom',
              alignment: Alignment.bottomCenter,
              usePenetrate: true,
              clickMaskDismiss: false,
              builder: ({ dismiss }) => {
                const frag = html`
                  <div style="${cardStyle}width:min(520px,92vw);display:flex;justify-content:space-between;align-items:center;">
                    <span><b>tag: "drawer-bottom"</b> · ${ctx.isEn ? 'Layered below center modal' : '底层抽屉'}</span>
                    <button data-close class="fsd-btn fsd-btn--subtle">Dismiss Bottom</button>
                  </div>
                `;
                frag.querySelector('[data-close]')?.addEventListener('click', () => void dismiss());
                return frag;
              },
            });
            void SmartDialog.show({
              tag: 'modal-center',
              alignment: Alignment.center,
              usePenetrate: true,
              clickMaskDismiss: false,
              builder: ({ dismiss }) => {
                const frag = html`
                  <div style="${cardStyle}">
                    <h4 style="margin:0 0 8px;">tag: "modal-center"</h4>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                      <button data-kill-bottom class="fsd-btn">dismiss(&#123; tag: 'drawer-bottom' &#125;)</button>
                      <button data-close class="fsd-btn fsd-btn--primary">Close Self</button>
                    </div>
                  </div>
                `;
                frag.querySelector('[data-kill-bottom]')?.addEventListener('click', () => {
                  ctx.log("SmartDialog.dismiss({ tag: 'drawer-bottom' })");
                  void SmartDialog.dismiss({ tag: 'drawer-bottom' });
                });
                frag.querySelector('[data-close]')?.addEventListener('click', () => void dismiss());
                return frag;
              },
            });
          },
        },
        {
          id: 'show-permanent',
          labelZh: '弹出 permanent (普通 dismiss 无法关闭)',
          labelEn: 'Open permanent Modal',
          onRun: (ctx) => {
            ctx.log('show permanent: true -> requires tag or force: true');
            void SmartDialog.show({
              tag: 'sticky-banner',
              permanent: true,
              usePenetrate: true,
              alignment: Alignment.topCenter,
              builder: () =>
                html`
                  <div style="${cardStyle}display:flex;gap:12px;align-items:center;">
                    <span><b>permanent: true</b> · ${ctx.isEn ? 'Immune to regular dismiss()' : '忽略普通 dismiss()'}</span>
                  </div>
                `,
            });
          },
        },
        {
          id: 'force-dismiss',
          labelZh: 'force: true 清空全部',
          labelEn: 'Force Clear All',
          onRun: (ctx) => {
            ctx.log('SmartDialog.dismiss({ status: SmartStatus.allCustom, force: true })');
            void SmartDialog.dismiss({ status: SmartStatus.allCustom, force: true });
          },
        },
      ]}
      snippets={{
        vanilla: `import { Alignment, SmartDialog, SmartStatus } from 'fe-smart-dialog';

// 1. 按 tag 精准管理多层弹窗
SmartDialog.show({ tag: 'drawer', alignment: Alignment.bottomCenter, builder: ... });
SmartDialog.show({ tag: 'confirm', alignment: Alignment.center, builder: ... });
await SmartDialog.dismiss({ tag: 'drawer' });

// 2. keepSingle: true —— 同一位置更新而不重复叠加
SmartDialog.show({ keepSingle: true, alignment: Alignment.centerRight, builder: ... });

// 3. permanent: true —— 必须显式指定 tag 或 force: true 才会关闭
SmartDialog.show({ tag: 'notice', permanent: true, builder: ... });
await SmartDialog.dismiss({ status: SmartStatus.allCustom, force: true });`,
      }}
    />
  );
}

export function CustomDialogPlayground() {
  return (
    <LiveDemoCard
      id="custom-dialog"
      titleZh="Custom 弹窗参数实验台"
      titleEn="Custom Dialog Parameter Playground"
      descZh="实时调整 Alignment 方位、动画类型、穿透事件与遮罩行为，点击“弹出弹窗”即时验证效果。"
      descEn="Tune Alignment, animationType, usePenetrate, clickMaskDismiss and useSystem interactively."
      workbenchId="CustomDialogLocation"
      knobs={[
        {
          key: 'alignment',
          labelZh: '对齐位置 (alignment)',
          labelEn: 'Alignment',
          type: 'select',
          defaultValue: 'center',
          options: Object.keys(ALIGNMENT_MAP).map((k) => ({ value: k, label: `Alignment.${k}` })),
        },
        {
          key: 'animationType',
          labelZh: '动画类型 (animationType)',
          labelEn: 'Animation Type',
          type: 'select',
          defaultValue: 'centerScale_otherSlide',
          options: Object.keys(ANIMATION_MAP).map((k) => ({
            value: k,
            label: `SmartAnimationType.${k}`,
          })),
        },
        {
          key: 'clickMaskDismiss',
          labelZh: '点击遮罩关闭',
          labelEn: 'clickMaskDismiss',
          type: 'boolean',
          defaultValue: true,
        },
        {
          key: 'usePenetrate',
          labelZh: '事件穿透 (usePenetrate)',
          labelEn: 'usePenetrate',
          type: 'boolean',
          defaultValue: false,
        },
        {
          key: 'useSystem',
          labelZh: '原生 <dialog> Top Layer',
          labelEn: 'useSystem (<dialog>)',
          type: 'boolean',
          defaultValue: false,
        },
      ]}
      actions={[
        {
          id: 'launch',
          labelZh: '弹出 Custom 弹窗',
          labelEn: 'Launch Custom Dialog',
          variant: 'primary',
          onRun: async (ctx) => {
            const alignmentKey = String(ctx.knobs.alignment);
            const animationKey = String(ctx.knobs.animationType);
            const clickMaskDismiss = Boolean(ctx.knobs.clickMaskDismiss);
            const usePenetrate = Boolean(ctx.knobs.usePenetrate);
            const useSystem = Boolean(ctx.knobs.useSystem);

            const res = await SmartDialog.show<string>({
              alignment: ALIGNMENT_MAP[alignmentKey] ?? Alignment.center,
              animationType: ANIMATION_MAP[animationKey],
              clickMaskDismiss,
              usePenetrate,
              useSystem,
              builder: ({ dismiss }) => {
                const frag = html`
                  <div style="${cardStyle}">
                    <h4 style="margin:0 0 8px;">Custom (${alignmentKey})</h4>
                    <p style="margin:0 0 12px;font-size:12.5px;opacity:.8;">
                      animation=${animationKey} · penetrate=${String(usePenetrate)} · system=${String(useSystem)}
                    </p>
                    <button data-close class="fsd-btn fsd-btn--primary">dismiss('done')</button>
                  </div>
                `;
                frag.querySelector('[data-close]')?.addEventListener('click', () => {
                  void dismiss('done');
                });
                return frag;
              },
            });
            ctx.log(`Resolved result: ${String(res ?? 'closed by mask/esc')}`);
          },
        },
      ]}
      snippets={{
        vanilla: (k) => `import { Alignment, SmartAnimationType, SmartDialog } from 'fe-smart-dialog';

const res = await SmartDialog.show<string>({
  alignment: Alignment.${k.alignment},
  animationType: SmartAnimationType.${k.animationType},
  clickMaskDismiss: ${String(k.clickMaskDismiss)},
  usePenetrate: ${String(k.usePenetrate)},
  useSystem: ${String(k.useSystem)},
  builder: ({ dismiss }) => {
    const el = document.createElement('div');
    el.innerHTML = '<button>Confirm</button>';
    el.querySelector('button')!.onclick = () => dismiss('done');
    return el;
  },
});`,
        react: (k) => `import { Alignment, SmartAnimationType } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/react';

const smartDialog = useSmartDialog();
await smartDialog.show<string>({
  alignment: Alignment.${k.alignment},
  animationType: SmartAnimationType.${k.animationType},
  clickMaskDismiss: ${String(k.clickMaskDismiss)},
  usePenetrate: ${String(k.usePenetrate)},
  useSystem: ${String(k.useSystem)},
  builder: ({ dismiss }) => <button onClick={() => dismiss('done')}>Confirm</button>,
});`,
      }}
    />
  );
}

export function CustomPenetrateDemo() {
  return (
    <LiveDemoCard
      id="custom-penetrate"
      titleZh="交互穿透与 MaskTriggerType 触发时机"
      titleEn="Pointer Penetrate & SmartMaskTriggerType"
      descZh="开启 usePenetrate: true 后遮罩不拦截底层页面滚动或按钮点击；还可自定义 maskTriggerType（pointerup / pointerdown / pointermove）。"
      descEn="Keep underlying controls interactive with usePenetrate: true or tune maskTriggerType (up/down/move)."
      workbenchId="CustomDialogPenetrate"
      knobs={[
        {
          key: 'trigger',
          labelZh: '遮罩触发时机 (maskTriggerType)',
          labelEn: 'maskTriggerType',
          type: 'select',
          defaultValue: 'up',
          options: [
            { value: 'up', label: 'SmartMaskTriggerType.up' },
            { value: 'down', label: 'SmartMaskTriggerType.down' },
            { value: 'move', label: 'SmartMaskTriggerType.move' },
          ],
        },
      ]}
      actions={[
        {
          id: 'open-penetrate',
          labelZh: '打开穿透悬浮面板',
          labelEn: 'Open Penetrate Drawer',
          variant: 'primary',
          onRun: (ctx) => {
            const trigger = String(ctx.knobs.trigger) as keyof typeof SmartMaskTriggerType;
            SmartDialog.config.custom.maskTriggerType = SmartMaskTriggerType[trigger];
            ctx.log(`usePenetrate=true, config.custom.maskTriggerType=${trigger}`);
            void SmartDialog.show({
              alignment: Alignment.centerRight,
              usePenetrate: true,
              builder: ({ dismiss }) => {
                const frag = html`
                  <div style="${cardStyle}width:240px;">
                    <h4 style="margin:0 0 8px;">Penetrate Drawer</h4>
                    <p style="margin:0 0 12px;font-size:12.5px;opacity:.85;">
                      ${ctx.isEn ? 'You can still click page buttons underneath while this stays open!' : '弹窗开启时，你依然可以直接点击下方页面按钮！'}
                    </p>
                    <button data-ok class="fsd-btn fsd-btn--primary">Close</button>
                  </div>
                `;
                frag.querySelector('[data-ok]')?.addEventListener('click', () => void dismiss());
                return frag;
              },
            });
          },
        },
        {
          id: 'under-btn',
          labelZh: '测试底层按钮点击',
          labelEn: 'Test Underlying Click',
          onRun: (ctx) => {
            ctx.log(ctx.isEn ? 'Underlying button received click!' : '底层按钮成功收到点击事件！');
          },
        },
      ]}
      snippets={{
        vanilla: (k) => `import { Alignment, SmartDialog, SmartMaskTriggerType } from 'fe-smart-dialog';

SmartDialog.config.custom.maskTriggerType = SmartMaskTriggerType.${k.trigger};

SmartDialog.show({
  alignment: Alignment.centerRight,
  usePenetrate: true,
  builder: ({ dismiss }) => floatingPanelElement,
});`,
      }}
    />
  );
}

export function AttachPopoverPlayground() {
  return (
    <LiveDemoCard
      id="attach-popover"
      titleZh="Attach 锚点定位：方位矩阵 + 边缘自适应"
      titleEn="Attach Popover: Alignment Matrix & Viewport Auto-Flip"
      descZh="调整相对目标元素的 alignment 与全局 attachAlignmentType（outside / inside / center），也支持 adjustBuilder 自动防溢出翻转。"
      descEn="Anchor a popover around the target element with Alignment & SmartAttachAlignmentType (outside/inside/center)."
      workbenchId="AttachDialogLocation"
      hasAttachTarget
      attachTargetLabelZh="点击测试 Attach 目标元素"
      attachTargetLabelEn="Click Target to Attach"
      knobs={[
        {
          key: 'alignment',
          labelZh: '贴靠方向 (alignment)',
          labelEn: 'Alignment',
          type: 'select',
          defaultValue: 'bottomCenter',
          options: [
            { value: 'topLeft', label: 'topLeft' },
            { value: 'topCenter', label: 'topCenter' },
            { value: 'topRight', label: 'topRight' },
            { value: 'bottomLeft', label: 'bottomLeft' },
            { value: 'bottomCenter', label: 'bottomCenter' },
            { value: 'bottomRight', label: 'bottomRight' },
            { value: 'centerLeft', label: 'centerLeft' },
            { value: 'centerRight', label: 'centerRight' },
          ],
        },
        {
          key: 'attachAlignmentType',
          labelZh: '边缘对齐 (attachAlignmentType)',
          labelEn: 'attachAlignmentType',
          type: 'select',
          defaultValue: 'center',
          options: [
            { value: 'center', label: 'SmartAttachAlignmentType.center' },
            { value: 'inside', label: 'SmartAttachAlignmentType.inside' },
            { value: 'outside', label: 'SmartAttachAlignmentType.outside' },
          ],
        },
      ]}
      actions={[
        {
          id: 'open-attach',
          labelZh: '触发 Attach 气泡',
          labelEn: 'Open Attach Popover',
          variant: 'primary',
          onRun: (ctx) => {
            const target = ctx.targetRef.current;
            if (!target) return;
            const alignmentKey = String(ctx.knobs.alignment);
            const alignTypeKey = String(
              ctx.knobs.attachAlignmentType,
            ) as keyof typeof SmartAttachAlignmentType;

            SmartDialog.config.attach.attachAlignmentType =
              SmartAttachAlignmentType[alignTypeKey];
            ctx.log(`showAttach alignment=${alignmentKey}, type=${alignTypeKey}`);

            void SmartDialog.showAttach({
              targetElement: target,
              alignment: ALIGNMENT_MAP[alignmentKey] ?? Alignment.bottomCenter,
              scalePointBuilder: (size) =>
                new Offset(size.width * 0.5, alignmentKey.startsWith('top') ? size.height : 0),
              adjustBuilder: (param) => {
                const overflowBottom =
                  param.selfOffset.y + param.selfSize.height > window.innerHeight - 12;
                const overflowTop = param.selfOffset.y < 12;
                if (overflowBottom && !overflowTop) {
                  return new AttachAdjustParam({ alignment: Alignment.topCenter });
                }
                if (overflowTop && !overflowBottom) {
                  return new AttachAdjustParam({ alignment: Alignment.bottomCenter });
                }
                return new AttachAdjustParam();
              },
              builder: ({ dismiss }) => {
                const frag = html`
                  <div style="${cardStyle}padding:12px 14px;min-width:220px;">
                    <div style="font-weight:700;font-size:13px;">Attach (${alignmentKey})</div>
                    <div style="font-size:12px;opacity:.8;margin:4px 0 10px;">
                      attachAlignmentType = <code>${alignTypeKey}</code>
                    </div>
                    <button data-close class="fsd-btn fsd-btn--subtle">Dismiss</button>
                  </div>
                `;
                frag.querySelector('[data-close]')?.addEventListener('click', () => void dismiss());
                return frag;
              },
            });
          },
        },
      ]}
      snippets={{
        vanilla: (k) => `import { Alignment, AttachAdjustParam, Offset, SmartAttachAlignmentType, SmartDialog } from 'fe-smart-dialog';

SmartDialog.config.attach.attachAlignmentType = SmartAttachAlignmentType.${k.attachAlignmentType};

SmartDialog.showAttach({
  targetElement: document.querySelector('#trigger-btn')!,
  alignment: Alignment.${k.alignment},
  scalePointBuilder: (size) => new Offset(size.width * 0.5, 0),
  adjustBuilder: (param) => {
    if (param.selfOffset.y + param.selfSize.height > window.innerHeight - 12) {
      return new AttachAdjustParam({ alignment: Alignment.topCenter });
    }
    return new AttachAdjustParam();
  },
  builder: ({ dismiss }) => popoverElement,
});`,
        react: (k) => `import { useRef } from 'react';
import { Alignment } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/react';

const triggerRef = useRef<HTMLButtonElement>(null);
const smartDialog = useSmartDialog();

smartDialog.showAttach({
  targetElement: triggerRef.current,
  alignment: Alignment.${k.alignment},
  builder: ({ dismiss }) => <PopoverCard onClose={dismiss} />,
});`,
      }}
    />
  );
}

export function SpotlightGuideCard() {
  const stepOneRef = useRef<HTMLButtonElement | null>(null);
  const stepTwoRef = useRef<HTMLButtonElement | null>(null);

  return (
    <LiveDemoCard
      id="attach-spotlight"
      titleZh="新手引导：SVG evenodd 聚光灯挖空 (highlightBuilder)"
      titleEn="Onboarding Spotlight with SVG evenodd Cutout"
      descZh="利用 highlightBuilder 返回目标挖空矩形/圆形区域（shape: SmartHighlightShape.rect | circle），轻松实现 2 步透明引导。"
      descEn="Return a rect or circle cutout via highlightBuilder for multi-step product onboarding tours."
      workbenchId="AttachDialogGuide"
      renderStageExtra={(ctx) => (
        <div className="fsd-target-grid" style={{ marginTop: '12px' }}>
          <button ref={stepOneRef} type="button" className="fsd-btn">
            {ctx.isEn ? 'Step 1 Target (Rect)' : '引导步骤 1（圆角矩形挖空）'}
          </button>
          <button
            ref={stepTwoRef}
            type="button"
            className="fsd-btn"
            style={{ borderRadius: '999px' }}
          >
            {ctx.isEn ? 'Step 2 Target (Circle)' : '引导步骤 2（圆形高亮）'}
          </button>
        </div>
      )}
      actions={[
        {
          id: 'start-tour',
          labelZh: '开始 2 步聚光灯引导',
          labelEn: 'Start 2-Step Spotlight Tour',
          variant: 'primary',
          onRun: async (ctx) => {
            if (!stepOneRef.current || !stepTwoRef.current) return;
            ctx.log('Tour step 1 -> rect highlight');

            await SmartDialog.showAttach({
              targetElement: stepOneRef.current,
              alignment: Alignment.bottomCenter,
              maskColor: 'rgba(15, 23, 42, 0.72)',
              highlightBuilder: (offset, size) => ({
                left: offset.dx - 6,
                top: offset.dy - 6,
                width: size.width + 12,
                height: size.height + 12,
                borderRadius: 10,
                shape: SmartHighlightShape.rect,
              }),
              builder: ({ dismiss }) => {
                const frag = html`
                  <div style="${cardStyle}">
                    <h4 style="margin:0 0 6px;">Step 1 / 2 · Rect Spotlight</h4>
                    <p style="margin:0 0 10px;font-size:12.5px;opacity:.8;">
                      ${ctx.isEn ? 'Next step switches to circular spotlight.' : '点击 Next 进入圆形高亮第二步。'}
                    </p>
                    <button data-next class="fsd-btn fsd-btn--primary">Next -&gt;</button>
                  </div>
                `;
                frag.querySelector('[data-next]')?.addEventListener('click', () => void dismiss(true));
                return frag;
              },
            });

            ctx.log('Tour step 2 -> circle highlight');
            await SmartDialog.showAttach({
              targetElement: stepTwoRef.current,
              alignment: Alignment.bottomCenter,
              maskColor: 'rgba(15, 23, 42, 0.72)',
              highlightBuilder: (offset, size) => ({
                left: offset.dx - 8,
                top: offset.dy - 8,
                width: size.width + 16,
                height: size.height + 16,
                shape: SmartHighlightShape.circle,
              }),
              builder: ({ dismiss }) => {
                const frag = html`
                  <div style="${cardStyle}">
                    <h4 style="margin:0 0 6px;">Step 2 / 2 · Circle Spotlight</h4>
                    <button data-done class="fsd-btn fsd-btn--primary">Finish Tour</button>
                  </div>
                `;
                frag.querySelector('[data-done]')?.addEventListener('click', () => void dismiss());
                return frag;
              },
            });
          },
        },
      ]}
      snippets={{
        vanilla: `import { Alignment, SmartDialog, SmartHighlightShape } from 'fe-smart-dialog';

await SmartDialog.showAttach({
  targetElement: stepOneButton,
  alignment: Alignment.bottomCenter,
  maskColor: 'rgba(15, 23, 42, 0.72)',
  highlightBuilder: (offset, size) => ({
    left: offset.dx - 6,
    top: offset.dy - 6,
    width: size.width + 12,
    height: size.height + 12,
    borderRadius: 10,
    shape: SmartHighlightShape.rect, // 或 SmartHighlightShape.circle
  }),
  builder: ({ dismiss }) => guideBubbleElement,
});`,
      }}
    />
  );
}

export function FeedbackSuiteCard() {
  return (
    <LiveDemoCard
      id="feedback-suite"
      titleZh="Notify / Loading / Toast 反馈三件套"
      titleEn="Notify, Loading & Toast Interactive Suite"
      descZh="切换 Notify 语义色、Toast 队列模式（normal / last / onlyRefresh / multi）与 Loading 防闪烁 leastLoadingTime。"
      descEn="Test semantic Notify types, Toast queue strategies, and anti-flicker Loading timers."
      workbenchId="ToastType"
      knobs={[
        {
          key: 'notifyType',
          labelZh: 'Notify 语义类型',
          labelEn: 'NotifyType',
          type: 'select',
          defaultValue: 'success',
          options: Object.values(NotifyType).map((t) => ({ value: t, label: `NotifyType.${t}` })),
        },
        {
          key: 'toastType',
          labelZh: 'Toast 队列模式',
          labelEn: 'SmartToastType',
          type: 'select',
          defaultValue: 'normal',
          options: Object.values(SmartToastType).map((t) => ({
            value: t,
            label: `SmartToastType.${t}`,
          })),
        },
      ]}
      actions={[
        {
          id: 'run-notify',
          labelZh: '触发 Notify',
          labelEn: 'Show Notify',
          variant: 'primary',
          onRun: (ctx) => {
            const notifyType = String(ctx.knobs.notifyType) as NotifyType;
            ctx.log(`SmartDialog.showNotify({ notifyType: '${notifyType}' })`);
            void SmartDialog.showNotify({
              notifyType,
              msg: `NotifyType.${notifyType}: Operation feedback`,
            });
          },
        },
        {
          id: 'run-toast-burst',
          labelZh: '连发 3 条 Toast (对比队列)',
          labelEn: 'Burst 3 Toasts',
          onRun: (ctx) => {
            const displayType = String(ctx.knobs.toastType) as SmartToastType;
            ctx.log(`Burst 3x showToast(displayType='${displayType}')`);
            for (const i of [1, 2, 3]) {
              void SmartDialog.showToast({
                msg: `Toast #${i} (${displayType})`,
                displayType,
                displayTime: Duration.milliseconds(1400),
              });
            }
          },
        },
        {
          id: 'run-loading',
          labelZh: 'Loading 最短保底防闪烁',
          labelEn: 'Loading (leastLoadingTime)',
          onRun: async (ctx) => {
            SmartDialog.config.loading.leastLoadingTime = Duration.milliseconds(900);
            ctx.log('showLoading() -> immediate dismiss() holds for 900ms min');
            void SmartDialog.showLoading({ msg: 'Syncing state...' });
            await SmartDialog.dismiss({ status: SmartStatus.loading });
            ctx.log('Loading dismissed cleanly after leastLoadingTime!');
          },
        },
      ]}
      snippets={{
        vanilla: (k) => `import { Duration, NotifyType, SmartDialog, SmartStatus, SmartToastType } from 'fe-smart-dialog';

// 1. 语义通知
SmartDialog.showNotify({
  notifyType: NotifyType.${k.notifyType},
  msg: 'Operation completed',
});

// 2. 防闪烁全局 Loading（最短展示 900ms）
SmartDialog.config.loading.leastLoadingTime = Duration.milliseconds(900);
SmartDialog.showLoading({ msg: 'Syncing...' });
await fetch('/api/save');
await SmartDialog.dismiss({ status: SmartStatus.loading });

// 3. Toast 队列与并发控制
SmartDialog.showToast({
  msg: 'Saved',
  displayType: SmartToastType.${k.toastType},
  displayTime: Duration.seconds(2),
});`,
      }}
    />
  );
}

export function LifecycleBindCard() {
  const [anchorVisible, setAnchorVisible] = useState(true);
  const boundAnchorRef = useRef<HTMLDivElement | null>(null);

  return (
    <LiveDemoCard
      id="lifecycle-bind"
      titleZh="生命周期绑定：bindWidget 元素销毁自关闭 & Esc backType"
      titleEn="Lifecycle Binding: bindWidget Auto-Cleanup & backType"
      descZh="弹出绑定某个 DOM 元素的弹窗并在 1.5s 后卸载该元素，观察弹窗随元素消失自动关闭。"
      descEn="Bind a dialog to a DOM element via bindWidget and unmount it after 1.5s to verify automatic cleanup."
      workbenchId="OtherBindWidget"
      renderStageExtra={(ctx) => (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 8,
            border: '1px dashed var(--rp-c-divider-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {anchorVisible ? (
            <div ref={boundAnchorRef} style={{ fontSize: 13, fontWeight: 600 }}>
              {ctx.isEn ? 'Mounted Host Element (bindWidget)' : '已挂载的宿主元素（bindWidget 目标）'}
            </div>
          ) : (
            <span style={{ fontSize: 13, color: 'var(--rp-c-text-2)' }}>
              {ctx.isEn ? 'Host element unmounted (dialog auto-dismissed)' : '宿主元素已卸载（关联弹窗已自动收起）'}
            </span>
          )}
          {!anchorVisible && (
            <button
              type="button"
              className="fsd-btn fsd-btn--subtle"
              onClick={() => setAnchorVisible(true)}
            >
              {ctx.isEn ? 'Remount Host' : '重新挂载'}
            </button>
          )}
        </div>
      )}
      knobs={[
        {
          key: 'backType',
          labelZh: 'Esc / 返回拦截策略 (backType)',
          labelEn: 'backType',
          type: 'select',
          defaultValue: 'normal',
          options: [
            { value: 'normal', label: 'SmartBackType.normal (关闭)' },
            { value: 'block', label: 'SmartBackType.block (拦截不关)' },
            { value: 'ignore', label: 'SmartBackType.ignore (透传)' },
          ],
        },
      ]}
      actions={[
        {
          id: 'bind-widget-test',
          labelZh: '弹出并 1.5s 后卸载宿主',
          labelEn: 'Open & Unmount Host in 1.5s',
          variant: 'primary',
          onRun: (ctx) => {
            if (!anchorVisible || !boundAnchorRef.current) {
              setAnchorVisible(true);
              return;
            }
            const backTypeKey = String(ctx.knobs.backType) as keyof typeof SmartBackType;
            ctx.log(`Opened with bindWidget + backType=${backTypeKey}`);
            void SmartDialog.show({
              bindWidget: boundAnchorRef.current,
              alignment: Alignment.topCenter,
              usePenetrate: true,
              clickMaskDismiss: false,
              backType: SmartBackType[backTypeKey],
              onBack: () => {
                ctx.log(`onBack triggered under backType=${backTypeKey}`);
                return true;
              },
              builder: () =>
                html`
                  <div style="${cardStyle}">
                    <b>bindWidget active</b> · backType=<code>${backTypeKey}</code>
                  </div>
                `,
            });
            setTimeout(() => {
              setAnchorVisible(false);
              ctx.log('Host DOM removed -> MutationObserver auto-dismissed dialog!');
            }, 1500);
          },
        },
      ]}
      snippets={{
        vanilla: (k) => `import { SmartBackType, SmartDialog } from 'fe-smart-dialog';

// 1. 元素销毁自动清理
SmartDialog.show({
  bindWidget: cardElement,
  bindPage: true,
  backType: SmartBackType.${k.backType},
  onBack: () => {
    console.log('Esc / Back pressed');
    return true; // 返回 false 可阻断关闭
  },
  builder: () => dialogContent,
});

// 2. React / Vue Hook 一键绑定 ref:
// const ref = useBindWidget<HTMLDivElement>();
// smartDialog.show({ bindWidget: ref, builder: ... });`,
      }}
    />
  );
}

export function ThemeTokenCard() {
  return (
    <LiveDemoCard
      id="theme-tokens"
      titleZh="CSS 变量即时换肤演示"
      titleEn="Live CSS Token Skinning Demo"
      descZh="不写复杂 styleBuilder，直接通过 --fsd-bg、--fsd-border、--fsd-radius、--fsd-success 定制默认组件视觉体系。"
      descEn="Skin default widgets globally or per-container using --fsd-* CSS custom properties."
      knobs={[
        {
          key: 'preset',
          labelZh: '选择样式主题',
          labelEn: 'Theme Preset',
          type: 'select',
          defaultValue: 'violet',
          options: [
            { value: 'violet', label: 'Violet Glass (--fsd-notify-radius: 18px)' },
            { value: 'amber', label: 'Warm Amber (--fsd-bg: #fffbeb)' },
            { value: 'reset', label: 'Reset Default Tokens' },
          ],
        },
      ]}
      actions={[
        {
          id: 'apply-token',
          labelZh: '应用变量并预览 Notify',
          labelEn: 'Apply Tokens & Preview Notify',
          variant: 'primary',
          onRun: (ctx) => {
            const rootStyle = document.documentElement.style;
            const preset = String(ctx.knobs.preset);
            if (preset === 'violet') {
              rootStyle.setProperty('--fsd-bg', '#1e1b4b');
              rootStyle.setProperty('--fsd-text', '#eef2ff');
              rootStyle.setProperty('--fsd-border', '1px solid rgba(165,180,252,0.35)');
              rootStyle.setProperty('--fsd-notify-radius', '18px');
              rootStyle.setProperty('--fsd-success', '#a855f7');
            } else if (preset === 'amber') {
              rootStyle.setProperty('--fsd-bg', '#fffbeb');
              rootStyle.setProperty('--fsd-text', '#78350f');
              rootStyle.setProperty('--fsd-border', '1px solid #fcd34d');
              rootStyle.setProperty('--fsd-notify-radius', '8px');
              rootStyle.setProperty('--fsd-success', '#d97706');
            } else {
              rootStyle.removeProperty('--fsd-bg');
              rootStyle.removeProperty('--fsd-text');
              rootStyle.removeProperty('--fsd-border');
              rootStyle.removeProperty('--fsd-notify-radius');
              rootStyle.removeProperty('--fsd-success');
            }
            ctx.log(`Applied preset: ${preset}`);
            void SmartDialog.showNotify({
              notifyType: NotifyType.success,
              msg: `CSS Token Preset: ${preset}`,
            });
          },
        },
      ]}
      snippets={{
        vanilla: `:root {
  --fsd-bg: #1e1b4b;
  --fsd-text: #eef2ff;
  --fsd-border: 1px solid rgba(165, 180, 252, 0.35);
  --fsd-notify-radius: 18px;
  --fsd-success: #a855f7;
}

/* 或者配合全局主题模式 */
SmartDialog.init({ theme: SmartTheme.auto });`,
      }}
    />
  );
}

export function ParamRefreshDemo() {
  return (
    <LiveDemoCard
      id="controller-refresh"
      titleZh="SmartDialogController.refresh() 局部无闪烁刷新"
      titleEn="In-Place Refresh with SmartDialogController"
      descZh="在不关闭销毁弹窗实例的前提下，通过 controller.refresh() 原地重绘 builder 内容。"
      descEn="Re-render dialog content in place without dismissing or replaying entrance animations."
      workbenchId="OtherHardClose"
      actions={[
        {
          id: 'open-controller',
          labelZh: '打开支持 refresh() 的弹窗',
          labelEn: 'Open Refreshable Modal',
          variant: 'primary',
          onRun: (ctx) => {
            let count = 1;
            const controller = new SmartDialogController();
            void SmartDialog.show({
              controller,
              builder: ({ dismiss }) => {
                const frag = html`
                  <div style="${cardStyle}">
                    <h4 style="margin:0 0 8px;">Controller Count: ${count}</h4>
                    <div style="display:flex;gap:8px;">
                      <button data-inc class="fsd-btn">+1 & refresh()</button>
                      <button data-close class="fsd-btn fsd-btn--primary">Close</button>
                    </div>
                  </div>
                `;
                frag.querySelector('[data-inc]')?.addEventListener('click', () => {
                  count += 1;
                  ctx.log(`controller.refresh() -> count=${count}`);
                  controller.refresh();
                });
                frag.querySelector('[data-close]')?.addEventListener('click', () => void dismiss());
                return frag;
              },
            });
          },
        },
      ]}
      snippets={{
        vanilla: `import { SmartDialog, SmartDialogController } from 'fe-smart-dialog';

let count = 0;
const controller = new SmartDialogController();

SmartDialog.show({
  controller,
  builder: ({ dismiss }) => {
    const el = document.createElement('div');
    el.innerHTML = \`<p>Count: \${count}</p><button>+1</button>\`;
    el.querySelector('button')!.onclick = () => {
      count += 1;
      controller.refresh();
    };
    return el;
  },
});`,
      }}
    />
  );
}
