import { expect, test } from '@playwright/test';

test.describe('Feedback (Toast/Loading/Notify), Lifecycle & React/Vue Sandboxes', () => {
  test('filters via sidebar search and verifies Toast modes, Loading leastLoadingTime + block, and Notify types', async ({
    page,
  }) => {
    await page.goto('/');

    // Search filter finds ToastType directly
    const search = page.getByTestId('sidebar-search');
    await search.fill('ToastType');
    await page.getByTestId('nav-item-toast-type').click();
    await search.fill('');

    // Toast last mode replaces active serial toast
    await page.getByTestId('btn-toast-last').click();
    await expect(page.locator('.fsd-toast')).toHaveCount(1);
    await expect(page.locator('.fsd-toast')).toHaveText('Last New');

    // Toast onlyRefresh updates text in place
    await page.getByTestId('btn-toast-refresh').click();
    await expect(page.locator('.fsd-toast')).toHaveCount(1);
    await expect(page.locator('.fsd-toast')).toHaveText('Progress 50%');
    await page.getByTestId('btn-toast-clear').click();

    // Loading leastLoadingTime & Esc block
    await page.getByTestId('nav-group-loading').click();
    await page.getByTestId('nav-item-loading-least-time').click();
    await page.getByTestId('btn-loading-min').click();
    await expect(page.locator('.fsd-loading')).toBeVisible();
    await page.waitForTimeout(150);
    await expect(page.locator('.fsd-loading')).toBeVisible();
    await expect(page.locator('.fsd-loading')).toHaveCount(0, { timeout: 2000 });

    await page.getByTestId('btn-loading-block').click();
    await expect(page.locator('.fsd-loading')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.fsd-loading')).toBeVisible();
    await page.getByTestId('btn-loading-dismiss').click();
    await expect(page.locator('.fsd-loading')).toHaveCount(0);

    // Notify success + warning
    await page.getByTestId('nav-group-notify').click();
    await page.getByTestId('nav-item-notify-success').click();
    await page.getByTestId('btn-notify-success').click();
    await expect(
      page.locator('[data-fsd-notify-type="success"]'),
    ).toBeVisible();
    await page.getByTestId('btn-notify-warning').click();
    await expect(
      page.locator('[data-fsd-notify-type="warning"]'),
    ).toBeVisible();
    await page.getByTestId('global-force-clear').click();
  });

  test('tracks SPA pushState/popstate bindPage visibility, bindWidget tab-switch/removal, and onBack', async ({
    page,
  }) => {
    await page.goto('/?dialogType=CustomDialogBindPage');

    // bindPage hide on forward pushState & reappear on back
    await page.getByTestId('btn-bindpage-dialog').click();
    const bpCard = page.getByTestId('bindpage-dialog-card');
    await expect(bpCard).toBeVisible();

    await page.getByTestId('btn-push-route').click();
    await expect(page.getByTestId('cur-route')).toHaveText('/sub-page');
    await expect(bpCard).toBeHidden();

    await page.getByTestId('btn-back-route').click();
    await expect(page.getByTestId('cur-route')).toHaveText('/');
    await expect(bpCard).toBeVisible();

    // bindWidget tab hide/reappear + DOM removal auto-dismiss
    await page.getByTestId('nav-item-dialog-bindwidget').click();
    await page.getByTestId('btn-bindwidget-open').click();
    const bwCard = page.getByTestId('bindwidget-dialog-card');
    await expect(bwCard).toBeVisible();

    await page.getByTestId('bw-tab-1').click();
    await expect(bwCard).toBeHidden();
    await page.getByTestId('bw-tab-0').click();
    await expect(bwCard).toBeVisible();

    await page.getByTestId('btn-bindwidget-remove').click();
    await expect(bwCard).toHaveCount(0);

    // onBack guard blocks first Esc, dismisses on second Esc
    await page.getByTestId('nav-item-dialog-hardclose').click();
    await page.getByTestId('btn-onback-guard').click();
    const onBackCard = page.getByTestId('onback-dialog-card');
    await expect(onBackCard).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(onBackCard).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(onBackCard).toHaveCount(0);
  });

  test('renders React 19 and Vue 3 Sandboxes with Context/Provide inheritance and showAttach', async ({
    page,
  }) => {
    await page.goto('/?dialogType=ReactSandbox');

    // React 19 Sandbox
    await page.getByTestId('btn-react-open').click();
    await expect(page.getByTestId('react-pg-modal')).toBeVisible();
    await expect(page.getByTestId('react-pg-theme')).toHaveText('react-ocean');
    await expect(page.getByTestId('react-pg-label')).toHaveText('Step-1');

    await page.getByTestId('react-pg-state-btn').click();
    await expect(page.getByTestId('react-pg-state-btn')).toContainText('1');

    await page.getByTestId('react-pg-modal-refresh').click();
    await expect(page.getByTestId('react-pg-label')).toHaveText('Step-2');

    await page.getByTestId('react-pg-close').click();
    await expect(page.getByTestId('react-pg-result')).toHaveText(
      'Result: react-done',
    );

    await page.getByTestId('btn-react-attach').click();
    await expect(page.getByTestId('react-pg-popover')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('react-pg-popover')).toHaveCount(0);

    // Vue 3 Sandbox
    await page.getByTestId('nav-item-framework-vue').click();
    await page.getByTestId('btn-vue-open').click();
    await expect(page.getByTestId('vue-pg-modal')).toBeVisible();
    await expect(page.getByTestId('vue-pg-theme')).toHaveText('vue-emerald');
    await expect(page.getByTestId('vue-pg-label')).toHaveText('Version-1');

    await page.getByTestId('vue-pg-state-btn').click();
    await expect(page.getByTestId('vue-pg-state-btn')).toContainText('1');

    await page.getByTestId('vue-pg-modal-refresh').click();
    await expect(page.getByTestId('vue-pg-label')).toHaveText('Version-2');

    await page.getByTestId('vue-pg-close').click();
    await expect(page.getByTestId('vue-pg-result')).toHaveText(
      'Result: vue-done',
    );

    await page.getByTestId('btn-vue-attach').click();
    await expect(page.getByTestId('vue-pg-popover')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('vue-pg-popover')).toHaveCount(0);
  });
});
