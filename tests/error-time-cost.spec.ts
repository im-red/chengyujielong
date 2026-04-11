import { test, expect } from '@playwright/test';

test.describe('Error Message Time Cost', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
    });

    test('should not reset timer on incorrect idiom submission', async ({ page }) => {
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        await page.waitForTimeout(1000);

        const timeDisplay1 = await page.locator('#current-time-display').textContent();
        const time1 = parseFloat(timeDisplay1?.replace('s', '') || '0');
        console.log('[Test] Time before error:', time1);

        await page.fill('#idiom-input', '错误成语');
        await page.click('#submit-btn');
        await page.waitForTimeout(100);

        await page.waitForTimeout(500);

        const timeDisplay2 = await page.locator('#current-time-display').textContent();
        const time2 = parseFloat(timeDisplay2?.replace('s', '') || '0');
        console.log('[Test] Time after error:', time2);

        expect(time2).toBeGreaterThan(time1);
        console.log('[Test] ✓ Timer did not reset on error');
    });

    test('should not show time cost for error messages', async ({ page }) => {
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        await page.fill('#idiom-input', '错误成语');
        await page.click('#submit-btn');
        await page.waitForTimeout(100);

        const errorBubble = page.locator('.error-bubble').first();
        await expect(errorBubble).toBeVisible();

        const errorMessage = errorBubble.locator('..');
        const timeDisplay = errorMessage.locator('.message-time');

        const timeCount = await timeDisplay.count();
        expect(timeCount).toBe(0);
        console.log('[Test] ✓ Error message does not show time cost');
    });

    test('should not show old error time cost when submitting new correct idiom', async ({ page }) => {
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        await page.waitForSelector('.computer-message');

        const firstMessage = await page.locator('.computer-message .message-bubble').first().textContent();
        console.log('[Test] First computer message:', firstMessage);

        await page.fill('#idiom-input', '错误成语');
        await page.click('#submit-btn');
        await page.waitForTimeout(100);

        const errorMessage = page.locator('.user-message').first();
        await expect(errorMessage.locator('.error-bubble')).toBeVisible();
        await expect(errorMessage.locator('.message-time')).not.toBeVisible();
        console.log('[Test] ✓ Error message has no time display');

        await page.waitForTimeout(500);

        const validResponse = await page.evaluate((idiom) => {
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

        const testIdiom = validResponse || '一心一意';
        console.log('[Test] Submitting valid idiom:', testIdiom);

        await page.fill('#idiom-input', testIdiom);
        await page.click('#submit-btn');
        await page.waitForTimeout(100);

        await page.waitForTimeout(600);

        const allUserMessages = page.locator('.user-message');
        const count = await allUserMessages.count();
        console.log('[Test] Total user messages:', count);

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

        const timeDisplay = correctMessage!.locator('.message-time');
        await expect(timeDisplay).toBeVisible();
        const timeText = await timeDisplay.textContent();
        console.log('[Test] Time cost for correct idiom:', timeText);

        const timeValue = parseFloat(timeText?.replace('s', '').replace('ms', '') || '0');
        if (timeText?.includes('ms')) {
            expect(timeValue).toBeLessThan(1000);
        } else {
            expect(timeValue).toBeLessThan(1.0);
        }
        console.log('[Test] ✓ Correct idiom time cost does not include error time');
    });

    test('should reset timer only on correct submission', async ({ page }) => {
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        await page.waitForSelector('.computer-message');

        const firstMessage = await page.locator('.computer-message .message-bubble').first().textContent();
        console.log('[Test] First computer message:', firstMessage);

        await page.waitForTimeout(1000);

        await page.fill('#idiom-input', '错误成语');
        await page.click('#submit-btn');
        await page.waitForTimeout(100);

        const timeDisplay1 = await page.locator('#current-time-display').textContent();
        const time1 = parseFloat(timeDisplay1?.replace('s', '') || '0');
        console.log('[Test] Time after error:', time1);

        await page.waitForTimeout(500);

        const validResponse = await page.evaluate((idiom) => {
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

        const testIdiom = validResponse || '一心一意';
        console.log('[Test] Submitting valid idiom:', testIdiom);

        await page.fill('#idiom-input', testIdiom);
        await page.click('#submit-btn');
        await page.waitForTimeout(100);

        await page.waitForTimeout(600);

        const timeDisplay2 = await page.locator('#current-time-display').textContent();
        const time2 = parseFloat(timeDisplay2?.replace('s', '') || '0');
        console.log('[Test] Time after correct submission:', time2);

        expect(time2).toBeLessThan(time1);
        console.log('[Test] ✓ Timer reset on correct submission');
    });

    test('should show time cost for correct submissions after errors', async ({ page }) => {
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        await page.waitForSelector('.computer-message');

        const firstMessage = await page.locator('.computer-message .message-bubble').first().textContent();
        console.log('[Test] First computer message:', firstMessage);

        await page.fill('#idiom-input', '错误1');
        await page.click('#submit-btn');
        await page.waitForTimeout(100);

        await page.fill('#idiom-input', '错误2');
        await page.click('#submit-btn');
        await page.waitForTimeout(100);

        const validResponse = await page.evaluate((idiom) => {
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

        const testIdiom = validResponse || '一心一意';
        console.log('[Test] Submitting valid idiom:', testIdiom);

        await page.fill('#idiom-input', testIdiom);
        await page.click('#submit-btn');
        await page.waitForTimeout(100);

        const userMessages = page.locator('.user-message');
        const count = await userMessages.count();
        console.log('[Test] Total user messages:', count);

        for (let i = 0; i < count; i++) {
            const message = userMessages.nth(i);
            const hasError = await message.locator('.error-bubble').count() > 0;
            const hasTime = await message.locator('.message-time').count() > 0;

            if (hasError) {
                expect(hasTime).toBe(false);
                console.log(`[Test] ✓ Error message ${i + 1} has no time display`);
            } else {
                expect(hasTime).toBe(true);
                console.log(`[Test] ✓ Correct message ${i + 1} has time display`);
            }
        }
    });
});
