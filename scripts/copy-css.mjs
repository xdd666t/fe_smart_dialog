import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const srcCss = resolve(rootDir, 'src/styles/smart-dialog.css');
const destCss = resolve(rootDir, 'dist/style.css');

mkdirSync(dirname(destCss), { recursive: true });
copyFileSync(srcCss, destCss);
console.log(`Copied ${srcCss} -> ${destCss}`);
