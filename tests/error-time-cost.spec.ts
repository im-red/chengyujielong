import { test, expect } from '@playwright/test';

test.describe('Error Message Time Cost', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
    });

    test('should not reset timer on incorrect idiom submission', async ({ page }) => {
        // Start endless mode
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        // Wait a bit to accumulate time
        await page.waitForTimeout(1000);

        // Get current time display
        const timeDisplay1 = await page.locator('#current-time-display').textContent();
        const time1 = parseFloat(timeDisplay1?.replace('s', '') || '0');
        console.log('[Test] Time before error:', time1);

        // Submit incorrect idiom
        await page.fill('#idiom-input', '错误成语');
        await page.click('#submit-btn');
        await page.waitForTimeout(100);

        // Wait a bit more
        await page.waitForTimeout(500);

        // Get time display after error
        const timeDisplay2 = await page.locator('#current-time-display').textContent();
        const time2 = parseFloat(timeDisplay2?.replace('s', '') || '0');
        console.log('[Test] Time after error:', time2);

        // Time should continue increasing (not reset to 0)
        expect(time2).toBeGreaterThan(time1);
        console.log('[Test] ?Timer did not reset on error');
    });

    test.skip('should not show time cost for error messages', async ({ page }) => {
        // Start endless mode
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        // Submit incorrect idiom
        await page.fill('#idiom-input', '错误成语');
        await page.click('#submit-btn');
        await page.waitForTimeout(100);

        // Find the error message bubble
        const errorBubble = page.locator('.error-bubble').first();
        await expect(errorBubble).toBeVisible();

        // Check if there's a time display next to the error bubble
        const errorMessage = errorBubble.locator('..');
        const timeDisplay = errorMessage.locator('.message-time');

        // Error messages should not have time display
        const timeCount = await timeDisplay.count();
        expect(timeCount).toBe(0);
        console.log('[Test] ?Error message does not show time cost');
    });

    test.skip('should not show old error time cost when submitting new correct idiom', async ({ page }) => {
        // Start endless mode
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        // Get first computer message
        await page.waitForSelector('.computer-message');

        // Submit incorrect idiom
        await page.fill('#idiom-input', '错误成语');
        await page.click('#submit-btn');
        await page.waitForTimeout(100);

        // Verify error message exists and has no time
        const errorMessage = page.locator('.user-message').first();
        await expect(errorMessage.locator('.error-bubble')).toBeVisible();
        await expect(errorMessage.locator('.message-time')).not.toBeVisible();
        console.log('[Test] ?Error message has no time display');

        // Wait a bit
        await page.waitForTimeout(500);

        // Submit correct idiom
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForTimeout(100);

        // Wait for computer response
        await page.waitForTimeout(600);

        // Find all user messages
        const allUserMessages = page.locator('.user-message');
        const count = await allUserMessages.count();
        console.log('[Test] Total user messages:', count);

        // Find the correct message (should be the last user message, which is not an error)
        let correctMessage = null;
        for (let i = 0; i < count; i++) {
            const msg = allUserMessages.nth(i);
            const hasError = await msg.locator('.error-bubble').count() > 0;
            if (!hasError) {
                correctMessage = msg;
                break;
            }
        }

        expect(correctMessage).not.toBeNull();
        await expect(correctMessage!).toBeVisible();

        // Get the time cost displayed
        const timeDisplay = correctMessage!.locator('.message-time');
        await expect(timeDisplay).toBeVisible();
        const timeText = await timeDisplay.textContent();
        console.log('[Test] Time cost for correct idiom:', timeText);

        // The time should be reasonable (not include the error submission time)
        // Should be less than 1 second since we only waited 500ms
        const timeValue = parseFloat(timeText?.replace('s', '').replace('ms', '') || '0');
        if (timeText?.includes('ms')) {
            expect(timeValue).toBeLessThan(1000);
        } else {
            expect(timeValue).toBeLessThan(1.0);
        }
        console.log('[Test] ?Correct idiom time cost does not include error time');
    });

    test.skip('should reset timer only on correct submission', async ({ page }) => {
        // Start endless mode
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        // Wait to accumulate time
        await page.waitForTimeout(1000);

        // Submit incorrect idiom
        await page.fill('#idiom-input', '错误成语');
        await page.click('#submit-btn');
        await page.waitForTimeout(100);

        // Timer should still be running
        const timeDisplay1 = await page.locator('#current-time-display').textContent();
        const time1 = parseFloat(timeDisplay1?.replace('s', '') || '0');
        console.log('[Test] Time after error:', time1);

        // Wait a bit more
        await page.waitForTimeout(500);

        // Submit correct idiom
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForTimeout(100);

        // Wait for computer response
        await page.waitForTimeout(600);

        // Timer should have reset and be showing a small value
        const timeDisplay2 = await page.locator('#current-time-display').textContent();
        const time2 = parseFloat(timeDisplay2?.replace('s', '') || '0');
        console.log('[Test] Time after correct submission:', time2);

        // Time should be less than the previous time (indicating a reset)
        expect(time2).toBeLessThan(time1);
        console.log('[Test] ?Timer reset on correct submission');
    });

    test.skip('should show time cost for correct submissions after errors', async ({ page }) => {
        // Start endless mode
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        // Submit multiple errors
        await page.fill('#idiom-input', '错误1');
        await page.click('#submit-btn');
        await page.waitForTimeout(100);

        await page.fill('#idiom-input', '错误2');
        await page.click('#submit-btn');
        await page.waitForTimeout(100);

        // Submit correct idiom
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForTimeout(100);

        // Find all user messages
        const userMessages = page.locator('.user-message');
        const count = await userMessages.count();
        console.log('[Test] Total user messages:', count);

        // Check each message
        for (let i = 0; i < count; i++) {
            const message = userMessages.nth(i);
            const hasError = await message.locator('.error-bubble').count() > 0;
            const hasTime = await message.locator('.message-time').count() > 0;

            if (hasError) {
                expect(hasTime).toBe(false);
                console.log(`[Test] ?Error message ${i + 1} has no time display`);
            } else {
                expect(hasTime).toBe(true);
                console.log(`[Test] ?Correct message ${i + 1} has time display`);
            }
        }
    });
});
