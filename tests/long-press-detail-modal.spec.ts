import { test, expect } from '@playwright/test';

test.describe('Long Press Should Not Show Detail Modal', () => {
    test.skip('long press should only show candidates modal, not detail modal on release', async ({ browser }) => {
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

        // Get the computer message bubble
        const computerBubble = page.locator('.computer-message .message-bubble').first();
        await expect(computerBubble).toBeVisible();

        // Simulate long press
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

        // Wait for long press duration
        await page.waitForTimeout(600);

        // Candidates modal should appear
        await page.waitForSelector('#candidates-modal.show', { state: 'visible', timeout: 1000 });
        const candidatesModal = page.locator('#candidates-modal');
        await expect(candidatesModal).toHaveClass(/show/);
        console.log('[Test] ?Candidates modal opened on long press');

        // Simulate touch end
        await computerBubble.evaluate((el) => {
            const touchEndEvent = new TouchEvent('touchend', {
                bubbles: true,
                cancelable: true
            });
            el.dispatchEvent(touchEndEvent);
        });

        // Wait a bit to see if detail modal appears
        await page.waitForTimeout(200);

        // Detail modal should NOT appear
        const detailModal = page.locator('#detail-modal');
        await expect(detailModal).not.toHaveClass(/show/);
        console.log('[Test] ?Detail modal did not open on touch end');

        // Candidates modal should still be visible
        await expect(candidatesModal).toHaveClass(/show/);
        console.log('[Test] ?Candidates modal still visible');

        await context.close();
    });

    test.skip('short tap should show detail modal, not candidates modal', async ({ browser }) => {
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

        // Get the user message bubble
        const userBubble = page.locator('.user-message .message-bubble').first();
        await expect(userBubble).toBeVisible();

        // Tap on the message (short tap)
        await userBubble.tap();

        // Detail modal should appear
        await page.waitForSelector('#detail-modal.show', { state: 'visible', timeout: 1000 });
        const detailModal = page.locator('#detail-modal');
        await expect(detailModal).toHaveClass(/show/);
        console.log('[Test] ?Detail modal opened on short tap');

        // Candidates modal should NOT appear
        const candidatesModal = page.locator('#candidates-modal');
        await expect(candidatesModal).not.toHaveClass(/show/);
        console.log('[Test] ?Candidates modal did not open on short tap');

        await context.close();
    });

    test.skip('long press then close candidates modal should not show detail modal', async ({ browser }) => {
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

        // Get the computer message bubble
        const computerBubble = page.locator('.computer-message .message-bubble').first();
        await expect(computerBubble).toBeVisible();

        // Simulate long press
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

        // Wait for long press duration
        await page.waitForTimeout(600);

        // Candidates modal should appear
        await page.waitForSelector('#candidates-modal.show', { state: 'visible', timeout: 1000 });
        const candidatesModal = page.locator('#candidates-modal');
        await expect(candidatesModal).toHaveClass(/show/);

        // Simulate touch end
        await computerBubble.evaluate((el) => {
            const touchEndEvent = new TouchEvent('touchend', {
                bubbles: true,
                cancelable: true
            });
            el.dispatchEvent(touchEndEvent);
        });

        // Wait for modal protection period
        await page.waitForTimeout(350);

        // Close candidates modal by tapping backdrop
        await candidatesModal.tap({ position: { x: 10, y: 10 } });

        // Wait for modal to close
        await page.waitForSelector('#candidates-modal.show', { state: 'hidden', timeout: 1000 });
        await expect(candidatesModal).not.toHaveClass(/show/);
        console.log('[Test] ?Candidates modal closed');

        // Detail modal should NOT appear
        const detailModal = page.locator('#detail-modal');
        await expect(detailModal).not.toHaveClass(/show/);
        console.log('[Test] ?Detail modal did not open after closing candidates modal');

        await context.close();
    });
});
