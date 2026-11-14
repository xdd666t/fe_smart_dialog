import {
  Fragment,
  Teleport,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  type PropType,
  type VNodeChild,
} from 'vue';
import { SmartDialog as CoreSmartDialog } from '../smart-dialog';
import {
  SmartNotifyStyle,
  type SmartInitOptions,
  type SmartMessageBuilder,
} from '../types/params';
import {
  ensureVueAdapterRegistered,
  normalizeToVNode,
  vuePortalRegistry,
  wrapVueContent,
  type VuePortalSlot,
} from './vue-adapter';

export function normalizeVueInitOptions(
  options: SmartInitOptions<VNodeChild>,
): SmartInitOptions {
  const wrapMsgBuilder = (
    fn?: SmartMessageBuilder<VNodeChild>,
  ): SmartMessageBuilder | undefined => {
    if (!fn) return undefined;
    return (msg: string) => wrapVueContent(fn(msg));
  };

  const notifyStyle = options.notifyStyle
    ? new SmartNotifyStyle({
        successBuilder: wrapMsgBuilder(options.notifyStyle.successBuilder),
        failureBuilder: wrapMsgBuilder(options.notifyStyle.failureBuilder),
        warningBuilder: wrapMsgBuilder(options.notifyStyle.warningBuilder),
        alertBuilder: wrapMsgBuilder(options.notifyStyle.alertBuilder),
        errorBuilder: wrapMsgBuilder(options.notifyStyle.errorBuilder),
      })
    : undefined;

  return {
    ...options,
    toastBuilder: wrapMsgBuilder(options.toastBuilder),
    loadingBuilder: wrapMsgBuilder(options.loadingBuilder),
    notifyStyle,
    styleBuilder: options.styleBuilder
      ? (child) => {
          const res = options.styleBuilder!(child);
          return res === undefined ? undefined : wrapVueContent(res);
        }
      : undefined,
  };
}

/**
 * Mounts SmartDialog Teleport bridge inside the Vue component tree so all dialogs
 * inherit local `provide`/`inject` as well as global app plugins.
 */
export const SmartDialogProvider = defineComponent({
  name: 'SmartDialogProvider',
  props: {
    initOptions: {
      type: Object as PropType<SmartInitOptions<VNodeChild>>,
      required: false,
      default: undefined,
    },
  },
  setup(props, { slots: componentSlots }) {
    ensureVueAdapterRegistered();
    const portalSlots = shallowRef<VuePortalSlot[]>([]);
    let unsubscribe: (() => void) | null = null;

    if (typeof document !== 'undefined') {
      unsubscribe = vuePortalRegistry.subscribe((next) => {
        portalSlots.value = next;
      });
    }

    onMounted(() => {
      if (!unsubscribe && typeof document !== 'undefined') {
        unsubscribe = vuePortalRegistry.subscribe((next) => {
          portalSlots.value = next;
        });
      }
      if (props.initOptions) {
        CoreSmartDialog.init(normalizeVueInitOptions(props.initOptions));
      }
    });

    onBeforeUnmount(() => {
      unsubscribe?.();
      unsubscribe = null;
    });

    return () => {
      const children = componentSlots.default ? componentSlots.default() : [];
      const portals = portalSlots.value.map((slot) =>
        h(
          Teleport,
          { to: slot.host, key: slot.id },
          { default: () => [normalizeToVNode(slot.node)] },
        ),
      );
      return h(Fragment, null, [...children, ...portals]);
    };
  },
});
