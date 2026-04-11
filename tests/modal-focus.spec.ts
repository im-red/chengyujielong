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

        // Focus input
        await input.focus();
        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input initially focused');

        // Click on a message bubble to open detail modal
        const firstBubble = page.locator('.message-bubble').first();
        await firstBubble.click();

        // Wait for modal to open
        await page.waitForSelector('#detail-modal.show', { timeout: 2000 });
        console.log('[Test] ✓ Detail modal opened');

        // Verify input still has focus
        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input maintains focus after modal opens');

        // Close modal
        await page.click('.close-modal');
        await page.waitForTimeout(200);

        // Verify input still has focus
        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input maintains focus after modal closes');
    });

    test.skip('should not steal focus from input when candidates modal opens', async ({ page }) => {
        console.log('[Test] Testing candidates modal does not steal focus');

        await startEndlessMode(page);

        const input = page.locator('#idiom-input');

        // Focus input
        await input.focus();
        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input initially focused');

        // Long press on a message bubble to open candidates modal
        const firstBubble = page.locator('.computer-message .message-bubble').first();
        await firstBubble.hover();

        // Simulate long press
        await page.mouse.down();
        await page.waitForTimeout(600);
        await page.mouse.up();

        // Wait for modal to open
        await page.waitForSelector('#candidates-modal.show', { timeout: 2000 });
        console.log('[Test] ✓ Candidates modal opened');

        // Verify input still has focus
        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input maintains focus after modal opens');

        // Close modal by clicking backdrop
        await page.click('#candidates-modal');
        await page.waitForTimeout(200);

        // Verify input still has focus
        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input maintains focus after modal closes');
    });

    test.skip('should not steal focus when clicking on stat items in candidates modal', async ({ page }) => {
        console.log('[Test] Testing stat items do not steal focus');

        await startEndlessMode(page);

        const input = page.locator('#idiom-input');

        // Focus input
        await input.focus();
        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input initially focused');

        // Open candidates modal
        const firstBubble = page.locator('.computer-message .message-bubble').first();
        await firstBubble.hover();
        await page.mouse.down();
        await page.waitForTimeout(600);
        await page.mouse.up();

        await page.waitForSelector('#candidates-modal.show', { timeout: 2000 });
        console.log('[Test] ✓ Candidates modal opened');

        // Click on "total" stat item
        await page.click('.stat-item[data-type="total"]');
        await page.waitForTimeout(200);

        // Verify input still has focus
        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input maintains focus after clicking stat item');

        // Click on a candidate item
        const candidateItem = page.locator('.candidate-item').first();
        if (await candidateItem.count() > 0) {
            await candidateItem.click();
            await page.waitForTimeout(200);

            // Verify input still has focus
            await expect(input).toBeFocused();
            console.log('[Test] ✓ Input maintains focus after clicking candidate item');
        }
    });
});
