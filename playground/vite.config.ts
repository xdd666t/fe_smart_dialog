import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

const ROOT_DIR = resolve(__dirname, '..');
const VIRTUAL_CSS_ID = '\0fsd-raw-style-css';
const CSS_FILE_PATH = resolve(ROOT_DIR, 'src/styles/smart-dialog.css');

const rawSmartDialogCssPlugin = {
  name: 'raw-smart-dialog-css',
  enforce: 'pre' as const,
  resolveId(source: string, importer?: string) {
    if (
      source === './smart-dialog.css' ||
      source.endsWith('/smart-dialog.css') ||
      source.endsWith('\\smart-dialog.css')
    ) {
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
  root: __dirname,
  plugins: [rawSmartDialogCssPlugin, react(), vue()],
  resolve: {
    alias: {
      'fe-smart-dialog/react': resolve(ROOT_DIR, 'src/react/index.ts'),
      'fe-smart-dialog/vue': resolve(ROOT_DIR, 'src/vue/index.ts'),
      'fe-smart-dialog/style.css': CSS_FILE_PATH,
      'fe-smart-dialog': resolve(ROOT_DIR, 'src/index.ts'),
    },
  },
  server: {
    port: 4173,
    host: '127.0.0.1',
  },
});
