import { test, expect } from '@playwright/test';

test.describe('Message Tap Interactions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
    });

    test.skip('tap on message shows detail modal on mobile', async ({ browser }) => {
        // Create a mobile context with touch support
        const context = await browser.newContext({
            hasTouch: true,
            viewport: { width: 375, height: 667 }
        });
        const page = await context.newPage();
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');

        // Start endless mode
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        // Submit first idiom
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');

        // Wait for messages to be rendered
        await page.waitForTimeout(100);

        // Get the first user message bubble
        const userBubble = page.locator('.user-message .message-bubble').first();
        await expect(userBubble).toBeVisible();

        // Tap on the message (short tap)
        await userBubble.tap();

        // Detail modal should appear
        await page.waitForSelector('.modal.show', { state: 'visible' });
        const modal = page.locator('.modal.show');
        await expect(modal).toBeVisible();

        // Should show idiom details (meaning, pinyin, etc.)
        const modalContent = await modal.textContent();
        expect(modalContent).toContain('一心一意');

        await context.close();
    });

    test.skip('long press on message shows candidates modal on mobile', async ({ browser }) => {
        // Create a mobile context with touch support
        const context = await browser.newContext({
            hasTouch: true,
            viewport: { width: 375, height: 667 }
        });
        const page = await context.newPage();
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');

        // Start endless mode
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        // Submit first idiom
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');

        // Wait for computer response
        await page.waitForTimeout(500);

        // Get the computer message bubble
        const computerBubble = page.locator('.computer-message .message-bubble').first();
        await expect(computerBubble).toBeVisible();

        // Long press on the message - simulate touchstart and hold
        await computerBubble.evaluate((el) => {
            // Simulate a long press by dispatching touch events
            const touchStartEvent = new TouchEvent('touchstart', {
                bubbles: true,
                cancelable: true,
                touches: [new Touch({
                    identifier: 0,
                    target: el,
                    clientX: el.getBoundingClientRect().left + el.offsetWidth / 2,
                    clientY: el.getBoundingClientRect().top + el.offsetHeight / 2
                })]
            });
            el.dispatchEvent(touchStartEvent);
        });

        // Wait for long press duration (500ms + buffer)
        await page.waitForTimeout(600);

        // Candidates modal should appear
        await page.waitForSelector('.modal.show', { state: 'visible', timeout: 1000 });
        const modal = page.locator('.modal.show');
        await expect(modal).toBeVisible();

        // Should show candidates list
        const modalContent = await modal.textContent();
        expect(modalContent).toContain('候选');

        await context.close();
    });

    test('tap on message shows detail modal on desktop', async ({ page }) => {
        // Start endless mode
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        // Submit first idiom
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');

        // Wait for messages to be rendered
        await page.waitForTimeout(100);

        // Get the first user message bubble
        const userBubble = page.locator('.user-message .message-bubble').first();
        await expect(userBubble).toBeVisible();

        // Click on the message
        await userBubble.click();

        // Detail modal should appear
        await page.waitForSelector('.modal.show', { state: 'visible' });
        const modal = page.locator('.modal.show');
        await expect(modal).toBeVisible();

        // Should show idiom details
        const modalContent = await modal.textContent();
        expect(modalContent).toContain('一心一意');
    });

    test('tap on message does not steal input focus', async ({ browser }) => {
        // Create a mobile context with touch support
        const context = await browser.newContext({
            hasTouch: true,
            viewport: { width: 375, height: 667 }
        });
        const page = await context.newPage();
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');

        // Start endless mode
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        // Submit first idiom
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');

        // Wait for messages to be rendered
        await page.waitForTimeout(100);

        // Focus should be on input
        const input = page.locator('#idiom-input');
        await expect(input).toBeFocused();

        // Tap on the message
        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.tap();

        // Wait for modal to appear
        await page.waitForSelector('.modal.show', { state: 'visible' });

        // Input should still be focused (or at least not blurred permanently)
        // Note: On mobile, focus might be temporarily lost but should be maintained
        const isFocused = await input.evaluate(el => document.activeElement === el);
        expect(isFocused).toBe(true);

        await context.close();
    });

    test('closing detail modal maintains input focus', async ({ browser }) => {
        // Create a mobile context with touch support
        const context = await browser.newContext({
            hasTouch: true,
            viewport: { width: 375, height: 667 }
        });
        const page = await context.newPage();
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');

        // Start endless mode
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        // Submit first idiom
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');

        // Wait for messages to be rendered
        await page.waitForTimeout(100);

        // Tap on the message to open modal
        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.tap();

        // Wait for modal to appear
        await page.waitForSelector('.modal.show', { state: 'visible' });

        // Close the modal
        await page.click('.close-modal');

        // Wait for modal to close
        await page.waitForSelector('.modal.show', { state: 'hidden' });

        // Input should be focused
        const input = page.locator('#idiom-input');
        await expect(input).toBeFocused();

        await context.close();
    });
});
