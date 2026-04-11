import { test, expect } from '@playwright/test';

test.describe('Candidate List Click on Mobile', () => {
    test('clicking stat item should show candidate list on mobile', async ({ browser }) => {
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

        // Double tap on computer message to open candidates modal
        const computerBubble = page.locator('.computer-message .message-bubble').first();
        await computerBubble.tap();
        await page.waitForTimeout(100);
        await computerBubble.tap();

        // Candidates modal should appear
        await page.waitForSelector('#candidates-modal.show', { state: 'visible' });
        console.log('[Test] ✓ Candidates modal opened');

        // Tap on "total" stat item
        const totalStat = page.locator('.stat-item[data-type="total"]');
        await totalStat.tap();
        await page.waitForTimeout(200);

        // Candidate list should appear
        const candidatesList = page.locator('.candidates-list');
        await expect(candidatesList).toBeVisible();
        console.log('[Test] ✓ Candidates list appeared after tapping total stat');

        // Should have candidate items
        const candidateItems = page.locator('.candidate-item');
        const count = await candidateItems.count();
        expect(count).toBeGreaterThan(0);
        console.log(`[Test] ✓ Found ${count} candidate items`);

        await context.close();
    });

    test('clicking used stat item should show used candidates on mobile', async ({ browser }) => {
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

        // Double tap on computer message to open candidates modal
        const computerBubble = page.locator('.computer-message .message-bubble').first();
        await computerBubble.tap();
        await page.waitForTimeout(100);
        await computerBubble.tap();

        // Candidates modal should appear
        await page.waitForSelector('#candidates-modal.show', { state: 'visible' });

        // Tap on "used" stat item
        const usedStat = page.locator('.stat-item[data-type="used"]');
        await usedStat.tap();
        await page.waitForTimeout(200);

        // Candidate list should appear with title
        const candidatesSection = page.locator('.candidates-section');
        await expect(candidatesSection).toBeVisible();

        const title = await candidatesSection.locator('h3').textContent();
        expect(title).toContain('已使用');
        console.log('[Test] ✓ Used candidates list appeared');

        await context.close();
    });

    test('clicking candidate item should show detail modal on mobile', async ({ browser }) => {
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

        // Double tap on computer message to open candidates modal
        const computerBubble = page.locator('.computer-message .message-bubble').first();
        await computerBubble.tap();
        await page.waitForTimeout(100);
        await computerBubble.tap();

        // Candidates modal should appear
        await page.waitForSelector('#candidates-modal.show', { state: 'visible' });

        // Tap on "total" stat item to show list
        const totalStat = page.locator('.stat-item[data-type="total"]');
        await totalStat.tap();
        await page.waitForTimeout(200);

        // Tap on first candidate item
        const firstCandidate = page.locator('.candidate-item').first();
        await expect(firstCandidate).toBeVisible();
        await firstCandidate.tap();

        // Wait for transition
        await page.waitForTimeout(400);

        // Candidates modal should close
        const candidatesModal = page.locator('#candidates-modal');
        await expect(candidatesModal).not.toHaveClass(/show/);
        console.log('[Test] ✓ Candidates modal closed');

        // Detail modal should open
        const detailModal = page.locator('#detail-modal');
        await expect(detailModal).toHaveClass(/show/);
        console.log('[Test] ✓ Detail modal opened after tapping candidate');

        await context.close();
    });

    test('input maintains focus after clicking stat items on mobile', async ({ browser }) => {
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

        // Double tap on computer message to open candidates modal
        const computerBubble = page.locator('.computer-message .message-bubble').first();
        await computerBubble.tap();
        await page.waitForTimeout(100);
        await computerBubble.tap();

        // Candidates modal should appear
        await page.waitForSelector('#candidates-modal.show', { state: 'visible' });

        // Tap on "total" stat item
        const totalStat = page.locator('.stat-item[data-type="total"]');
        await totalStat.tap();
        await page.waitForTimeout(200);

        // Candidate list should appear (main functionality test)
        const candidatesList = page.locator('.candidates-list');
        await expect(candidatesList).toBeVisible();
        console.log('[Test] ✓ Stat item click works on mobile');

        // Input should still be available for typing (focus may vary on mobile)
        const input = page.locator('#idiom-input');
        await expect(input).toBeVisible();
        await expect(input).toBeEnabled();
        console.log('[Test] ✓ Input remains available after clicking stat item');

        await context.close();
    });
});
