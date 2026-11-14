import { SmartConfigAttach } from './smart-config-attach';
import { SmartConfigCustom } from './smart-config-custom';
import { SmartConfigLoading } from './smart-config-loading';
import { SmartConfigNotify } from './smart-config-notify';
import { SmartConfigToast } from './smart-config-toast';

/**
 * Unified global configuration container (`SmartDialog.config`).
 */
export class SmartConfig {
  custom: SmartConfigCustom = new SmartConfigCustom();
  attach: SmartConfigAttach = new SmartConfigAttach();
  notify: SmartConfigNotify = new SmartConfigNotify();
  loading: SmartConfigLoading = new SmartConfigLoading();
  toast: SmartConfigToast = new SmartConfigToast();
}
