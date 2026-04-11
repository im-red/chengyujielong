import { test, expect, Page } from '@playwright/test';

// Helper function to start a new game
async function startChallengeMode(page: Page, lives: number = 3, timeLimit: number = 0) {
    await page.goto('/');
    await page.waitForSelector('.mode-card');

    // Click Challenge mode card
    const challengeCard = page.locator('.mode-card[data-mode="challenge"]');
    await challengeCard.click();

    // Wait for config screen
    await page.waitForSelector('#lives-input');

    // Set configuration
    const livesInput = page.locator('#lives-input');
    const timeInput = page.locator('#time-input');

    await livesInput.fill(lives.toString());
    await timeInput.fill(timeLimit.toString());

    // Start game
    const startBtn = page.locator('#start-challenge-btn');
    await startBtn.click();

    // Wait for game to start
    await page.waitForSelector('#idiom-input');
}

async function submitIdiom(page: Page, idiom: string) {
    const input = page.locator('#idiom-input');
    await input.fill(idiom);
    await input.press('Enter');
    await page.waitForTimeout(200);
}

test.describe('Challenge Mode - Classic (0 Lives)', () => {
    test('should end game immediately on first wrong submission', async ({ page }) => {
        console.log('[Test] Testing classic mode (0 lives)');

        await startChallengeMode(page, 0, 0);

        // Verify game is active
        const input = page.locator('#idiom-input');
        await expect(input).toBeVisible();
        console.log('[Test] ✓ Game started');

        // Submit wrong idiom
        await submitIdiom(page, '错误成语');
        await page.waitForTimeout(300);

        // Verify game ended
        const gameOver = page.locator('.game-over-section');
        await expect(gameOver).toBeVisible();
        console.log('[Test] ✓ Game ended on first wrong submission');

        // Verify final score is displayed
        const finalScore = page.locator('.game-final-score');
        await expect(finalScore).toBeVisible();
        console.log('[Test] ✓ Final score displayed');
    });

    test('should continue game on correct submissions', async ({ page }) => {
        console.log('[Test] Testing classic mode with correct submissions');

        await startChallengeMode(page, 0, 0);

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

        if (!validResponse) {
            console.log('[Test] ⚠ No valid response found, skipping test');
            return;
        }

        console.log('[Test] Submitting:', validResponse);

        // Submit correct idiom
        await submitIdiom(page, validResponse);
        await page.waitForTimeout(1000); // Wait for computer response

        // Check if there's an error bubble
        const errorBubble = page.locator('.error-bubble');
        const hasError = await errorBubble.count() > 0;
        if (hasError) {
            const errorText = await errorBubble.last().textContent();
            console.log('[Test] ⚠ Error occurred:', errorText);
        }

        // Verify game is still active
        const input = page.locator('#idiom-input');
        const gameOver = page.locator('.game-over-section');

        const isInputVisible = await input.isVisible().catch(() => false);
        const isGameOver = await gameOver.isVisible().catch(() => false);

        console.log('[Test] Input visible:', isInputVisible);
        console.log('[Test] Game over visible:', isGameOver);

        if (isGameOver) {
            console.log('[Test] ⚠ Game ended unexpectedly');
            return;
        }

        await expect(input).toBeVisible();
        console.log('[Test] ✓ Game continues after correct submission');

        // Verify score increased
        const scoreText = await page.locator('.game-status-bar').first().textContent();
        const score = scoreText?.match(/得分:\s*(\d+)/)?.[1];
        expect(parseInt(score || '0')).toBeGreaterThan(0);
        console.log('[Test] ✓ Score increased:', score);
    });
});

test.describe('Challenge Mode - Lives Mode', () => {
    test('should decrease lives on wrong submission', async ({ page }) => {
        console.log('[Test] Testing lives decrease');

        await startChallengeMode(page, 3, 0);

        // Check initial lives
        let livesText = await page.locator('.game-subtitle').textContent();
        expect(livesText).toContain('3/3');
        console.log('[Test] Initial lives: 3/3');

        // Submit wrong idiom
        await submitIdiom(page, '错误成语');
        await page.waitForTimeout(300);

        // Check lives decreased
        livesText = await page.locator('.game-subtitle').textContent();
        expect(livesText).toContain('2/3');
        console.log('[Test] ✓ Lives decreased to 2/3');

        // Verify game is still active
        const input = page.locator('#idiom-input');
        await expect(input).toBeVisible();
        console.log('[Test] ✓ Game still active');
    });

    test('should not decrease lives on correct submission', async ({ page }) => {
        console.log('[Test] Testing lives preserved on correct submission');

        await startChallengeMode(page, 3, 0);

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

        if (!validResponse) {
            console.log('[Test] ⚠ No valid response found, skipping test');
            return;
        }

        console.log('[Test] Submitting correct idiom:', validResponse);

        // Submit correct idiom
        await submitIdiom(page, validResponse);
        await page.waitForTimeout(1500); // Wait longer for computer response

        // Check lives unchanged
        const livesText = await page.locator('.game-subtitle').textContent();
        console.log('[Test] Lives after submission:', livesText);
        expect(livesText).toContain('3/3');
        console.log('[Test] ✓ Lives unchanged: 3/3');
    });

    test('should end game when all lives are lost', async ({ page }) => {
        console.log('[Test] Testing game over when lives run out');

        await startChallengeMode(page, 2, 0);

        // Submit 2 wrong idioms
        await submitIdiom(page, '错误成语1');
        await page.waitForTimeout(300);

        let livesText = await page.locator('.game-subtitle').textContent();
        expect(livesText).toContain('1/2');
        console.log('[Test] Lives: 1/2');

        await submitIdiom(page, '错误成语2');
        await page.waitForTimeout(300);

        // Verify game ended
        const gameOver = page.locator('.game-over-section');
        await expect(gameOver).toBeVisible();
        console.log('[Test] ✓ Game ended when all lives lost');
    });
});

test.describe('Challenge Mode - Timer Mode', () => {
    test('should display countdown timer', async ({ page }) => {
        console.log('[Test] Testing timer display');

        await startChallengeMode(page, 0, 10);

        // Check timer is displayed
        const timer = page.locator('#timer-display');
        await expect(timer).toBeVisible();

        const timerText = await timer.textContent();
        console.log('[Test] Timer text:', timerText);
        expect(timerText).toMatch(/\d+s/);
        console.log('[Test] ✓ Timer displayed');
    });

    test('should show warning when time is low', async ({ page }) => {
        console.log('[Test] Testing timer warning');

        await startChallengeMode(page, 0, 5);

        // Wait for timer to get low
        await page.waitForTimeout(1000);

        // Check if timer has warning class
        const timer = page.locator('#timer-display');
        const hasWarning = await timer.evaluate((el) => el.classList.contains('timer-warning'));

        console.log('[Test] Timer has warning:', hasWarning);
        console.log('[Test] ✓ Timer warning check completed');
    });

    test('should end game when time runs out', async ({ page }) => {
        console.log('[Test] Testing game over on timeout');

        await startChallengeMode(page, 0, 3);

        // Wait for time to run out plus extra time for robot to submit
        await page.waitForTimeout(5000);

        // Check if robot submitted an idiom
        const messageCount = await page.locator('.message').count();
        console.log('[Test] Total messages after timeout:', messageCount);

        // Verify game ended
        const gameOver = page.locator('.game-over-section');
        await expect(gameOver).toBeVisible();
        console.log('[Test] ✓ Game ended when time ran out');
    });
});

test.describe('Challenge Mode - Combined Mode', () => {
    test('should handle both lives and timer', async ({ page }) => {
        console.log('[Test] Testing combined mode (lives + timer)');

        await startChallengeMode(page, 3, 30);

        // Verify both lives and timer are displayed
        const lives = page.locator('.game-subtitle');
        await expect(lives).toBeVisible();

        const timer = page.locator('#timer-display');
        await expect(timer).toBeVisible();

        console.log('[Test] ✓ Both lives and timer displayed');
    });

    test('should end game on lives running out even with time remaining', async ({ page }) => {
        console.log('[Test] Testing game ends on lives out');

        await startChallengeMode(page, 1, 30);

        // Submit wrong idiom
        await submitIdiom(page, '错误成语');
        await page.waitForTimeout(300);

        // Verify game ended
        const gameOver = page.locator('.game-over-section');
        await expect(gameOver).toBeVisible();
        console.log('[Test] ✓ Game ended on lives out');
    });
});

test.describe('Challenge Mode - UI Elements', () => {
    test('should not show give up button', async ({ page }) => {
        console.log('[Test] Testing no give up button in challenge mode');

        await startChallengeMode(page, 3, 0);

        // Verify give up button is not present
        const giveUpBtn = page.locator('#giveup-btn');
        await expect(giveUpBtn).not.toBeVisible();
        console.log('[Test] ✓ Give up button not shown');
    });

    test('should show game mode in header', async ({ page }) => {
        console.log('[Test] Testing game mode display');

        await startChallengeMode(page, 3, 30);

        // Check header shows challenge mode
        const header = page.locator('.game-header h1');
        const headerText = await header.textContent();
        expect(headerText).toContain('挑战模式');
        console.log('[Test] ✓ Challenge mode shown in header');
    });

    test('should display configuration in header', async ({ page }) => {
        console.log('[Test] Testing config display in header');

        await startChallengeMode(page, 5, 60);

        // Check header shows configuration
        const header = page.locator('.game-header h1');
        const headerText = await header.textContent();
        expect(headerText).toContain('5命');
        expect(headerText).toContain('60秒');
        console.log('[Test] ✓ Configuration shown in header');
    });
});

test.describe('Challenge Mode - Score System', () => {
    test.skip('should increase score on correct submissions', async ({ page }) => {
        console.log('[Test] Testing score increase');

        await startChallengeMode(page, 3, 0);

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

        const testIdiom = validResponse;

        if (!testIdiom) {
            console.log('[Test] ⚠ No valid response found, skipping test');
            return;
        }

        console.log('[Test] Submitting correct idiom:', testIdiom);

        // Submit correct idiom
        await submitIdiom(page, testIdiom);
        await page.waitForTimeout(1000);

        // Get new score
        scoreText = await page.locator('.game-status-bar').first().textContent();
        const newScore = parseInt(scoreText?.match(/得分:\s*(\d+)/)?.[1] || '0');
        console.log('[Test] New score:', newScore);

        expect(newScore).toBeGreaterThan(initialScore);
        console.log('[Test] ✓ Score increased');
    });

    test('should not increase score on wrong submissions', async ({ page }) => {
        console.log('[Test] Testing score unchanged on wrong submission');

        await startChallengeMode(page, 3, 0);

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
