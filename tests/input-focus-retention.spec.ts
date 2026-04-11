import { test, expect } from '@playwright/test';

test.describe('Input Focus Retention', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    async function startEndlessMode(page: any) {
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('.game-container');
    }

    test('should not lose focus on input when submitting an idiom', async ({ page }) => {
        console.log('[Test] Testing input does not lose focus on submit');
        await startEndlessMode(page);

        const input = page.locator('#idiom-input');
        await input.focus();
        await expect(input).toBeFocused();

        // Inject script to track blur events
        await page.evaluate(() => {
            (window as any).blurCount = 0;
            const el = document.getElementById('idiom-input');
            if (el) {
                el.addEventListener('blur', () => {
                    (window as any).blurCount++;
                });
            }
        });

        // Type a valid idiom to submit
        await input.fill('一心一意');
        
        // Click submit button
        await page.click('#submit-btn');

        // Wait a bit for submit to process
        await page.waitForTimeout(500);

        // Verify focus is still on input
        await expect(input).toBeFocused();

        // Verify that blur event was never fired
        const blurCount = await page.evaluate(() => (window as any).blurCount);
        expect(blurCount).toBe(0);
        console.log('[Test] ✓ Input never lost focus during submit');
    });

    test('should not lose focus on input when closing detail modal', async ({ page }) => {
        console.log('[Test] Testing input does not lose focus on closing detail modal');
        await startEndlessMode(page);

        const input = page.locator('#idiom-input');
        await input.focus();
        await expect(input).toBeFocused();

        // Inject script to track blur events
        await page.evaluate(() => {
            (window as any).blurCount = 0;
            const el = document.getElementById('idiom-input');
            if (el) {
                el.addEventListener('blur', () => {
                    (window as any).blurCount++;
                });
            }
        });

        // Open detail modal
        const firstBubble = page.locator('.message-bubble').first();
        await firstBubble.click();
        await page.waitForSelector('#detail-modal.show', { timeout: 2000 });

        // Click close button on modal
        await page.click('#detail-modal .close-modal');
        await page.waitForTimeout(500);

        // Verify focus is still on input
        await expect(input).toBeFocused();

        // Verify that blur event was never fired
        const blurCount = await page.evaluate(() => (window as any).blurCount);
        expect(blurCount).toBe(0);
        console.log('[Test] ✓ Input never lost focus when closing detail modal');
    });

    test('should not lose focus on input when closing candidates modal', async ({ page }) => {
        console.log('[Test] Testing input does not lose focus on closing candidates modal');
        await startEndlessMode(page);

        const input = page.locator('#idiom-input');
        await input.focus();
        await expect(input).toBeFocused();

        // Inject script to track blur events
        await page.evaluate(() => {
            (window as any).blurCount = 0;
            const el = document.getElementById('idiom-input');
            if (el) {
                el.addEventListener('blur', () => {
                    (window as any).blurCount++;
                });
            }
        });

        // Open candidates modal (right click on computer message)
        const firstBubble = page.locator('.computer-message .message-bubble').first();
        await firstBubble.click({ button: 'right' });
        await page.waitForSelector('#candidates-modal.show', { timeout: 2000 });

        // Click close button on modal
        await page.click('#candidates-modal .close-modal');
        await page.waitForTimeout(500);

        // Verify focus is still on input
        await expect(input).toBeFocused();

        // Verify that blur event was never fired
        const blurCount = await page.evaluate(() => (window as any).blurCount);
        expect(blurCount).toBe(0);
        console.log('[Test] ✓ Input never lost focus when closing candidates modal');
    });

    test('should not lose focus on input when closing detail modal by backdrop click', async ({ page }) => {
        console.log('[Test] Testing input does not lose focus on closing detail modal via backdrop');
        await startEndlessMode(page);

        const input = page.locator('#idiom-input');
        await input.focus();
        await expect(input).toBeFocused();

        // Inject script to track blur events
        await page.evaluate(() => {
            (window as any).blurCount = 0;
            const el = document.getElementById('idiom-input');
            if (el) {
                el.addEventListener('blur', () => {
                    (window as any).blurCount++;
                });
            }
        });

        // Open detail modal
        const firstBubble = page.locator('.message-bubble').first();
        await firstBubble.click();
        await page.waitForSelector('#detail-modal.show', { timeout: 2000 });

        // Click backdrop to close
        await page.click('#detail-modal', { position: { x: 10, y: 10 } });
        await page.waitForTimeout(500);

        // Verify focus is still on input
        await expect(input).toBeFocused();

        // Verify that blur event was never fired
        const blurCount = await page.evaluate(() => (window as any).blurCount);
        expect(blurCount).toBe(0);
        console.log('[Test] ✓ Input never lost focus when closing detail modal via backdrop');
    });

    test('should not lose focus on input when closing candidates modal by backdrop click', async ({ page }) => {
        console.log('[Test] Testing input does not lose focus on closing candidates modal via backdrop');
        await startEndlessMode(page);

        const input = page.locator('#idiom-input');
        await input.focus();
        await expect(input).toBeFocused();

        // Inject script to track blur events
        await page.evaluate(() => {
            (window as any).blurCount = 0;
            const el = document.getElementById('idiom-input');
            if (el) {
                el.addEventListener('blur', () => {
                    (window as any).blurCount++;
                });
            }
        });

        // Open candidates modal (right click on computer message)
        const firstBubble = page.locator('.computer-message .message-bubble').first();
        await firstBubble.click({ button: 'right' });
        await page.waitForSelector('#candidates-modal.show', { timeout: 2000 });

        // Click backdrop to close
        await page.click('#candidates-modal', { position: { x: 10, y: 10 } });
        await page.waitForTimeout(500);

        // Verify focus is still on input
        await expect(input).toBeFocused();

        // Verify that blur event was never fired
        const blurCount = await page.evaluate(() => (window as any).blurCount);
        expect(blurCount).toBe(0);
        console.log('[Test] ✓ Input never lost focus when closing candidates modal via backdrop');
    });
});
