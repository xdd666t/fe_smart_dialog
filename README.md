# fe-smart-dialog

An elegant, zero-dependency frontend dialog solution inspired by [`flutter_smart_dialog`](https://github.com/xdd666t/flutter_smart_dialog) — delivering **Custom**, **Attach**, **Notify**, **Loading**, and **Toast** overlays with full stack/queue management, SVG spotlight cutouts, SPA route & DOM lifecycle binding, native `<dialog>` top-layer support, and first-class adapters for **Vanilla TS/JS**, **React 18/19**, and **Vue 3**.

## Features

- **Zero Runtime Dependencies**: Core TypeScript/DOM engine compiles to ESM, CJS, and UMD/IIFE with zero runtime deps. React and Vue 3 adapters are optional subpath entrypoints.
- **Zero-Config Styling + Dark/Light Theme**: Scoped `.fsd-*` styles with `--fsd-*` CSS variables auto-inject into `<head>` by default (`injectStyles: false` to import `fe-smart-dialog/style.css` manually).
- **Complete 5-Layer Overlay Architecture**: Ordered layers (`custom` < `attach` < `notify` < `loading` < `toast`) with exact z-index separation and optional `useSystem: true` native `<dialog>.showModal()` Top Layer.
- **Rich Queue & Lifecycle Semantics**:
  - `tag` FIFO single close vs LIFO untagged close, `keepSingle` instance reuse across promises, `permanent` barrier protection (`force: true` required), `debounce`, and `displayTime`.
  - `bindPage` automatic History API / `popstate` / `hashchange` visibility tracking + explicit `SmartDialog.observer` (`didPush`, `didReplace`, `didPop`, `didRemove`).
  - `bindWidget` / `bindElement` automatic dismissal and visibility tracking via `MutationObserver` + `IntersectionObserver`.
  - `backType` (`normal` / `block` / `ignore`) & `onBack` for `Escape` and optional browser back interception (`enableHistoryBack`).
- **Attach Popovers & SVG Spotlight Guides**:
  - Anchor to any DOM element, React ref, Vue ref, CSS selector, getter, or coordinates (`targetBuilder`).
  - 9 alignments (`topLeft` .. `bottomRight` & custom `{ x, y }`), `SmartAttachAlignmentType` (`inside` / `center` / `outside`), edge-aware `adjustBuilder`, scroll & `ResizeObserver` tracking.
  - Built-in SVG `fill-rule="evenodd"` spotlight cutout via `highlightBuilder` (`rect` or `circle`) and `maskIgnoreArea`.
- **Toast, Loading & Semantic Notify**:
  - 4 Toast modes (`normal`, `last`, `onlyRefresh`, `multi`) + `VisualViewport` soft-keyboard avoidance.
  - Singleton Loading with `leastLoadingTime` minimum display protection.
  - 5 semantic Notify styles (`success`, `failure`, `warning`, `error`, `alert`) via `SmartNotifyStyle`.

---

## Installation

```bash
npm install fe-smart-dialog
```

Subpath entrypoints:

| Import | Purpose |
| --- | --- |
| `fe-smart-dialog` | Core library (Vanilla JS/TS, Config, Enums, Helpers, `html`) |
| `fe-smart-dialog/react` | React 18/19 facade, `<SmartDialogProvider>`, Hooks |
| `fe-smart-dialog/vue` | Vue 3 facade, `SmartDialogPlugin`, `<SmartDialogProvider>`, Composables |
| `fe-smart-dialog/style.css` | Standalone CSS bundle (when setting `injectStyles: false`) |

---

## Quick Start

### Vanilla TypeScript / JavaScript

No setup boilerplate is required — just call `SmartDialog` directly:

```ts
import { Alignment, NotifyType, SmartDialog, SmartToastType, html } from 'fe-smart-dialog';

// Toast
await SmartDialog.showToast('Saved successfully', {
  displayType: SmartToastType.last,
});

// Loading
void SmartDialog.showLoading({ msg: 'Uploading...' });
await doWork();
await SmartDialog.dismiss({ status: 'loading' });

// Semantic Notify
await SmartDialog.showNotify({
  notifyType: NotifyType.success,
  msg: 'Deployment complete',
});

// Custom Modal with XSS-safe html helper & return value
const confirmed = await SmartDialog.show<boolean>({
  alignment: Alignment.center,
  builder: ({ dismiss }) => {
    const el = document.createElement('div');
    el.appendChild(html`<div class="my-card"><h3>Confirm?</h3></div>`);
    const ok = document.createElement('button');
    ok.textContent = 'Confirm';
    ok.onclick = () => void dismiss(true);
    el.appendChild(ok);
    return el;
  },
});
```

### React 18 / 19

Wrap your app in `<SmartDialogProvider>` so dialogs render through React Portals and inherit React Context (`Theme`, `Router`, `Redux`, `i18n`):

```tsx
import {
  Alignment,
  SmartDialogProvider,
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
                <button onClick={() => void dismiss()}>Close</button>
              </div>
            ),
          })
        }
      >
        Open Dialog
      </button>

      <button
        ref={anchorRef}
        onClick={() =>
          void smartDialog.showAttach({
            targetContext: anchorRef,
            alignment: Alignment.bottomCenter,
            builder: () => <div className="popover">Attached Popover</div>,
          })
        }
      >
        Anchor
      </button>
    </>
  );
}

export function App() {
  return (
    <SmartDialogProvider theme="auto">
      <Demo />
    </SmartDialogProvider>
  );
}
```

### Vue 3

Install `SmartDialogPlugin` and optionally mount `<SmartDialogProvider>` to inherit both global app plugins and local component `provide`/`inject`:

```ts
import { createApp, h } from 'vue';
import {
  SmartDialogPlugin,
  SmartDialogProvider,
  useSmartDialog,
} from 'fe-smart-dialog/vue';

const app = createApp({
  render: () => h(SmartDialogProvider, null, { default: () => h(AppContent) }),
});

app.use(SmartDialogPlugin, { theme: 'auto' });
app.mount('#app');
```

Inside a component:

```ts
const dialog = useSmartDialog();
const anchorRef = useBindWidget<HTMLButtonElement>();

void dialog.show({
  builder: ({ dismiss }) =>
    h('div', [
      h('p', 'Hello from Vue 3!'),
      h('button', { onClick: () => void dismiss() }, 'Close'),
    ]),
});
```

---

## API Overview

### Initialization & Global Config

- `SmartDialog.init(options?)`:
  - `toastBuilder`, `loadingBuilder`, `notifyStyle` (`SmartNotifyStyle`), `styleBuilder`
  - `initType`: subset of `['custom', 'attach', 'notify', 'loading', 'toast']`
  - `container`: custom mount DOM element or CSS selector (defaults to `document.body`)
  - `zIndexBase`: base z-index for the 5 layers (default `9999`)
  - `theme`: `'auto' | 'light' | 'dark'`
  - `injectStyles`: `boolean` (default `true`; set `false` when importing `fe-smart-dialog/style.css` yourself)
  - `autoTrackHistory`: `boolean` (default `true`)
  - `enableHistoryBack`: `boolean` (default `false`; intercepts browser back button while dialog is open)
- `SmartDialog.config`:
  - `config.custom` (`SmartConfigCustom`)
  - `config.attach` (`SmartConfigAttach`)
  - `config.notify` (`SmartConfigNotify`)
  - `config.loading` (`SmartConfigLoading`)
  - `config.toast` (`SmartConfigToast`)

### Dialog Methods

- `SmartDialog.show<T>(options)`
- `SmartDialog.showAttach<T>(options)`
- `SmartDialog.showNotify<T>(options)`
- `SmartDialog.showLoading<T>(options?)`
- `SmartDialog.showToast(msg, options?)` or `SmartDialog.showToast({ msg, ...options })`
- `SmartDialog.dismiss<T>({ status?, tag?, result?, force? })`
- `SmartDialog.checkExist({ tag?, dialogTypes? })`

### Flutter SmartDialog Migration Notes

- All core class, config, enum, and parameter names match `flutter_smart_dialog` (`SmartStatus`, `SmartToastType`, `SmartAnimationType`, `SmartAttachAlignmentType`, `SmartAwaitOverType`, `SmartMaskTriggerType`, `SmartNonAnimationType`, `SmartBackType`, `NotifyType`, `Alignment`, `Duration`, `Offset`, `Rect`, `Size`).
- Web-native conveniences also accept raw milliseconds (`displayTime: 2000`), string preset alignments (`alignment: 'bottomCenter'`), `targetElement` / `bindElement` aliases, and CSS variables (`--fsd-*`).
- When `useSystem: true` is set, dialogs use `<dialog>.showModal()` (cannot be combined with `tag`, `keepSingle`, or `permanent`, matching Flutter semantics).

---

## Development & Verification

```bash
npm run typecheck
npm run test:unit
npm run build
npm run test:e2e
npm run dev:playground
```

## License

MIT
