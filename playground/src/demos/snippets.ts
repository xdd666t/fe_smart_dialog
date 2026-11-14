import type { DemoFrameworkSnippets } from '../types/demo';

function makeNotifySnippets(
  notifyType: string,
  sampleMsg: string,
): DemoFrameworkSnippets {
  return {
    vanilla: `import { NotifyType, SmartDialog } from 'fe-smart-dialog';

await SmartDialog.showNotify({
  notifyType: NotifyType.${notifyType},
  msg: '${sampleMsg}',
  displayTime: 2200,
});`,
    react: `import { NotifyType } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/react';

function NotifyAction() {
  const smartDialog = useSmartDialog();

  return (
    <button
      onClick={() =>
        void smartDialog.showNotify({
          notifyType: NotifyType.${notifyType},
          msg: '${sampleMsg}',
          displayTime: 2200,
        })
      }
    >
      Trigger ${notifyType}
    </button>
  );
}`,
    vue: `import { NotifyType } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/vue';

const smartDialog = useSmartDialog();

await smartDialog.showNotify({
  notifyType: NotifyType.${notifyType},
  msg: '${sampleMsg}',
  displayTime: 2200,
});`,
  };
}

function wrapCustomShow(
  imports: string,
  optionsExpr: string,
  reactBody: string,
  vueBody: string,
): Pick<DemoFrameworkSnippets, 'react' | 'vue'> {
  return {
    react: `import { ${imports} } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/react';

function DemoButton() {
  const smartDialog = useSmartDialog();

  const onOpen = () => {
    void smartDialog.show({
      ${optionsExpr}
      builder: ({ dismiss }) => ${reactBody},
    });
  };

  return <button onClick={onOpen}>Open Dialog</button>;
}`,
    vue: `import { h } from 'vue';
import { ${imports} } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/vue';

const smartDialog = useSmartDialog();

function onOpen() {
  void smartDialog.show({
    ${optionsExpr}
    builder: ({ dismiss }) => ${vueBody},
  });
}`,
  };
}

export const FRAMEWORK_SNIPPETS_BY_ID: Record<string, DemoFrameworkSnippets> = {
  'dialog-easy': {
    vanilla: `import { SmartDialog, html } from 'fe-smart-dialog';

SmartDialog.show({
  builder: ({ dismiss }) => {
    const frag = html\`
      <div class="my-modal">
        <h4>Hello SmartDialog</h4>
        <p>函数式按需唤起，无需模板占位。</p>
        <button data-close>关闭</button>
      </div>
    \`;
    frag.querySelector('[data-close]')?.addEventListener('click', () => void dismiss());
    return frag;
  },
});`,
    react: `import { useSmartDialog, useSmartDialogController } from 'fe-smart-dialog/react';

function Example() {
  const smartDialog = useSmartDialog();
  const controller = useSmartDialogController();

  return (
    <button
      onClick={() =>
        void smartDialog.show({
          tag: 'easy-card',
          controller,
          builder: ({ dismiss }) => (
            <div className="my-modal">
              <h4>Reactive JSX Portal Modal</h4>
              <button onClick={() => void dismiss()}>Dismiss</button>
            </div>
          ),
        })
      }
    >
      Open Dialog
    </button>
  );
}`,
    vue: `import { h } from 'vue';
import { useSmartDialog, useSmartDialogController } from 'fe-smart-dialog/vue';

export default {
  setup() {
    const dialog = useSmartDialog();
    const controller = useSmartDialogController();

    return () =>
      h(
        'button',
        {
          onClick: () =>
            void dialog.show({
              tag: 'easy-card',
              controller,
              builder: ({ dismiss }) =>
                h('div', { class: 'my-modal' }, [
                  h('h4', 'Reactive Vue Teleport Modal'),
                  h('button', { onClick: () => void dismiss() }, 'Dismiss'),
                ]),
            }),
        },
        'Open Dialog',
      );
  },
};`,
  },

  'dialog-location': {
    vanilla: `import { Alignment, SmartAnimationType, SmartDialog, html } from 'fe-smart-dialog';

SmartDialog.show({
  alignment: Alignment.bottomCenter,
  animationType: SmartAnimationType.centerScale_otherSlide,
  builder: ({ dismiss }) => {
    const frag = html\`
      <div style="width:min(520px,100vw);padding:20px;border-radius:14px 14px 0 0;background:#fff;">
        <h4>Bottom Drawer</h4>
        <button data-close>关闭抽屉</button>
      </div>
    \`;
    frag.querySelector('[data-close]')?.addEventListener('click', () => void dismiss());
    return frag;
  },
});`,
    ...wrapCustomShow(
      'Alignment, SmartAnimationType',
      'alignment: Alignment.bottomCenter,\n      animationType: SmartAnimationType.centerScale_otherSlide,',
      `(\n        <div className="drawer">\n          <h4>Bottom Drawer</h4>\n          <button onClick={() => void dismiss()}>Close</button>\n        </div>\n      )`,
      `h('div', { class: 'drawer' }, [\n      h('h4', 'Bottom Drawer'),\n      h('button', { onClick: () => void dismiss() }, 'Close'),\n    ])`,
    ),
  },

  'dialog-penetrate': {
    vanilla: `import { Alignment, SmartDialog, SmartMaskTriggerType, html } from 'fe-smart-dialog';

// 可选：指定点击/抬起触发遮罩关闭回调的时机
SmartDialog.config.custom.maskTriggerType = SmartMaskTriggerType.up;

SmartDialog.show({
  alignment: Alignment.centerRight,
  usePenetrate: true,
  clickMaskDismiss: false,
  builder: ({ dismiss }) => {
    const frag = html\`
      <div class="side-tool">
        <h4>事件穿透侧栏</h4>
        <p>此时仍可直接滚动或点击底层页面控件</p>
        <button data-close>关闭</button>
      </div>
    \`;
    frag.querySelector('[data-close]')?.addEventListener('click', () => void dismiss());
    return frag;
  },
});`,
    ...wrapCustomShow(
      'Alignment',
      'alignment: Alignment.centerRight,\n      usePenetrate: true,\n      clickMaskDismiss: false,',
      `(\n        <div className="side-tool">\n          <h4>Penetrate Panel</h4>\n          <button onClick={() => void dismiss()}>Close</button>\n        </div>\n      )`,
      `h('div', { class: 'side-tool' }, [\n      h('h4', 'Penetrate Panel'),\n      h('button', { onClick: () => void dismiss() }, 'Close'),\n    ])`,
    ),
  },

  'dialog-single': {
    vanilla: `import { Alignment, SmartDialog, html } from 'fe-smart-dialog';

function showSidePanel(step: string) {
  SmartDialog.show({
    alignment: Alignment.centerRight,
    keepSingle: true, // 同实例刷新内容，不堆叠黑罩
    usePenetrate: true,
    clickMaskDismiss: false,
    builder: ({ dismiss }) => {
      const frag = html\`
        <div class="panel">
          <b>keepSingle Active: \${step}</b>
          <button data-close>关闭</button>
        </div>
      \`;
      frag.querySelector('[data-close]')?.addEventListener('click', () => void dismiss());
      return frag;
    },
  });
}

showSidePanel('Step 1');
setTimeout(() => showSidePanel('Step 2 (reused container)'), 800);`,
    ...wrapCustomShow(
      'Alignment',
      'alignment: Alignment.centerRight,\n      keepSingle: true,\n      usePenetrate: true,',
      `(\n        <div className="panel">\n          <p>Reused keepSingle container</p>\n          <button onClick={() => void dismiss()}>Close</button>\n        </div>\n      )`,
      `h('div', { class: 'panel' }, [\n      h('p', 'Reused keepSingle container'),\n      h('button', { onClick: () => void dismiss() }, 'Close'),\n    ])`,
    ),
  },

  'dialog-stack': {
    vanilla: `import { Alignment, SmartDialog, html } from 'fe-smart-dialog';

const makeEdgeCard = (tag: string) =>
  html\`<div style="padding:16px;background:#1e293b;color:#fff;">Layer \${tag}</div>\`;

void SmartDialog.show({ tag: 'A', alignment: Alignment.centerLeft, builder: () => makeEdgeCard('A') });
void SmartDialog.show({ tag: 'B', alignment: Alignment.topCenter, builder: () => makeEdgeCard('B') });
void SmartDialog.show({ tag: 'C', alignment: Alignment.centerRight, builder: () => makeEdgeCard('C') });

// 在任意时刻精准拆除中间指定 tag 层而不影响其余层
await SmartDialog.dismiss({ tag: 'B' });`,
    react: `import { Alignment } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/react';

function StackDemo() {
  const smartDialog = useSmartDialog();

  const pushLayers = () => {
    void smartDialog.show({ tag: 'A', alignment: Alignment.centerLeft, builder: () => <div>Layer A</div> });
    void smartDialog.show({ tag: 'B', alignment: Alignment.topCenter, builder: () => <div>Layer B</div> });
  };

  return (
    <>
      <button onClick={pushLayers}>Push Stack A + B</button>
      <button onClick={() => void smartDialog.dismiss({ tag: 'A' })}>Dismiss Tag A</button>
    </>
  );
}`,
    vue: `import { h } from 'vue';
import { Alignment } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/vue';

const smartDialog = useSmartDialog();

void smartDialog.show({ tag: 'A', alignment: Alignment.centerLeft, builder: () => h('div', 'Layer A') });
void smartDialog.show({ tag: 'B', alignment: Alignment.topCenter, builder: () => h('div', 'Layer B') });

// 按 tag 定点关闭底层 A
await smartDialog.dismiss({ tag: 'A' });`,
  },

  'dialog-system': {
    vanilla: `import { SmartDialog, html } from 'fe-smart-dialog';

const res = await SmartDialog.show<string>({
  useSystem: true, // 原生 <dialog>.showModal() Top Layer 渲染
  ariaLabel: 'System Confirmation Modal',
  builder: ({ dismiss }) => {
    const frag = html\`
      <div class="system-modal">
        <h4>Native Top-Layer &lt;dialog&gt;</h4>
        <p>自带焦点锁定、Esc 关闭与焦点回溯</p>
        <button data-ok>提交确认</button>
      </div>
    \`;
    frag.querySelector('[data-ok]')?.addEventListener('click', () => void dismiss('confirmed'));
    return frag;
  },
});
console.log('Result:', res);`,
    ...wrapCustomShow(
      'Alignment',
      "useSystem: true,\n      alignment: Alignment.center,\n      ariaLabel: 'System Confirmation Modal',",
      `(\n        <div className="system-modal">\n          <h4>Native Top-Layer Modal</h4>\n          <button onClick={() => void dismiss('confirmed')}>Confirm</button>\n        </div>\n      )`,
      `h('div', { class: 'system-modal' }, [\n      h('h4', 'Native Top-Layer Modal'),\n      h('button', { onClick: () => void dismiss('confirmed') }, 'Confirm'),\n    ])`,
    ),
  },

  'dialog-bindpage': {
    vanilla: `import { Alignment, SmartDialog, SmartStatus, html } from 'fe-smart-dialog';

// bindPage 默认为 true：路由变化自动隐藏，回到当前页自动恢复
SmartDialog.show({
  bindPage: true,
  builder: ({ dismiss }) => {
    const frag = html\`
      <div class="card">
        <h4>绑定页面的弹窗 (bindPage: true)</h4>
        <button data-nav>Push 新路由 (/detail)</button>
        <button data-close>关闭</button>
      </div>
    \`;
    frag.querySelector('[data-nav]')?.addEventListener('click', () => {
      history.pushState({}, '', '#detail'); // 原页面弹窗会自动暂隐
    });
    frag.querySelector('[data-close]')?.addEventListener('click', () => {
      void SmartDialog.dismiss({ status: SmartStatus.custom });
      void dismiss();
    });
    return frag;
  },
});`,
    ...wrapCustomShow(
      'Alignment',
      'bindPage: true,\n      alignment: Alignment.center,',
      `(\n        <div className="card">\n          <h4>Page-Bound Modal</h4>\n          <button onClick={() => void dismiss()}>Close</button>\n        </div>\n      )`,
      `h('div', { class: 'card' }, [\n      h('h4', 'Page-Bound Modal'),\n      h('button', { onClick: () => void dismiss() }, 'Close'),\n    ])`,
    ),
  },

  'dialog-carry-result': {
    vanilla: `import { SmartDialog, html } from 'fe-smart-dialog';

const picked = await SmartDialog.show<'publish' | 'draft'>({
  builder: ({ dismiss }) => {
    const frag = html\`
      <div class="card">
        <h4>选择提交方式</h4>
        <button data-val="draft">存为草稿</button>
        <button data-val="publish">立即发布</button>
      </div>
    \`;
    frag.querySelectorAll<HTMLElement>('[data-val]').forEach((btn) => {
      btn.onclick = () => void dismiss(btn.dataset.val as 'publish' | 'draft');
    });
    return frag;
  },
});
console.log('Dialog resolved:', picked ?? 'dismissed via mask');`,
    react: `import { useSmartDialog } from 'fe-smart-dialog/react';

function ActionBar() {
  const smartDialog = useSmartDialog();

  const pickOption = async () => {
    const res = await smartDialog.show<'publish' | 'draft'>({
      builder: ({ dismiss }) => (
        <div className="card">
          <h4>Choose Action</h4>
          <button onClick={() => void dismiss('draft')}>Draft</button>
          <button onClick={() => void dismiss('publish')}>Publish</button>
        </div>
      ),
    });
    if (res) smartDialog.showToast(\`Picked: \${res}\`);
  };

  return <button onClick={() => void pickOption()}>Pick Action</button>;
}`,
    vue: `import { h } from 'vue';
import { useSmartDialog } from 'fe-smart-dialog/vue';

const smartDialog = useSmartDialog();

const picked = await smartDialog.show<'publish' | 'draft'>({
  builder: ({ dismiss }) =>
    h('div', { class: 'card' }, [
      h('h4', 'Choose Action'),
      h('button', { onClick: () => void dismiss('draft') }, 'Draft'),
      h('button', { onClick: () => void dismiss('publish') }, 'Publish'),
    ]),
});`,
  },

  'dialog-permanent': {
    vanilla: `import { SmartDialog, SmartStatus, html } from 'fe-smart-dialog';

SmartDialog.show({
  tag: 'force-update-lock',
  permanent: true, // 普通 dismiss() / 遮罩 / Esc 无法关闭
  builder: ({ dismiss }) => {
    const frag = html\`
      <div class="card">
        <h4>permanent: true 常驻锁定</h4>
        <button data-unlock>调用 dismiss({ force: true }) 解锁</button>
      </div>
    \`;
    frag.querySelector('[data-unlock]')?.addEventListener('click', () => {
      void SmartDialog.dismiss({ tag: 'force-update-lock', force: true });
      void dismiss();
    });
    return frag;
  },
});
void SmartDialog.dismiss({ status: SmartStatus.allCustom }); // 不会关闭 permanent 弹窗`,
    ...wrapCustomShow(
      'Alignment',
      "tag: 'force-lock',\n      permanent: true,\n      alignment: Alignment.center,",
      `(\n        <div className="card">\n          <h4>Permanent Modal</h4>\n          <button onClick={() => void smartDialog.dismiss({ tag: 'force-lock', force: true })}>Force Close</button>\n        </div>\n      )`,
      `h('div', { class: 'card' }, [\n      h('h4', 'Permanent Modal'),\n      h('button', { onClick: () => void smartDialog.dismiss({ tag: 'force-lock', force: true }) }, 'Force Close'),\n    ])`,
    ),
  },

  'dialog-animation': {
    vanilla: `import { Duration, SmartDialog, html } from 'fe-smart-dialog';

SmartDialog.show({
  animationTime: Duration.milliseconds(360),
  animationBuilder: (_controller, child, animationParam) => {
    animationParam.onForward = () => {
      child.animate(
        [
          { opacity: 0, transform: 'translateY(24px) scale(0.92)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: animationParam.animationTime, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'forwards' },
      );
    };
    animationParam.onDismiss = () => {
      child.animate(
        [{ opacity: 1 }, { opacity: 0, transform: 'translateY(16px) scale(0.94)' }],
        { duration: animationParam.animationTime, fill: 'forwards' },
      );
    };
    return child;
  },
  builder: ({ dismiss }) => {
    const frag = html\`<div class="card"><h4>Spring WAAPI</h4><button data-ok>Close</button></div>\`;
    frag.querySelector('[data-ok]')?.addEventListener('click', () => void dismiss());
    return frag;
  },
});`,
    ...wrapCustomShow(
      'Duration, SmartAnimationType',
      'animationTime: Duration.milliseconds(360),\n      animationType: SmartAnimationType.centerScale_otherSlide,',
      `(\n        <div className="card">\n          <h4>Custom Animated Modal</h4>\n          <button onClick={() => void dismiss()}>Close</button>\n        </div>\n      )`,
      `h('div', { class: 'card' }, [\n      h('h4', 'Custom Animated Modal'),\n      h('button', { onClick: () => void dismiss() }, 'Close'),\n    ])`,
    ),
  },

  'dialog-bindwidget': {
    vanilla: `import { Alignment, SmartDialog, html } from 'fe-smart-dialog';

const hostCard = document.querySelector('#host-card')!;

SmartDialog.show({
  bindWidget: hostCard, // 宿主页签从 DOM 销毁移除后，弹窗自动收起清理
  alignment: Alignment.topCenter,
  usePenetrate: true,
  clickMaskDismiss: false,
  builder: () => html\`<div class="banner">绑定宿主元素的浮窗</div>\`,
});`,
    react: `import { Alignment } from 'fe-smart-dialog';
import { useBindWidget, useSmartDialog } from 'fe-smart-dialog/react';

function BoundSection() {
  const smartDialog = useSmartDialog();
  const hostRef = useBindWidget<HTMLDivElement>();

  return (
    <div ref={hostRef}>
      <button
        onClick={() =>
          void smartDialog.show({
            bindWidget: hostRef,
            alignment: Alignment.topCenter,
            builder: ({ dismiss }) => (
              <div className="card">
                <p>Auto-dismisses when host unmounts</p>
                <button onClick={() => void dismiss()}>Close</button>
              </div>
            ),
          })
        }
      >
        Open Bound Modal
      </button>
    </div>
  );
}`,
    vue: `import { h } from 'vue';
import { Alignment } from 'fe-smart-dialog';
import { useBindWidget, useSmartDialog } from 'fe-smart-dialog/vue';

const smartDialog = useSmartDialog();
const hostRef = useBindWidget<HTMLElement>();

void smartDialog.show({
  bindWidget: hostRef,
  alignment: Alignment.topCenter,
  builder: ({ dismiss }) =>
    h('div', { class: 'card' }, [
      h('p', 'Auto-dismisses when host unmounts'),
      h('button', { onClick: () => void dismiss() }, 'Close'),
    ]),
});`,
  },

  'dialog-hardclose': {
    vanilla: `import { SmartDialog, SmartDialogController, SmartStatus, html } from 'fe-smart-dialog';

let step = 1;
const controller = new SmartDialogController();

SmartDialog.show({
  controller,
  builder: () => {
    const frag = html\`
      <div class="card">
        <h4>Controller Step: \${step}</h4>
        <button data-next>refresh() 原地更新</button>
        <button data-all>强制清空 allDialog</button>
      </div>
    \`;
    frag.querySelector('[data-next]')?.addEventListener('click', () => {
      step += 1;
      controller.refresh();
    });
    frag.querySelector('[data-all]')?.addEventListener('click', () => {
      void SmartDialog.dismiss({ status: SmartStatus.allDialog, force: true });
    });
    return frag;
  },
});`,
    react: `import { useRef } from 'react';
import { SmartStatus } from 'fe-smart-dialog';
import { useSmartDialog, useSmartDialogController } from 'fe-smart-dialog/react';

function ControllerDemo() {
  const smartDialog = useSmartDialog();
  const controller = useSmartDialogController();
  const countRef = useRef(1);

  return (
    <button
      onClick={() =>
        void smartDialog.show({
          controller,
          builder: () => (
            <div className="card">
              <h4>Count: {countRef.current}</h4>
              <button onClick={() => { countRef.current += 1; controller.refresh(); }}>
                Refresh In Place
              </button>
              <button onClick={() => void smartDialog.dismiss({ status: SmartStatus.allDialog, force: true })}>
                Force Clear All
              </button>
            </div>
          ),
        })
      }
    >
      Open Controlled Modal
    </button>
  );
}`,
    vue: `import { h, ref } from 'vue';
import { SmartStatus } from 'fe-smart-dialog';
import { useSmartDialog, useSmartDialogController } from 'fe-smart-dialog/vue';

const smartDialog = useSmartDialog();
const controller = useSmartDialogController();
const count = ref(1);

void smartDialog.show({
  controller,
  builder: () =>
    h('div', { class: 'card' }, [
      h('h4', \`Count: \${count.value}\`),
      h('button', { onClick: () => { count.value += 1; controller.refresh(); } }, 'Refresh'),
      h('button', { onClick: () => void smartDialog.dismiss({ status: SmartStatus.allDialog, force: true }) }, 'Force Clear'),
    ]),
});`,
  },

  'attach-location': {
    vanilla: `import { Alignment, SmartAttachAlignmentType, SmartDialog, html } from 'fe-smart-dialog';

SmartDialog.config.attach.attachAlignmentType = SmartAttachAlignmentType.outside;

SmartDialog.showAttach({
  targetElement: document.querySelector('#anchor-btn')!,
  alignment: Alignment.topLeft,
  usePenetrate: true,
  clickMaskDismiss: false,
  builder: ({ dismiss }) => {
    const frag = html\`
      <div class="popover">
        <span>Anchored Popover (topLeft)</span>
        <button data-close>关闭</button>
      </div>
    \`;
    frag.querySelector('[data-close]')?.addEventListener('click', () => void dismiss());
    return frag;
  },
});`,
    react: `import { Alignment, SmartAttachAlignmentType } from 'fe-smart-dialog';
import { useBindWidget, useSmartDialog } from 'fe-smart-dialog/react';

function PopoverDemo() {
  const dialog = useSmartDialog();
  const anchorRef = useBindWidget<HTMLButtonElement>();

  return (
    <button
      ref={anchorRef}
      onClick={() => {
        dialog.config.attach.attachAlignmentType = SmartAttachAlignmentType.outside;
        void dialog.showAttach({
          targetContext: anchorRef,
          alignment: Alignment.bottomCenter,
          builder: ({ dismiss }) => (
            <div className="popover">
              <span>Attached to React ref</span>
              <button onClick={() => void dismiss()}>Close</button>
            </div>
          ),
        });
      }}
    >
      Anchor Button
    </button>
  );
}`,
    vue: `import { h } from 'vue';
import { Alignment, SmartAttachAlignmentType } from 'fe-smart-dialog';
import { useBindWidget, useSmartDialog } from 'fe-smart-dialog/vue';

const dialog = useSmartDialog();
const anchorRef = useBindWidget<HTMLButtonElement>();

dialog.config.attach.attachAlignmentType = SmartAttachAlignmentType.outside;

void dialog.showAttach({
  targetElement: anchorRef,
  alignment: Alignment.bottomCenter,
  builder: ({ dismiss }) =>
    h('div', { class: 'popover' }, [
      h('span', 'Attached to Vue ref'),
      h('button', { onClick: () => void dismiss() }, 'Close'),
    ]),
});`,
  },

  'attach-point': {
    vanilla: `import { Alignment, Offset, SmartDialog, html } from 'fe-smart-dialog';

document.querySelector('#pad')?.addEventListener('pointerdown', (e) => {
  const evt = e as PointerEvent;
  SmartDialog.showAttach({
    targetContext: null,
    targetBuilder: () => new Offset(evt.clientX, evt.clientY),
    alignment: Alignment.topCenter,
    keepSingle: true,
    usePenetrate: true,
    clickMaskDismiss: false,
    builder: () => html\`<div class="badge">坐标 (\${Math.round(evt.clientX)}, \${Math.round(evt.clientY)})</div>\`,
  });
});`,
    react: `import { Alignment, Offset } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/react';

function CanvasMenu() {
  const dialog = useSmartDialog();

  return (
    <div
      onPointerDown={(e) =>
        void dialog.showAttach({
          targetBuilder: () => new Offset(e.clientX, e.clientY),
          alignment: Alignment.bottomRight,
          keepSingle: true,
          builder: ({ dismiss }) => (
            <div className="context-menu">
              <button onClick={() => void dismiss()}>Action A</button>
            </div>
          ),
        })
      }
    >
      Click anywhere to anchor at pointer
    </div>
  );
}`,
    vue: `import { h } from 'vue';
import { Alignment, Offset } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/vue';

const dialog = useSmartDialog();

function onPointerDown(e: PointerEvent) {
  void dialog.showAttach({
    targetBuilder: () => new Offset(e.clientX, e.clientY),
    alignment: Alignment.bottomRight,
    keepSingle: true,
    builder: () => h('div', { class: 'context-menu' }, 'Pointer Anchored'),
  });
}`,
  },

  'attach-target': {
    vanilla: `import { Alignment, Offset, SmartDialog, html } from 'fe-smart-dialog';

SmartDialog.showAttach({
  targetBuilder: () => new Offset(0, 140), // 锚定在屏幕左边缘坐标
  alignment: Alignment.centerRight,
  usePenetrate: true,
  builder: ({ dismiss }) => {
    const frag = html\`<div class="dock-pill">Edge Dock Tag <button data-x>×</button></div>\`;
    frag.querySelector('[data-x]')?.addEventListener('click', () => void dismiss());
    return frag;
  },
});`,
    react: `import { Alignment, Offset } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/react';

const dialog = useSmartDialog();
void dialog.showAttach({
  targetBuilder: () => new Offset(0, 140),
  alignment: Alignment.centerRight,
  usePenetrate: true,
  builder: () => <div className="dock-pill">Edge Tag</div>,
});`,
    vue: `import { h } from 'vue';
import { Alignment, Offset } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/vue';

const dialog = useSmartDialog();
void dialog.showAttach({
  targetBuilder: () => new Offset(0, 140),
  alignment: Alignment.centerRight,
  usePenetrate: true,
  builder: () => h('div', { class: 'dock-pill' }, 'Edge Tag'),
});`,
  },

  'attach-imitate': {
    vanilla: `import { Alignment, SmartAttachAlignmentType, SmartDialog, html } from 'fe-smart-dialog';

SmartDialog.config.attach.attachAlignmentType = SmartAttachAlignmentType.outside;

SmartDialog.showAttach({
  targetElement: document.querySelector('#search-input')!,
  alignment: Alignment.bottomCenter,
  builder: ({ dismiss }) => {
    const frag = html\`
      <ul class="dropdown">
        <li data-item="Option A">Option A</li>
        <li data-item="Option B">Option B</li>
      </ul>
    \`;
    frag.querySelectorAll('li').forEach((li) => {
      li.onclick = () => void dismiss(li.dataset.item);
    });
    return frag;
  },
});`,
    react: `import { Alignment } from 'fe-smart-dialog';
import { useBindWidget, useSmartDialog } from 'fe-smart-dialog/react';

function DropdownInput() {
  const dialog = useSmartDialog();
  const inputRef = useBindWidget<HTMLInputElement>();

  return (
    <input
      ref={inputRef}
      onFocus={() =>
        void dialog.showAttach({
          targetContext: inputRef,
          alignment: Alignment.bottomCenter,
          builder: ({ dismiss }) => (
            <ul className="dropdown">
              <li onClick={() => void dismiss('Option A')}>Option A</li>
            </ul>
          ),
        })
      }
    />
  );
}`,
    vue: `import { h } from 'vue';
import { Alignment } from 'fe-smart-dialog';
import { useBindWidget, useSmartDialog } from 'fe-smart-dialog/vue';

const dialog = useSmartDialog();
const inputRef = useBindWidget<HTMLInputElement>();

void dialog.showAttach({
  targetElement: inputRef,
  alignment: Alignment.bottomCenter,
  builder: ({ dismiss }) =>
    h('ul', { class: 'dropdown' }, [
      h('li', { onClick: () => void dismiss('Option A') }, 'Option A'),
    ]),
});`,
  },

  'attach-business': {
    vanilla: `import { Alignment, SmartDialog, html } from 'fe-smart-dialog';

SmartDialog.showAttach({
  targetElement: document.querySelector('#filter-trigger')!,
  alignment: Alignment.bottomLeft,
  builder: ({ dismiss }) => {
    const frag = html\`
      <div class="filter-menu">
        <button data-status="all">全部状态</button>
        <button data-status="active">进行中</button>
      </div>
    \`;
    frag.querySelectorAll<HTMLElement>('button').forEach((b) => {
      b.onclick = () => void dismiss(b.dataset.status);
    });
    return frag;
  },
});`,
    react: `import { Alignment } from 'fe-smart-dialog';
import { useBindWidget, useSmartDialog } from 'fe-smart-dialog/react';

function FilterBar() {
  const dialog = useSmartDialog();
  const filterRef = useBindWidget<HTMLButtonElement>();

  return (
    <button
      ref={filterRef}
      onClick={() =>
        void dialog.showAttach({
          targetContext: filterRef,
          alignment: Alignment.bottomLeft,
          builder: ({ dismiss }) => (
            <div className="filter-menu">
              <button onClick={() => void dismiss('active')}>Active Only</button>
            </div>
          ),
        })
      }
    >
      Filter
    </button>
  );
}`,
    vue: `import { h } from 'vue';
import { Alignment } from 'fe-smart-dialog';
import { useBindWidget, useSmartDialog } from 'fe-smart-dialog/vue';

const dialog = useSmartDialog();
const filterRef = useBindWidget<HTMLButtonElement>();

void dialog.showAttach({
  targetElement: filterRef,
  alignment: Alignment.bottomLeft,
  builder: ({ dismiss }) =>
    h('div', { class: 'filter-menu' }, [
      h('button', { onClick: () => void dismiss('active') }, 'Active Only'),
    ]),
});`,
  },

  'attach-guide': {
    vanilla: `import {
  Alignment,
  SmartDialog,
  SmartHighlightShape,
  SmartNonAnimationType,
  html,
} from 'fe-smart-dialog';

await SmartDialog.showAttach({
  tag: 'spotlight-tour',
  keepSingle: true,
  targetElement: document.querySelector('#guide-target')!,
  alignment: Alignment.bottomCenter,
  maskColor: 'rgba(15, 23, 42, 0.72)',
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
    shape: SmartHighlightShape.rect,
  }),
  builder: ({ dismiss }) => {
    const frag = html\`<div class="tour-card"><p>功能高亮指引</p><button data-next>下一步</button></div>\`;
    frag.querySelector('[data-next]')?.addEventListener('click', () => void dismiss());
    return frag;
  },
});`,
    react: `import { Alignment, SmartHighlightShape, SmartNonAnimationType } from 'fe-smart-dialog';
import { useBindWidget, useSmartDialog } from 'fe-smart-dialog/react';

function SpotlightButton() {
  const dialog = useSmartDialog();
  const targetRef = useBindWidget<HTMLButtonElement>();

  return (
    <button
      ref={targetRef}
      onClick={() =>
        void dialog.showAttach({
          tag: 'spotlight-tour',
          keepSingle: true,
          targetContext: targetRef,
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
            shape: SmartHighlightShape.circle,
          }),
          builder: ({ dismiss }) => (
            <div className="tour-card">
              <p>Step 1 Highlight</p>
              <button onClick={() => void dismiss()}>Next</button>
            </div>
          ),
        })
      }
    >
      Start Tour
    </button>
  );
}`,
    vue: `import { h } from 'vue';
import { Alignment, SmartHighlightShape } from 'fe-smart-dialog';
import { useBindWidget, useSmartDialog } from 'fe-smart-dialog/vue';

const dialog = useSmartDialog();
const targetRef = useBindWidget<HTMLButtonElement>();

void dialog.showAttach({
  tag: 'spotlight-tour',
  keepSingle: true,
  targetElement: targetRef,
  alignment: Alignment.bottomCenter,
  highlightBuilder: (offset, size) => ({
    left: offset.dx - 6,
    top: offset.dy - 6,
    width: size.width + 12,
    height: size.height + 12,
    borderRadius: 10,
    shape: SmartHighlightShape.circle,
  }),
  builder: ({ dismiss }) =>
    h('div', { class: 'tour-card' }, [
      h('p', 'Step 1 Highlight'),
      h('button', { onClick: () => void dismiss() }, 'Next'),
    ]),
});`,
  },

  'attach-scale-point': {
    vanilla: `import { Alignment, Offset, SmartDialog, html } from 'fe-smart-dialog';

SmartDialog.showAttach({
  targetElement: document.querySelector('#menu-btn')!,
  alignment: Alignment.bottomRight,
  // 动画缩放原点锚定在弹出卡片右上角 (selfSize.width, 0)
  scalePointBuilder: (selfSize) => new Offset(selfSize.width, 0),
  builder: ({ dismiss }) => {
    const frag = html\`<div class="menu"><ul><li>编辑</li><li>分享</li></ul><button data-x>关闭</button></div>\`;
    frag.querySelector('[data-x]')?.addEventListener('click', () => void dismiss());
    return frag;
  },
});`,
    react: `import { Alignment, Offset } from 'fe-smart-dialog';
import { useBindWidget, useSmartDialog } from 'fe-smart-dialog/react';

const dialog = useSmartDialog();
const btnRef = useBindWidget<HTMLButtonElement>();

void dialog.showAttach({
  targetContext: btnRef,
  alignment: Alignment.bottomRight,
  scalePointBuilder: (selfSize) => new Offset(selfSize.width, 0),
  builder: () => <div className="menu">Scales from top-right corner</div>,
});`,
    vue: `import { h } from 'vue';
import { Alignment, Offset } from 'fe-smart-dialog';
import { useBindWidget, useSmartDialog } from 'fe-smart-dialog/vue';

const dialog = useSmartDialog();
const btnRef = useBindWidget<HTMLButtonElement>();

void dialog.showAttach({
  targetElement: btnRef,
  alignment: Alignment.bottomRight,
  scalePointBuilder: (selfSize) => new Offset(selfSize.width, 0),
  builder: () => h('div', { class: 'menu' }, 'Scales from top-right corner'),
});`,
  },

  'attach-adjust': {
    vanilla: `import { Alignment, AttachAdjustParam, SmartDialog, html } from 'fe-smart-dialog';

SmartDialog.showAttach({
  targetElement: document.querySelector('#edge-btn')!,
  alignment: Alignment.bottomCenter,
  adjustBuilder: (param) => {
    if (param.selfOffset.y + param.selfSize.height > window.innerHeight - 16) {
      return new AttachAdjustParam({ alignment: Alignment.topCenter });
    }
    return new AttachAdjustParam();
  },
  builder: () => html\`<div class="popover">超出视口底部自动翻转为 topCenter</div>\`,
});`,
    react: `import { Alignment, AttachAdjustParam } from 'fe-smart-dialog';
import { useBindWidget, useSmartDialog } from 'fe-smart-dialog/react';

const dialog = useSmartDialog();
const edgeRef = useBindWidget<HTMLButtonElement>();

void dialog.showAttach({
  targetContext: edgeRef,
  alignment: Alignment.bottomCenter,
  adjustBuilder: (param) =>
    param.selfOffset.y + param.selfSize.height > window.innerHeight - 16
      ? new AttachAdjustParam({ alignment: Alignment.topCenter })
      : new AttachAdjustParam(),
  builder: () => <div className="popover">Auto-flips at viewport edge</div>,
});`,
    vue: `import { h } from 'vue';
import { Alignment, AttachAdjustParam } from 'fe-smart-dialog';
import { useBindWidget, useSmartDialog } from 'fe-smart-dialog/vue';

const dialog = useSmartDialog();
const edgeRef = useBindWidget<HTMLButtonElement>();

void dialog.showAttach({
  targetElement: edgeRef,
  alignment: Alignment.bottomCenter,
  adjustBuilder: (param) =>
    param.selfOffset.y + param.selfSize.height > window.innerHeight - 16
      ? new AttachAdjustParam({ alignment: Alignment.topCenter })
      : new AttachAdjustParam(),
  builder: () => h('div', { class: 'popover' }, 'Auto-flips at viewport edge'),
});`,
  },

  'notify-success': makeNotifySnippets('success', '操作成功，变更已即时同步。'),
  'notify-failure': makeNotifySnippets('failure', '提交失败，请检查表单必填字段。'),
  'notify-warning': makeNotifySnippets('warning', '请注意：当前配额接近阈值上限。'),
  'notify-error': makeNotifySnippets('error', '发生异常错误，请稍后重试。'),
  'notify-alter': makeNotifySnippets('alert', '系统将于今晚 23:00 进行例行维护。'),

  'loading-default': {
    vanilla: `import { SmartDialog, SmartStatus } from 'fe-smart-dialog';

void SmartDialog.showLoading({ msg: 'Syncing...' });
await new Promise((r) => setTimeout(r, 1200));
await SmartDialog.dismiss({ status: SmartStatus.loading });`,
    react: `import { SmartStatus } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/react';

const smartDialog = useSmartDialog();
void smartDialog.showLoading({ msg: 'Syncing...' });
await syncTask();
await smartDialog.dismiss({ status: SmartStatus.loading });`,
    vue: `import { SmartStatus } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/vue';

const smartDialog = useSmartDialog();
void smartDialog.showLoading({ msg: 'Syncing...' });
await syncTask();
await smartDialog.dismiss({ status: SmartStatus.loading });`,
  },

  'loading-param': {
    vanilla: `import { SmartBackType, SmartDialog, SmartStatus } from 'fe-smart-dialog';

SmartDialog.showLoading({
  msg: '后台同步中（支持穿透操作）',
  maskColor: 'rgba(15, 23, 42, 0.2)',
  usePenetrate: true,
  backType: SmartBackType.block, // 按 Esc 不关闭 Loading
  displayTime: 1800,
});`,
    react: `import { SmartBackType } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/react';

const smartDialog = useSmartDialog();
void smartDialog.showLoading({
  msg: 'Background sync...',
  usePenetrate: true,
  backType: SmartBackType.block,
  displayTime: 1800,
});`,
    vue: `import { SmartBackType } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/vue';

const smartDialog = useSmartDialog();
void smartDialog.showLoading({
  msg: 'Background sync...',
  usePenetrate: true,
  backType: SmartBackType.block,
  displayTime: 1800,
});`,
  },

  'loading-custom': {
    vanilla: `import { SmartDialog, SmartStatus, html } from 'fe-smart-dialog';

SmartDialog.showLoading({
  builder: () =>
    html\`<div class="brand-loader"><span>正在加载定制资源...</span></div>\`,
  displayTime: 1600,
});`,
    react: `import { useSmartDialog } from 'fe-smart-dialog/react';

const smartDialog = useSmartDialog();
void smartDialog.showLoading({
  displayTime: 1600,
  builder: () => <div className="brand-loader">Custom JSX Spinner...</div>,
});`,
    vue: `import { h } from 'vue';
import { useSmartDialog } from 'fe-smart-dialog/vue';

const smartDialog = useSmartDialog();
void smartDialog.showLoading({
  displayTime: 1600,
  builder: () => h('div', { class: 'brand-loader' }, 'Custom Vue Spinner...'),
});`,
  },

  'loading-least-time': {
    vanilla: `import { Duration, SmartDialog, SmartStatus } from 'fe-smart-dialog';

SmartDialog.config.loading.leastLoadingTime = Duration.milliseconds(900);

void SmartDialog.showLoading({ msg: '请求极快返回但不闪烁' });
// 即便立刻 dismiss，也会至少保留展示 900ms 再顺滑退出
await SmartDialog.dismiss({ status: SmartStatus.loading });`,
    react: `import { Duration, SmartStatus } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/react';

const smartDialog = useSmartDialog();
smartDialog.config.loading.leastLoadingTime = Duration.milliseconds(900);

void smartDialog.showLoading({ msg: 'Saving...' });
await quickSave();
await smartDialog.dismiss({ status: SmartStatus.loading });`,
    vue: `import { Duration, SmartStatus } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/vue';

const smartDialog = useSmartDialog();
smartDialog.config.loading.leastLoadingTime = Duration.milliseconds(900);

void smartDialog.showLoading({ msg: 'Saving...' });
await quickSave();
await smartDialog.dismiss({ status: SmartStatus.loading });`,
  },

  'toast-default': {
    vanilla: `import { SmartDialog } from 'fe-smart-dialog';

await SmartDialog.showToast('Changes saved successfully');`,
    react: `import { SmartToastType } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/react';

const dialog = useSmartDialog();
await dialog.showToast('Changes saved', {
  displayType: SmartToastType.last,
});`,
    vue: `import { SmartToastType } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/vue';

const dialog = useSmartDialog();
await dialog.showToast('Changes saved', {
  displayType: SmartToastType.last,
});`,
  },

  'toast-custom': {
    vanilla: `import { Alignment, SmartDialog, html } from 'fe-smart-dialog';

SmartDialog.showToast({
  msg: 'Custom Toast',
  alignment: Alignment.topCenter,
  displayTime: 2000,
  builder: () => html\`<div class="pill-toast">已添加到收藏夹</div>\`,
});`,
    react: `import { Alignment } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/react';

const dialog = useSmartDialog();
void dialog.showToast({
  msg: 'Custom Toast',
  alignment: Alignment.topCenter,
  builder: () => <div className="pill-toast">Saved in React</div>,
});`,
    vue: `import { h } from 'vue';
import { Alignment } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/vue';

const dialog = useSmartDialog();
void dialog.showToast({
  msg: 'Custom Toast',
  alignment: Alignment.topCenter,
  builder: () => h('div', { class: 'pill-toast' }, 'Saved in Vue'),
});`,
  },

  'toast-type': {
    vanilla: `import { SmartDialog, SmartToastType } from 'fe-smart-dialog';

// 可选: normal (FIFO 排队) | last (替换清空) | onlyRefresh (原地更新) | multi (多条并存)
for (const i of [1, 2, 3]) {
  void SmartDialog.showToast({
    msg: \`Toast #\${i}\`,
    displayType: SmartToastType.multi,
    displayTime: 1800,
  });
}`,
    react: `import { SmartToastType } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/react';

const dialog = useSmartDialog();
void dialog.showToast({ msg: 'Queued Toast', displayType: SmartToastType.normal });
void dialog.showToast({ msg: 'Replace Top', displayType: SmartToastType.last });`,
    vue: `import { SmartToastType } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/vue';

const dialog = useSmartDialog();
void dialog.showToast({ msg: 'Queued Toast', displayType: SmartToastType.normal });
void dialog.showToast({ msg: 'Replace Top', displayType: SmartToastType.last });`,
  },

  'toast-smart': {
    vanilla: `import { Alignment, SmartDialog, SmartStatus } from 'fe-smart-dialog';

void SmartDialog.showToast({ msg: 'Top notice', alignment: Alignment.topCenter });
void SmartDialog.showToast({ msg: 'Bottom notice', alignment: Alignment.bottomCenter });

// 如需立刻清屏所有 Toast（含队列）：
// await SmartDialog.dismiss({ status: SmartStatus.allToast });`,
    react: `import { Alignment } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/react';

const dialog = useSmartDialog();
void dialog.showToast({ msg: 'Top Banner Toast', alignment: Alignment.topCenter });`,
    vue: `import { Alignment } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/vue';

const dialog = useSmartDialog();
void dialog.showToast({ msg: 'Top Banner Toast', alignment: Alignment.topCenter });`,
  },

  'toast-interval': {
    vanilla: `import { Duration, SmartConfigToast, SmartDialog } from 'fe-smart-dialog';

// 全局限制两次 Toast 之间至少间隔 800ms，防高频连点刷屏
SmartDialog.config.toast = new SmartConfigToast({
  intervalTime: Duration.milliseconds(800),
});

void SmartDialog.showToast('Allowed toast');
void SmartDialog.showToast('Throttled within 800ms');`,
    react: `import { Duration } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/react';

const dialog = useSmartDialog();
dialog.config.toast.intervalTime = Duration.milliseconds(800);
void dialog.showToast('Rate-limited toast');`,
    vue: `import { Duration } from 'fe-smart-dialog';
import { useSmartDialog } from 'fe-smart-dialog/vue';

const dialog = useSmartDialog();
dialog.config.toast.intervalTime = Duration.milliseconds(800);
void dialog.showToast('Rate-limited toast');`,
  },

  'other-trick': {
    vanilla: `import { Alignment, SmartDialog, html } from 'fe-smart-dialog';

let updateCounter: (() => void) | null = null;
let count = 0;

void SmartDialog.show({
  alignment: Alignment.center,
  builder: () => {
    const frag = html\`<div class="card"><b>Count: <span>0</span></b></div>\`;
    const span = frag.querySelector('span')!;
    updateCounter = () => {
      count += 1;
      span.textContent = String(count);
    };
    return frag;
  },
});

void SmartDialog.show({
  alignment: Alignment.centerRight,
  usePenetrate: true,
  clickMaskDismiss: false,
  builder: () => {
    const frag = html\`<button class="btn">Remote +1</button>\`;
    frag.querySelector('button')!.onclick = () => updateCounter?.();
    return frag;
  },
});`,
    react: `import { useState } from 'react';
import { Alignment } from 'fe-smart-dialog';
import { useSmartDialog, useSmartDialogController } from 'fe-smart-dialog/react';

// React 跨弹窗协同可通过外层状态 + controller.refresh() 实现
const smartDialog = useSmartDialog();
const controller = useSmartDialogController();`,
    vue: `import { ref } from 'vue';
import { useSmartDialog } from 'fe-smart-dialog/vue';

// Vue 3 跨弹窗状态天然通过 ref() 响应式同步
const count = ref(0);
const smartDialog = useSmartDialog();`,
  },
};
