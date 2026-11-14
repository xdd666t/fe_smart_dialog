import type { DemoFrameworkSnippets } from '../types/demo';

export const FRAMEWORK_SNIPPETS_BY_ID: Record<string, DemoFrameworkSnippets> = {
  'dialog-easy': {
    react: `import { useSmartDialog, useSmartDialogController } from 'fe-smart-dialog/react';

function Example() {
  const smartDialog = useSmartDialog();
  const controller = useSmartDialogController();

  return (
    <button
      onClick={() =>
        void smartDialog.show({
          tag: 'counter-card',
          controller,
          builder: ({ dismiss }) => (
            <div className="card">
              <p>Reactive JSX Portal Modal</p>
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
      h('button', {
        onClick: () =>
          void dialog.show({
            tag: 'counter-card',
            controller,
            builder: ({ dismiss }) =>
              h('div', { class: 'card' }, [
                h('p', 'Reactive Vue Teleport Modal'),
                h('button', { onClick: () => void dismiss() }, 'Dismiss'),
              ]),
          }),
      }, 'Open Dialog');
  },
};`,
  },
  'dialog-location': {
    react: `import { Alignment, SmartAnimationType, useSmartDialog } from 'fe-smart-dialog/react';

const dialog = useSmartDialog();

void dialog.show({
  alignment: Alignment.bottomCenter,
  animationType: SmartAnimationType.centerScale_otherSlide,
  builder: ({ dismiss }) => <Drawer onClose={() => void dismiss()} />,
});`,
    vue: `import { Alignment, SmartAnimationType, useSmartDialog } from 'fe-smart-dialog/vue';

const dialog = useSmartDialog();

void dialog.show({
  alignment: Alignment.bottomCenter,
  animationType: SmartAnimationType.centerScale_otherSlide,
  builder: ({ dismiss }) => h(Drawer, { onClose: () => void dismiss() }),
});`,
  },
  'attach-location': {
    react: `import { Alignment, SmartAttachAlignmentType, useBindWidget, useSmartDialog } from 'fe-smart-dialog/react';

function PopoverDemo() {
  const dialog = useSmartDialog();
  const anchorRef = useBindWidget<HTMLButtonElement>();

  return (
    <button
      ref={anchorRef}
      onClick={() =>
        void dialog.showAttach({
          targetContext: anchorRef,
          alignment: Alignment.bottomCenter,
          attachAlignmentType: SmartAttachAlignmentType.outside,
          builder: () => <div className="popover">Attached to React ref</div>,
        })
      }
    >
      Anchor
    </button>
  );
}`,
    vue: `import { Alignment, SmartAttachAlignmentType, useBindWidget, useSmartDialog } from 'fe-smart-dialog/vue';

const dialog = useSmartDialog();
const anchorRef = useBindWidget<HTMLButtonElement>();

void dialog.showAttach({
  targetElement: anchorRef,
  alignment: Alignment.bottomCenter,
  attachAlignmentType: SmartAttachAlignmentType.outside,
  builder: () => h('div', { class: 'popover' }, 'Attached to Vue ref'),
});`,
  },
  'attach-guide': {
    react: `import { Alignment, SmartHighlightShape, SmartNonAnimationType, useBindWidget, useSmartDialog } from 'fe-smart-dialog/react';

const dialog = useSmartDialog();
const targetRef = useBindWidget<HTMLButtonElement>();

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
  builder: ({ dismiss }) => <TourCard onNext={() => void dismiss()} />,
});`,
    vue: `import { Alignment, SmartHighlightShape, useBindWidget, useSmartDialog } from 'fe-smart-dialog/vue';

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
  builder: ({ dismiss }) => h(TourCard, { onNext: () => void dismiss() }),
});`,
  },
  'toast-default': {
    react: `import { SmartToastType, useSmartDialog } from 'fe-smart-dialog/react';

const dialog = useSmartDialog();
await dialog.showToast('Changes saved', {
  displayType: SmartToastType.last,
});`,
    vue: `import { SmartToastType, useSmartDialog } from 'fe-smart-dialog/vue';

const dialog = useSmartDialog();
await dialog.showToast('Changes saved', {
  displayType: SmartToastType.last,
});`,
  },
  'loading-default': {
    react: `import { SmartStatus, useSmartDialog } from 'fe-smart-dialog/react';

const dialog = useSmartDialog();
void dialog.showLoading({ msg: 'Syncing...' });
await syncTask();
await dialog.dismiss({ status: SmartStatus.loading });`,
    vue: `import { SmartStatus, useSmartDialog } from 'fe-smart-dialog/vue';

const dialog = useSmartDialog();
void dialog.showLoading({ msg: 'Syncing...' });
await syncTask();
await dialog.dismiss({ status: SmartStatus.loading });`,
  },
  'notify-success': {
    react: `import { NotifyType, useSmartDialog } from 'fe-smart-dialog/react';

const dialog = useSmartDialog();
await dialog.showNotify({
  notifyType: NotifyType.success,
  msg: 'Deployment verified successfully.',
});`,
    vue: `import { NotifyType, useSmartDialog } from 'fe-smart-dialog/vue';

const dialog = useSmartDialog();
await dialog.showNotify({
  notifyType: NotifyType.success,
  msg: 'Deployment verified successfully.',
});`,
  },
};
