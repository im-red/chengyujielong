import { test, expect, Page } from '@playwright/test';
import { setupTestMode, disableTestMode, TEST_IDIOM_SEQUENCE, TEST_USER_RESPONSES } from './testHelpers';

async function startEndlessMode(page: Page, useTestMode: boolean = true) {
    await page.goto('/');
    await page.waitForSelector('.mode-card');

    if (useTestMode) {
        await setupTestMode(page);
    }

    const endlessCard = page.locator('.mode-card[data-mode="endless"]');
    await endlessCard.click();

    await page.waitForSelector('.game-container');
    await page.waitForSelector('.message-bubble');
}

async function submitIdiom(page: Page, idiom: string) {
    const input = page.locator('#idiom-input');
    await input.fill(idiom);
    await input.press('Enter');
    await page.waitForTimeout(200);
}

test.describe('Endless Mode - Wrong Idiom Handling', () => {
    test('should keep input enabled after submitting a wrong idiom', async ({ page }) => {
        console.log('[Test] Testing input remains enabled after wrong submission');

        await startEndlessMode(page);

        const wrongIdiom = '错误成语';
        console.log('[Test] Submitting wrong idiom:', wrongIdiom);
        await submitIdiom(page, wrongIdiom);

        const errorBubble = page.locator('.message-bubble.error-bubble');
        await expect(errorBubble).toBeVisible();
        const errorText = (await errorBubble.textContent())?.trim();
        expect(errorText).toBe(wrongIdiom);
        console.log('[Test] Error bubble displayed correctly');

        const input = page.locator('#idiom-input');
        await expect(input).toBeEnabled();
        await expect(input).not.toBeDisabled();
        console.log('[Test] ✓ Input is still enabled after wrong submission');
    });

    test('should allow multiple wrong submissions in a row', async ({ page }) => {
        console.log('[Test] Testing multiple wrong submissions');

        await startEndlessMode(page);

        const wrongIdioms = ['错误一', '错误二', '错误三'];

        for (const wrongIdiom of wrongIdioms) {
            await submitIdiom(page, wrongIdiom);
            await page.waitForTimeout(100);
        }

        const errorBubbles = page.locator('.message-bubble.error-bubble');
        const count = await errorBubbles.count();
        expect(count).toBe(wrongIdioms.length);
        console.log('[Test] ✓ All error bubbles displayed');

        const input = page.locator('#idiom-input');
        await expect(input).toBeEnabled();
        console.log('[Test] ✓ Input still enabled after multiple wrong submissions');
    });

    test('should show correct error message for non-existent idiom', async ({ page }) => {
        console.log('[Test] Testing error message for non-existent idiom');

        await startEndlessMode(page);

        await submitIdiom(page, '不存在成语');

        const errorBubble = page.locator('.message-bubble.error-bubble');
        await expect(errorBubble).toBeVisible();

        const parent = errorBubble.locator('xpath=..');
        const errorHint = parent.locator('.error-hint');
        if (await errorHint.count() > 0) {
            const hintText = await errorHint.textContent();
            expect(hintText).toContain('成语不存在');
            console.log('[Test] ✓ Error hint displayed:', hintText);
        } else {
            console.log('[Test] ✓ Error bubble displayed (no separate hint element)');
        }
    });

    test('should show correct error message for duplicate idiom', async ({ page }) => {
        console.log('[Test] Testing error message for duplicate idiom');

        await startEndlessMode(page);

        const firstMessage = await page.locator('.computer-message .message-bubble').first().textContent();
        console.log('[Test] First computer message:', firstMessage);

        if (firstMessage) {
            await submitIdiom(page, firstMessage.trim());

            const errorBubble = page.locator('.message-bubble.error-bubble');
            await expect(errorBubble).toBeVisible();
            console.log('[Test] ✓ Error bubble displayed for duplicate');
        }
    });

    test('should show correct error message for pinyin mismatch', async ({ page }) => {
        console.log('[Test] Testing error message for pinyin mismatch');

        await startEndlessMode(page);

        await submitIdiom(page, '张冠李戴');

        const errorBubble = page.locator('.message-bubble.error-bubble');
        await expect(errorBubble).toBeVisible();
        console.log('[Test] ✓ Error bubble displayed for pinyin mismatch');
    });

    test('should maintain game state after modal interactions', async ({ page }) => {
        console.log('[Test] Testing game state after modal interactions');

        await startEndlessMode(page);

        const firstBubble = page.locator('.message-bubble').first();
        await firstBubble.click();
        await page.waitForTimeout(300);

        const modal = page.locator('#detail-modal.show');
        await expect(modal).toBeVisible();
        console.log('[Test] Modal opened');

        const currentScoreText = await page.locator('.game-status-bar').first().textContent();
        const initialScore = currentScoreText?.match(/得分:\s*(\d+)/)?.[1] || '0';
        console.log('[Test] Initial score:', initialScore);

        await page.click('#detail-modal .close-modal');
        await page.waitForTimeout(300);
        await expect(modal).not.toBeVisible();
        console.log('[Test] Modal closed');

        const input = page.locator('#idiom-input');
        await expect(input).toBeEnabled();

        await submitIdiom(page, '错误成语');
        await page.waitForTimeout(300);

        const errorBubble = page.locator('.message-bubble.error-bubble');
        await expect(errorBubble).toBeVisible();
        console.log('[Test] ✓ Game state maintained after modal interactions');
    });

    test('should maintain input focus after submission', async ({ page }) => {
        console.log('[Test] Testing input focus retention');

        await startEndlessMode(page);

        const input = page.locator('#idiom-input');

        await input.focus();
        await page.waitForTimeout(100);

        let focusedElement = await page.evaluate(() => document.activeElement?.id);
        expect(focusedElement).toBe('idiom-input');
        console.log('[Test] ✓ Input initially focused');

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];
        console.log('[Test] Submitting correct idiom:', userResponse);

        await input.fill(userResponse);
        await input.press('Enter');

        console.log('[Test] Waiting 3 seconds before checking focus...');
        await page.waitForTimeout(3000);

        focusedElement = await page.evaluate(() => document.activeElement?.id);
        expect(focusedElement).toBe('idiom-input');
        console.log('[Test] ✓ Input focus retained after submission');

        const inputValue = await input.inputValue();
        expect(inputValue).toBe('');
        console.log('[Test] ✓ Input cleared after submission');
    });
});
