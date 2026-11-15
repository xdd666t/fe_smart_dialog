<div align="center">

# fe-smart-dialog

**优雅、零运行时依赖的前端全能弹窗解决方案**

参考 [`flutter_smart_dialog`](https://github.com/fluttercandies/flutter_smart_dialog)，完整提供 **Custom**、**Attach**、**Notify**、**Loading**、**Toast** 五层独立弹窗体系，内置队列堆栈管理、SVG 聚光灯挖空引导、SPA 路由与 DOM 生命周期绑定、原生 `<dialog>` 顶层模态框支持，并为 **Vanilla TS/JS**、**React 18/19** 与 **Vue 3** 提供一等公民适配。

[![npm version](https://img.shields.io/npm/v/fe-smart-dialog.svg)](https://www.npmjs.com/package/fe-smart-dialog)
[![CI](https://github.com/xdd666t/fe_smart_dialog/actions/workflows/ci.yml/badge.svg)](https://github.com/xdd666t/fe_smart_dialog/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/xdd666t/fe_smart_dialog/blob/main/LICENSE)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](https://www.npmjs.com/package/fe-smart-dialog)

[在线文档](https://xdd666t.github.io/fe_smart_dialog/) · [交互式 Playground](https://xdd666t.github.io/fe_smart_dialog/playground/) · [更新日志](https://github.com/xdd666t/fe_smart_dialog/blob/main/CHANGELOG.md) · [发布版本](https://github.com/xdd666t/fe_smart_dialog/releases) · [问题反馈](https://github.com/xdd666t/fe_smart_dialog/issues)

</div>

---

## 目录

- [核心特性](#核心特性)
- [五层弹窗架构](#五层弹窗架构)
- [安装与引入](#安装与引入)
- [快速开始](#快速开始)
  - [Vanilla TS/JS](#vanilla-tsjs)
  - [React 18/19](#react-1819)
  - [Vue 3](#vue-3)
  - [CDN 与严格 CSP 环境](#cdn-与严格-csp-环境)
- [核心 API 速览](#核心-api-速览)
  - [全局初始化与配置](#全局初始化与配置)
  - [弹窗调用与关闭](#弹窗调用与关闭)
  - [控制器与路由监听](#控制器与路由监听)
  - [常用枚举与几何类](#常用枚举与几何类)
- [主题定制与 CSS 变量](#主题定制与-css-变量)
- [Flutter SmartDialog 迁移说明](#flutter-smartdialog-迁移说明)
- [本地开发与验证](#本地开发与验证)
- [开源协议](#开源协议)

---

## 核心特性

- **零运行时依赖与多产物输出**：核心引擎基于纯 TypeScript 与原生 DOM 构建，提供 ESM、CJS、IIFE（`window.FeSmartDialog`）及完整 `.d.ts` 类型声明；React 与 Vue 3 适配器通过子路径按需接入。
- **开箱即用样式与明暗主题**：内置作用域 `.fsd-*` 样式与 `--fsd-*` CSS 变量，首次触发弹窗时自动注入 `<head>`；支持 `SmartTheme.auto / light / dark` 主题切换，也可通过 `injectStyles: false` 配合 `fe-smart-dialog/style.css` 手动引入。
- **五层物理隔离弹窗栈**：按 `Custom < Attach < Notify < Loading < Toast` 顺序严格隔离 DOM 容器与 `z-index`，各类弹窗互不遮挡；支持 `useSystem: true` 启用浏览器原生 `<dialog>.showModal()` Top Layer。
- **完备的队列与生命周期语义**：
  - **堆栈与复用**：`tag` 定点关闭与 `checkExist` 存在性检查、`keepSingle` 单例刷新复用、`permanent` 常驻保护锁（需 `force: true` 或指定 `tag` 关闭）、`debounce` 防抖与 `displayTime` 自动关闭。
  - **Promise 返回值**：`await SmartDialog.show*()` 支持通过 `dismiss(result)` 异步返回业务结果，并通过 `awaitOverType`（`dialogDismiss` / `dialogAppear` / `none`）控制 `resolve` 时机。
  - **路由与元素绑定**：`bindPage` 自动监听 History API（`pushState` / `replaceState` / `popstate` / `hashchange`）实现跨页隔离，亦可通过 `SmartDialog.observer` 显式接入第三方路由；`bindWidget` / `bindElement` 基于 `MutationObserver` + `IntersectionObserver` 在宿主元素销毁时自动清理弹窗。
  - **返回拦截**：通过 `backType`（`normal` / `block` / `ignore`）与 `onBack` 统一处理 `Esc` 键与可选浏览器后退拦截（`enableHistoryBack`）。
- **智能锚点定位与 SVG 聚光灯**：
  - `showAttach` 支持绑定 DOM 元素、CSS 选择器、React/Vue `Ref`、getter 函数或自定义视口坐标（`targetBuilder`）。
  - 提供 9 宫格对齐常量与 `new Alignment(x, y)` 归一化坐标、`SmartAttachAlignmentType`（`inside` / `center` / `outside`）、视口边缘自适应 `adjustBuilder`、滚动及 `ResizeObserver` 自动重定位。
  - 内置基于 SVG `fill-rule="evenodd"` 的 `highlightBuilder` 聚光灯挖空（`SmartHighlightShape.rect` / `circle`）与 `maskIgnoreArea` 穿透交互区域。
- **开箱反馈套件（Toast / Loading / Notify）**：
  - 4 种 Toast 队列模式（`normal`、`last`、`onlyRefresh`、`multi`）、触发冷却 `intervalTime` 与移动端 `VisualViewport` 软键盘避让。
  - 全局单例 Loading，支持 `leastLoadingTime` 最短展示时间保护，避免请求过快导致闪烁。
  - 5 种语义化 Notify 风格（`success`、`failure`、`warning`、`error`、`alert`），支持通过 `SmartNotifyStyle` 全局替换模板。

---

## 五层弹窗架构

`fe-smart-dialog` 将弹窗按语义拆分为 5 个独立挂载的图层容器（默认起始 `zIndexBase = 9999`），确保全局加载或提示永远不会被底层业务弹窗遮挡：

| 层级顺序 | 图层类型 | 对应 API | 默认 `z-index` | 典型用途 |
| :---: | --- | --- | :---: | --- |
| 5（最高） | **Toast** | `SmartDialog.showToast` | `zIndexBase + 40` | 轻提示、操作反馈队列 |
| 4 | **Loading** | `SmartDialog.showLoading` | `zIndexBase + 30` | 全局单例加载遮罩 |
| 3 | **Notify** | `SmartDialog.showNotify` | `zIndexBase + 20` | 语义化状态通知横幅 |
| 2 | **Attach** | `SmartDialog.showAttach` | `zIndexBase + 10` | 锚点气泡、右键菜单、聚光灯引导 |
| 1（最底） | **Custom** | `SmartDialog.show` | `zIndexBase + 0` | 模态框、抽屉、ActionSheet、自定义浮层 |

> 调用无参 `SmartDialog.dismiss()` 时（默认 `SmartStatus.smart`），会按 **`Loading` → `Notify` → 栈顶 `Custom` / `Attach`** 的优先级依次关闭最顶层弹窗。

---

## 安装与引入

使用任意包管理器安装：

```bash
npm install fe-smart-dialog
# 或使用 pnpm / yarn / bun
pnpm add fe-smart-dialog
yarn add fe-smart-dialog
bun add fe-smart-dialog
```

> **对等依赖说明**：核心包无任何运行时依赖；若使用框架适配器，需项目本身已安装 `react >= 18.0.0`（含 `react-dom`）或 `vue >= 3.3.0`。

### 子路径导出说明

| 引入路径 | 用途说明 |
| --- | --- |
| `fe-smart-dialog` | 核心库（`SmartDialog`、`SmartConfig`、`Alignment`、枚举、`html` 等） |
| `fe-smart-dialog/react` | React 18/19 适配器（`SmartDialogProvider`、`ReactSmartDialog`、Hooks 等） |
| `fe-smart-dialog/vue` | Vue 3 适配器（`SmartDialogPlugin`、`SmartDialogProvider`、`VueSmartDialog`、Composables 等） |
| `fe-smart-dialog/style.css` | 独立样式文件（在配置 `injectStyles: false` 时手动引入） |

---

## 快速开始

### Vanilla TS/JS

无需任何初始化样板代码，直接调用 `SmartDialog` 静态方法即可使用。推荐配合内置 `html` 标签模板构建 DOM，插值内容会自动进行 HTML 转义以防范 XSS 注入：

```ts
import {
  Alignment,
  NotifyType,
  SmartDialog,
  SmartStatus,
  SmartToastType,
  html,
} from 'fe-smart-dialog';

// 1. Toast 轻提示
await SmartDialog.showToast('保存成功', {
  displayType: SmartToastType.last,
});

// 2. Loading 全局加载
void SmartDialog.showLoading({ msg: '正在上传...' });
try {
  await doWork();
} finally {
  await SmartDialog.dismiss({ status: SmartStatus.loading });
}

// 3. Notify 语义通知
await SmartDialog.showNotify({
  notifyType: NotifyType.success,
  msg: '部署已完成',
});

// 4. Custom 自定义弹窗（支持泛型异步返回值）
const confirmed = await SmartDialog.show<boolean>({
  alignment: Alignment.center,
  builder: ({ dismiss }) => {
    const title = '操作确认';
    const frag = html`
      <div class="my-card">
        <h3>${title}</h3>
        <p>确认继续执行当前操作吗？</p>
        <div class="actions">
          <button data-action="cancel">取消</button>
          <button data-action="ok">确认</button>
        </div>
      </div>
    `;
    frag.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
      void dismiss(false);
    });
    frag.querySelector('[data-action="ok"]')?.addEventListener('click', () => {
      void dismiss(true);
    });
    return frag;
  },
});
```

### React 18/19

在应用根节点挂载 `<SmartDialogProvider>`，弹窗内容将通过 React Portal 渲染并自动继承组件树上下文（如 `Theme`、`Router`、`Redux`、`i18n` 等）：

```tsx
import {
  Alignment,
  SmartDialogProvider,
  SmartTheme,
  useBindWidget,
  useSmartDialog,
} from 'fe-smart-dialog/react';

function Demo() {
  const smartDialog = useSmartDialog();
  const anchorRef = useBindWidget<HTMLButtonElement>();

  return (
    <>
      <button
        onClick={() =>
          void smartDialog.show({
            builder: ({ dismiss }) => (
              <div className="card">
                <p>Hello from React Portal!</p>
                <button onClick={() => void dismiss()}>关闭</button>
              </div>
            ),
          })
        }
      >
        打开弹窗
      </button>

      <button
        ref={anchorRef}
        onClick={() =>
          void smartDialog.showAttach({
            targetElement: anchorRef,
            alignment: Alignment.bottomCenter,
            builder: () => <div className="popover">锚点气泡提示</div>,
          })
        }
      >
        锚点触发
      </button>
    </>
  );
}

export function App() {
  return (
    <SmartDialogProvider theme={SmartTheme.auto}>
      <Demo />
    </SmartDialogProvider>
  );
}
```

### Vue 3

安装 `SmartDialogPlugin` 并挂载 `<SmartDialogProvider>`，即可同时继承全局应用插件（如 `Pinia`、`Vue Router`）与组件局部 `provide` / `inject`：

```ts
// main.ts
import { createApp, h } from 'vue';
import {
  SmartDialogPlugin,
  SmartDialogProvider,
  SmartTheme,
} from 'fe-smart-dialog/vue';
import AppContent from './App.vue';

const app = createApp({
  render: () => h(SmartDialogProvider, null, { default: () => h(AppContent) }),
});

app.use(SmartDialogPlugin, { theme: SmartTheme.auto });
app.mount('#app');
```

在组件 `<script setup>` 中调用：

```ts
import { h } from 'vue';
import { useBindWidget, useSmartDialog } from 'fe-smart-dialog/vue';

const smartDialog = useSmartDialog();
const anchorRef = useBindWidget<HTMLButtonElement>();

function openDialog() {
  void smartDialog.show({
    bindWidget: anchorRef,
    builder: ({ dismiss }) =>
      h('div', { class: 'card' }, [
        h('p', 'Hello from Vue 3!'),
        h('button', { onClick: () => void dismiss() }, '关闭'),
      ]),
  });
}
```

> 在选项式 API 中，安装 `SmartDialogPlugin` 后也可直接通过 `this.$smartDialog` 调用；若未在插件安装时传参，可通过 `<SmartDialogProvider :init-options="{ theme: SmartTheme.auto }">` 传入初始化配置。

### CDN 与严格 CSP 环境

**浏览器直接引入 IIFE 产物：**

```html
<script src="https://unpkg.com/fe-smart-dialog/dist/fe-smart-dialog.global.js"></script>
<script>
  const { SmartDialog, Alignment, SmartStatus } = window.FeSmartDialog;
  SmartDialog.showToast('Hello from CDN!');
</script>
```

**严格 CSP（禁止内联 `<style>`）环境：**

```ts
import 'fe-smart-dialog/style.css';
import { SmartDialog } from 'fe-smart-dialog';

SmartDialog.init({
  injectStyles: false,
});
```

---

## 核心 API 速览

### 全局初始化与配置

#### `SmartDialog.init(options?)`

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `theme` | `SmartTheme` | `SmartTheme.auto` | 内置组件主题：`auto` / `light` / `dark` |
| `container` | `HTMLElement \| string` | `document.body` | 自定义挂载容器或 CSS 选择器（适用于微前端/局部挂载） |
| `zIndexBase` | `number` | `9999` | 五层弹窗基准 `z-index` |
| `injectStyles` | `boolean` | `true` | 是否自动向 `<head>` 注入内置样式 |
| `initType` | `Iterable<SmartInitType>` | 全部 5 层 | 指定预先初始化的弹窗图层集合 |
| `toastBuilder` | `(msg: string) => SmartContent` | 内置模板 | 全局替换默认 Toast 视图 |
| `loadingBuilder` | `(msg: string) => SmartContent` | 内置模板 | 全局替换默认 Loading 视图 |
| `notifyStyle` | `SmartNotifyStyle` | 内置语义模板 | 按 5 种 `NotifyType` 分别定制 Notify 模板 |
| `styleBuilder` | `(child: HTMLElement) => SmartContent \| void` | — | 全局包裹弹窗容器根结构 |
| `autoTrackHistory` | `boolean` | `true` | 是否自动监听 `pushState` / `replaceState` / `popstate` / `hashchange` |
| `enableHistoryBack` | `boolean` | `false` | 是否启用历史记录哨兵以拦截浏览器物理后退按钮 |

#### `SmartDialog.config` 全局分层配置

可通过 `SmartDialog.config` 统一调整各层默认行为：

- `SmartDialog.config.custom`（`SmartConfigCustom`）
- `SmartDialog.config.attach`（`SmartConfigAttach`）
- `SmartDialog.config.notify`（`SmartConfigNotify`）
- `SmartDialog.config.loading`（`SmartConfigLoading`）
- `SmartDialog.config.toast`（`SmartConfigToast`）

### 弹窗调用与关闭

| 方法签名 | 说明 |
| --- | --- |
| `SmartDialog.show<T>(options)` | 弹出自定义弹窗（支持居中、抽屉、穿透、`useSystem` 等） |
| `SmartDialog.showAttach<T>(options)` | 弹出锚点定位弹窗（支持 `targetElement`、`targetBuilder`、`adjustBuilder`、`highlightBuilder`） |
| `SmartDialog.showNotify<T>(options)` | 弹出语义化通知（`NotifyType.success` / `failure` / `warning` / `error` / `alert`） |
| `SmartDialog.showLoading<T>(options?)` | 弹出全局单例 Loading 遮罩 |
| `SmartDialog.showToast(msg, options?)` | 弹出 Toast 提示（亦支持 `SmartDialog.showToast({ msg, ...options })` 对象形式） |
| `SmartDialog.dismiss<T>({ status?, tag?, result?, force? })` | 关闭指定类型或 `tag` 的弹窗，并可向等待中的 `show*` 回传 `result` |
| `SmartDialog.checkExist({ tag?, dialogTypes? })` | 检查指定 `tag` 或弹窗类型当前是否存在 |

### 控制器与路由监听

- **`SmartDialogController`**：传入 `controller` 参数后，调用 `controller.refresh()` 可在不销毁弹窗实例的情况下原地刷新 `builder` 内容（React / Vue 中提供 `useSmartDialogController()`）。
- **`SmartDialog.observer`**（`SmartNavigatorObserver`）：在关闭自动追踪或需要精确对接 Vue Router / React Router 时，可手动调用 `didPush(route, previousRoute?)`、`didReplace({ newRoute, oldRoute })`、`didPop(route, previousRoute?)`、`didRemove(route)`。
- **`FeSmartDialog`**：提供与 `FlutterSmartDialog.init` / `FlutterSmartDialog.observer` 对齐的兼容别名对象。

### 常用枚举与几何类

- **核心枚举**：`SmartStatus`、`SmartAllDialogType`、`SmartToastType`、`NotifyType`、`SmartAnimationType`、`SmartAttachAlignmentType`、`SmartAwaitOverType`、`SmartMaskTriggerType`、`SmartNonAnimationType`、`SmartBackType`、`SmartHighlightShape`、`SmartTheme`、`SmartInitType`
- **几何与时长工具**：`Alignment`（9 个静态预设及 `new Alignment(x, y)` / `Alignment.custom(x, y)`）、`Duration`、`Offset`、`Size`、`Rect`

> 完整参数定义与在线示例请访问 [API 参考文档](https://xdd666t.github.io/fe_smart_dialog/api/)。

---

## 主题定制与 CSS 变量

内置 Toast、Loading 与 Notify 组件均使用 `--fsd-*` CSS 变量控制外观，可在 `:root` 或自定义容器选择器上直接覆写：

```css
:root {
  --fsd-bg: rgba(18, 18, 22, 0.9);
  --fsd-text: #ffffff;
  --fsd-border: rgba(255, 255, 255, 0.08);
  --fsd-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
  --fsd-radius: 12px;
  --fsd-toast-radius: 20px;
  --fsd-loading-radius: 15px;
  --fsd-notify-radius: 10px;
  --fsd-success: #22c55e;
  --fsd-failure: #ef4444;
  --fsd-warning: #f59e0b;
  --fsd-alert: #3b82f6;
  --fsd-error: #dc2626;
}
```

---

## Flutter SmartDialog 迁移说明

- **API 与命名高度一致**：核心方法、配置类、枚举名及几何类型（`Alignment`、`Duration`、`Offset`、`Rect`、`Size`）均与 `flutter_smart_dialog` 保持一致。
- **严格的类型与运行时校验**：枚举参数与 `Alignment` 遵循严格的实例约束（如 `Alignment.bottomCenter`、`new Alignment(0.5, -0.5)`、`Alignment.custom(0.5, -0.5)`、`SmartStatus.loading`、`SmartTheme.dark`），在编译期与运行时均拒绝裸字符串或普通坐标字面量对象。
- **Web 端专属增强**：
  - 时长参数除 `Duration.milliseconds(2000)` 外，支持直接传入毫秒数字（如 `displayTime: 2000`）。
  - 提供 `targetElement`、`bindElement` 语义别名，以及基于 `--fsd-*` 的 CSS 变量换肤。
  - 开启 `useSystem: true` 时使用浏览器原生 `<dialog>.showModal()` Top Layer 渲染；与 Flutter 语义一致，该模式下不可同时设置 `tag`、`keepSingle` 或 `permanent`。

---

## 本地开发与验证

```bash
# 类型检查（库源码与文档工程）
npm run typecheck

# 运行 Vitest 单元测试
npm run test:unit

# 构建产物（ESM / CJS / IIFE / DTS + CSS）
npm run build

# 运行 Playwright 端到端测试
npm run test:e2e

# 运行完整校验流水线（类型检查 + 单测 + 构建 + 站点构建 + E2E）
npm test

# 启动交互式 Playground 开发服务器
npm run dev:playground

# 启动 Rspress 文档站开发服务器
npm run dev:docs
```

---

## 开源协议

基于 [MIT License](https://github.com/xdd666t/fe_smart_dialog/blob/main/LICENSE) 开源。
