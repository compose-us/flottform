import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/tests/canvas');
});

test('There is a test page /tests/canvas route', async ({ page }) => {
	await expect(
		page.getByRole('heading', { name: 'Test page to send canvas to file input' })
	).toBeVisible();
});
test('Call Flottform and upload canvas as a file', async ({ page, context }) => {
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
	const canvasElement = newPage.locator('#canvas');
	await expect(canvasElement).toBeVisible();
	const canvasElementCoordinates = await canvasElement.boundingBox();
	if (canvasElementCoordinates) {
		await page.mouse.move(canvasElementCoordinates.x, canvasElementCoordinates.y);
		await page.mouse.down();
		await page.mouse.move(canvasElementCoordinates.x, canvasElementCoordinates.y + 100);
		await page.mouse.move(canvasElementCoordinates.x + 100, canvasElementCoordinates.y + 100);
		await page.mouse.move(canvasElementCoordinates.x + 100, canvasElementCoordinates.y);
		await page.mouse.move(canvasElementCoordinates.x, canvasElementCoordinates.y);
		await page.mouse.up();
	}
	await expect(newPage.getByRole('button', { name: 'Send file' })).toBeVisible();
	// Send file to client
	await newPage.getByRole('button', { name: 'Send file' }).click();
	// Close dialog
	await page.getByRole('dialog').locator('.close-dialog-button').click();
	// Send file to server
	await page.getByRole('button', { name: 'Send' }).click();
	// // Check that file is successfully uploaded
	await expect(page.getByRole('heading', { level: 2 })).toContainText('Upload done');
});
