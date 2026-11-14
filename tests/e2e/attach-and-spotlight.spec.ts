import { expect, test } from '@playwright/test';

test.describe('Attach Positioning, Scroll Tracking, Imitate & SVG Spotlight Tour', () => {
  test('positions attach popover accurately below and above target and tracks scroll', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByTestId('nav-group-attach').click();
    await page.getByTestId('nav-item-attach-location').click();

    const anchor = page.getByTestId('attach-anchor-btn');
    const anchorBox = (await anchor.boundingBox())!;

    // bottomCenter
    await page.getByTestId('attach-alignment-select').selectOption('bottomCenter');
    await page.getByTestId('attach-anchor-btn').click();
    const pop = page.getByTestId('attach-popover');
    await expect(pop).toBeVisible();
    await page.waitForTimeout(240);
    const bottomBox = (await pop.boundingBox())!;
    expect(bottomBox.y).toBeGreaterThanOrEqual(anchorBox.y + anchorBox.height - 2);

    await page.mouse.click(10, 10);
    await expect(pop).toBeHidden();

    // topLeft outside mode
    await page.getByTestId('attach-alignment-select').selectOption('topLeft');
    await page.getByTestId('attach-mode-select').selectOption('outside');
    await page.getByTestId('attach-anchor-btn').click();
    await expect(pop).toBeVisible();
    await page.waitForTimeout(240);
    const topLeftOutsideBox = (await pop.boundingBox())!;
    expect(topLeftOutsideBox.y + topLeftOutsideBox.height).toBeLessThanOrEqual(
      anchorBox.y + 2,
    );
    expect(topLeftOutsideBox.x + topLeftOutsideBox.width).toBeLessThanOrEqual(
      anchorBox.x + 2,
    );
    await page.waitForTimeout(550);
    await page.mouse.click(10, 10);
    await expect(pop).toBeHidden();

    // Scroll tracking inside scrollable container
    const scrollBox = page.getByTestId('attach-scroll-box');
    const scrollAnchor = page.getByTestId('scroll-attach-anchor');
    await scrollAnchor.scrollIntoViewIfNeeded();
    await scrollAnchor.click();

    const scrollPop = page.getByTestId('scroll-attach-popover');
    await expect(scrollPop).toBeVisible();
    const yBefore = (await scrollPop.boundingBox())!.y;

    await scrollBox.evaluate((el) => {
      el.scrollTop += 60;
    });
    await page.waitForTimeout(80);
    const yAfter = (await scrollPop.boundingBox())!.y;
    expect(yAfter).toBeLessThan(yBefore - 20);
    await page.getByTestId('global-force-clear').click();
    await expect(scrollPop).toBeHidden();
  });

  test('renders SVG evenodd spotlight cutout, advances keepSingle tour smoothly, and supports imitate dropdown', async ({
    page,
  }) => {
    await page.goto('/?dialogType=AttachDialogGuide');

    await page.getByTestId('btn-start-tour').click();
    await expect(page.getByTestId('tour-card-1')).toBeVisible();

    const svgPath = page.locator('.fsd-mask svg path');
    await expect(svgPath).toHaveAttribute('fill-rule', 'evenodd');

    await page.getByTestId('btn-tour-next').click();
    await expect(page.getByTestId('tour-card-1')).toHaveCount(0);
    await expect(page.getByTestId('tour-card-2')).toBeVisible();

    await page.getByTestId('btn-tour-next').click();
    await expect(page.getByTestId('tour-card-2')).toHaveCount(0);
    await expect(page.getByTestId('st-attach')).toHaveText('false');

    // Imitate Dropdown attach menu
    await page.getByTestId('nav-item-attach-imitate').click();
    await page.getByTestId('btn-imitate-dropdown').click();
    await page.getByRole('button', { name: '小猪猪', exact: true }).click();
    await expect(page.getByTestId('imitate-val')).toHaveText('小猪猪');
  });
});
