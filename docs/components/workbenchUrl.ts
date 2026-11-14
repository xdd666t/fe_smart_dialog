import { withBase } from '@rspress/core/runtime';

const DEFAULT_WORKBENCH_URL =
  typeof process !== 'undefined' ? undefined : undefined;

/**
 * Resolves a navigation href pointing from the Rspress docs site to the
 * interactive Workbench (`/playground/`). Always use a native `<a>` element
 * with this href so Rspress's SPA router performs a full page navigation.
 */
export function getWorkbenchHref(dialogType?: string): string {
  const configured =
    typeof import.meta !== 'undefined' &&
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env
      ?.PUBLIC_WORKBENCH_URL;

  const basePath = configured ? configured.replace(/\/+$/, '') + '/' : withBase('/playground/');

  if (!dialogType) {
    return basePath;
  }

  const separator = basePath.includes('?') ? '&' : '?';
  return `${basePath}${separator}dialogType=${encodeURIComponent(dialogType)}`;
}

void DEFAULT_WORKBENCH_URL;
