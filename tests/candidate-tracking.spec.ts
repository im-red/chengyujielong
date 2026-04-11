import { test, expect } from '@playwright/test';

test.describe('Candidate Tracking', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test.skip('should accurately track used and unused candidates', async ({ page }) => {
        console.log('[Test] Testing candidate tracking accuracy');

        // Start endless mode
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('.game-container');

        // Get first computer message
        const firstMessage = await page.locator('.computer-message .message-bubble').first().textContent();
        console.log('[Test] First computer message:', firstMessage?.trim());

        // Get all candidates for this idiom
        const candidatesInfo = await page.evaluate((idiom) => {
            // @ts-ignore
            const lib = window.idiomLib;
            const allCandidates = lib.getCandidateList(idiom);
            const unusedCandidates = lib.getUnusedCandidateList(idiom);
            return {
                total: allCandidates.length,
                unused: unusedCandidates.length,
                allCandidates: allCandidates,
                unusedCandidates: unusedCandidates
            };
        }, firstMessage?.trim() || '');

        console.log('[Test] Initial candidates - Total:', candidatesInfo.total, 'Unused:', candidatesInfo.unused);

        // Skip test if there are no unused candidates (edge case)
        if (candidatesInfo.unused === 0) {
            console.log('[Test] ⚠ No unused candidates available, skipping test');
            test.skip();
            return;
        }

        expect(candidatesInfo.total).toBe(candidatesInfo.unused);
        console.log('[Test] ✓ Initially all candidates are unused');

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

        if (!validResponse) {
            console.log('[Test] ⚠ No valid response found, skipping test');
            test.skip();
            return;
        }

        console.log('[Test] Submitting idiom:', validResponse);

        // Submit the idiom
        const input = page.locator('#idiom-input');
        await input.fill(validResponse);
        await page.click('#submit-btn');

        // Wait for computer response
        await page.waitForTimeout(1000);

        // Check candidates after submission
        const candidatesAfter = await page.evaluate((idiom) => {
            // @ts-ignore
            const lib = window.idiomLib;
            const allCandidates = lib.getCandidateList(idiom);
            const unusedCandidates = lib.getUnusedCandidateList(idiom);
            return {
                total: allCandidates.length,
                unused: unusedCandidates.length
            };
        }, firstMessage?.trim() || '');

        console.log('[Test] After submission - Total:', candidatesAfter.total, 'Unused:', candidatesAfter.unused);

        // The user's idiom should have been removed from the unused list
        // So unused should be one less than the initial count
        expect(candidatesAfter.unused).toBe(candidatesInfo.unused - 1);
        console.log('[Test] ✓ Unused candidates decreased by 1 after user submission');

        // Long press on the first computer message to show candidates modal
        const firstBubble = page.locator('.computer-message .message-bubble').first();
        await firstBubble.hover();

        // Simulate long press
        await page.mouse.down();
        await page.waitForTimeout(600);
        await page.mouse.up();

        // Wait for modal to open
        await page.waitForSelector('#candidates-modal.show', { timeout: 2000 });
        console.log('[Test] ✓ Candidates modal opened');

        // Get the displayed stats
        const displayedStats = await page.evaluate(() => {
            const totalElement = document.querySelector('.stat-item[data-type="total"] .stat-value');
            const usedElement = document.querySelector('.stat-item[data-type="used"] .stat-value');
            const unusedElement = document.querySelector('.stat-item[data-type="unused"] .stat-value');

            return {
                total: parseInt(totalElement?.textContent || '0'),
                used: parseInt(usedElement?.textContent || '0'),
                unused: parseInt(unusedElement?.textContent || '0')
            };
        });

        console.log('[Test] Displayed stats - Total:', displayedStats.total, 'Used:', displayedStats.used, 'Unused:', displayedStats.unused);

        // Verify the stats match the actual library state
        expect(displayedStats.total).toBe(candidatesAfter.total);
        expect(displayedStats.unused).toBe(candidatesAfter.unused);
        expect(displayedStats.used).toBe(candidatesAfter.total - candidatesAfter.unused);
        console.log('[Test] ✓ Displayed stats match library state');

        // Click on "used" to see the list
        await page.click('.stat-item[data-type="used"]');
        await page.waitForTimeout(200);

        // Get the used candidates list
        const usedList = await page.evaluate(() => {
            const items = document.querySelectorAll('.candidates-list .candidate-item');
            return Array.from(items).map(item => item.textContent?.trim() || '');
        });

        console.log('[Test] Used candidates displayed:', usedList.length);
        expect(usedList.length).toBe(displayedStats.used);
        console.log('[Test] ✓ Used candidates list matches count');

        // Verify the submitted idiom is in the used list
        expect(usedList).toContain(validResponse);
        console.log('[Test] ✓ Submitted idiom is in used list');
    });
});
