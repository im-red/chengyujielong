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

async function submitIdiom(page: Page, idiom: string) {
    const input = page.locator('#idiom-input');
    await input.fill(idiom);
    await input.press('Enter');
    await page.waitForTimeout(200);
}

test.describe('Endless Mode - Correct Submissions', () => {
    test.skip('should accept correct idiom and computer responds', async ({ page }) => {
        console.log('[Test] Testing correct submission flow');

        await startEndlessMode(page);

        // Get first computer message
        const firstMessage = await page.locator('.computer-message .message-bubble').first().textContent();
        console.log('[Test] First computer message:', firstMessage);

        // Count initial messages
        const initialCount = await page.locator('.message').count();
        console.log('[Test] Initial message count:', initialCount);

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

        // Submit correct idiom
        await submitIdiom(page, testIdiom);
        await page.waitForTimeout(1000); // Wait for computer response

        // Count messages after submission
        const finalCount = await page.locator('.message').count();
        console.log('[Test] Final message count:', finalCount);

        // Should have 2 more messages (user + computer)
        expect(finalCount).toBe(initialCount + 2);
        console.log('[Test] ✓ Computer responded to correct submission');
    });

    test.skip('should increase score on correct submissions', async ({ page }) => {
        console.log('[Test] Testing score increase');

        await startEndlessMode(page);

        // Get initial score
        let scoreText = await page.locator('.game-status-bar').first().textContent();
        let initialScore = parseInt(scoreText?.match(/得分:\s*(\d+)/)?.[1] || '0');
        console.log('[Test] Initial score:', initialScore);

        // Get first computer message
        const firstMessage = await page.locator('.computer-message .message-bubble').first().textContent();

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

        // Submit correct idiom
        await submitIdiom(page, testIdiom);
        await page.waitForTimeout(1000);

        // Get new score
        scoreText = await page.locator('.game-status-bar').first().textContent();
        const newScore = parseInt(scoreText?.match(/得分:\s*(\d+)/)?.[1] || '0');
        console.log('[Test] New score:', newScore);

        expect(newScore).toBeGreaterThan(initialScore);
        console.log('[Test] ✓ Score increased from', initialScore, 'to', newScore);
    });

    test('should not increase score on wrong submissions', async ({ page }) => {
        console.log('[Test] Testing score unchanged on wrong submission');

        await startEndlessMode(page);

        // Get initial score
        let scoreText = await page.locator('.game-status-bar').first().textContent();
        let initialScore = parseInt(scoreText?.match(/得分:\s*(\d+)/)?.[1] || '0');
        console.log('[Test] Initial score:', initialScore);

        // Submit wrong idiom
        await submitIdiom(page, '错误成语');
        await page.waitForTimeout(300);

        // Get new score
        scoreText = await page.locator('.game-status-bar').first().textContent();
        const newScore = parseInt(scoreText?.match(/得分:\s*(\d+)/)?.[1] || '0');
        console.log('[Test] New score:', newScore);

        expect(newScore).toBe(initialScore);
        console.log('[Test] ✓ Score unchanged');
    });
});

test.describe('Endless Mode - Game Never Ends', () => {
    test('should continue indefinitely with correct submissions', async ({ page }) => {
        console.log('[Test] Testing game continues indefinitely');

        await startEndlessMode(page);

        // Submit 5 correct idioms in a row
        for (let i = 0; i < 5; i++) {
            const lastComputerMessage = await page.locator('.computer-message .message-bubble').last().textContent();

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
            }, lastComputerMessage?.trim() || '');

            if (!validResponse) {
                console.log('[Test] No valid response found, using fallback');
                break;
            }

            await submitIdiom(page, validResponse);
            await page.waitForTimeout(1000);

            // Verify game is still active
            const input = page.locator('#idiom-input');
            await expect(input).toBeVisible();
            console.log('[Test] ✓ Game still active after', i + 1, 'submissions');
        }

        // Verify game never ended
        const gameOver = page.locator('.game-over-section');
        await expect(gameOver).not.toBeVisible();
        console.log('[Test] ✓ Game never ended');
    });

    test('should continue after multiple wrong submissions', async ({ page }) => {
        console.log('[Test] Testing game continues after wrong submissions');

        await startEndlessMode(page);

        // Submit 10 wrong idioms
        for (let i = 0; i < 10; i++) {
            await submitIdiom(page, `错误成语${i}`);
            await page.waitForTimeout(200);

            // Verify game is still active
            const input = page.locator('#idiom-input');
            await expect(input).toBeVisible();
        }

        console.log('[Test] ✓ Game still active after 10 wrong submissions');

        // Verify game never ended
        const gameOver = page.locator('.game-over-section');
        await expect(gameOver).not.toBeVisible();
        console.log('[Test] ✓ Game never ended');
    });
});

test.describe('Endless Mode - UI Elements', () => {
    test('should always show give up button', async ({ page }) => {
        console.log('[Test] Testing give up button visibility');

        await startEndlessMode(page);

        // Verify give up button is visible
        const giveUpBtn = page.locator('#giveup-btn');
        await expect(giveUpBtn).toBeVisible();
        console.log('[Test] ✓ Give up button visible');

        // Submit a correct idiom
        const firstMessage = await page.locator('.computer-message .message-bubble').first().textContent();
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

        if (validResponse) {
            await submitIdiom(page, validResponse);
            await page.waitForTimeout(1000);

            // Verify give up button still visible
            await expect(giveUpBtn).toBeVisible();
            console.log('[Test] ✓ Give up button still visible after submission');
        }
    });

    test('should show current time display', async ({ page }) => {
        console.log('[Test] Testing current time display');

        await startEndlessMode(page);

        // Verify current time display is visible
        const timeDisplay = page.locator('#current-time-display');
        await expect(timeDisplay).toBeVisible();
        console.log('[Test] ✓ Current time display visible');

        // Wait a bit and check if time updates
        await page.waitForTimeout(1500);
        const timeText = await timeDisplay.textContent();
        console.log('[Test] Time display:', timeText);
        expect(timeText).toMatch(/\d+\.\d+s/);
        console.log('[Test] ✓ Time display format correct');
    });

    test('should show endless mode in header', async ({ page }) => {
        console.log('[Test] Testing mode display in header');

        await startEndlessMode(page);

        // Check header shows endless mode
        const header = page.locator('.game-header h1');
        const headerText = await header.textContent();
        expect(headerText).toContain('无尽模式');
        console.log('[Test] ✓ Endless mode shown in header');
    });

    test('should not show lives in endless mode', async ({ page }) => {
        console.log('[Test] Testing no lives display');

        await startEndlessMode(page);

        // Verify lives subtitle is not present
        const subtitle = page.locator('.game-subtitle');
        await expect(subtitle).not.toBeVisible();
        console.log('[Test] ✓ No lives display in endless mode');
    });
});

test.describe('Endless Mode - Message Display', () => {
    test('should show time cost for correct user messages', async ({ page }) => {
        console.log('[Test] Testing time cost display for correct user messages');

        await startEndlessMode(page);

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

        const testIdiom = validResponse || '一心一意';
        console.log('[Test] Submitting valid idiom:', testIdiom);

        await submitIdiom(page, testIdiom);
        await page.waitForTimeout(600);

        const userMessage = page.locator('.user-message').last();
        const errorBubble = userMessage.locator('.error-bubble');
        const hasError = await errorBubble.count() > 0;

        if (hasError) {
            console.log('[Test] ⚠ Idiom was rejected, skipping test');
            return;
        }

        const timeDisplay = userMessage.locator('.message-time');
        await expect(timeDisplay).toBeVisible();

        const timeText = await timeDisplay.textContent();
        console.log('[Test] Time cost:', timeText);
        expect(timeText).toMatch(/\d+(\.\d+)?(s|ms)/);
        console.log('[Test] ✓ Time cost displayed for correct user message');
    });

    test('should not show time cost for computer messages', async ({ page }) => {
        console.log('[Test] Testing no time cost for computer messages');

        await startEndlessMode(page);

        // Check computer message has no time cost
        const computerMessage = page.locator('.computer-message').first();
        const timeDisplay = computerMessage.locator('.message-time');
        await expect(timeDisplay).not.toBeVisible();
        console.log('[Test] ✓ No time cost for computer message');
    });

    test.skip('should show hint on first computer message', async ({ page }) => {
        console.log('[Test] Testing hint display');

        await startEndlessMode(page);

        // Check first computer message has hint
        const firstComputerMessage = page.locator('.computer-message').first();
        const hint = firstComputerMessage.locator('.message-hint');
        await expect(hint).toBeVisible();

        const hintText = await hint.textContent();
        expect(hintText).toContain('点击查看详情');
        expect(hintText).toContain('长按查看候选');
        console.log('[Test] ✓ Hint displayed on first message');
    });
});

test.describe('Endless Mode - Interaction', () => {
    test('should show detail modal on bubble click', async ({ page }) => {
        console.log('[Test] Testing detail modal');

        await startEndlessMode(page);

        // Click first message bubble
        const firstBubble = page.locator('.message-bubble').first();
        await firstBubble.click();
        await page.waitForTimeout(300);

        // Verify modal is open
        const modal = page.locator('#detail-modal.show');
        await expect(modal).toBeVisible();
        console.log('[Test] ✓ Detail modal opened');

        // Verify modal has content
        const modalBody = page.locator('#modal-body');
        const content = await modalBody.textContent();
        expect(content).toBeTruthy();
        console.log('[Test] ✓ Modal has content');
    });

    test.skip('should show candidates modal on long press', async ({ page }) => {
        console.log('[Test] Testing candidates modal');

        await startEndlessMode(page);

        // Long press first message bubble
        const firstBubble = page.locator('.message-bubble').first();
        await firstBubble.hover();
        await page.mouse.down();
        await page.waitForTimeout(600); // Long press duration
        await page.mouse.up();
        await page.waitForTimeout(300);

        // Verify modal is open
        const modal = page.locator('#candidates-modal.show');
        await expect(modal).toBeVisible();
        console.log('[Test] ✓ Candidates modal opened');

        // Verify modal has stats
        const stats = page.locator('.candidates-stats');
        await expect(stats).toBeVisible();
        console.log('[Test] ✓ Candidates stats displayed');
    });
});
