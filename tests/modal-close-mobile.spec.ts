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

        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(100);

        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.tap();

        await page.waitForSelector('#detail-modal.show', { state: 'visible' });
        const modal = page.locator('#detail-modal');
        await expect(modal).toHaveClass(/show/);

        const closeBtn = page.locator('#detail-modal .close-modal');
        await closeBtn.tap();

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

        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(100);

        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.tap();

        await page.waitForSelector('#detail-modal.show', { state: 'visible' });
        const modal = page.locator('#detail-modal');
        await expect(modal).toHaveClass(/show/);

        await page.waitForTimeout(350);

        await modal.tap({ position: { x: 10, y: 10 } });

        await page.waitForSelector('#detail-modal.show', { state: 'hidden', timeout: 1000 });
        await expect(modal).not.toHaveClass(/show/);

        await context.close();
    });

    test('candidates modal closes when tapping close button on mobile', async ({ browser }) => {
        const context = await browser.newContext({
            hasTouch: true,
            viewport: { width: 375, height: 667 }
        });
        const page = await context.newPage();
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');

        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(500);

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

        await page.waitForSelector('#candidates-modal.show', { state: 'visible' });
        const modal = page.locator('#candidates-modal');
        await expect(modal).toHaveClass(/show/);

        const closeBtn = page.locator('#candidates-modal .close-modal');
        await closeBtn.tap();

        await page.waitForSelector('#candidates-modal.show', { state: 'hidden', timeout: 1000 });
        await expect(modal).not.toHaveClass(/show/);

        await context.close();
    });

    test('candidates modal closes when tapping backdrop on mobile', async ({ browser }) => {
        const context = await browser.newContext({
            hasTouch: true,
            viewport: { width: 375, height: 667 }
        });
        const page = await context.newPage();
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');

        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(500);

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

        await page.waitForSelector('#candidates-modal.show', { state: 'visible' });
        const modal = page.locator('#candidates-modal');
        await expect(modal).toHaveClass(/show/);

        await page.waitForTimeout(350);

        await modal.tap({ position: { x: 10, y: 10 } });

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

        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(100);

        const input = page.locator('#idiom-input');
        await expect(input).toBeFocused();

        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.tap();

        await page.waitForSelector('#detail-modal.show', { state: 'visible' });

        const closeBtn = page.locator('#detail-modal .close-modal');
        await closeBtn.tap();

        await page.waitForSelector('#detail-modal.show', { state: 'hidden', timeout: 1000 });

        await expect(input).toBeFocused();

        await context.close();
    });
});
