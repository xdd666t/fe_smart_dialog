import { expect, test } from '@playwright/test';

test.describe('Custom Dialogs, Showcase Code Preview, Native <dialog>, Penetrate & Permanent', () => {
  test('navigates Dialog tree items, verifies syntax code preview + copy, controller refresh, XSS, alignments & carryResult', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await expect(page.getByTestId('st-custom')).toHaveText('false');
    await expect(page.getByTestId('demo-title')).toHaveText('CustomDialogEasy');
    await expect(page.getByTestId('code-filename')).toHaveText('CustomDialogEasy.ts');
    await expect(page.getByTestId('code-preview')).toContainText('SmartDialog.show');

    // Copy button feedback
    await page.getByTestId('copy-code-btn').click();
    await expect(page.getByTestId('copy-btn-label')).toHaveText('Copied!');

    // Easy dialog
    await page.getByTestId('btn-demo-easy').click();
    await expect(page.getByTestId('easy-dialog-card')).toBeVisible();
    await page.mouse.click(10, 10);
    await expect(page.getByTestId('easy-dialog-card')).toHaveCount(0);

    // Controller refresh
    await page.getByTestId('btn-show-controller').click();
    await expect(page.getByTestId('controller-value')).toHaveText('Count: 1');
    await page.getByTestId('btn-ctrl-inc').click();
    await expect(page.getByTestId('controller-value')).toHaveText('Count: 2');
    await page.getByRole('button', { name: 'Dismiss', exact: true }).click();

    // XSS safety on html tagged template
    await page.getByTestId('btn-show-xss').click();
    await expect(page.getByTestId('xss-card')).toHaveText(
      '<img src=x onerror=alert(1)>',
    );
    await page.getByTestId('btn-close-xss').click();
    await expect(page.getByTestId('xss-card')).toHaveCount(0);

    // Switch to location demo & verify URL ?dialogType sync + alignment geometry
    await page.getByTestId('nav-item-dialog-location').click();
    await expect(page).toHaveURL(/dialogType=CustomDialogLocation/);

    await page.getByTestId('custom-alignment-select').selectOption('topLeft');
    await page.getByTestId('btn-show-custom').click();
    const card = page.getByTestId('custom-dialog-card');
    await expect(card).toBeVisible();
    const topLeftBox = await card.boundingBox();
    expect(topLeftBox).not.toBeNull();
    expect(topLeftBox!.x).toBeLessThan(20);
    expect(topLeftBox!.y).toBeLessThan(20);
    await expect(page.getByTestId('st-custom')).toHaveText('true');
    await page.getByTestId('btn-close-dialog').click();
    await expect(card).toBeHidden();

    await page.getByTestId('custom-alignment-select').selectOption('bottomRight');
    await page.getByTestId('btn-show-custom').click();
    await expect(card).toBeVisible();
    const viewport = page.viewportSize()!;
    const brBox = await card.boundingBox();
    expect(brBox!.x + brBox!.width).toBeGreaterThan(viewport.width - 20);
    expect(brBox!.y + brBox!.height).toBeGreaterThan(viewport.height - 20);
    await page.getByTestId('btn-close-dialog').click();
    await expect(card).toBeHidden();

    // carryResult demo roundtrip
    await page.getByTestId('nav-item-dialog-carry-result').click();
    await page.getByTestId('btn-demo-carry-result').click();
    await page.getByTestId('carry-result-input').fill('smart-return-ok');
    await page.getByTestId('btn-carry-confirm').click();
    await expect(page.getByTestId('carry-result-output')).toHaveText(
      'Last Result: smart-return-ok',
    );
    await expect(page.locator('.fsd-toast')).toContainText('smart-return-ok');

    expect(errors).toEqual([]);
  });

  test('supports deep link ?dialogType=CustomDialogSystem and native <dialog>.showModal() top layer', async ({
    page,
  }) => {
    await page.goto('/?dialogType=CustomDialogSystem');
    await expect(page.getByTestId('demo-title')).toHaveText('CustomDialogSystem');

    const triggerBtn = page.getByTestId('btn-show-system');
    await triggerBtn.focus();
    await triggerBtn.click();

    const nativeDialog = page.locator('dialog.fsd-native-dialog');
    await expect(nativeDialog).toBeVisible();
    await expect(nativeDialog).toHaveJSProperty('open', true);

    await page.getByTestId('system-input').fill('hello');
    await page.getByTestId('btn-system-confirm').click();
    await expect(nativeDialog).toHaveCount(0);
    await expect(page.getByTestId('system-result')).toHaveText(
      'Result: confirmed',
    );
    await expect(triggerBtn).toBeFocused();

    // Also close via Escape
    await triggerBtn.click();
    await expect(nativeDialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(nativeDialog).toHaveCount(0);
  });

  test('supports usePenetrate click-through, down/move/up mask triggers, and permanent force dismiss', async ({
    page,
  }) => {
    await page.goto('/?dialogType=CustomDialogPenetrate');

    // Penetrate allows real mouse click on button behind mask
    await page.getByTestId('btn-show-penetrate').click();
    await expect(page.getByTestId('penetrate-card')).toBeVisible();

    await page.getByTestId('btn-behind-target').click();
    await expect(page.getByTestId('behind-count')).toHaveText('1');
    await expect(page.getByTestId('penetrate-card')).toBeVisible();
    await page.getByTestId('btn-close-penetrate').click();

    // Mask trigger DOWN
    await page.getByTestId('btn-mask-down').click();
    await expect(page.getByTestId('mask-card-down')).toBeVisible();
    await page.mouse.move(10, 10);
    await page.mouse.down();
    await expect(page.getByTestId('mask-card-down')).toBeHidden();
    await page.mouse.up();

    await page.waitForTimeout(550);

    // Mask trigger MOVE
    await page.getByTestId('btn-mask-move').click();
    await expect(page.getByTestId('mask-card-move')).toBeVisible();
    await page.mouse.move(10, 10);
    await page.mouse.down();
    await expect(page.getByTestId('mask-card-move')).toBeVisible();
    await page.mouse.move(30, 30);
    await expect(page.getByTestId('mask-card-move')).toBeHidden();
    await page.mouse.up();

    await page.waitForTimeout(550);

    // Mask trigger UP
    await page.getByTestId('btn-mask-up').click();
    await expect(page.getByTestId('mask-card-up')).toBeVisible();
    await page.mouse.move(10, 10);
    await page.mouse.down();
    await page.mouse.move(25, 25);
    await expect(page.getByTestId('mask-card-up')).toBeVisible();
    await page.mouse.up();
    await expect(page.getByTestId('mask-card-up')).toBeHidden();

    await page.waitForTimeout(550);

    // Permanent resists mask click and normal dismiss until force dismiss
    await page.getByTestId('nav-item-dialog-permanent').click();
    await page.getByTestId('btn-show-permanent').click();
    await expect(page.getByTestId('permanent-card')).toBeVisible();
    await page.mouse.click(10, 10);
    await expect(page.getByTestId('permanent-card')).toBeVisible();
    await page.getByTestId('btn-perm-normal-dismiss').click();
    await expect(page.getByTestId('permanent-card')).toBeVisible();
    await page.getByTestId('btn-perm-force-dismiss').click();
    await expect(page.getByTestId('permanent-card')).toBeHidden();
  });
});
