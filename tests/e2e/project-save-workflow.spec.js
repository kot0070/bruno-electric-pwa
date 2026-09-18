const { test, expect } = require('@playwright/test');

const projectName = 'Phone Save Test';

test('project calculator saves, lists, and reloads projects', async ({ page }) => {
  await page.goto('/electrical-tools.html');

  await expect(page.locator('#pc-save')).toBeVisible();
  await expect(page.locator('#pc-view-projects')).toBeVisible();

  await page.fill('#pc-name', projectName);
  await page.fill('#pc-sqft', '2100');
  await page.click('#pc-save');
  await expect(page.locator('#pc-saved-hint')).toContainText('Saved');

  await page.click('#pc-view-projects');
  await expect(page.locator('#tool-projects')).toHaveClass(/active/);
  await expect(page.locator('#pc-project-list')).toContainText(projectName);
  await expect(page.locator('#pc-project-count')).toContainText('1 saved project');

  await page.reload();
  await page.click('#tool-nav [data-tool="projects"]');
  await expect(page.locator('#pc-project-list')).toContainText(projectName);

  await page.locator('#pc-project-list [data-act="open"]').first().click();
  await expect(page.locator('#pc-name')).toHaveValue(projectName);
  await expect(page.locator('#pc-sqft')).toHaveValue('2100');
});
