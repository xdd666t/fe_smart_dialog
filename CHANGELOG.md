# Changelog

## 1.0.0 - 2026-11-14

### Features
- **Full `flutter_smart_dialog` API parity** for Web (`Vanilla TS/JS`, `React 18/19`, `Vue 3`):
  - 5-layer z-index overlay architecture (`custom` < `attach` < `notify` < `loading` < `toast`) + native `<dialog>.showModal()` Top Layer (`useSystem: true`).
  - `SmartDialog.show`, `SmartDialog.showAttach`, `SmartDialog.showNotify`, `SmartDialog.showLoading`, `SmartDialog.showToast`, `SmartDialog.dismiss`, `SmartDialog.checkExist`, `SmartDialog.init`, `SmartDialog.config`, `SmartDialogController`, `SmartNavigatorObserver`.
  - Queue & lifecycle semantics: `tag`, `keepSingle`, `permanent` + `force`, `debounce`, `displayTime`, `leastLoadingTime`, `awaitOverType`, `maskTriggerType` (`down`/`move`/`up`), `backType`, `onBack`, `bindPage`, and `bindWidget` / `bindElement`.
  - Positioning & Spotlight: `AttachEngine` with 9 alignments + custom coordinates, `SmartAttachAlignmentType` (`inside`/`center`/`outside`), `adjustBuilder`, scroll & `ResizeObserver` tracking, and SVG `evenodd` `highlightBuilder` (`SmartHighlightShape.rect` / `circle`).
  - Flutter-aligned default animation timing (`200ms`, `linear` easing, `scale(0) -> scale(1)` center scale / edge slide).
  - Strict Flutter-style enums & `Alignment` class (`Alignment.centerLeft`, `new Alignment(x, y)`, `Alignment.custom(x, y)`, `SmartStatus`, `SmartTheme`, `SmartHighlightShape`, etc.) with runtime `TypeError` validation.
- **Zero-dependency ESM / CJS / IIFE / DTS bundle** + auto-injected scoped CSS with dark/light/auto themes.
- **3-pane `flutter_use`-style interactive Playground Showcase** + automated Vitest unit suite (43 tests) and Playwright E2E suite (8 tests).
