function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Builds a DOM `DocumentFragment` from an HTML string or tagged template literal.
 * Interpolated values in tagged template literals (`html\`...\${val}...\``) are HTML-escaped
 * to prevent XSS injection.
 */
export function html(
  markupOrStrings: string | TemplateStringsArray,
  ...values: unknown[]
): DocumentFragment {
  if (typeof document === 'undefined') {
    throw new Error('SmartDialog.html requires a DOM environment.');
  }

  let raw: string;
  if (typeof markupOrStrings === 'string') {
    raw = markupOrStrings;
  } else {
    raw = markupOrStrings.reduce((acc, part, idx) => {
      const val =
        idx < values.length ? escapeHtml(String(values[idx] ?? '')) : '';
      return acc + part + val;
    }, '');
  }

  const template = document.createElement('template');
  template.innerHTML = raw.trim();
  return template.content;
}
