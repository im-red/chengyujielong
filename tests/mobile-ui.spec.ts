import { test, expect, Page } from '@playwright/test';

async function startEndlessMode(page: Page) {
    await page.goto('/');
    await page.waitForSelector('.mode-card');

    const endlessCard = page.locator('.mode-card[data-mode="endless"]');
    await endlessCard.click();

    await page.waitForSelector('#idiom-input');
}

test.describe('Mobile UI - Android Specific Issues', () => {
    test.use({
        ...test.use,
        viewport: { width: 375, height: 667 }
    });

    test('should not truncate give up button text', async ({ page }) => {
        console.log('[Test] Testing give up button is not truncated');

        await startEndlessMode(page);

        const giveUpBtn = page.locator('#giveup-btn');
        await expect(giveUpBtn).toBeVisible();

        const buttonBox = await giveUpBtn.boundingBox();
        const buttonText = await giveUpBtn.textContent();

        console.log('[Test] Button text:', buttonText);
        console.log('[Test] Button width:', buttonBox?.width);

        expect(buttonBox?.width).toBeGreaterThanOrEqual(60);
        console.log('[Test] ✓ Button width is sufficient');

        expect(buttonText?.trim()).toBe('放弃');
        console.log('[Test] ✓ Button text is correct');

        const isOverflowing = await giveUpBtn.evaluate((el) => {
            return el.scrollWidth > el.clientWidth;
        });

        expect(isOverflowing).toBe(false);
        console.log('[Test] ✓ Button text is not truncated');
    });

    test('should keep candidates modal open after long press release', async ({ page }) => {
        console.log('[Test] Testing candidates modal stays open on release');

        await startEndlessMode(page);

        const firstBubble = page.locator('.computer-message .message-bubble').first();
        await expect(firstBubble).toBeVisible();

        await firstBubble.click({ button: 'right' });

        console.log('[Test] Right-clicked to open modal');

        const modal = page.locator('#candidates-modal.show');
        await expect(modal).toBeVisible();
        console.log('[Test] ✓ Modal opened on right-click');

        await page.waitForTimeout(500);

        await expect(modal).toBeVisible();
        console.log('[Test] ✓ Modal stayed open');

        const stats = page.locator('.candidates-stats');
        await expect(stats).toBeVisible();
        console.log('[Test] ✓ Modal content is visible');
    });

    test('should close candidates modal on backdrop click', async ({ page }) => {
        console.log('[Test] Testing modal closes on backdrop click');

        await startEndlessMode(page);

        const firstBubble = page.locator('.computer-message .message-bubble').first();
        await expect(firstBubble).toBeVisible();

        await firstBubble.click({ button: 'right' });

        const modal = page.locator('#candidates-modal.show');
        await expect(modal).toBeVisible();
        console.log('[Test] ✓ Modal opened');

        await page.waitForTimeout(400);

        await modal.click({ position: { x: 10, y: 10 } });

        await page.waitForTimeout(300);

        await expect(modal).not.toBeVisible();
        console.log('[Test] ✓ Modal closed on backdrop click');
    });

    test('should close candidates modal on close button click', async ({ page }) => {
        console.log('[Test] Testing modal closes on close button');

        await startEndlessMode(page);

        const firstBubble = page.locator('.computer-message .message-bubble').first();
        await expect(firstBubble).toBeVisible();

        await firstBubble.click({ button: 'right' });

        const modal = page.locator('#candidates-modal.show');
        await expect(modal).toBeVisible();
        console.log('[Test] ✓ Modal opened');

        const closeBtn = modal.locator('.close-modal');
        await closeBtn.click();

        await page.waitForTimeout(300);

        await expect(modal).not.toBeVisible();
        console.log('[Test] ✓ Modal closed on close button click');
    });

    test('should not open modal on short tap', async ({ page }) => {
        console.log('[Test] Testing modal does not open on short tap');

        await startEndlessMode(page);

        const firstBubble = page.locator('.message-bubble').first();
        await expect(firstBubble).toBeVisible();

        await firstBubble.hover();
        await page.mouse.down();
        await page.waitForTimeout(200);
        await page.mouse.up();

        await page.waitForTimeout(300);

        const candidatesModal = page.locator('#candidates-modal.show');
        await expect(candidatesModal).not.toBeVisible();
        console.log('[Test] ✓ Candidates modal did not open on short tap');

        const detailModal = page.locator('#detail-modal.show');
        await expect(detailModal).toBeVisible();
        console.log('[Test] ✓ Detail modal opened on short tap');
    });
});

test.describe('Mobile UI - Button Layout', () => {
    test.use({
        ...test.use,
        viewport: { width: 320, height: 568 }
    });

    test('should fit all buttons in input group on small screens', async ({ page }) => {
        console.log('[Test] Testing button layout on small screen');

        await startEndlessMode(page);

        const inputGroup = page.locator('.input-group');
        await expect(inputGroup).toBeVisible();

        const submitBtn = page.locator('#submit-btn');
        const giveUpBtn = page.locator('#giveup-btn');

        await expect(submitBtn).toBeVisible();
        await expect(giveUpBtn).toBeVisible();
        console.log('[Test] ✓ All buttons visible');

        const submitBox = await submitBtn.boundingBox();
        const giveUpBox = await giveUpBtn.boundingBox();

        console.log('[Test] Submit button:', submitBox);
        console.log('[Test] Give up button:', giveUpBox);

        if (submitBox && giveUpBox) {
            const submitRight = submitBox.x + submitBox.width;
            const giveUpLeft = giveUpBox.x;

            expect(submitRight).toBeLessThanOrEqual(giveUpLeft + 5);
            console.log('[Test] ✓ Buttons do not overlap');
        }

        const viewportWidth = page.viewportSize()?.width || 0;
        if (giveUpBox) {
            expect(giveUpBox.x + giveUpBox.width).toBeLessThanOrEqual(viewportWidth);
            console.log('[Test] ✓ Buttons fit within viewport');
        }
    });

    test('should have minimum touch target size for all buttons', async ({ page }) => {
        console.log('[Test] Testing minimum touch target size');

        await startEndlessMode(page);

        const submitBtn = page.locator('#submit-btn');
        const giveUpBtn = page.locator('#giveup-btn');
        const backBtn = page.locator('#back-btn');

        const buttons = [
            { name: 'Submit', locator: submitBtn },
            { name: 'Give Up', locator: giveUpBtn },
            { name: 'Back', locator: backBtn }
        ];

        for (const button of buttons) {
            await expect(button.locator).toBeVisible();
            const box = await button.locator.boundingBox();

            console.log(`[Test] ${button.name} button:`, box);

            expect(box?.width).toBeGreaterThanOrEqual(44);
            expect(box?.height).toBeGreaterThanOrEqual(44);
            console.log(`[Test] ✓ ${button.name} button meets minimum touch target`);
        }
    });

    test('should not lose focus during submission (keyboard stability)', async ({ page }) => {
        console.log('[Test] Testing keyboard stability during submission');

        await startEndlessMode(page);

        const input = page.locator('#idiom-input');

        await input.focus();
        await page.waitForTimeout(100);

        await page.evaluate(() => {
            const input = document.getElementById('idiom-input');
            if (input) {
                input.addEventListener('blur', () => {
                    (window as any).focusLost = true;
                    console.log('[Focus] Input lost focus');
                });
                input.addEventListener('focus', () => {
                    console.log('[Focus] Input gained focus');
                });
            }
        });

        const firstMessage = await page.locator('.computer-message .message-bubble').first().textContent();
        console.log('[Test] First computer message:', firstMessage);

        const validResponse = await page.evaluate((idiom) => {
            try {
                // @ts-ignore
                const lib = window.idiomLib;
                if (lib && typeof lib.getUnusedCandidateList === 'function') {
                    const candidates = lib.getUnusedCandidateList(idiom);
                    return candidates && candidates.length > 0 ? candidates[0] : null;
                }
            } catch (e) {
                console.error('Error getting candidates:', e);
            }
            return null;
        }, firstMessage?.trim() || '');

        const testIdiom = validResponse || '身体力行';
        console.log('[Test] Submitting:', testIdiom);

        await input.fill(testIdiom);
        await page.click('#submit-btn');

        await page.waitForTimeout(50);
        const focusLostImmediately = await page.evaluate(() => (window as any).focusLost);
        expect(focusLostImmediately).toBeFalsy();
        console.log('[Test] ✓ Focus not lost immediately after submission');

        await page.waitForTimeout(200);
        const focusLostAfterDelay = await page.evaluate(() => (window as any).focusLost);
        expect(focusLostAfterDelay).toBeFalsy();
        console.log('[Test] ✓ Focus not lost after delay');

        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input maintains focus throughout submission');
    });

    test('should submit idiom when send button is clicked', async ({ page }) => {
        console.log('[Test] Testing send button functionality');

        await startEndlessMode(page);

        const input = page.locator('#idiom-input');
        const submitBtn = page.locator('#submit-btn');

        const initialCount = await page.locator('.message').count();
        console.log('[Test] Initial message count:', initialCount);

        const firstMessage = await page.locator('.computer-message .message-bubble').first().textContent();
        console.log('[Test] First computer message:', firstMessage);

        const validResponse = await page.evaluate((idiom) => {
            try {
                // @ts-ignore
                const lib = window.idiomLib;
                if (lib && typeof lib.getUnusedCandidateList === 'function') {
                    const candidates = lib.getUnusedCandidateList(idiom);
                    return candidates && candidates.length > 0 ? candidates[0] : null;
                }
            } catch (e) {
                console.error('Error getting candidates:', e);
            }
            return null;
        }, firstMessage?.trim() || '');

        const testIdiom = validResponse || '身体力行';
        console.log('[Test] Submitting:', testIdiom);

        await input.fill(testIdiom);
        await submitBtn.click();

        await page.waitForTimeout(500);

        const finalCount = await page.locator('.message').count();
        console.log('[Test] Final message count:', finalCount);
        expect(finalCount).toBeGreaterThan(initialCount);
        console.log('[Test] ✓ Send button works correctly');

        const inputValue = await input.inputValue();
        expect(inputValue).toBe('');
        console.log('[Test] ✓ Input cleared after submission');
    });

    test('should maintain focus after give up button is clicked', async ({ page }) => {
        console.log('[Test] Testing focus retention after give up');

        await startEndlessMode(page);

        const input = page.locator('#idiom-input');
        const giveUpBtn = page.locator('#giveup-btn');

        await input.focus();
        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input initially focused');

        const initialCount = await page.locator('.message').count();
        console.log('[Test] Initial message count:', initialCount);

        await giveUpBtn.click();

        await page.waitForTimeout(500);

        const finalCount = await page.locator('.message').count();
        console.log('[Test] Final message count:', finalCount);
        expect(finalCount).toBeGreaterThan(initialCount);
        console.log('[Test] ✓ Computer responded after give up');

        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input focus maintained after give up');
    });
});
