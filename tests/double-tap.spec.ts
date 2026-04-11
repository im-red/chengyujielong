import { test, expect } from '@playwright/test';

test.describe('Double Tap to Show Candidates', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
    });

    test('single tap shows detail modal', async ({ page }) => {
        // Start endless mode
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        // Submit first idiom
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(100);

        // Single tap on user message
        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.click();

        // Wait for single tap delay
        await page.waitForTimeout(350);

        // Detail modal should appear
        await page.waitForSelector('#detail-modal.show', { state: 'visible', timeout: 1000 });
        const detailModal = page.locator('#detail-modal');
        await expect(detailModal).toHaveClass(/show/);
        console.log('[Test] ✓ Detail modal opened on single tap');

        // Candidates modal should NOT appear
        const candidatesModal = page.locator('#candidates-modal');
        await expect(candidatesModal).not.toHaveClass(/show/);
        console.log('[Test] ✓ Candidates modal did not open');
    });

    test('double click shows candidates modal on desktop', async ({ page }) => {
        // Start endless mode
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        // Submit first idiom
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(500);

        // Double click on computer message
        const computerBubble = page.locator('.computer-message .message-bubble').first();
        await computerBubble.dblclick();

        // Candidates modal should appear
        await page.waitForSelector('#candidates-modal.show', { state: 'visible', timeout: 1000 });
        const candidatesModal = page.locator('#candidates-modal');
        await expect(candidatesModal).toHaveClass(/show/);
        console.log('[Test] ✓ Candidates modal opened on double click');

        // Detail modal should NOT appear
        const detailModal = page.locator('#detail-modal');
        await expect(detailModal).not.toHaveClass(/show/);
        console.log('[Test] ✓ Detail modal did not open');
    });

    test('double tap shows candidates modal on mobile', async ({ browser }) => {
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

        // Double tap on computer message
        const computerBubble = page.locator('.computer-message .message-bubble').first();

        // First tap
        await computerBubble.tap();
        // Second tap within 300ms
        await page.waitForTimeout(100);
        await computerBubble.tap();

        // Candidates modal should appear
        await page.waitForSelector('#candidates-modal.show', { state: 'visible', timeout: 1000 });
        const candidatesModal = page.locator('#candidates-modal');
        await expect(candidatesModal).toHaveClass(/show/);
        console.log('[Test] ✓ Candidates modal opened on double tap');

        // Detail modal should NOT appear
        const detailModal = page.locator('#detail-modal');
        await expect(detailModal).not.toHaveClass(/show/);
        console.log('[Test] ✓ Detail modal did not open');

        await context.close();
    });

    test('single tap then wait shows detail modal on mobile', async ({ browser }) => {
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

        // Single tap on user message
        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.tap();

        // Wait for single tap timeout
        await page.waitForTimeout(350);

        // Detail modal should appear
        await page.waitForSelector('#detail-modal.show', { state: 'visible', timeout: 1000 });
        const detailModal = page.locator('#detail-modal');
        await expect(detailModal).toHaveClass(/show/);
        console.log('[Test] ✓ Detail modal opened on single tap');

        // Candidates modal should NOT appear
        const candidatesModal = page.locator('#candidates-modal');
        await expect(candidatesModal).not.toHaveClass(/show/);
        console.log('[Test] ✓ Candidates modal did not open');

        await context.close();
    });

    test('hint text shows double tap instruction', async ({ page }) => {
        // Start endless mode
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        // Wait for first computer message
        await page.waitForSelector('.computer-message');

        // Check hint text
        const hint = page.locator('.message-hint').first();
        await expect(hint).toBeVisible();

        const hintText = await hint.textContent();
        expect(hintText).toContain('双击');
        expect(hintText).not.toContain('长按');
        console.log('[Test] ✓ Hint text shows "双击" (double tap)');
        console.log('[Test] Hint text:', hintText);
    });

    test.skip('double tap works on both user and computer messages', async ({ page }) => {
        // Start endless mode
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('#idiom-input');

        // Submit first idiom
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(500);

        // Double click on user message
        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.dblclick();

        // Candidates modal should appear
        await page.waitForSelector('#candidates-modal.show', { state: 'visible', timeout: 1000 });
        let candidatesModal = page.locator('#candidates-modal');
        await expect(candidatesModal).toHaveClass(/show/);
        console.log('[Test] ✓ Candidates modal opened on user message double click');

        // Close modal
        await page.click('#candidates-modal .close-modal');
        await page.waitForSelector('#candidates-modal.show', { state: 'hidden', timeout: 1000 });

        // Double click on computer message
        const computerBubble = page.locator('.computer-message .message-bubble').first();
        await computerBubble.dblclick();

        // Candidates modal should appear again
        await page.waitForSelector('#candidates-modal.show', { state: 'visible', timeout: 1000 });
        candidatesModal = page.locator('#candidates-modal');
        await expect(candidatesModal).toHaveClass(/show/);
        console.log('[Test] ✓ Candidates modal opened on computer message double click');
    });
});
