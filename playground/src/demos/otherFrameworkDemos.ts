import { Alignment, SmartDialog } from 'fe-smart-dialog';
import type { DemoEntry } from '../types/demo';
import { mountReactDemo } from './ReactSandboxView';
import { mountVueDemo } from './VueSandboxView';

export const OTHER_AND_FRAMEWORK_DEMOS: DemoEntry[] = [
  {
    id: 'other-trick',
    className: 'OtherTrick',
    category: 'other',
    route: '/other/trick',
    label: 'trick (跨弹窗通信)',
    description:
      '参考 flutter_use OtherTrick：展示两个独立弹窗之间的实时跨弹窗通信（右侧按钮远程递增居中弹窗计数器）。',
    code: `import { Alignment, SmartDialog } from 'fe-smart-dialog';

let invokeIncrement: (() => void) | null = null;

// 弹窗 1：居中展示计数器
SmartDialog.show({
  alignment: Alignment.center,
  builder: () => counterWidget((fn) => { invokeIncrement = fn; }),
});

await delay(350);

// 弹窗 2：右侧无遮罩操作栏，点击即可驱动左侧弹窗实时更新
SmartDialog.show({
  alignment: Alignment.centerRight,
  maskColor: 'transparent',
  usePenetrate: true,
  clickMaskDismiss: false,
  builder: () => addButton(() => invokeIncrement?.()),
});`,
    mount(stage, ctx) {
      let cancelled = false;
      stage.innerHTML = `
        <button class="pg-btn pg-btn--primary pg-btn--elevated" data-testid="btn-other-trick">click me</button>
      `;

      (
        stage.querySelector('[data-testid="btn-other-trick"]') as HTMLButtonElement
      ).onclick = async () => {
        cancelled = false;
        let count = 0;
        let updateDisplay: (() => void) | null = null;

        ctx.log('show display counter dialog');
        void SmartDialog.show({
          tag: 'trick-display',
          alignment: Alignment.center,
          builder: () => {
            const box = document.createElement('div');
            box.className = 'pg-dialog-box';
            box.style.cssText = 'text-align:center;font-size:24px;font-weight:700;';
            box.textContent = `Counter：${count}`;
            updateDisplay = () => {
              count += 1;
              box.textContent = `Counter：${count}`;
              ctx.log(`trick counter -> ${count}`);
            };
            return box;
          },
        });

        await new Promise((r) => setTimeout(r, 380));
        if (cancelled) return;

        void SmartDialog.show({
          tag: 'trick-handler',
          alignment: Alignment.centerRight,
          maskColor: 'transparent',
          usePenetrate: true,
          clickMaskDismiss: false,
          builder: ({ dismiss }) => {
            const drawer = document.createElement('div');
            drawer.className = 'pg-handle-drawer pg-handle-drawer--right';
            drawer.style.width = '180px';
            drawer.innerHTML = '<h4 style="margin:0;">Remote Add</h4>';
            const addBtn = document.createElement('button');
            addBtn.className = 'pg-btn pg-btn--primary';
            addBtn.textContent = 'add (+1)';
            addBtn.onclick = () => updateDisplay?.();

            const closeBtn = document.createElement('button');
            closeBtn.className = 'pg-btn pg-btn--sm';
            closeBtn.textContent = '关闭双弹窗';
            closeBtn.onclick = () => {
              void SmartDialog.dismiss({ tag: 'trick-display' });
              void dismiss();
            };
            drawer.append(addBtn, closeBtn);
            return drawer;
          },
        });
      };

      return () => {
        cancelled = true;
        void SmartDialog.dismiss({ tag: 'trick-display', force: true });
        void SmartDialog.dismiss({ tag: 'trick-handler', force: true });
      };
    },
  },

  {
    id: 'framework-react',
    className: 'ReactSandbox',
    category: 'other',
    route: '/framework/react',
    label: 'React 19 Sandbox',
    badge: 'React',
    description:
      '官方 React 18/19 适配器：通过 SmartDialogProvider 与 Portal 让弹窗直接返回 JSX、继承 Context，并使用 Hook 控制器与 Ref 贴靠。',
    code: `import {
  Alignment,
  SmartDialogProvider,
  useBindWidget,
  useSmartDialog,
  useSmartDialogController,
} from 'fe-smart-dialog/react';

function InnerDemo() {
  const dialog = useSmartDialog();
  const controller = useSmartDialogController();
  const anchorRef = useBindWidget<HTMLButtonElement>();

  return (
    <SmartDialogProvider>
      <button onClick={() => dialog.show({ controller, builder: () => <MyModal /> })}>
        Open React Dialog
      </button>
      <button
        ref={anchorRef}
        onClick={() => dialog.showAttach({ targetContext: anchorRef, alignment: Alignment.bottomCenter, builder: () => <Popover /> })}
      >
        Attach Popover
      </button>
    </SmartDialogProvider>
  );
}`,
    mount(stage) {
      return mountReactDemo(stage);
    },
  },

  {
    id: 'framework-vue',
    className: 'VueSandbox',
    category: 'other',
    route: '/framework/vue',
    label: 'Vue 3 Sandbox',
    badge: 'Vue 3',
    description:
      '官方 Vue 3 适配器：通过 SmartDialogPlugin + SmartDialogProvider Teleport 继承 provide/inject 与局部响应式状态。',
    code: `import {
  Alignment,
  SmartDialogPlugin,
  SmartDialogProvider,
  useBindWidget,
  useSmartDialog,
  useSmartDialogController,
} from 'fe-smart-dialog/vue';

app.use(SmartDialogPlugin);

// setup() 内：
const dialog = useSmartDialog();
const controller = useSmartDialogController();
const anchorRef = useBindWidget<HTMLButtonElement>();

void dialog.showAttach({
  targetElement: anchorRef,
  alignment: Alignment.bottomCenter,
  builder: () => h('div', 'Vue Ref Attached Popover'),
});`,
    mount(stage) {
      return mountVueDemo(stage);
    },
  },
];
