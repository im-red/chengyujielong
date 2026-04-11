import { test, expect, Page } from '@playwright/test';

// Helper function to start endless mode game
async function startEndlessMode(page: Page) {
    await page.goto('/');
    await page.waitForSelector('.mode-card');

    // Click endless mode card
    const endlessCard = page.locator('.mode-card[data-mode="endless"]');
    await endlessCard.click();

    // Wait for game to start
    await page.waitForSelector('.game-container');
    await page.waitForSelector('.message-bubble');
}

// Helper function to submit an idiom
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

        // Submit a wrong idiom (non-existent)
        const wrongIdiom = '错误成语';
        console.log('[Test] Submitting wrong idiom:', wrongIdiom);
        await submitIdiom(page, wrongIdiom);

        // Verify the wrong idiom appears as error bubble
        const errorBubble = page.locator('.message-bubble.error-bubble');
        await expect(errorBubble).toBeVisible();
        const errorText = (await errorBubble.textContent())?.trim();
        expect(errorText).toBe(wrongIdiom);
        console.log('[Test] Error bubble displayed correctly');

        // Verify game is still active (input should be enabled)
        const input = page.locator('#idiom-input');
        await expect(input).toBeEnabled();
        await expect(input).not.toBeDisabled();
        console.log('[Test] ✓ Input is still enabled after wrong submission');
    });

    test('should allow multiple wrong submissions in a row', async ({ page }) => {
        console.log('[Test] Testing multiple wrong submissions');

        await startEndlessMode(page);

        const input = page.locator('#idiom-input');

        // Submit first wrong idiom
        await submitIdiom(page, '错误一号');
        await expect(input).toBeEnabled();
        console.log('[Test] ✓ Input enabled after 1st wrong submission');

        // Submit second wrong idiom
        await submitIdiom(page, '错误二号');
        await expect(input).toBeEnabled();
        console.log('[Test] ✓ Input enabled after 2nd wrong submission');

        // Submit third wrong idiom
        await submitIdiom(page, '错误三号');
        await expect(input).toBeEnabled();
        console.log('[Test] ✓ Input enabled after 3rd wrong submission');

        // Count error bubbles
        const errorBubbles = page.locator('.message-bubble.error-bubble');
        const errorCount = await errorBubbles.count();
        expect(errorCount).toBe(3);
        console.log('[Test] ✓ All 3 error bubbles displayed');

        // Verify game is still active (no game over screen)
        const gameOverSection = page.locator('.game-over-section');
        await expect(gameOverSection).not.toBeVisible();
        console.log('[Test] ✓ Game still active');
    });

    test('should NOT display time cost for wrong submissions', async ({ page }) => {
        console.log('[Test] Testing time cost is NOT displayed for wrong submissions');

        await startEndlessMode(page);

        await page.waitForTimeout(1000);

        await submitIdiom(page, '错误成语');

        const userMessages = page.locator('.user-message');
        const lastUserMessage = userMessages.last();
        const errorBubble = lastUserMessage.locator('.error-bubble');
        await expect(errorBubble).toBeVisible();
        console.log('[Test] ✓ Error bubble is visible');

        const timeDisplay = lastUserMessage.locator('.message-time');
        await expect(timeDisplay).not.toBeVisible();
        console.log('[Test] ✓ Time cost is NOT displayed for wrong submission');
    });

    test.skip('should allow give up button to trigger computer turn', async ({ page }) => {
        console.log('[Test] Testing give up button');

        await startEndlessMode(page);

        // Get initial computer message count
        const initialComputerCount = await page.locator('.computer-message .message-bubble:not(.error-bubble)').count();
        console.log('[Test] Initial computer messages:', initialComputerCount);

        // Submit wrong idiom
        await submitIdiom(page, '错误成语');

        // Verify give up button is present
        const giveUpBtn = page.locator('#giveup-btn');
        await expect(giveUpBtn).toBeVisible();
        console.log('[Test] Give up button is visible');

        // Click give up button
        await giveUpBtn.click();
        await page.waitForTimeout(800);

        // Should see a new computer message
        const finalComputerCount = await page.locator('.computer-message .message-bubble:not(.error-bubble)').count();
        console.log('[Test] Final computer messages:', finalComputerCount);

        // Should have one more computer message
        expect(finalComputerCount).toBe(initialComputerCount + 1);

        // Verify input is still enabled
        const input = page.locator('#idiom-input');
        await expect(input).toBeEnabled();
        console.log('[Test] ✓ Give up button works correctly');
    });

    test('should not include error messages in game history', async ({ page }) => {
        console.log('[Test] Testing error messages are excluded from history');

        await startEndlessMode(page);

        // Submit a wrong idiom
        await submitIdiom(page, '错误成语');

        // Click give up to trigger computer turn
        const giveUpBtn = page.locator('#giveup-btn');
        await giveUpBtn.click();
        await page.waitForTimeout(800);

        // The computer should respond based on the first computer message, not the error
        // If error was included in history, computer would try to match "错误成语" which doesn't exist
        // and would fail. The fact that we get a response means errors are filtered out.

        const computerMessages = page.locator('.computer-message .message-bubble:not(.error-bubble)');
        const count = await computerMessages.count();

        // Should have 2 computer messages (initial + after give up)
        expect(count).toBe(2);
        console.log('[Test] ✓ Error messages correctly excluded from history');
    });

    test('should maintain game state after modal interactions', async ({ page }) => {
        console.log('[Test] Testing game state persistence');

        await startEndlessMode(page);

        const initialScoreText = await page.locator('.game-status-bar').first().textContent();
        const initialScore = initialScoreText?.match(/得分:\s*(\d+)/)?.[1] || '0';
        console.log('[Test] Initial score:', initialScore);

        // Submit wrong idiom
        await submitIdiom(page, '错误成语');

        // Click on a message bubble to open modal
        const firstBubble = page.locator('.message-bubble').first();
        await firstBubble.click();
        await page.waitForTimeout(300);

        // Verify modal is open
        const modal = page.locator('#detail-modal.show');
        await expect(modal).toBeVisible();

        // Close modal
        const closeBtn = page.locator('.close-modal').first();
        await closeBtn.click();
        await page.waitForTimeout(300);

        // Verify input is still enabled
        const input = page.locator('#idiom-input');
        await expect(input).toBeEnabled();

        // Verify score hasn't changed (wrong submission doesn't add points)
        const currentScoreText = await page.locator('.game-status-bar').first().textContent();
        const currentScore = currentScoreText?.match(/得分:\s*(\d+)/)?.[1] || '0';
        expect(currentScore).toBe(initialScore);
        console.log('[Test] ✓ Game state maintained');
    });

    test('should maintain input focus after submission', async ({ page }) => {
        console.log('[Test] Testing input focus retention');

        await startEndlessMode(page);

        const input = page.locator('#idiom-input');

        // Focus the input
        await input.focus();
        await page.waitForTimeout(100);

        // Verify input has focus
        let focusedElement = await page.evaluate(() => document.activeElement?.id);
        expect(focusedElement).toBe('idiom-input');
        console.log('[Test] ✓ Input initially focused');

        // Get first computer message to respond to
        const firstMessage = await page.locator('.computer-message .message-bubble').first().textContent();
        console.log('[Test] First computer message:', firstMessage);

        // Find a valid response using the global idiomLib
        const validResponse = await page.evaluate((idiom) => {
            // Access the idiomLib from the app instance
            const appElement = document.getElementById('app');
            if (!appElement) return null;

            // Try to get candidates from the idiom library
            try {
                // @ts-ignore
                const lib = window.idiomLib;
                if (lib && typeof lib.getUnusedCandidateList === 'function') {
                    const candidates = lib.getUnusedCandidateList(idiom);
                    return candidates && candidates.length > 0 ? candidates[0] : null;
                }
            } catch (e) {
                console.error('Error getting candidates:', e);
            }
            return null;
        }, firstMessage?.trim() || '');

        console.log('[Test] Valid response found:', validResponse);

        // If no valid response, try a known idiom that should work
        const testIdiom = validResponse || '身体力行';

        // Submit the idiom while input has focus
        await input.fill(testIdiom);
        await input.press('Enter');

        // Wait 3 seconds before checking focus (as requested)
        console.log('[Test] Waiting 3 seconds before checking focus...');
        await page.waitForTimeout(3000);

        // Verify input still has focus after submission
        focusedElement = await page.evaluate(() => document.activeElement?.id);
        expect(focusedElement).toBe('idiom-input');
        console.log('[Test] ✓ Input focus retained after submission');

        // Verify input is empty and ready for next input
        const inputValue = await input.inputValue();
        expect(inputValue).toBe('');
        console.log('[Test] ✓ Input cleared after submission');
    });

});
