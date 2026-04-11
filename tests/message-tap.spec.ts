import { test, expect } from '@playwright/test';

test.describe('Message Tap Interactions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
    });

    test('tap on message shows detail modal on mobile', async ({ browser }) => {
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
        await expect(userBubble).toBeVisible();

        await userBubble.tap();

        await page.waitForSelector('.modal.show', { state: 'visible' });
        const modal = page.locator('.modal.show');
        await expect(modal).toBeVisible();

        const modalContent = await modal.textContent();
        expect(modalContent).toContain('一心一意');

        await context.close();
    });

    test('long press on message shows candidates modal on mobile', async ({ browser }) => {
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
        await expect(computerBubble).toBeVisible();

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

        await page.waitForSelector('.modal.show', { state: 'visible', timeout: 1000 });
        const modal = page.locator('.modal.show');
        await expect(modal).toBeVisible();

        const modalContent = await modal.textContent();
        expect(modalContent).toContain('候选');

        await context.close();
    });

    test('tap on message shows detail modal on desktop', async ({ page }) => {
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');

        await page.waitForTimeout(100);

        const userBubble = page.locator('.user-message .message-bubble').first();
        await expect(userBubble).toBeVisible();

        await userBubble.click();

        await page.waitForSelector('.modal.show', { state: 'visible' });
        const modal = page.locator('.modal.show');
        await expect(modal).toBeVisible();

        const modalContent = await modal.textContent();
        expect(modalContent).toContain('一心一意');
    });

    test('tap on message does not steal input focus', async ({ browser }) => {
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

        await page.waitForSelector('.modal.show', { state: 'visible' });

        const isFocused = await input.evaluate(el => document.activeElement === el);
        expect(isFocused).toBe(true);

        await context.close();
    });

    test('closing detail modal maintains input focus', async ({ browser }) => {
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

        await page.waitForSelector('.modal.show', { state: 'visible' });

        await page.click('.close-modal');

        await page.waitForSelector('.modal.show', { state: 'hidden' });

        const input = page.locator('#idiom-input');
        await expect(input).toBeFocused();

        await context.close();
    });
});
