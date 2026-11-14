function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const TOKEN_RE =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|`(?:\\.|[^`\\])*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|\b(?:import|from|export|const|let|var|function|async|await|return|if|else|for|of|new|void|true|false|null|undefined|type|interface)\b|\b(?:SmartDialog|SmartStatus|SmartToastType|SmartAnimationType|SmartAttachAlignmentType|SmartNonAnimationType|SmartMaskTriggerType|SmartBackType|SmartConfigAttach|SmartConfigLoading|SmartConfigToast|SmartDialogController|SmartDialogProvider|SmartDialogPlugin|Alignment|Duration|Offset|AttachAdjustParam|NotifyType|html|useSmartDialog|useSmartDialogController|useBindWidget)\b|\b\d+(?:\.\d+)?\b)/g;

function highlightSegment(line: string): string {
  let out = '';
  let lastIdx = 0;

  for (const match of line.matchAll(TOKEN_RE)) {
    const idx = match.index ?? 0;
    if (idx > lastIdx) {
      out += escapeHtml(line.slice(lastIdx, idx));
    }

    const token = match[0]!;
    const escaped = escapeHtml(token);

    if (token.startsWith('//') || token.startsWith('/*')) {
      out += `<span class="tok-cmt">${escaped}</span>`;
    } else if (
      token.startsWith("'") ||
      token.startsWith('"') ||
      token.startsWith('`')
    ) {
      out += `<span class="tok-str">${escaped}</span>`;
    } else if (/^\d/.test(token)) {
      out += `<span class="tok-num">${escaped}</span>`;
    } else if (
      /^(?:import|from|export|const|let|var|function|async|await|return|if|else|for|of|new|void|true|false|null|undefined|type|interface)$/.test(
        token,
      )
    ) {
      out += `<span class="tok-kw">${escaped}</span>`;
    } else {
      out += `<span class="tok-type">${escaped}</span>`;
    }

    lastIdx = idx + token.length;
  }

  if (lastIdx < line.length) {
    out += escapeHtml(line.slice(lastIdx));
  }

  return out;
}

export function renderHighlightedCode(code: string): string {
  const lines = code.trimEnd().split('\n');
  return lines
    .map(
      (line, index) =>
        `<div class="pg-code-line"><span class="pg-code-ln">${index + 1}</span><span>${highlightSegment(line) || '&nbsp;'}</span></div>`,
    )
    .join('');
}
