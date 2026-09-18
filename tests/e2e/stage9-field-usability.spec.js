const { test, expect } = require('@playwright/test');

test('STAGE9-FIELD-01 motor HP/W helper, voltage-drop verdict, and verified conduit ranges work as a field user', async ({page}) => {
  await page.goto('/electrical-tools.html', {waitUntil:'load'});

  await page.locator('[data-tool="mo3"]').click();
  await expect(page.locator('#mo-punit')).toBeVisible();
  await page.locator('#mo-punit').selectOption('hp');
  await page.locator('#mo-power').fill('5');
  await page.locator('#mo-v').fill('240');
  await page.locator('#mo-ph').selectOption('1');
  await page.locator('#mo-pf').fill('0.90');
  await page.locator('#mo-eff').fill('0.90');
  await page.locator('#mo-flc').fill('14');
  await page.locator('#mo-estimate').click();
  await expect(page.locator('#mo-est-note')).toContainText('estimated');
  await expect(page.locator('#mo-est-note')).toContainText('Article 430 table FLC');
  await expect(page.locator('#mo-flc')).toHaveValue('14');
  expect(Number(await page.locator('#mo-np').inputValue())).toBeGreaterThan(0);

  await page.locator('[data-tool="vd"]').click();
  await page.locator('#v-v').fill('240');
  await page.locator('#v-i').fill('40');
  await page.locator('#v-d').fill('100');
  await page.locator('#v-t').fill('3');
  await page.locator('#run-vd').click();
  await expect(page.locator('#out-vd')).toContainText(/PASS|REVIEW/);
  await expect(page.locator('#out-vd')).toContainText('% target');
  await expect(page.locator('#out-vd')).toContainText('V at load');

  await page.locator('[data-tool="cf"]').click();
  await expect(page.locator('#c-r')).toHaveValue('EMT');
  await expect(page.locator('#c-ts option')).toHaveCount(10);
  await expect(page.locator('.c-size').first().locator('option')).toHaveCount(24);
  await page.locator('#c-r').selectOption('PVC40');
  await expect(page.locator('#c-ts option')).toHaveCount(12);
  await page.locator('#c-ts').selectOption('6');
  await page.locator('#run-cf').click();
  await expect(page.locator('#out-cf')).toContainText(/PASS|FAIL/);
});
