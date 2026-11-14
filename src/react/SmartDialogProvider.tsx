import {
  Fragment,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { SmartDialog as CoreSmartDialog } from '../smart-dialog';
import {
  SmartNotifyStyle,
  type SmartInitOptions,
  type SmartMessageBuilder,
} from '../types/params';
import {
  ensureReactAdapterRegistered,
  reactPortalRegistry,
  wrapReactContent,
  type ReactPortalSlot,
} from './react-adapter';

export interface SmartDialogProviderProps
  extends SmartInitOptions<ReactNode> {
  children?: ReactNode;
}

export function normalizeReactInitOptions(
  options: SmartInitOptions<ReactNode>,
): SmartInitOptions {
  const wrapMsgBuilder = (
    fn?: SmartMessageBuilder<ReactNode>,
  ): SmartMessageBuilder | undefined => {
    if (!fn) return undefined;
    return (msg: string) => wrapReactContent(fn(msg));
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
          return res === undefined ? undefined : wrapReactContent(res);
        }
      : undefined,
  };
}

/**
 * Mounts SmartDialog Portal bridge inside the React component tree so all dialogs
 * inherit React Context (Theme, Router, Redux/Zustand, i18n).
 */
export function SmartDialogProvider({
  children,
  ...initOptions
}: SmartDialogProviderProps) {
  ensureReactAdapterRegistered();
  const [slots, setSlots] = useState<ReactPortalSlot[]>([]);

  useLayoutEffect(() => {
    const unsubscribe = reactPortalRegistry.subscribe((nextSlots) => {
      setSlots(nextSlots);
    });
    if (Object.keys(initOptions).length > 0) {
      CoreSmartDialog.init(normalizeReactInitOptions(initOptions));
    }
    return unsubscribe;
  }, []);

  return (
    <Fragment>
      {children}
      {slots.map((slot) => createPortal(slot.node, slot.host, slot.id))}
    </Fragment>
  );
}
