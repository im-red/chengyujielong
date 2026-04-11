import { test, expect } from '@playwright/test';

test.describe('Modal Close Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
    });

    test('detail modal closes when clicking close button', async ({ page }) => {
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(100);

        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.click();

        await page.waitForSelector('#detail-modal.show', { state: 'visible' });
        const modal = page.locator('#detail-modal.show');
        await expect(modal).toBeVisible();

        await page.click('#detail-modal .close-modal');

        await page.waitForSelector('#detail-modal.show', { state: 'hidden', timeout: 1000 });
        await expect(modal).not.toBeVisible();
    });

    test('detail modal closes when clicking backdrop', async ({ page }) => {
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(100);

        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.click();

        await page.waitForSelector('#detail-modal.show', { state: 'visible' });
        const modal = page.locator('#detail-modal');
        await expect(modal).toBeVisible();

        await page.waitForTimeout(350);

        await modal.click({ position: { x: 10, y: 10 } });

        await page.waitForSelector('#detail-modal.show', { state: 'hidden', timeout: 1000 });
        await expect(modal).not.toHaveClass(/show/);
    });

    test('candidates modal closes when clicking close button', async ({ page }) => {
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(500);

        const computerBubble = page.locator('.computer-message .message-bubble').first();
        await computerBubble.click({ button: 'right' });

        await page.waitForSelector('#candidates-modal.show', { state: 'visible' });
        const modal = page.locator('#candidates-modal');
        await expect(modal).toBeVisible();

        await page.click('#candidates-modal .close-modal');

        await page.waitForSelector('#candidates-modal.show', { state: 'hidden', timeout: 1000 });
        await expect(modal).not.toHaveClass(/show/);
    });

    test('candidates modal closes when clicking backdrop', async ({ page }) => {
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(500);

        const computerBubble = page.locator('.computer-message .message-bubble').first();
        await computerBubble.click({ button: 'right' });

        await page.waitForSelector('#candidates-modal.show', { state: 'visible' });
        const modal = page.locator('#candidates-modal');
        await expect(modal).toBeVisible();

        await page.waitForTimeout(350);

        await modal.click({ position: { x: 10, y: 10 } });

        await page.waitForSelector('#candidates-modal.show', { state: 'hidden', timeout: 1000 });
        await expect(modal).not.toHaveClass(/show/);
    });

    test('closing modal maintains input focus', async ({ page }) => {
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(100);

        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.click();

        await page.waitForSelector('#detail-modal.show', { state: 'visible' });

        await page.click('#detail-modal .close-modal');

        await page.waitForSelector('#detail-modal.show', { state: 'hidden', timeout: 1000 });

        const input = page.locator('#idiom-input');
        await expect(input).toBeFocused();
    });

    test('back button does not close modal or end game', async ({ page }) => {
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(100);

        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.click();

        await page.waitForSelector('#detail-modal.show', { state: 'visible' });

        await page.keyboard.press('Escape');

        await page.waitForSelector('#detail-modal.show', { state: 'hidden', timeout: 1000 });

        await expect(page.locator('#idiom-input')).toBeVisible();
        await expect(page.locator('.mode-card')).not.toBeVisible();
    });
});
