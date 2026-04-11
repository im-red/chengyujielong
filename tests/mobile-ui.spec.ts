import { test, expect, Page } from '@playwright/test';

// Helper function to start endless mode
async function startEndlessMode(page: Page) {
    await page.goto('/');
    await page.waitForSelector('.mode-card');

    // Click Endless mode card
    const endlessCard = page.locator('.mode-card[data-mode="endless"]');
    await endlessCard.click();

    // Wait for game to start
    await page.waitForSelector('#idiom-input');
}

test.describe('Mobile UI - Android Specific Issues', () => {
    test.use({
        ...test.use,
        viewport: { width: 375, height: 667 } // iPhone SE size for mobile testing
    });

    test('should not truncate give up button text', async ({ page }) => {
        console.log('[Test] Testing give up button is not truncated');

        await startEndlessMode(page);

        // Find give up button
        const giveUpBtn = page.locator('#giveup-btn');
        await expect(giveUpBtn).toBeVisible();

        // Get button dimensions and text
        const buttonBox = await giveUpBtn.boundingBox();
        const buttonText = await giveUpBtn.textContent();

        console.log('[Test] Button text:', buttonText);
        console.log('[Test] Button width:', buttonBox?.width);

        // Verify button has minimum width (60px is sufficient for "放弃")
        expect(buttonBox?.width).toBeGreaterThanOrEqual(60);
        console.log('[Test] ✓ Button width is sufficient');

        // Verify text is visible (not empty)
        expect(buttonText?.trim()).toBe('放弃');
        console.log('[Test] ✓ Button text is correct');

        // Check if text is truncated by comparing computed style
        const isOverflowing = await giveUpBtn.evaluate((el) => {
            return el.scrollWidth > el.clientWidth;
        });

        expect(isOverflowing).toBe(false);
        console.log('[Test] ✓ Button text is not truncated');
    });

    test.skip('should keep candidates modal open after long press release', async ({ page }) => {
        console.log('[Test] Testing candidates modal stays open on release');

        await startEndlessMode(page);

        // Get first message bubble
        const firstBubble = page.locator('.message-bubble').first();
        await expect(firstBubble).toBeVisible();

        // Simulate long press using touch events
        await firstBubble.hover();
        await page.mouse.down();

        console.log('[Test] Holding for 600ms...');
        await page.waitForTimeout(600); // Long press duration

        // Verify modal opened
        const modal = page.locator('#candidates-modal.show');
        await expect(modal).toBeVisible();
        console.log('[Test] ✓ Modal opened on long press');

        // Release the press
        await page.mouse.up();
        console.log('[Test] Released press');

        // Wait a bit to ensure modal doesn't close
        await page.waitForTimeout(500);

        // Verify modal is still visible
        await expect(modal).toBeVisible();
        console.log('[Test] ✓ Modal stayed open after release');

        // Verify modal content is visible
        const stats = page.locator('.candidates-stats');
        await expect(stats).toBeVisible();
        console.log('[Test] ✓ Modal content is visible');
    });

    test.skip('should close candidates modal on backdrop click', async ({ page }) => {
        console.log('[Test] Testing modal closes on backdrop click');

        await startEndlessMode(page);

        // Get first message bubble
        const firstBubble = page.locator('.message-bubble').first();
        await expect(firstBubble).toBeVisible();

        // Open modal with long press
        await firstBubble.hover();
        await page.mouse.down();
        await page.waitForTimeout(600);
        await page.mouse.up();

        // Verify modal opened
        const modal = page.locator('#candidates-modal.show');
        await expect(modal).toBeVisible();
        console.log('[Test] ✓ Modal opened');

        // Wait for modal to be fully ready (past the 300ms protection period)
        await page.waitForTimeout(400);

        // Click on backdrop (the modal element itself, not its content)
        await modal.click({ position: { x: 10, y: 10 } });

        // Wait a bit for animation
        await page.waitForTimeout(300);

        // Verify modal closed
        await expect(modal).not.toBeVisible();
        console.log('[Test] ✓ Modal closed on backdrop click');
    });

    test.skip('should close candidates modal on close button click', async ({ page }) => {
        console.log('[Test] Testing modal closes on close button');

        await startEndlessMode(page);

        // Get first message bubble
        const firstBubble = page.locator('.message-bubble').first();
        await expect(firstBubble).toBeVisible();

        // Open modal with long press
        await firstBubble.hover();
        await page.mouse.down();
        await page.waitForTimeout(600);
        await page.mouse.up();

        // Verify modal opened
        const modal = page.locator('#candidates-modal.show');
        await expect(modal).toBeVisible();
        console.log('[Test] ✓ Modal opened');

        // Click close button
        const closeBtn = modal.locator('.close-modal');
        await closeBtn.click();

        // Wait a bit for animation
        await page.waitForTimeout(300);

        // Verify modal closed
        await expect(modal).not.toBeVisible();
        console.log('[Test] ✓ Modal closed on close button click');
    });

    test('should not open modal on short tap', async ({ page }) => {
        console.log('[Test] Testing modal does not open on short tap');

        await startEndlessMode(page);

        // Get first message bubble
        const firstBubble = page.locator('.message-bubble').first();
        await expect(firstBubble).toBeVisible();

        // Simulate short tap (less than 500ms)
        await firstBubble.hover();
        await page.mouse.down();
        await page.waitForTimeout(200); // Short duration
        await page.mouse.up();

        // Wait a bit
        await page.waitForTimeout(300);

        // Verify candidates modal did NOT open
        const candidatesModal = page.locator('#candidates-modal.show');
        await expect(candidatesModal).not.toBeVisible();
        console.log('[Test] ✓ Candidates modal did not open on short tap');

        // Verify detail modal opened instead (short tap opens detail)
        const detailModal = page.locator('#detail-modal.show');
        await expect(detailModal).toBeVisible();
        console.log('[Test] ✓ Detail modal opened on short tap');
    });
});

test.describe('Mobile UI - Button Layout', () => {
    test.use({
        ...test.use,
        viewport: { width: 320, height: 568 } // iPhone 5/SE size (smallest common mobile)
    });

    test('should fit all buttons in input group on small screens', async ({ page }) => {
        console.log('[Test] Testing button layout on small screen');

        await startEndlessMode(page);

        // Get input group
        const inputGroup = page.locator('.input-group');
        await expect(inputGroup).toBeVisible();

        // Get all buttons in input group
        const submitBtn = page.locator('#submit-btn');
        const giveUpBtn = page.locator('#giveup-btn');

        // Verify all buttons are visible
        await expect(submitBtn).toBeVisible();
        await expect(giveUpBtn).toBeVisible();
        console.log('[Test] ✓ All buttons visible');

        // Get button positions
        const submitBox = await submitBtn.boundingBox();
        const giveUpBox = await giveUpBtn.boundingBox();

        console.log('[Test] Submit button:', submitBox);
        console.log('[Test] Give up button:', giveUpBox);

        // Verify buttons are not overlapping
        if (submitBox && giveUpBox) {
            const submitRight = submitBox.x + submitBox.width;
            const giveUpLeft = giveUpBox.x;

            // Buttons should not overlap (with small tolerance for gap)
            expect(submitRight).toBeLessThanOrEqual(giveUpLeft + 5);
            console.log('[Test] ✓ Buttons do not overlap');
        }

        // Verify buttons are within viewport (accounting for container padding)
        const viewportWidth = page.viewportSize()?.width || 0;
        if (giveUpBox) {
            // Just check that the button doesn't overflow the viewport
            expect(giveUpBox.x + giveUpBox.width).toBeLessThanOrEqual(viewportWidth);
            console.log('[Test] ✓ Buttons fit within viewport');
        }
    });

    test('should have minimum touch target size for all buttons', async ({ page }) => {
        console.log('[Test] Testing minimum touch target size');

        await startEndlessMode(page);

        // Get all interactive buttons
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

            // Verify minimum 44x44px touch target (iOS guideline)
            expect(box?.width).toBeGreaterThanOrEqual(44);
            expect(box?.height).toBeGreaterThanOrEqual(44);
            console.log(`[Test] ✓ ${button.name} button meets minimum touch target`);
        }
    });

    test('should not lose focus during submission (keyboard stability)', async ({ page }) => {
        console.log('[Test] Testing keyboard stability during submission');

        await startEndlessMode(page);

        const input = page.locator('#idiom-input');

        // Focus input
        await input.focus();
        await page.waitForTimeout(100);

        // Track focus changes
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

        // Get first computer message
        const firstMessage = await page.locator('.computer-message .message-bubble').first().textContent();
        console.log('[Test] First computer message:', firstMessage);

        // Find a valid response
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

        // Submit idiom
        await input.fill(testIdiom);
        await page.click('#submit-btn');

        // Check immediately if focus was lost
        await page.waitForTimeout(50);
        const focusLostImmediately = await page.evaluate(() => (window as any).focusLost);
        expect(focusLostImmediately).toBeFalsy();
        console.log('[Test] ✓ Focus not lost immediately after submission');

        // Check after short delay
        await page.waitForTimeout(200);
        const focusLostAfterDelay = await page.evaluate(() => (window as any).focusLost);
        expect(focusLostAfterDelay).toBeFalsy();
        console.log('[Test] ✓ Focus not lost after delay');

        // Verify input still has focus
        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input maintains focus throughout submission');
    });

    test('should submit idiom when send button is clicked', async ({ page }) => {
        console.log('[Test] Testing send button functionality');

        await startEndlessMode(page);

        const input = page.locator('#idiom-input');
        const submitBtn = page.locator('#submit-btn');

        // Get initial message count
        const initialCount = await page.locator('.message').count();
        console.log('[Test] Initial message count:', initialCount);

        // Get first computer message
        const firstMessage = await page.locator('.computer-message .message-bubble').first().textContent();
        console.log('[Test] First computer message:', firstMessage);

        // Find a valid response
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

        // Fill input and click send button
        await input.fill(testIdiom);
        await submitBtn.click();

        // Wait for message to be added
        await page.waitForTimeout(500);

        // Check that message was added
        const finalCount = await page.locator('.message').count();
        console.log('[Test] Final message count:', finalCount);
        expect(finalCount).toBeGreaterThan(initialCount);
        console.log('[Test] ✓ Send button works correctly');

        // Verify input was cleared
        const inputValue = await input.inputValue();
        expect(inputValue).toBe('');
        console.log('[Test] ✓ Input cleared after submission');
    });

    test('should maintain focus after give up button is clicked', async ({ page }) => {
        console.log('[Test] Testing focus retention after give up');

        await startEndlessMode(page);

        const input = page.locator('#idiom-input');
        const giveUpBtn = page.locator('#giveup-btn');

        // Focus input
        await input.focus();
        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input initially focused');

        // Get initial message count
        const initialCount = await page.locator('.message').count();
        console.log('[Test] Initial message count:', initialCount);

        // Click give up button
        await giveUpBtn.click();

        // Wait for computer to respond
        await page.waitForTimeout(500);

        // Check that computer added a message
        const finalCount = await page.locator('.message').count();
        console.log('[Test] Final message count:', finalCount);
        expect(finalCount).toBeGreaterThan(initialCount);
        console.log('[Test] ✓ Computer responded after give up');

        // Verify input still has focus
        await expect(input).toBeFocused();
        console.log('[Test] ✓ Input focus maintained after give up');
    });
});
