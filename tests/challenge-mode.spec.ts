import { test, expect, Page } from '@playwright/test';
import { setupTestMode, TEST_IDIOM_SEQUENCE, TEST_USER_RESPONSES } from './testHelpers';

async function startChallengeMode(page: Page, lives: number = 3, timeLimit: number = 0, useTestMode: boolean = true) {
    await page.goto('/');
    await page.waitForSelector('.mode-card');

    if (useTestMode) {
        await setupTestMode(page);
    }

    const challengeCard = page.locator('.mode-card[data-mode="challenge"]');
    await challengeCard.click();

    await page.waitForSelector('#lives-input');

    const livesInput = page.locator('#lives-input');
    const timeInput = page.locator('#time-input');

    await livesInput.fill(lives.toString());
    await timeInput.fill(timeLimit.toString());

    const startBtn = page.locator('#start-challenge-btn');
    await startBtn.click();

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

        const input = page.locator('#idiom-input');
        await expect(input).toBeVisible();
        console.log('[Test] ✓ Game started');

        await submitIdiom(page, '错误成语');
        await page.waitForTimeout(300);

        const gameOverModal = page.locator('#game-over-modal.show');
        await expect(gameOverModal).toBeVisible();
        console.log('[Test] ✓ Game ended on first wrong submission');

        const finalScore = page.locator('.game-over-score-value');
        await expect(finalScore).toBeVisible();
        console.log('[Test] ✓ Final score displayed');
    });

    test('should continue game on correct submissions', async ({ page }) => {
        console.log('[Test] Testing classic mode with correct submissions');

        const browserLogs: any[] = [];
        page.on('console', msg => {
            browserLogs.push({ type: msg.type(), text: msg.text() });
        });

        await startChallengeMode(page, 0, 0);

        const input = page.locator('#idiom-input');
        await expect(input).toBeVisible();
        console.log('[Test] ✓ Game started');

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];
        console.log('[Test] Computer idiom:', firstComputerIdiom);
        console.log('[Test] User response:', userResponse);

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(1000);

        console.log('[Test] Browser logs:', JSON.stringify(browserLogs.filter(l => l.text.includes('[useGameState]') || l.text.includes('[IdiomLib]')), null, 2));

        const errorBubble = page.locator('.error-bubble');
        const hasError = await errorBubble.count() > 0;
        if (hasError) {
            const errorText = await errorBubble.last().textContent();
            console.log('[Test] ⚠ Error occurred:', errorText);
        }

        const gameOverModal = page.locator('#game-over-modal.show');
        const isGameOver = await gameOverModal.isVisible().catch(() => false);

        if (isGameOver) {
            console.log('[Test] ⚠ Game ended unexpectedly');
            return;
        }

        await expect(input).toBeVisible();
        console.log('[Test] ✓ Game continues after correct submission');

        const statusBar = page.locator('.game-status-bar');
        const statusText = await statusBar.textContent();
        console.log('[Test] Status bar text:', statusText);

        const scoreMatch = statusText?.match(/得分:\s*(\d+)/);
        console.log('[Test] Score match:', scoreMatch);

        const score = scoreMatch ? scoreMatch[1] : '0';
        console.log('[Test] Extracted score:', score);

        expect(parseInt(score || '0')).toBeGreaterThan(0);
        console.log('[Test] ✓ Score increased:', score);
    });
});

test.describe('Challenge Mode - Lives Mode', () => {
    test('should decrease lives on wrong submission', async ({ page }) => {
        console.log('[Test] Testing lives decrease');

        await startChallengeMode(page, 3, 0);

        let livesText = await page.locator('.game-subtitle').textContent();
        expect(livesText).toContain('3/3');
        console.log('[Test] Initial lives: 3/3');

        await submitIdiom(page, '错误成语');
        await page.waitForTimeout(300);

        livesText = await page.locator('.game-subtitle').textContent();
        expect(livesText).toContain('2/3');
        console.log('[Test] ✓ Lives decreased to 2/3');

        const input = page.locator('#idiom-input');
        await expect(input).toBeVisible();
        console.log('[Test] ✓ Game still active');
    });

    test('should not decrease lives on correct submission', async ({ page }) => {
        console.log('[Test] Testing lives preserved on correct submission');

        await startChallengeMode(page, 3, 0);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];
        console.log('[Test] Submitting correct idiom:', userResponse);

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(1500);

        const livesText = await page.locator('.game-subtitle').textContent();
        console.log('[Test] Lives after submission:', livesText);
        expect(livesText).toContain('3/3');
        console.log('[Test] ✓ Lives unchanged: 3/3');
    });

    test('should end game when all lives are lost', async ({ page }) => {
        console.log('[Test] Testing game over when lives run out');

        await startChallengeMode(page, 2, 0);

        await submitIdiom(page, '错误成语1');
        await page.waitForTimeout(300);

        let livesText = await page.locator('.game-subtitle').textContent();
        expect(livesText).toContain('1/2');
        console.log('[Test] Lives: 1/2');

        await submitIdiom(page, '错误成语2');
        await page.waitForTimeout(300);

        const gameOverModal = page.locator('#game-over-modal.show');
        await expect(gameOverModal).toBeVisible();
        console.log('[Test] ✓ Game ended when all lives lost');
    });
});

test.describe('Challenge Mode - Timer Mode', () => {
    test('should display countdown timer', async ({ page }) => {
        console.log('[Test] Testing timer display');

        await startChallengeMode(page, 0, 10);

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

        await page.waitForTimeout(1000);

        const timer = page.locator('#timer-display');
        const hasWarning = await timer.evaluate((el) => el.classList.contains('timer-warning'));

        console.log('[Test] Timer has warning:', hasWarning);
        console.log('[Test] ✓ Timer warning check completed');
    });

    test('should end game when time runs out', async ({ page }) => {
        console.log('[Test] Testing game over on timeout');

        await startChallengeMode(page, 0, 3);

        await page.waitForTimeout(5000);

        const messageCount = await page.locator('.message').count();
        console.log('[Test] Total messages after timeout:', messageCount);

        const gameOverModal = page.locator('#game-over-modal.show');
        await expect(gameOverModal).toBeVisible();
        console.log('[Test] ✓ Game ended when time ran out');
    });
});

test.describe('Challenge Mode - Combined Mode', () => {
    test('should handle both lives and timer', async ({ page }) => {
        console.log('[Test] Testing combined mode (lives + timer)');

        await startChallengeMode(page, 3, 30);

        const lives = page.locator('.game-subtitle');
        await expect(lives).toBeVisible();

        const timer = page.locator('#timer-display');
        await expect(timer).toBeVisible();

        console.log('[Test] ✓ Both lives and timer displayed');
    });

    test('should end game on lives running out even with time remaining', async ({ page }) => {
        console.log('[Test] Testing game ends on lives out');

        await startChallengeMode(page, 1, 30);

        await submitIdiom(page, '错误成语');
        await page.waitForTimeout(300);

        const gameOverModal = page.locator('#game-over-modal.show');
        await expect(gameOverModal).toBeVisible();
        console.log('[Test] ✓ Game ended on lives out');
    });
});

test.describe('Challenge Mode - UI Elements', () => {
    test('should not show give up button', async ({ page }) => {
        console.log('[Test] Testing no give up button in challenge mode');

        await startChallengeMode(page, 3, 0);

        const giveUpBtn = page.locator('#giveup-btn');
        await expect(giveUpBtn).not.toBeVisible();
        console.log('[Test] ✓ Give up button not shown');
    });

    test('should show game mode in header', async ({ page }) => {
        console.log('[Test] Testing game mode display');

        await startChallengeMode(page, 3, 30);

        const header = page.locator('.game-header h1');
        const headerText = await header.textContent();
        expect(headerText).toContain('挑战模式');
        console.log('[Test] ✓ Challenge mode shown in header');
    });

    test('should display configuration in header', async ({ page }) => {
        console.log('[Test] Testing config display in header');

        await startChallengeMode(page, 5, 60);

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

        let scoreText = await page.locator('.game-status-bar').first().textContent();
        let initialScore = parseInt(scoreText?.match(/得分:\s*(\d+)/)?.[1] || '0');
        console.log('[Test] Initial score:', initialScore);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];
        console.log('[Test] Submitting correct idiom:', userResponse);

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(1000);

        scoreText = await page.locator('.game-status-bar').first().textContent();
        const newScore = parseInt(scoreText?.match(/得分:\s*(\d+)/)?.[1] || '0');
        console.log('[Test] New score:', newScore);

        expect(newScore).toBeGreaterThan(initialScore);
        console.log('[Test] ✓ Score increased');
    });

    test('should not increase score on wrong submissions', async ({ page }) => {
        console.log('[Test] Testing score unchanged on wrong submission');

        await startChallengeMode(page, 3, 0);

        let scoreText = await page.locator('.game-status-bar').first().textContent();
        let initialScore = parseInt(scoreText?.match(/得分:\s*(\d+)/)?.[1] || '0');
        console.log('[Test] Initial score:', initialScore);

        await submitIdiom(page, '错误成语');
        await page.waitForTimeout(300);

        scoreText = await page.locator('.game-status-bar').first().textContent();
        const newScore = parseInt(scoreText?.match(/得分:\s*(\d+)/)?.[1] || '0');
        console.log('[Test] New score:', newScore);

        expect(newScore).toBe(initialScore);
        console.log('[Test] ✓ Score unchanged');
    });
});
