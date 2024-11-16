import { expect, test } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.beforeEach(async ({ page }) => {
	await page.goto('/tests/file');
});

test('There is a test page /tests/file route', async ({ page }) => {
	await expect(page.getByRole('heading', { name: 'Test page to send files' })).toBeVisible();
});
test('Call Flottform and upload a file', async ({ page, context }) => {
	// Test if button is there
	await expect(page.locator('.flottform-button')).toBeVisible();
	// Click button
	await page.locator('.flottform-button').click();
	// Check that dialog is open
	await expect(page.getByRole('dialog')).toBeVisible();
	// Click Flottform link
	await page.locator('.flottform-link-offer').click();
	// Wait for a new tab to open
	const pagePromise = context.waitForEvent('page');
	// Open a peer connection page
	const newPage = await pagePromise;
	await expect(
		newPage.getByRole('heading', { name: 'Flottform "Return and complaints" client' })
	).toBeVisible();
	await newPage.locator('#document').setInputFiles(path.join(__dirname, './test-image.webp'));
	await expect(newPage.getByRole('button', { name: 'Send file' })).toBeVisible();
	// Send file to client
	await newPage.getByRole('button', { name: 'Send file' }).click();
	// Close dialog
	await page.getByRole('dialog').locator('.close-dialog-button').click();
	// Send file to server
	await page.getByRole('button', { name: 'Send' }).click();
	// Check that file is successfully uploaded
	await expect(page.getByRole('heading', { level: 2 })).toContainText('Upload done');
});
