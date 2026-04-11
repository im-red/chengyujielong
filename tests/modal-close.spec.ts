import { test, expect } from '@playwright/test';

test.describe('Modal Close Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
    });

    test('detail modal closes when clicking close button', async ({ page }) => {
        // Start endless mode
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        // Submit first idiom
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(100);

        // Click on message to open detail modal
        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.click();

        // Wait for modal to appear
        await page.waitForSelector('#detail-modal.show', { state: 'visible' });
        const modal = page.locator('#detail-modal.show');
        await expect(modal).toBeVisible();

        // Click close button
        await page.click('#detail-modal .close-modal');

        // Modal should be hidden
        await page.waitForSelector('#detail-modal.show', { state: 'hidden', timeout: 1000 });
        await expect(modal).not.toBeVisible();
    });

    test('detail modal closes when clicking backdrop', async ({ page }) => {
        // Start endless mode
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        // Submit first idiom
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(100);

        // Click on message to open detail modal
        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.click();

        // Wait for modal to appear
        await page.waitForSelector('#detail-modal.show', { state: 'visible' });
        const modal = page.locator('#detail-modal');
        await expect(modal).toBeVisible();

        // Wait for modal protection period to expire (300ms)
        await page.waitForTimeout(350);

        // Click on backdrop (the modal element itself, not its children)
        await modal.click({ position: { x: 10, y: 10 } });

        // Modal should be hidden
        await page.waitForSelector('#detail-modal.show', { state: 'hidden', timeout: 1000 });
        await expect(modal).not.toHaveClass(/show/);
    });

    test.skip('candidates modal closes when clicking close button', async ({ page }) => {
        // Start endless mode
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        // Submit first idiom
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(500);

        // Double click on computer message to open candidates modal
        const computerBubble = page.locator('.computer-message .message-bubble').first();
        await computerBubble.dblclick();

        // Wait for modal to appear
        await page.waitForSelector('#candidates-modal.show', { state: 'visible' });
        const modal = page.locator('#candidates-modal');
        await expect(modal).toBeVisible();

        // Click close button
        await page.click('#candidates-modal .close-modal');

        // Modal should be hidden
        await page.waitForSelector('#candidates-modal.show', { state: 'hidden', timeout: 1000 });
        await expect(modal).not.toHaveClass(/show/);
    });

    test.skip('candidates modal closes when clicking backdrop', async ({ page }) => {
        // Start endless mode
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        // Submit first idiom
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(500);

        // Double click on computer message to open candidates modal
        const computerBubble = page.locator('.computer-message .message-bubble').first();
        await computerBubble.dblclick();

        // Wait for modal to appear
        await page.waitForSelector('#candidates-modal.show', { state: 'visible' });
        const modal = page.locator('#candidates-modal');
        await expect(modal).toBeVisible();

        // Wait for modal protection period to expire (300ms)
        await page.waitForTimeout(350);

        // Click on backdrop
        await modal.click({ position: { x: 10, y: 10 } });

        // Modal should be hidden
        await page.waitForSelector('#candidates-modal.show', { state: 'hidden', timeout: 1000 });
        await expect(modal).not.toHaveClass(/show/);
    });

    test('closing modal maintains input focus', async ({ page }) => {
        // Start endless mode
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        // Submit first idiom
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(100);

        // Click on message to open detail modal
        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.click();

        // Wait for modal to appear
        await page.waitForSelector('#detail-modal.show', { state: 'visible' });

        // Click close button
        await page.click('#detail-modal .close-modal');

        // Modal should be hidden
        await page.waitForSelector('#detail-modal.show', { state: 'hidden', timeout: 1000 });

        // Input should still be focused
        const input = page.locator('#idiom-input');
        await expect(input).toBeFocused();
    });

    test('back button does not close modal or end game', async ({ page }) => {
        // Start endless mode
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        // Submit first idiom
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(100);

        // Click on message to open detail modal
        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.click();

        // Wait for modal to appear
        await page.waitForSelector('#detail-modal.show', { state: 'visible' });

        // Simulate back button (ESC key)
        await page.keyboard.press('Escape');

        // Modal should be hidden
        await page.waitForSelector('#detail-modal.show', { state: 'hidden', timeout: 1000 });

        // Game should still be active (not returned to home)
        await expect(page.locator('#idiom-input')).toBeVisible();
        await expect(page.locator('.mode-card')).not.toBeVisible();
    });
});
