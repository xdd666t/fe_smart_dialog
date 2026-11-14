import { createHighlighterCoreSync, type ThemedToken } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import langBash from 'shiki/langs/bash.mjs';
import langTsx from 'shiki/langs/tsx.mjs';
import langTs from 'shiki/langs/typescript.mjs';
import themeDark from 'shiki/themes/github-dark.mjs';
import themeLight from 'shiki/themes/github-light.mjs';

export type CodeLanguage = 'typescript' | 'tsx' | 'bash';

const highlighter = createHighlighterCoreSync({
  themes: [themeLight, themeDark],
  langs: [langTs, langTsx, langBash],
  engine: createJavaScriptRegexEngine(),
});

/**
 * Tokenizes source code synchronously with Shiki's JS RegExp engine
 * so static GitHub Pages builds require zero external WASM fetches.
 */
export function tokenizeCode(
  code: string,
  lang: CodeLanguage,
  isDark: boolean,
): ThemedToken[][] {
  return highlighter.codeToTokensBase(code.trimEnd(), {
    lang,
    theme: isDark ? 'github-dark' : 'github-light',
  });
}
