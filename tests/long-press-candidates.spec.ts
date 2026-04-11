import { test, expect } from '@playwright/test';

test.describe('Long Press to Show Candidates', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
    });

    test('single tap shows detail modal', async ({ page }) => {
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(100);

        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.click();

        await page.waitForSelector('#detail-modal.show', { state: 'visible', timeout: 1000 });
        const detailModal = page.locator('#detail-modal');
        await expect(detailModal).toHaveClass(/show/);
        console.log('[Test] ✓ Detail modal opened on single tap');

        const candidatesModal = page.locator('#candidates-modal');
        await expect(candidatesModal).not.toHaveClass(/show/);
        console.log('[Test] ✓ Candidates modal did not open');
    });

    test('right click shows candidates modal on desktop', async ({ page }) => {
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(500);

        const computerBubble = page.locator('.computer-message .message-bubble').first();
        await computerBubble.click({ button: 'right' });

        await page.waitForSelector('#candidates-modal.show', { state: 'visible', timeout: 1000 });
        const candidatesModal = page.locator('#candidates-modal');
        await expect(candidatesModal).toHaveClass(/show/);
        console.log('[Test] ✓ Candidates modal opened on right click');

        const detailModal = page.locator('#detail-modal');
        await expect(detailModal).not.toHaveClass(/show/);
        console.log('[Test] ✓ Detail modal did not open');
    });

    test('long press shows candidates modal on mobile', async ({ browser }) => {
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

        await page.waitForSelector('#candidates-modal.show', { state: 'visible', timeout: 1000 });
        const candidatesModal = page.locator('#candidates-modal');
        await expect(candidatesModal).toHaveClass(/show/);
        console.log('[Test] ✓ Candidates modal opened on long press');

        const detailModal = page.locator('#detail-modal');
        await expect(detailModal).not.toHaveClass(/show/);
        console.log('[Test] ✓ Detail modal did not open');

        await context.close();
    });

    test('short tap shows detail modal on mobile', async ({ browser }) => {
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

        await page.waitForSelector('#detail-modal.show', { state: 'visible', timeout: 1000 });
        const detailModal = page.locator('#detail-modal');
        await expect(detailModal).toHaveClass(/show/);
        console.log('[Test] ✓ Detail modal opened on short tap');

        const candidatesModal = page.locator('#candidates-modal');
        await expect(candidatesModal).not.toHaveClass(/show/);
        console.log('[Test] ✓ Candidates modal did not open');

        await context.close();
    });

    test('hint text shows long press instruction', async ({ page }) => {
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        await page.waitForSelector('.computer-message');

        const hint = page.locator('.message-hint').first();
        await expect(hint).toBeVisible();

        const hintText = await hint.textContent();
        expect(hintText).toContain('长按');
        expect(hintText).not.toContain('双击');
        console.log('[Test] ✓ Hint text shows "长按" (long press)');
        console.log('[Test] Hint text:', hintText);
    });

    test('touch move cancels long press', async ({ browser }) => {
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

        await page.waitForTimeout(200);

        await computerBubble.evaluate((el) => {
            const touchMoveEvent = new TouchEvent('touchmove', {
                bubbles: true,
                cancelable: true
            });
            el.dispatchEvent(touchMoveEvent);
        });

        await page.waitForTimeout(400);

        const candidatesModal = page.locator('#candidates-modal');
        await expect(candidatesModal).not.toHaveClass(/show/);
        console.log('[Test] ✓ Candidates modal did not open after touch move');

        await context.close();
    });
});
