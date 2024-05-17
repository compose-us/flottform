import { expect, test } from '@playwright/test';

test('There is a test page /tests/file route', async ({ page }) => {
	await page.goto('/tests/file');
	await expect(page.getByRole('heading', { name: 'Test page to send files' })).toBeVisible();
});
