/**
 * Resolves links from the Playground Workbench (`/playground/`) back to the
 * paired Rspress documentation site (`/`).
 */
export function getDocsHref(subPath = ''): string {
  const cleanSubPath = subPath.replace(/^\/+/, '');
  const baseUrl = import.meta.env.BASE_URL ?? '/';

  if (baseUrl.endsWith('/playground/')) {
    const parentRoot = baseUrl.slice(0, -'playground/'.length);
    return `${parentRoot}${cleanSubPath}`;
  }

  const configured =
    import.meta.env.VITE_DOCS_URL ?? 'https://xdd666t.github.io/fe_smart_dialog/';
  const normalizedRoot = configured.endsWith('/') ? configured : `${configured}/`;
  return `${normalizedRoot}${cleanSubPath}`;
}
