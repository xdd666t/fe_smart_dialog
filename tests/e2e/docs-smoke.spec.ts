import { execSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { extname, join, normalize, resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const ROOT_DIR = resolve(process.cwd());
const SITE_DIST_DIR = resolve(ROOT_DIR, 'site-dist');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

function detectSiteBase(distDir: string): string {
  const playgroundHtmlPath = join(distDir, 'playground', 'index.html');
  if (existsSync(playgroundHtmlPath)) {
    const html = readFileSync(playgroundHtmlPath, 'utf8');
    const match = html.match(/(?:src|href)="(\/[^"]*?)playground\/assets\//);
    if (match?.[1]) {
      return match[1].endsWith('/') ? match[1] : `${match[1]}/`;
    }
  }
  return '/';
}

function resolveStaticFile(distDir: string, relPath: string): string | null {
  const cleanRel = relPath.replace(/^\/+/, '');
  const safePath = normalize(cleanRel).replace(/^(\.\.(\/|\\|$))+/, '');
  const fullPath = resolve(distDir, safePath);
  if (!fullPath.startsWith(distDir)) {
    return null;
  }

  const candidates = cleanRel
    ? [fullPath, join(fullPath, 'index.html'), `${fullPath}.html`]
    : [join(distDir, 'index.html')];

  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

function startStaticSiteServer(
  distDir: string,
  siteBase: string,
): Promise<{ server: Server; baseUrl: string }> {
  return new Promise((resolvePromise, rejectPromise) => {
    const server = createServer((req, res) => {
      const reqUrl = new URL(req.url ?? '/', 'http://127.0.0.1');
      let pathname = decodeURIComponent(reqUrl.pathname);

      if (siteBase !== '/' && pathname.startsWith(siteBase)) {
        pathname = `/${pathname.slice(siteBase.length)}`;
      } else if (
        siteBase !== '/' &&
        pathname === siteBase.slice(0, -1)
      ) {
        pathname = '/';
      }

      const filePath = resolveStaticFile(distDir, pathname);
      if (!filePath) {
        const notFoundPage = join(distDir, '404.html');
        res.statusCode = 404;
        if (existsSync(notFoundPage)) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(readFileSync(notFoundPage));
        } else {
          res.end('Not Found');
        }
        return;
      }

      const ext = extname(filePath).toLowerCase();
      res.statusCode = 200;
      res.setHeader('Content-Type', MIME_TYPES[ext] ?? 'application/octet-stream');
      res.end(readFileSync(filePath));
    });

    server.on('error', rejectPromise);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address() as AddressInfo;
      resolvePromise({
        server,
        baseUrl: `http://127.0.0.1:${address.port}${siteBase}`,
      });
    });
  });
}

test.describe('Workbench Usage Guides, Framework Snippets & Docs Links', () => {
  test('renders collapsible guide panel, framework TS/React/Vue tabs & valid docs navigation links', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');

    // Topbar & Hero docs links exist with expected href targets
    await expect(page.getByTestId('topbar-docs-link')).toBeVisible();
    await expect(page.getByTestId('hero-docs-link')).toHaveAttribute(
      'href',
      /guide\/getting-started/,
    );
    await expect(page.getByTestId('demo-docs-link')).toHaveAttribute(
      'href',
      /features\/custom-dialog/,
    );

    // Collapsible Usage Guide & Key Options panel
    const guidePanel = page.getByTestId('demo-guide-panel');
    await expect(guidePanel).toBeVisible();
    await expect(guidePanel).toContainText('clickMaskDismiss');

    // Toggle collapse and re-expand
    await page.getByTestId('demo-guide-toggle').click();
    await expect(guidePanel).not.toContainText('clickMaskDismiss');
    await page.getByTestId('demo-guide-toggle').click();
    await expect(guidePanel).toContainText('clickMaskDismiss');

    // Multi-framework snippet tabs on regular demos (CustomDialogEasy)
    await expect(page.getByTestId('code-preview')).toContainText('SmartDialog.show');
    await page.getByRole('tab', { name: 'React' }).click();
    await expect(page.getByTestId('code-filename')).toHaveText('CustomDialogEasy.tsx');
    await expect(page.getByTestId('code-preview')).toContainText('useSmartDialog');

    await page.getByRole('tab', { name: 'Vue' }).click();
    await expect(page.getByTestId('code-filename')).toHaveText('CustomDialogEasy.vue.ts');
    await expect(page.getByTestId('code-preview')).toContainText('useSmartDialog');

    await page.getByRole('tab', { name: 'TS' }).click();
    await expect(page.getByTestId('code-filename')).toHaveText('CustomDialogEasy.ts');

    expect(errors).toEqual([]);
  });
});

test.describe('Combined Docs Site, Live Demos, TypeDoc API & Cross-Navigation', () => {
  let staticServer: Server | null = null;
  let siteUrl = '';

  test.beforeAll(async () => {
    test.setTimeout(120_000);
    if (
      !existsSync(join(SITE_DIST_DIR, 'index.html')) ||
      !existsSync(join(SITE_DIST_DIR, 'playground', 'index.html'))
    ) {
      execSync('npm run build:site', { cwd: ROOT_DIR, stdio: 'inherit' });
    }
    const detectedBase = detectSiteBase(SITE_DIST_DIR);
    const started = await startStaticSiteServer(SITE_DIST_DIR, detectedBase);
    staticServer = started.server;
    siteUrl = started.baseUrl;
  });

  test.afterAll(async () => {
    await new Promise<void>((resolveClose) => {
      if (!staticServer) {
        resolveClose();
        return;
      }
      staticServer.close(() => resolveClose());
    });
  });

  test('verifies Docs home live deck, interactive feature playgrounds, TypeDoc API, EN locale & Docs<->Workbench round-trip', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // 1. Docs Home & Live 5-Layer Deck
    await page.goto(siteUrl);
    await expect(page.getByTestId('home-live-deck')).toBeVisible();
    await page.getByTestId('home-deck-custom').click();
    const homeModal = page.getByRole('dialog').last();
    await expect(homeModal).toBeVisible();
    await homeModal.locator('[data-action="ok"]').click();
    await expect(page.getByTestId('home-live-deck')).toContainText('Custom resolved: confirmed');

    // 2. Feature Page: Custom Dialog Interactive Playground with parameter knobs
    await page.goto(`${siteUrl}features/custom-dialog`);
    const customCard = page.getByTestId('docs-demo-custom-dialog');
    await expect(customCard).toBeVisible();
    await customCard.locator('select').first().selectOption('topRight');
    await expect(customCard).toContainText('Alignment.topRight');
    await page.getByTestId('demo-action-custom-dialog-launch').click();
    const customModal = page.getByRole('dialog').last();
    await expect(customModal).toBeVisible();
    await customModal.locator('[data-close]').click();
    await expect(customCard).toContainText('Resolved result: done');

    // 3. Frameworks Guide: React Provider & JSX modal live trigger + Vue 3 VNode trigger
    await page.goto(`${siteUrl}guide/frameworks`);
    const fwCard = page.getByTestId('docs-demo-framework-bridge');
    await expect(fwCard).toBeVisible();
    await page.getByTestId('demo-action-framework-bridge-open-react').click();
    const reactModal = page.getByRole('dialog').last();
    await expect(reactModal).toContainText('React Portal Dialog');
    await reactModal.getByRole('button', { name: /关闭 React 弹窗|Close React Dialog/ }).click();
    await expect(reactModal).toHaveCount(0);

    await page.getByTestId('demo-action-framework-bridge-open-vue').click();
    const vueModal = page.getByRole('dialog').last();
    await expect(vueModal).toContainText('Vue 3 Teleport Modal');
    await vueModal.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(vueModal).toHaveCount(0);

    // 4. English locale + Attach interactive card
    await page.goto(`${siteUrl}en/features/attach-spotlight`);
    const attachCard = page.getByTestId('docs-demo-attach-popover');
    await expect(attachCard).toBeVisible();
    await page.getByTestId('demo-action-attach-popover-open-attach').click();
    const attachModal = page.getByRole('dialog').last();
    await expect(attachModal).toContainText('Attach (bottomCenter)');
    await attachModal.locator('[data-close]').click();

    // 5. TypeDoc Generated API Reference
    await page.goto(`${siteUrl}api/classes/index.SmartDialog`);
    await expect(page.locator('main')).toContainText('showAttach');
    await expect(page.locator('main')).toContainText('showToast');

    // 6. Full Combined Navigation: Docs Nav -> Workbench -> Back to Docs feature page
    await page.goto(siteUrl);
    await page.getByTestId('docs-nav-workbench').click();
    await expect(page).toHaveURL(/\/playground\//);
    await expect(page.getByTestId('demo-title')).toHaveText('CustomDialogEasy');

    await page.getByTestId('demo-docs-link').click();
    await expect(page).toHaveURL(/features\/custom-dialog/);
    await expect(page.getByTestId('docs-demo-custom-dialog')).toBeVisible();

    expect(errors).toEqual([]);
  });
});
