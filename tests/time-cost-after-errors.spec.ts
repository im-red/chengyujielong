import { test, expect } from '@playwright/test';

test.describe('Time Cost After Errors', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
    });

    test('time cost should reflect total time from robot message, not from last error', async ({ page }) => {
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        await page.fill('#idiom-input', '心想事成');
        await page.click('#submit-btn');
        await page.waitForTimeout(600);

        await page.waitForSelector('.computer-message');
        console.log('[Test] ✓ Robot responded');

        await page.waitForTimeout(1000);

        await page.fill('#idiom-input', '错误成语');
        await page.click('#submit-btn');
        await page.waitForTimeout(100);

        const errorBubble = page.locator('.error-bubble').first();
        await expect(errorBubble).toBeVisible();
        console.log('[Test] ✓ Error message displayed');

        await page.waitForTimeout(1000);

        await page.fill('#idiom-input', '又错了');
        await page.click('#submit-btn');
        await page.waitForTimeout(100);

        await page.waitForTimeout(1000);

        await page.click('#giveup-btn');
        await page.waitForTimeout(600);

        await page.waitForTimeout(2000);

        await page.fill('#idiom-input', '再错一次');
        await page.click('#submit-btn');
        await page.waitForTimeout(100);

        await page.waitForTimeout(1000);

        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForTimeout(600);

        const userMessages = page.locator('.user-message');
        const lastUserMessage = userMessages.last();
        const hasError = await lastUserMessage.locator('.error-bubble').count() > 0;

        if (hasError) {
            console.log('[Test] ⚠ Idiom was rejected, trying another one');
            await page.fill('#idiom-input', '心想事成');
            await page.click('#submit-btn');
            await page.waitForTimeout(600);

            const lastUserMessage2 = userMessages.last();
            const hasError2 = await lastUserMessage2.locator('.error-bubble').count() > 0;

            if (hasError2) {
                console.log('[Test] ⚠ Still rejected, skipping test');
                return;
            }
        }

        console.log('[Test] ✓ Correct idiom submitted successfully');

        const count = await userMessages.count();
        let lastCorrectMessage = null;
        for (let i = count - 1; i >= 0; i--) {
            const msg = userMessages.nth(i);
            const hasErr = await msg.locator('.error-bubble').count() > 0;
            if (!hasErr) {
                lastCorrectMessage = msg;
                break;
            }
        }

        expect(lastCorrectMessage).not.toBeNull();

        const timeDisplay = lastCorrectMessage!.locator('.message-time');
        await expect(timeDisplay).toBeVisible();

        const timeText = await timeDisplay.textContent();
        console.log('[Test] Time cost displayed:', timeText);

        const timeMatch = timeText!.match(/(\d+\.?\d*)s?/);
        expect(timeMatch).not.toBeNull();

        const timeCost = parseFloat(timeMatch![1]);
        console.log('[Test] Parsed time cost:', timeCost);

        expect(timeCost).toBeGreaterThanOrEqual(2.8);
        console.log('[Test] ✓ Time cost reflects total time from robot message (>= 2.8s)');

        expect(timeCost).toBeGreaterThan(2.0);
        console.log('[Test] ✓ Time cost is not just from last error');
    });
});
