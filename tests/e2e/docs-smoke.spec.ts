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

    // Topbar & Demo docs links exist without an extra Hero Showcase banner above the workbench
    await expect(page.getByTestId('hero-showcase')).toHaveCount(0);
    await expect(page.getByTestId('topbar-docs-link')).toBeVisible();
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

    async function expectOverlayVisibleInViewport(locator: ReturnType<typeof page.locator>) {
      await expect(locator).toBeVisible();
      await expect(async () => {
        const metrics = await locator.evaluate((el) => {
          const styleEl = document.getElementById('fe-smart-dialog-styles');
          const rootEl = el.closest('.fsd-root');
          const rootPos = rootEl ? getComputedStyle(rootEl).position : null;
          const rect = el.getBoundingClientRect();
          return {
            hasCss: Boolean(styleEl && styleEl.textContent?.includes('.fsd-root')),
            rootPos,
            rect: {
              left: rect.left,
              top: rect.top,
              right: rect.right,
              bottom: rect.bottom,
              width: rect.width,
              height: rect.height,
            },
            vw: window.innerWidth,
            vh: window.innerHeight,
          };
        });
        expect(metrics.hasCss).toBe(true);
        expect(metrics.rootPos).toBe('fixed');
        expect(metrics.rect.width).toBeGreaterThan(20);
        expect(metrics.rect.height).toBeGreaterThan(20);
        expect(metrics.rect.left).toBeGreaterThanOrEqual(-1);
        expect(metrics.rect.top).toBeGreaterThanOrEqual(-1);
        expect(metrics.rect.right).toBeLessThanOrEqual(metrics.vw + 1);
        expect(metrics.rect.bottom).toBeLessThanOrEqual(metrics.vh + 1);
      }).toPass({ timeout: 3000 });
    }

    // 1. Docs Home & Live 5-Layer Deck
    await page.goto(siteUrl);
    await expect(page.getByTestId('home-live-deck')).toBeVisible();
    await page.getByTestId('home-deck-custom').click();
    const homeModal = page.getByRole('dialog').last();
    await expectOverlayVisibleInViewport(homeModal);
    await homeModal.locator('[data-action="ok"]').click();
    await expect(page.getByTestId('home-live-deck')).toContainText('Custom resolved: confirmed');

    // 2. Feature Page: Custom Dialog Interactive Playground with parameter knobs + useSystem
    await page.goto(`${siteUrl}features/custom-dialog`);
    const customCard = page.getByTestId('docs-demo-custom-dialog');
    await expect(customCard).toBeVisible();
    await customCard.locator('select').first().selectOption('topRight');
    await expect(customCard).toContainText('Alignment.topRight');
    await page.getByTestId('demo-action-custom-dialog-launch').click();
    const customModal = page.getByRole('dialog').last();
    await expectOverlayVisibleInViewport(customModal);
    await customModal.locator('[data-close]').click();
    await expect(customCard).toContainText('Resolved result: done');

    await customCard.locator('select').nth(2).selectOption('false');
    await customCard.locator('select').nth(4).selectOption('true');
    await expect(customCard).toContainText('clickMaskDismiss: false');
    await expect(customCard).toContainText('useSystem: true');
    await page.getByTestId('demo-action-custom-dialog-launch').click();
    const nativeDialog = page.locator('dialog.fsd-native-dialog[open]').last();
    await expectOverlayVisibleInViewport(nativeDialog);
    await page.mouse.click(10, 10);
    await expect(nativeDialog).toBeVisible();
    await nativeDialog.locator('[data-close]').click();
    await expect(nativeDialog).toHaveCount(0);
    await expect(customCard).toContainText('Resolved result: done');

    // 3. Frameworks Guide: React Provider & JSX modal live trigger + Vue 3 reactive VNode trigger
    await page.goto(`${siteUrl}guide/frameworks`);
    const fwCard = page.getByTestId('docs-demo-framework-bridge');
    await expect(fwCard).toBeVisible();
    await page.getByTestId('demo-action-framework-bridge-open-react').click();
    const reactModal = page.getByRole('dialog').last();
    await expectOverlayVisibleInViewport(reactModal);
    await expect(reactModal).toContainText('React Portal Dialog');
    await reactModal.getByRole('button', { name: /关闭 React 弹窗|Close React Dialog/ }).click();
    await expect(reactModal).toHaveCount(0);

    await page.getByTestId('demo-action-framework-bridge-open-vue').click();
    const vueModal = page.getByRole('dialog').last();
    await expectOverlayVisibleInViewport(vueModal);
    await expect(vueModal).toContainText('Vue 3 Teleport Modal');
    await vueModal.getByRole('button', { name: /\+1/ }).click();
    await expect(vueModal).toContainText('+1 (2)');
    await vueModal.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(vueModal).toHaveCount(0);

    // 4. English locale + Attach interactive card
    await page.goto(`${siteUrl}en/features/attach-spotlight`);
    const attachCard = page.getByTestId('docs-demo-attach-popover');
    await expect(attachCard).toBeVisible();
    await page.getByTestId('demo-action-attach-popover-open-attach').click();
    const attachModal = page.getByRole('dialog').last();
    await expectOverlayVisibleInViewport(attachModal);
    await expect(attachModal).toContainText('Attach (bottomCenter)');
    await attachModal.locator('[data-close]').click();

    // 4b. Theme tokens override (violet preset -> CSS variables on :root take effect on notify)
    await page.goto(`${siteUrl}guide/theming-styling`);
    const themeCard = page.locator('[data-testid^="docs-demo-"]').first();
    await expect(themeCard).toBeVisible();
    await themeCard.locator('select').first().selectOption('violet');
    await themeCard.locator('button.fsd-btn--primary').click();
    const themedNotify = page.locator('.fsd-notify').last();
    await expectOverlayVisibleInViewport(themedNotify);
    const notifyStyles = await themedNotify.evaluate((el) => {
      const style = getComputedStyle(el);
      return { bg: style.backgroundColor, radius: style.borderRadius };
    });
    expect(notifyStyles.bg).toBe('rgb(30, 27, 75)');
    expect(notifyStyles.radius).toBe('18px');

    // 4c. Lifecycle bindWidget visible in viewport then auto-dismisses when host unmounts
    await page.goto(`${siteUrl}guide/lifecycle-routing`);
    const lifecycleCard = page.getByTestId('docs-demo-lifecycle-bind');
    await expect(lifecycleCard).toBeVisible();
    await page.getByTestId('demo-action-lifecycle-bind-bind-widget-test').click();
    const bindModal = page.getByRole('dialog').last();
    await expectOverlayVisibleInViewport(bindModal);
    await expect(bindModal).toHaveCount(0, { timeout: 5000 });

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
