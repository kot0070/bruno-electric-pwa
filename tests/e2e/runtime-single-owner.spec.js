const { test, expect } = require('@playwright/test');

test('RUNTIME-SINGLE-OWNER-01 no legacy invoice or metrics patch is loaded', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'load' });
  await expect(page.locator('html')).toHaveAttribute('data-be-bootstrap', 'single-runtime-v2');
  await expect(page.locator('html')).toHaveAttribute('data-be-runtime-authority', /v1/);

  const scripts = await page.locator('script[src]').evaluateAll(nodes => nodes.map(n => n.getAttribute('src') || ''));
  expect(scripts.some(src => src.includes('electric-customer-invoice-patch.js'))).toBe(false);
  expect(scripts.some(src => src.includes('electric-journal-customer-metrics.js'))).toBe(false);
  expect(scripts.filter(src => src.includes('electric-customer-documents.js')).length).toBeLessThanOrEqual(1);
  expect(scripts.filter(src => src.includes('electric-runtime-authority-v1.js')).length).toBeLessThanOrEqual(1);
});

test('RUNTIME-SINGLE-OWNER-02 settings survive reload without shell cache rollback', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'load' });
  await expect(page.locator('#djs-commercial-tax')).toBeAttached();
  await expect(page.locator('#djs-business-reserve')).toBeAttached();
  await page.locator('#djs-commercial-tax').fill('10');
  await page.locator('#djs-business-reserve').fill('17');
  await page.locator('#djs-address').fill('Runtime Test Address');
  await page.locator('#djs-phone').fill('512-555-0100');
  page.once('dialog', d => d.accept());
  await page.locator('#djs-customer-save').click();

  await expect.poll(() => page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('bruno-electric-dispatch-settings-v2') || '{}');
    return [s.commercialTaxPct, s.businessReservePct, s.invoiceAddress, s.invoicePhone];
  })).toEqual([10, 17, 'Runtime Test Address', '512-555-0100']);

  await page.reload({ waitUntil: 'load' });
  await expect(page.locator('#djs-commercial-tax')).toHaveValue('10');
  await expect(page.locator('#djs-business-reserve')).toHaveValue('17');
});
