import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const VIRTUAL_CSS_ID = '\0fsd-raw-style-css';
const CSS_FILE_PATH = resolve(__dirname, 'src/styles/smart-dialog.css');

const rawSmartDialogCssPlugin = {
  name: 'raw-smart-dialog-css',
  enforce: 'pre' as const,
  resolveId(source: string, importer?: string) {
    if (
      source === './smart-dialog.css' ||
      source.endsWith('/smart-dialog.css') ||
      source.endsWith('\\smart-dialog.css')
    ) {
      // Only intercept inject.ts CSS text import; keep other CSS imports intact
      if (!importer || importer.replace(/\\/g, '/').includes('styles/inject')) {
        return VIRTUAL_CSS_ID;
      }
    }
    return undefined;
  },
  load(id: string) {
    if (id === VIRTUAL_CSS_ID) {
      const content = readFileSync(CSS_FILE_PATH, 'utf8');
      return `export default ${JSON.stringify(content)};`;
    }
    return undefined;
  },
};

export default defineConfig({
  plugins: [rawSmartDialogCssPlugin],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/unit/setup.ts'],
  },
  resolve: {
    alias: {
      'fe-smart-dialog/react': resolve(__dirname, 'src/react/index.ts'),
      'fe-smart-dialog/vue': resolve(__dirname, 'src/vue/index.ts'),
      'fe-smart-dialog': resolve(__dirname, 'src/index.ts'),
    },
  },
});
