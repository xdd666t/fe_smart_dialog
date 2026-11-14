import { createApp, defineComponent, h, inject, ref } from 'vue';
import {
  Alignment,
  SmartDialogPlugin,
  SmartDialogProvider,
  useBindWidget,
  useSmartDialog,
  useSmartDialogController,
} from 'fe-smart-dialog/vue';

const VUE_THEME_KEY = Symbol('vue-theme');

const VueContextModal = defineComponent({
  name: 'VueContextModal',
  props: {
    label: { type: String, required: true },
  },
  emits: ['close', 'refresh'],
  setup(props, { emit }) {
    const theme = inject(VUE_THEME_KEY, 'default-vue');
    const clicks = ref(0);

    return () =>
      h('div', { class: 'pg-dialog-box', 'data-testid': 'vue-pg-modal' }, [
        h('h4', { style: 'margin:0 0 8px' }, 'Vue 3 Teleport Modal'),
        h('p', { style: 'margin:0 0 8px' }, [
          'Provide/Inject Value: ',
          h('strong', { 'data-testid': 'vue-pg-theme' }, theme),
        ]),
        h('p', { style: 'margin:0 0 12px' }, [
          'Controller Prop: ',
          h('strong', { 'data-testid': 'vue-pg-label' }, props.label),
        ]),
        h('div', { class: 'pg-actions' }, [
          h(
            'button',
            {
              class: 'pg-btn pg-btn--primary',
              'data-testid': 'vue-pg-state-btn',
              onClick: () => {
                clicks.value += 1;
              },
            },
            `Reactive State: ${clicks.value}`,
          ),
          h(
            'button',
            {
              class: 'pg-btn',
              'data-testid': 'vue-pg-modal-refresh',
              onClick: () => emit('refresh'),
            },
            'Refresh Label',
          ),
          h(
            'button',
            {
              class: 'pg-btn',
              'data-testid': 'vue-pg-close',
              onClick: () => emit('close'),
            },
            'Close (vue-done)',
          ),
        ]),
      ]);
  },
});

const VuePlaygroundInner = defineComponent({
  name: 'VuePlaygroundInner',
  setup() {
    const dialog = useSmartDialog();
    const controller = useSmartDialogController();
    const anchorRef = useBindWidget<HTMLButtonElement>();
    const resultText = ref('none');
    let version = 1;

    const refreshModal = () => {
      version += 1;
      controller.refresh();
    };

    const openModal = () => {
      version = 1;
      void dialog
        .show<string>({
          tag: 'vue-pg-dialog',
          controller,
          builder: ({ dismiss }) =>
            h(VueContextModal, {
              label: `Version-${version}`,
              onRefresh: refreshModal,
              onClose: () => void dismiss('vue-done'),
            }),
        })
        .then((res) => {
          resultText.value = res ?? 'closed';
        });
    };

    const openAttach = () => {
      void dialog.showAttach({
        targetElement: anchorRef,
        alignment: Alignment.bottomCenter,
        builder: () =>
          h(
            'div',
            { class: 'pg-popover', 'data-testid': 'vue-pg-popover' },
            'Vue Ref Attached Popover',
          ),
      });
    };

    return () =>
      h('div', { style: 'display:flex;flex-direction:column;gap:12px;width:100%' }, [
        h('div', { class: 'pg-card' }, [
          h('h4', 'Vue 3 Provide/Inject + Controller'),
          h(
            'p',
            'Dialogs inherit Vue provide/inject context via Teleport and retain reactive component state across controller.refresh().',
          ),
          h(
            'div',
            {
              class: 'pg-actions',
              style: 'margin-bottom:10px;justify-content:flex-start;',
            },
            [
              h(
                'button',
                {
                  class: 'pg-btn pg-btn--primary',
                  'data-testid': 'btn-vue-open',
                  onClick: openModal,
                },
                'Open Vue Dialog',
              ),
              h(
                'button',
                {
                  class: 'pg-btn',
                  'data-testid': 'btn-vue-refresh',
                  onClick: refreshModal,
                },
                'Controller Refresh',
              ),
            ],
          ),
          h('div', { class: 'pg-badge', 'data-testid': 'vue-pg-result' }, [
            `Result: ${resultText.value}`,
          ]),
        ]),
        h('div', { class: 'pg-card' }, [
          h('h4', 'Vue useBindWidget + showAttach'),
          h('p', 'Attach Vue VNodes directly to template refs.'),
          h('div', { class: 'pg-actions', style: 'justify-content:flex-start;' }, [
            h(
              'button',
              {
                ref: anchorRef,
                class: 'pg-btn pg-btn--primary',
                'data-testid': 'btn-vue-attach',
                onClick: openAttach,
              },
              'Vue Attach Anchor',
            ),
          ]),
        ]),
      ]);
  },
});

const VueRoot = defineComponent({
  name: 'VuePlaygroundRoot',
  provide() {
    return {
      [VUE_THEME_KEY]: 'vue-emerald',
    };
  },
  render() {
    return h(SmartDialogProvider, null, {
      default: () => h(VuePlaygroundInner),
    });
  },
});

export function mountVueDemo(container: HTMLElement): () => void {
  const host = document.createElement('div');
  host.style.width = '100%';
  container.appendChild(host);

  const app = createApp(VueRoot);
  app.use(SmartDialogPlugin);
  app.mount(host);

  return () => {
    app.unmount();
    host.remove();
  };
}
