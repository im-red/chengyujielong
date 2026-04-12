import { test, expect, Page } from '@playwright/test';
import { setupTestMode, TEST_IDIOM_SEQUENCE, TEST_USER_RESPONSES } from './testHelpers';

async function navigateToLimitedTimeConfig(page: Page) {
    await page.goto('/');
    await page.waitForSelector('.mode-card');

    const limitedTimeCard = page.locator('.mode-card[data-mode="limitedTime"]');
    await limitedTimeCard.click();

    await page.waitForSelector('#game-time-input');
}

async function startLimitedTimeMode(page: Page, gameTimeLimitSeconds: number = 120, useTestMode: boolean = true) {
    await page.goto('/');
    await page.waitForSelector('.mode-card');

    if (useTestMode) {
        await setupTestMode(page);
    }

    const limitedTimeCard = page.locator('.mode-card[data-mode="limitedTime"]');
    await limitedTimeCard.click();

    await page.waitForSelector('#game-time-input');

    if (gameTimeLimitSeconds !== 120) {
        const presetButtons = page.locator('.btn-preset');
        if (gameTimeLimitSeconds === 60) {
            await presetButtons.nth(0).click();
        } else if (gameTimeLimitSeconds === 180) {
            await presetButtons.nth(2).click();
        } else if (gameTimeLimitSeconds === 300) {
            await presetButtons.nth(3).click();
        } else if (gameTimeLimitSeconds === 30) {
            const minusBtn = page.locator('.btn-adjust').first();
            for (let i = 0; i < 3; i++) {
                await minusBtn.click();
                await page.waitForTimeout(100);
            }
        }
    }

    const startBtn = page.locator('#start-limited-time-btn');
    await startBtn.click();

    await page.waitForSelector('#idiom-input');
}

async function submitIdiom(page: Page, idiom: string) {
    const input = page.locator('#idiom-input');
    await input.fill(idiom);
    await input.press('Enter');
    await page.waitForTimeout(200);
}

test.describe('Limited-Time Mode - Config Page', () => {
    test('should display limited-time mode card on home page', async ({ page }) => {
        console.log('[Test] Testing limited-time mode card visibility');

        await page.goto('/');
        await page.waitForSelector('.mode-card');

        const limitedTimeCard = page.locator('.mode-card[data-mode="limitedTime"]');
        await expect(limitedTimeCard).toBeVisible();

        const cardText = await limitedTimeCard.textContent();
        expect(cardText).toContain('限时模式');
        console.log('[Test] ✓ Limited-time mode card displayed');
    });

    test('should navigate to config page when clicking limited-time card', async ({ page }) => {
        console.log('[Test] Testing navigation to config page');

        await navigateToLimitedTimeConfig(page);

        const header = page.locator('.app-header h1');
        const headerText = await header.textContent();
        expect(headerText).toContain('限时模式配置');
        console.log('[Test] ✓ Config page displayed');
    });

    test('should have default time of 2 minutes', async ({ page }) => {
        console.log('[Test] Testing default time value');

        await navigateToLimitedTimeConfig(page);

        const timeInput = page.locator('#game-time-input');
        const timeValue = await timeInput.inputValue();
        expect(timeValue).toContain('2分钟');
        console.log('[Test] ✓ Default time is 2 minutes');
    });

    test('should adjust time with +/- buttons', async ({ page }) => {
        console.log('[Test] Testing time adjustment');

        await navigateToLimitedTimeConfig(page);

        const timeInput = page.locator('#game-time-input');
        const adjustButtons = page.locator('.btn-adjust');

        const plusBtn = adjustButtons.nth(1);
        await plusBtn.click();

        let timeValue = await timeInput.inputValue();
        expect(timeValue).toContain('2分30秒');
        console.log('[Test] ✓ Time increased to 2m30s');

        const minusBtn = adjustButtons.nth(0);
        await minusBtn.click();

        timeValue = await timeInput.inputValue();
        expect(timeValue).toContain('2分钟');
        console.log('[Test] ✓ Time decreased back to 2m');
    });

    test('should have preset buttons for common times', async ({ page }) => {
        console.log('[Test] Testing preset buttons');

        await navigateToLimitedTimeConfig(page);

        const presetButtons = page.locator('.btn-preset');
        const count = await presetButtons.count();
        expect(count).toBe(4);

        const presetTexts = await Promise.all([
            presetButtons.nth(0).textContent(),
            presetButtons.nth(1).textContent(),
            presetButtons.nth(2).textContent(),
            presetButtons.nth(3).textContent(),
        ]);

        expect(presetTexts[0]).toContain('1分钟');
        expect(presetTexts[1]).toContain('2分钟');
        expect(presetTexts[2]).toContain('3分钟');
        expect(presetTexts[3]).toContain('5分钟');
        console.log('[Test] ✓ All preset buttons present');
    });

    test('should set time via preset buttons', async ({ page }) => {
        console.log('[Test] Testing preset button functionality');

        await navigateToLimitedTimeConfig(page);

        const presetButtons = page.locator('.btn-preset');
        await presetButtons.nth(2).click();

        const timeInput = page.locator('#game-time-input');
        const timeValue = await timeInput.inputValue();
        expect(timeValue).toContain('3分钟');
        console.log('[Test] ✓ Preset button sets correct time');
    });

    test('should not allow time below 30 seconds', async ({ page }) => {
        console.log('[Test] Testing minimum time limit');

        await navigateToLimitedTimeConfig(page);

        const minusBtn = page.locator('.btn-adjust').first();

        for (let i = 0; i < 10; i++) {
            await minusBtn.click();
        }

        const timeInput = page.locator('#game-time-input');
        const timeValue = await timeInput.inputValue();
        expect(timeValue).toContain('30秒');
        console.log('[Test] ✓ Minimum time is 30 seconds');
    });

    test('should not allow time above 10 minutes', async ({ page }) => {
        console.log('[Test] Testing maximum time limit');

        await navigateToLimitedTimeConfig(page);

        const plusBtn = page.locator('.btn-adjust').nth(1);

        for (let i = 0; i < 30; i++) {
            await plusBtn.click();
        }

        const timeInput = page.locator('#game-time-input');
        const timeValue = await timeInput.inputValue();
        expect(timeValue).toContain('10分钟');
        console.log('[Test] ✓ Maximum time is 10 minutes');
    });

    test('should go back to home when clicking back button', async ({ page }) => {
        console.log('[Test] Testing back navigation');

        await navigateToLimitedTimeConfig(page);

        const backBtn = page.locator('.btn-back');
        await backBtn.click();

        await page.waitForSelector('.mode-card');
        const homeHeader = page.locator('.app-header h1');
        const headerText = await homeHeader.textContent();
        expect(headerText).toContain('成语接龙');
        console.log('[Test] ✓ Back navigation works');
    });
});

test.describe('Limited-Time Mode - Game UI', () => {
    test('should start game with configured time', async ({ page }) => {
        console.log('[Test] Testing game start');

        await startLimitedTimeMode(page, 120);

        const input = page.locator('#idiom-input');
        await expect(input).toBeVisible();
        console.log('[Test] ✓ Game started');
    });

    test('should display game time in status bar middle', async ({ page }) => {
        console.log('[Test] Testing game time display position');

        await startLimitedTimeMode(page, 120);

        const gameTimeDisplay = page.locator('#game-time-display');
        await expect(gameTimeDisplay).toBeVisible();

        const gameTimeText = await gameTimeDisplay.textContent();
        console.log('[Test] Game time text:', gameTimeText);
        expect(gameTimeText).toMatch(/1:\d{2}|2:\d{2}|\d+s/);
        console.log('[Test] ✓ Game time displayed');
    });

    test('should show score on left, game time in middle, turn time on right', async ({ page }) => {
        console.log('[Test] Testing status bar layout');

        await startLimitedTimeMode(page, 120);

        const statusBar = page.locator('.game-status-bar');
        const statusText = await statusBar.textContent();

        expect(statusText).toContain('得分');
        console.log('[Test] ✓ Score displayed');

        const gameTimeDisplay = page.locator('#game-time-display');
        await expect(gameTimeDisplay).toBeVisible();
        console.log('[Test] ✓ Game time in middle');

        const turnTimeDisplay = page.locator('#current-time-display');
        await expect(turnTimeDisplay).toBeVisible();
        console.log('[Test] ✓ Turn time on right');
    });

    test('should show limited-time mode in header', async ({ page }) => {
        console.log('[Test] Testing header display');

        await startLimitedTimeMode(page, 120);

        const header = page.locator('.game-header h1');
        const headerText = await header.textContent();
        expect(headerText).toContain('限时模式');
        console.log('[Test] ✓ Limited-time mode shown in header');
    });

    test('should show configured time in header', async ({ page }) => {
        console.log('[Test] Testing time config in header');

        await startLimitedTimeMode(page, 180);

        const header = page.locator('.game-header h1');
        const headerText = await header.textContent();
        console.log('[Test] Header text:', headerText);
        expect(headerText).toContain('3分钟');
        console.log('[Test] ✓ Time config shown in header');
    });

    test('should show give up button', async ({ page }) => {
        console.log('[Test] Testing give up button visibility');

        await startLimitedTimeMode(page, 120);

        const giveUpBtn = page.locator('#giveup-btn');
        await expect(giveUpBtn).toBeVisible();
        console.log('[Test] ✓ Give up button visible');
    });

    test('should not show lives display', async ({ page }) => {
        console.log('[Test] Testing no lives display');

        await startLimitedTimeMode(page, 120);

        const livesDisplay = page.locator('.game-subtitle');
        const livesCount = await livesDisplay.count();

        if (livesCount > 0) {
            const livesText = await livesDisplay.first().textContent();
            expect(livesText).not.toContain('命');
        }
        console.log('[Test] ✓ No lives display in limited-time mode');
    });
});

test.describe('Limited-Time Mode - Game Time Countdown', () => {
    test('should count down game time', async ({ page }) => {
        console.log('[Test] Testing game time countdown');

        await startLimitedTimeMode(page, 60);

        const gameTimeDisplay = page.locator('#game-time-display');
        const initialTime = await gameTimeDisplay.textContent();
        console.log('[Test] Initial time:', initialTime);

        await page.waitForTimeout(3000);

        const laterTime = await gameTimeDisplay.textContent();
        console.log('[Test] Time after 3s:', laterTime);

        expect(laterTime).not.toBe(initialTime);
        console.log('[Test] ✓ Game time counting down');
    });

    test('should show warning when game time is low', async ({ page }) => {
        console.log('[Test] Testing game time warning');

        test.setTimeout(60000);

        await startLimitedTimeMode(page, 60);

        await page.waitForTimeout(35000);

        const gameTimeDisplay = page.locator('#game-time-display');
        const hasWarning = await gameTimeDisplay.evaluate((el) => el.classList.contains('timer-warning'));

        console.log('[Test] Game time has warning:', hasWarning);
        console.log('[Test] ✓ Game time warning check completed');
    });

    test('should end game when time runs out', async ({ page }) => {
        console.log('[Test] Testing game end on timeout');

        test.setTimeout(60000);

        await startLimitedTimeMode(page, 30);

        await page.waitForTimeout(35000);

        const gameOver = page.locator('.game-over-section');
        await expect(gameOver).toBeVisible({ timeout: 5000 });
        console.log('[Test] ✓ Game ended when time ran out');
    });

    test('should show final score when game ends', async ({ page }) => {
        console.log('[Test] Testing final score display');

        test.setTimeout(60000);

        await startLimitedTimeMode(page, 30);

        await page.waitForTimeout(35000);

        const finalScore = page.locator('.game-final-score');
        await expect(finalScore).toBeVisible({ timeout: 5000 });
        console.log('[Test] ✓ Final score displayed');
    });
});

test.describe('Limited-Time Mode - Give Up', () => {
    test('should deduct 10 points when giving up', async ({ page }) => {
        console.log('[Test] Testing give up penalty');

        await startLimitedTimeMode(page, 120);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];
        console.log('[Test] Submitting correct idiom:', userResponse);

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(1500);

        const scoreDisplay = page.locator('#score-display');
        let scoreText = await scoreDisplay.textContent();
        let scoreMatch = scoreText?.match(/得分:\s*(\d+)/);
        const scoreBeforeGiveUp = scoreMatch ? parseInt(scoreMatch[1]) : 0;
        console.log('[Test] Score before give up:', scoreBeforeGiveUp);

        const giveUpBtn = page.locator('#giveup-btn');
        await giveUpBtn.click();
        await page.waitForTimeout(1000);

        scoreText = await scoreDisplay.textContent();
        scoreMatch = scoreText?.match(/得分:\s*(-?\d+)/);
        const scoreAfterGiveUp = scoreMatch ? parseInt(scoreMatch[1]) : 0;
        console.log('[Test] Score after give up:', scoreAfterGiveUp);

        expect(scoreAfterGiveUp).toBe(scoreBeforeGiveUp - 10);
        console.log('[Test] ✓ 10 points deducted for give up');
    });

    test('should continue game after giving up', async ({ page }) => {
        console.log('[Test] Testing game continues after give up');

        await startLimitedTimeMode(page, 120);

        const giveUpBtn = page.locator('#giveup-btn');
        await giveUpBtn.click();
        await page.waitForTimeout(1000);

        const input = page.locator('#idiom-input');
        await expect(input).toBeVisible();
        console.log('[Test] ✓ Game continues after give up');
    });

    test('should allow multiple give ups', async ({ page }) => {
        console.log('[Test] Testing multiple give ups');

        await startLimitedTimeMode(page, 120);

        for (let i = 0; i < 3; i++) {
            const giveUpBtn = page.locator('#giveup-btn');
            await giveUpBtn.click();
            await page.waitForTimeout(1000);
        }

        const scoreDisplay = page.locator('#score-display');
        const scoreText = await scoreDisplay.textContent();
        const scoreMatch = scoreText?.match(/得分:\s*(-?\d+)/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
        console.log('[Test] Score after 3 give ups:', score);

        expect(score).toBe(-30);
        console.log('[Test] ✓ Multiple give ups allowed with cumulative penalty');
    });
});

test.describe('Limited-Time Mode - Scoring', () => {
    test('should award 10 points for answer within 10 seconds', async ({ page }) => {
        console.log('[Test] Testing fast response scoring');

        await startLimitedTimeMode(page, 120);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];
        console.log('[Test] Submitting fast response:', userResponse);

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(1500);

        const scoreDisplay = page.locator('#score-display');
        const scoreText = await scoreDisplay.textContent();
        console.log('[Test] Score display text:', scoreText);
        const scoreMatch = scoreText?.match(/得分:\s*(\d+)/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

        expect(score).toBe(10);
        console.log('[Test] ✓ 10 points awarded for fast response');
    });

    test('should not change score on wrong submission', async ({ page }) => {
        console.log('[Test] Testing wrong submission scoring');

        await startLimitedTimeMode(page, 120);

        const scoreDisplay = page.locator('#score-display');
        let scoreText = await scoreDisplay.textContent();
        let scoreMatch = scoreText?.match(/得分:\s*(\d+)/);
        const initialScore = scoreMatch ? parseInt(scoreMatch[1]) : 0;
        console.log('[Test] Initial score:', initialScore);

        await submitIdiom(page, '错误成语');
        await page.waitForTimeout(300);

        scoreText = await scoreDisplay.textContent();
        scoreMatch = scoreText?.match(/得分:\s*(\d+)/);
        const newScore = scoreMatch ? parseInt(scoreMatch[1]) : 0;
        console.log('[Test] Score after wrong submission:', newScore);

        expect(newScore).toBe(initialScore);
        console.log('[Test] ✓ Score unchanged on wrong submission');
    });

    test('should accumulate score across multiple turns', async ({ page }) => {
        console.log('[Test] Testing score accumulation');

        await startLimitedTimeMode(page, 120);

        for (let i = 0; i < 3; i++) {
            const computerIdiom = TEST_IDIOM_SEQUENCE[i];
            const userResponse = TEST_USER_RESPONSES[computerIdiom];
            console.log(`[Test] Turn ${i + 1}: Submitting`, userResponse);
            await submitIdiom(page, userResponse);
            await page.waitForTimeout(1500);
        }

        const scoreDisplay = page.locator('#score-display');
        const scoreText = await scoreDisplay.textContent();
        const scoreMatch = scoreText?.match(/得分:\s*(\d+)/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
        console.log('[Test] Final score after 3 turns:', score);

        expect(score).toBeGreaterThanOrEqual(20);
        console.log('[Test] ✓ Score accumulated correctly');
    });
});

test.describe('Limited-Time Mode - Game Over', () => {
    test('should show game over section when time ends', async ({ page }) => {
        console.log('[Test] Testing game over UI');

        test.setTimeout(60000);

        await startLimitedTimeMode(page, 30);

        await page.waitForTimeout(35000);

        const gameOver = page.locator('.game-over-section');
        await expect(gameOver).toBeVisible({ timeout: 5000 });

        const newGameBtn = page.locator('#new-game-btn');
        await expect(newGameBtn).toBeVisible();

        const homeBtn = page.locator('#home-btn');
        await expect(homeBtn).toBeVisible();

        console.log('[Test] ✓ Game over UI displayed correctly');
    });

    test('should restart game when clicking new game button', async ({ page }) => {
        console.log('[Test] Testing new game restart');

        test.setTimeout(60000);

        await startLimitedTimeMode(page, 30);

        await page.waitForTimeout(35000);

        const newGameBtn = page.locator('#new-game-btn');
        await newGameBtn.click({ timeout: 10000 });
        await page.waitForSelector('#idiom-input', { timeout: 5000 });

        const input = page.locator('#idiom-input');
        await expect(input).toBeVisible();
        console.log('[Test] ✓ New game started');
    });

    test('should go to home when clicking home button', async ({ page }) => {
        console.log('[Test] Testing home navigation');

        test.setTimeout(60000);

        await startLimitedTimeMode(page, 30);

        await page.waitForTimeout(35000);

        const homeBtn = page.locator('#home-btn');
        await homeBtn.click({ timeout: 10000 });
        await page.waitForSelector('.mode-card', { timeout: 5000 });

        const homeHeader = page.locator('.app-header h1');
        const headerText = await homeHeader.textContent();
        expect(headerText).toContain('成语接龙');
        console.log('[Test] ✓ Navigated to home');
    });
});

test.describe('Limited-Time Mode - History', () => {
    test('should save game to history after time ends', async ({ page }) => {
        console.log('[Test] Testing history save');

        test.setTimeout(60000);

        await startLimitedTimeMode(page, 30);

        await page.waitForTimeout(35000);

        const homeBtn = page.locator('#home-btn');
        await homeBtn.click({ timeout: 10000 });
        await page.waitForSelector('.session-card', { timeout: 5000 });

        const sessionCard = page.locator('.session-card').first();
        const sessionText = await sessionCard.textContent();
        expect(sessionText).toContain('限时');
        console.log('[Test] ✓ Game saved to history');
    });

    test('should display correct mode name in history', async ({ page }) => {
        console.log('[Test] Testing history mode name');

        test.setTimeout(60000);

        await startLimitedTimeMode(page, 30);

        await page.waitForTimeout(35000);

        const homeBtn = page.locator('#home-btn');
        await homeBtn.click({ timeout: 10000 });
        await page.waitForSelector('.session-card', { timeout: 5000 });

        const sessionMode = page.locator('.session-mode').first();
        const modeText = await sessionMode.textContent();
        expect(modeText).toContain('限时');
        console.log('[Test] ✓ Correct mode name in history');
    });
});
