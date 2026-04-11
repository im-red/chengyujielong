import { test, expect } from '@playwright/test';

test.describe('Modal Close on Mobile', () => {
    test('detail modal closes when tapping close button on mobile', async ({ browser }) => {
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
        await page.waitForTimeout(100);

        // Tap on message to open detail modal
        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.tap();

        // Wait for modal to appear
        await page.waitForSelector('#detail-modal.show', { state: 'visible' });
        const modal = page.locator('#detail-modal');
        await expect(modal).toHaveClass(/show/);

        // Tap close button
        const closeBtn = page.locator('#detail-modal .close-modal');
        await closeBtn.tap();

        // Modal should be hidden
        await page.waitForSelector('#detail-modal.show', { state: 'hidden', timeout: 1000 });
        await expect(modal).not.toHaveClass(/show/);

        await context.close();
    });

    test('detail modal closes when tapping backdrop on mobile', async ({ browser }) => {
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
        await page.waitForTimeout(100);

        // Tap on message to open detail modal
        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.tap();

        // Wait for modal to appear
        await page.waitForSelector('#detail-modal.show', { state: 'visible' });
        const modal = page.locator('#detail-modal');
        await expect(modal).toHaveClass(/show/);

        // Wait for modal protection period to expire (300ms)
        await page.waitForTimeout(350);

        // Tap on backdrop (the modal element itself, not its children)
        await modal.tap({ position: { x: 10, y: 10 } });

        // Modal should be hidden
        await page.waitForSelector('#detail-modal.show', { state: 'hidden', timeout: 1000 });
        await expect(modal).not.toHaveClass(/show/);

        await context.close();
    });

    test.skip('candidates modal closes when tapping close button on mobile', async ({ browser }) => {
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
        await page.waitForTimeout(500);

        // Long press on computer message to open candidates modal
        const computerBubble = page.locator('.computer-message .message-bubble').first();
        await computerBubble.evaluate((el) => {
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
        await page.waitForTimeout(600);

        // Wait for modal to appear
        await page.waitForSelector('#candidates-modal.show', { state: 'visible' });
        const modal = page.locator('#candidates-modal');
        await expect(modal).toHaveClass(/show/);

        // Tap close button
        const closeBtn = page.locator('#candidates-modal .close-modal');
        await closeBtn.tap();

        // Modal should be hidden
        await page.waitForSelector('#candidates-modal.show', { state: 'hidden', timeout: 1000 });
        await expect(modal).not.toHaveClass(/show/);

        await context.close();
    });

    test.skip('candidates modal closes when tapping backdrop on mobile', async ({ browser }) => {
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
        await page.waitForTimeout(500);

        // Long press on computer message to open candidates modal
        const computerBubble = page.locator('.computer-message .message-bubble').first();
        await computerBubble.evaluate((el) => {
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
        await page.waitForTimeout(600);

        // Wait for modal to appear
        await page.waitForSelector('#candidates-modal.show', { state: 'visible' });
        const modal = page.locator('#candidates-modal');
        await expect(modal).toHaveClass(/show/);

        // Wait for modal protection period to expire (300ms)
        await page.waitForTimeout(350);

        // Tap on backdrop
        await modal.tap({ position: { x: 10, y: 10 } });

        // Modal should be hidden
        await page.waitForSelector('#candidates-modal.show', { state: 'hidden', timeout: 1000 });
        await expect(modal).not.toHaveClass(/show/);

        await context.close();
    });

    test('input maintains focus after closing modal on mobile', async ({ browser }) => {
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
        await page.waitForTimeout(100);

        // Input should be focused
        const input = page.locator('#idiom-input');
        await expect(input).toBeFocused();

        // Tap on message to open detail modal
        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.tap();

        // Wait for modal to appear
        await page.waitForSelector('#detail-modal.show', { state: 'visible' });

        // Tap close button
        const closeBtn = page.locator('#detail-modal .close-modal');
        await closeBtn.tap();

        // Modal should be hidden
        await page.waitForSelector('#detail-modal.show', { state: 'hidden', timeout: 1000 });

        // Input should still be focused
        await expect(input).toBeFocused();

        await context.close();
    });
});
