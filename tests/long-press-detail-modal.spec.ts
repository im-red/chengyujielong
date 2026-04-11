import { test, expect } from '@playwright/test';

test.describe('Long Press Should Not Show Detail Modal', () => {
    test('long press should only show candidates modal, not detail modal on release', async ({ browser }) => {
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

        await page.waitForSelector('#candidates-modal.show', { state: 'visible', timeout: 1000 });
        const candidatesModal = page.locator('#candidates-modal');
        await expect(candidatesModal).toHaveClass(/show/);
        console.log('[Test] ✓ Candidates modal opened on long press');

        await computerBubble.evaluate((el) => {
            const touchEndEvent = new TouchEvent('touchend', {
                bubbles: true,
                cancelable: true
            });
            el.dispatchEvent(touchEndEvent);
        });

        await page.waitForTimeout(200);

        const detailModal = page.locator('#detail-modal');
        await expect(detailModal).not.toHaveClass(/show/);
        console.log('[Test] ✓ Detail modal did not open on touch end');

        await expect(candidatesModal).toHaveClass(/show/);
        console.log('[Test] ✓ Candidates modal still visible');

        await context.close();
    });

    test('short tap should show detail modal, not candidates modal', async ({ browser }) => {
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

        await page.waitForSelector('#detail-modal.show', { state: 'visible', timeout: 1000 });
        const detailModal = page.locator('#detail-modal');
        await expect(detailModal).toHaveClass(/show/);
        console.log('[Test] ✓ Detail modal opened on short tap');

        const candidatesModal = page.locator('#candidates-modal');
        await expect(candidatesModal).not.toHaveClass(/show/);
        console.log('[Test] ✓ Candidates modal did not open on short tap');

        await context.close();
    });

    test('long press then close candidates modal should not show detail modal', async ({ browser }) => {
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

        await page.waitForSelector('#candidates-modal.show', { state: 'visible', timeout: 1000 });
        const candidatesModal = page.locator('#candidates-modal');
        await expect(candidatesModal).toHaveClass(/show/);

        await computerBubble.evaluate((el) => {
            const touchEndEvent = new TouchEvent('touchend', {
                bubbles: true,
                cancelable: true
            });
            el.dispatchEvent(touchEndEvent);
        });

        await page.waitForTimeout(350);

        await candidatesModal.tap({ position: { x: 10, y: 10 } });

        await page.waitForSelector('#candidates-modal.show', { state: 'hidden', timeout: 1000 });
        await expect(candidatesModal).not.toHaveClass(/show/);
        console.log('[Test] ✓ Candidates modal closed');

        const detailModal = page.locator('#detail-modal');
        await expect(detailModal).not.toHaveClass(/show/);
        console.log('[Test] ✓ Detail modal did not open after closing candidates modal');

        await context.close();
    });
});
