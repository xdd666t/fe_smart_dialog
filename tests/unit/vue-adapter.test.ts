import { mount } from '@vue/test-utils';
import { defineComponent, h, inject, nextTick, provide } from 'vue';
import { describe, expect, it } from 'vitest';
import {
  SmartDialog,
  SmartDialogPlugin,
  SmartDialogProvider,
  useBindWidget,
  useSmartDialog,
  useSmartDialogController,
} from '../../src/vue';

describe('Vue 3 Adapter Integration', () => {
  it('supports SmartDialogPlugin + SmartDialogProvider Teleport inheriting provide/inject', async () => {
    const LOCAL_KEY = Symbol('local-theme');
    const GLOBAL_KEY = Symbol('global-cfg');

    const DialogInner = defineComponent({
      name: 'DialogInner',
      setup() {
        const localTheme = inject(LOCAL_KEY, 'missing');
        const globalCfg = inject(GLOBAL_KEY, 'missing');
        return () =>
          h('div', { 'data-testid': 'vue-dialog-inner' }, [
            h('span', { 'data-testid': 'vue-local' }, localTheme),
            h('span', { 'data-testid': 'vue-global' }, globalCfg),
          ]);
      },
    });

    const HostChild = defineComponent({
      name: 'HostChild',
      setup() {
        const dialog = useSmartDialog();
        const controller = useSmartDialogController();
        const btnRef = useBindWidget<HTMLButtonElement>();
        let count = 1;

        const open = () => {
          void dialog.show({
            tag: 'vue-ctx',
            controller,
            useAnimation: false,
            builder: ({ dismiss }) =>
              h('div', [
                h(DialogInner),
                h('span', { 'data-testid': 'vue-count' }, `Count:${count}`),
                h(
                  'button',
                  {
                    'data-testid': 'vue-close',
                    onClick: () => void dismiss('vue-ok'),
                  },
                  'Close',
                ),
              ]),
          });
        };

        const refresh = () => {
          count += 1;
          controller.refresh();
        };

        const openAttach = () => {
          void dialog.showAttach({
            targetElement: btnRef,
            useAnimation: false,
            builder: () => h('div', { 'data-testid': 'vue-attach' }, 'Anchored'),
          });
        };

        return () =>
          h('div', [
            h(
              'button',
              { ref: btnRef, 'data-testid': 'vue-open', onClick: open },
              'Open',
            ),
            h(
              'button',
              { 'data-testid': 'vue-refresh', onClick: refresh },
              'Refresh',
            ),
            h(
              'button',
              { 'data-testid': 'vue-attach-btn', onClick: openAttach },
              'Attach',
            ),
          ]);
      },
    });

    const AppRoot = defineComponent({
      setup() {
        provide(LOCAL_KEY, 'emerald-vue');
        return () => h(SmartDialogProvider, null, { default: () => h(HostChild) });
      },
    });

    const wrapper = mount(AppRoot, {
      attachTo: document.body,
      global: {
        plugins: [SmartDialogPlugin],
        provide: {
          [GLOBAL_KEY as symbol]: 'vue-plugin-ok',
        },
      },
    });

    await wrapper.get('[data-testid="vue-open"]').trigger('click');
    await nextTick();

    expect(document.querySelector('[data-testid="vue-local"]')?.textContent).toBe(
      'emerald-vue',
    );
    expect(document.querySelector('[data-testid="vue-global"]')?.textContent).toBe(
      'vue-plugin-ok',
    );
    expect(document.querySelector('[data-testid="vue-count"]')?.textContent).toBe(
      'Count:1',
    );

    await wrapper.get('[data-testid="vue-refresh"]').trigger('click');
    await nextTick();
    expect(document.querySelector('[data-testid="vue-count"]')?.textContent).toBe(
      'Count:2',
    );

    await wrapper.get('[data-testid="vue-attach-btn"]').trigger('click');
    await nextTick();
    expect(document.querySelector('[data-testid="vue-attach"]')?.textContent).toBe(
      'Anchored',
    );

    await SmartDialog.dismiss();
    await nextTick();
    (document.querySelector('[data-testid="vue-close"]') as HTMLButtonElement).click();
    await nextTick();

    expect(SmartDialog.checkExist()).toBe(false);
    wrapper.unmount();
  });

  it('works standalone with render() fallback when SmartDialogProvider is not mounted', async () => {
    const resultPromise = SmartDialog.show<string>({
      useAnimation: false,
      builder: ({ dismiss }) =>
        h(
          'button',
          {
            'data-testid': 'vue-standalone-btn',
            onClick: () => void dismiss('standalone-vue'),
          },
          'Vue Standalone',
        ),
    });

    const btn = document.querySelector(
      '[data-testid="vue-standalone-btn"]',
    ) as HTMLButtonElement;
    expect(btn).not.toBeNull();
    expect(btn.textContent).toBe('Vue Standalone');

    btn.click();
    expect(await resultPromise).toBe('standalone-vue');
    expect(SmartDialog.checkExist()).toBe(false);
  });
});
