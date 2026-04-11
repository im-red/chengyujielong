import { test, expect } from '@playwright/test';

test.describe('Modal Focus Management', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    async function startEndlessMode(page: any) {
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('.game-container');
    }

    test('should not steal focus from input when detail modal opens', async ({ page }) => {
        console.log('[Test] Testing detail modal does not steal focus');

        await startEndlessMode(page);

        const input = page.locator('#idiom-input');

        await input.focus();
        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input initially focused');

        const firstBubble = page.locator('.message-bubble').first();
        await firstBubble.click();

        await page.waitForSelector('#detail-modal.show', { timeout: 2000 });
        console.log('[Test] ✓ Detail modal opened');

        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input maintains focus after modal opens');

        await page.click('.close-modal');
        await page.waitForTimeout(200);

        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input maintains focus after modal closes');
    });

    test('should not steal focus from input when candidates modal opens', async ({ page }) => {
        console.log('[Test] Testing candidates modal does not steal focus');

        await startEndlessMode(page);

        const input = page.locator('#idiom-input');

        await input.focus();
        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input initially focused');

        const firstBubble = page.locator('.computer-message .message-bubble').first();

        await firstBubble.click({ button: 'right' });

        await page.waitForSelector('#candidates-modal.show', { timeout: 2000 });
        console.log('[Test] ✓ Candidates modal opened');

        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input maintains focus after modal opens');

        await page.click('#candidates-modal');
        await page.waitForTimeout(200);

        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input maintains focus after modal closes');
    });

    test('should not steal focus when clicking on stat items in candidates modal', async ({ page }) => {
        console.log('[Test] Testing stat items do not steal focus');

        await startEndlessMode(page);

        const input = page.locator('#idiom-input');

        await input.focus();
        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input initially focused');

        const firstBubble = page.locator('.computer-message .message-bubble').first();
        await firstBubble.click({ button: 'right' });

        await page.waitForSelector('#candidates-modal.show', { timeout: 2000 });
        console.log('[Test] ✓ Candidates modal opened');

        await page.click('.stat-item[data-type="total"]');
        await page.waitForTimeout(200);

        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input maintains focus after clicking stat item');

        const candidateItem = page.locator('.candidate-item').first();
        if (await candidateItem.count() > 0) {
            await candidateItem.click();
            await page.waitForTimeout(200);

            await expect(input).toBeFocused();
            console.log('[Test] ✓ Input maintains focus after clicking candidate item');
        }
    });
});
