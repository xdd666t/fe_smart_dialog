import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const docsOutDir = resolve(rootDir, 'docs/doc_build');
const playgroundOutDir = resolve(rootDir, 'playground/dist');
const siteDistDir = resolve(rootDir, 'site-dist');

function normalizeBase(raw) {
  let base = (raw || '/').trim();
  if (!base.startsWith('/')) {
    base = `/${base}`;
  }
  if (!base.endsWith('/')) {
    base = `${base}/`;
  }
  return base;
}

function runNpmScript(scriptName, extraEnv) {
  const result = spawnSync(`npm run ${scriptName}`, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      ...extraEnv,
    },
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const siteBase = normalizeBase(process.env.SITE_BASE);
const playgroundBase = `${siteBase}playground/`;

console.log(
  `[build:site] Building combined site (DOCS_BASE=${siteBase}, VITE_BASE=${playgroundBase})...`,
);

rmSync(siteDistDir, { recursive: true, force: true });

runNpmScript('build:docs', {
  DOCS_BASE: siteBase,
  RSPRESS_PERSISTENT_CACHE: 'false',
});
runNpmScript('build:playground', { VITE_BASE: playgroundBase });

if (!existsSync(docsOutDir)) {
  throw new Error(`Missing docs build output: ${docsOutDir}`);
}
if (!existsSync(playgroundOutDir)) {
  throw new Error(`Missing playground build output: ${playgroundOutDir}`);
}

mkdirSync(siteDistDir, { recursive: true });
cpSync(docsOutDir, siteDistDir, { recursive: true });

const sitePlaygroundDir = resolve(siteDistDir, 'playground');
mkdirSync(sitePlaygroundDir, { recursive: true });
cpSync(playgroundOutDir, sitePlaygroundDir, { recursive: true });

writeFileSync(resolve(siteDistDir, '.nojekyll'), '');

console.log(`[build:site] Combined output ready at ${siteDistDir}`);
