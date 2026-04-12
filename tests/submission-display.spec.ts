import { test, expect, Page } from '@playwright/test';
import { setupTestMode, TEST_IDIOM_SEQUENCE, TEST_USER_RESPONSES } from './testHelpers';

async function startEndlessMode(page: Page, useTestMode: boolean = true) {
    await page.goto('/');
    await page.waitForSelector('.mode-card');

    if (useTestMode) {
        await setupTestMode(page);
    }

    const endlessCard = page.locator('.mode-card[data-mode="endless"]');
    await endlessCard.click();

    await page.waitForSelector('.game-container');
    await page.waitForSelector('.message-bubble');
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

async function startChallengeMode(page: Page, lives: number = 3, timeLimit: number = 0, useTestMode: boolean = true) {
    await page.goto('/');
    await page.waitForSelector('.mode-card');

    if (useTestMode) {
        await setupTestMode(page);
    }

    const challengeCard = page.locator('.mode-card[data-mode="challenge"]');
    await challengeCard.click();

    await page.waitForSelector('#lives-input');

    if (lives !== 3) {
        const livesInput = page.locator('#lives-input');
        await livesInput.fill(lives.toString());
    }

    if (timeLimit > 0) {
        const timeInput = page.locator('#time-limit-input');
        await timeInput.fill(timeLimit.toString());
    }

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

test.describe('Submission Display - Error Reasons', () => {
    test('should show "成语不存在" for non-existent idiom in Endless mode', async ({ page }) => {
        console.log('[Test] Testing error reason for non-existent idiom');

        await startEndlessMode(page);

        await submitIdiom(page, '不存在成语');

        const errorBubble = page.locator('.message-bubble.error-bubble');
        await expect(errorBubble).toBeVisible();

        const errorReason = page.locator('.message-error-reason');
        await expect(errorReason).toBeVisible();
        const reasonText = await errorReason.textContent();
        expect(reasonText).toContain('成语不存在');
        console.log('[Test] ✓ Error reason displayed:', reasonText);
    });

    test('should show "成语已使用" for duplicate idiom in Endless mode', async ({ page }) => {
        console.log('[Test] Testing error reason for duplicate idiom');

        await startEndlessMode(page);

        const firstMessage = await page.locator('.computer-message .message-bubble').first().textContent();
        console.log('[Test] First computer message:', firstMessage);

        if (firstMessage) {
            await submitIdiom(page, firstMessage.trim());

            const errorBubble = page.locator('.message-bubble.error-bubble');
            await expect(errorBubble).toBeVisible();

            const errorReason = page.locator('.message-error-reason');
            await expect(errorReason).toBeVisible();
            const reasonText = await errorReason.textContent();
            expect(reasonText).toContain('成语已使用');
            console.log('[Test] ✓ Error reason displayed:', reasonText);
        }
    });

    test('should show "拼音不匹配" for pinyin mismatch in Endless mode', async ({ page }) => {
        console.log('[Test] Testing error reason for pinyin mismatch');

        await startEndlessMode(page);

        await submitIdiom(page, '张冠李戴');

        const errorBubble = page.locator('.message-bubble.error-bubble');
        await expect(errorBubble).toBeVisible();

        const errorReason = page.locator('.message-error-reason');
        await expect(errorReason).toBeVisible();
        const reasonText = await errorReason.textContent();
        expect(reasonText).toContain('拼音不匹配');
        console.log('[Test] ✓ Error reason displayed:', reasonText);
    });

    test('should show error reason in Limited-Time mode', async ({ page }) => {
        console.log('[Test] Testing error reason in Limited-Time mode');

        await startLimitedTimeMode(page, 120);

        await submitIdiom(page, '不存在成语');

        const errorReason = page.locator('.message-error-reason');
        await expect(errorReason).toBeVisible();
        const reasonText = await errorReason.textContent();
        expect(reasonText).toContain('成语不存在');
        console.log('[Test] ✓ Error reason displayed in Limited-Time mode');
    });

    test('should show error reason in Challenge mode', async ({ page }) => {
        console.log('[Test] Testing error reason in Challenge mode');

        await startChallengeMode(page, 3, 0);

        await submitIdiom(page, '不存在成语');

        const errorReason = page.locator('.message-error-reason');
        await expect(errorReason).toBeVisible();
        const reasonText = await errorReason.textContent();
        expect(reasonText).toContain('成语不存在');
        console.log('[Test] ✓ Error reason displayed in Challenge mode');
    });
});

test.describe('Submission Display - Score Display in Endless Mode', () => {
    test('should show "+10分" for answer within 10 seconds', async ({ page }) => {
        console.log('[Test] Testing +10分 display for fast response');

        await startEndlessMode(page);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];
        console.log('[Test] Submitting fast response:', userResponse);

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(1500);

        const scoreSpan = page.locator('.message-score');
        await expect(scoreSpan).toBeVisible();
        const scoreText = await scoreSpan.textContent();
        expect(scoreText).toBe('+10分');
        console.log('[Test] ✓ Score displayed:', scoreText);
    });

    test('should show score beside each correct submission', async ({ page }) => {
        console.log('[Test] Testing score display for multiple submissions');

        await startEndlessMode(page);

        for (let i = 0; i < 3; i++) {
            const computerIdiom = TEST_IDIOM_SEQUENCE[i];
            const userResponse = TEST_USER_RESPONSES[computerIdiom];
            console.log(`[Test] Turn ${i + 1}: Submitting`, userResponse);
            await submitIdiom(page, userResponse);
            await page.waitForTimeout(1500);
        }

        const scoreSpans = page.locator('.message-score');
        const count = await scoreSpans.count();
        expect(count).toBeGreaterThanOrEqual(2);
        console.log('[Test] ✓ Score displayed for', count, 'submissions');
    });

    test('should not show score for wrong submission', async ({ page }) => {
        console.log('[Test] Testing no score for wrong submission');

        await startEndlessMode(page);

        await submitIdiom(page, '不存在成语');

        const errorBubble = page.locator('.message-bubble.error-bubble');
        await expect(errorBubble).toBeVisible();

        const parentMessage = errorBubble.locator('xpath=..');
        const scoreInError = parentMessage.locator('.message-score');
        const count = await scoreInError.count();
        expect(count).toBe(0);
        console.log('[Test] ✓ No score displayed for wrong submission');
    });
});

test.describe('Submission Display - Score Display in Limited-Time Mode', () => {
    test('should show "+10分" for answer within 10 seconds', async ({ page }) => {
        console.log('[Test] Testing +10分 display in Limited-Time mode');

        await startLimitedTimeMode(page, 120);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];
        console.log('[Test] Submitting fast response:', userResponse);

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(1500);

        const scoreSpan = page.locator('.message-score');
        await expect(scoreSpan).toBeVisible();
        const scoreText = await scoreSpan.textContent();
        expect(scoreText).toBe('+10分');
        console.log('[Test] ✓ Score displayed:', scoreText);
    });

    test('should show score beside each correct submission', async ({ page }) => {
        console.log('[Test] Testing score display for multiple submissions in Limited-Time mode');

        await startLimitedTimeMode(page, 120);

        for (let i = 0; i < 3; i++) {
            const computerIdiom = TEST_IDIOM_SEQUENCE[i];
            const userResponse = TEST_USER_RESPONSES[computerIdiom];
            console.log(`[Test] Turn ${i + 1}: Submitting`, userResponse);
            await submitIdiom(page, userResponse);
            await page.waitForTimeout(1500);
        }

        const scoreSpans = page.locator('.message-score');
        const count = await scoreSpans.count();
        expect(count).toBeGreaterThanOrEqual(2);
        console.log('[Test] ✓ Score displayed for', count, 'submissions');
    });
});

test.describe('Submission Display - No Score in Challenge Mode', () => {
    test('should NOT show score for correct submission in Challenge mode', async ({ page }) => {
        console.log('[Test] Testing no score display in Challenge mode');

        await startChallengeMode(page, 3, 0);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];
        console.log('[Test] Submitting correct idiom:', userResponse);

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(1500);

        const scoreSpan = page.locator('.message-score');
        const count = await scoreSpan.count();
        expect(count).toBe(0);
        console.log('[Test] ✓ No score displayed in Challenge mode');
    });

    test('should still show error reason in Challenge mode', async ({ page }) => {
        console.log('[Test] Testing error reason still shown in Challenge mode');

        await startChallengeMode(page, 3, 0);

        await submitIdiom(page, '不存在成语');

        const errorReason = page.locator('.message-error-reason');
        await expect(errorReason).toBeVisible();
        console.log('[Test] ✓ Error reason displayed in Challenge mode');
    });
});

test.describe('Submission Display - Combined Display', () => {
    test('should show time and score together for correct submission', async ({ page }) => {
        console.log('[Test] Testing time and score display together');

        await startEndlessMode(page);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];
        await submitIdiom(page, userResponse);
        await page.waitForTimeout(1500);

        const messageTime = page.locator('.message-time');
        await expect(messageTime).toBeVisible();

        const timeText = await messageTime.textContent();
        console.log('[Test] Message time text:', timeText);

        expect(timeText).toMatch(/\d+\.\d+s/);
        expect(timeText).toContain('+10分');
        console.log('[Test] ✓ Time and score displayed together');
    });

    test('should show only error reason for wrong submission (no time, no score)', async ({ page }) => {
        console.log('[Test] Testing only error reason for wrong submission');

        await startEndlessMode(page);

        await submitIdiom(page, '不存在成语');

        const errorReason = page.locator('.message-error-reason');
        await expect(errorReason).toBeVisible();

        const errorBubble = page.locator('.message-bubble.error-bubble');
        const parentMessage = errorBubble.locator('xpath=..');

        const timeInError = parentMessage.locator('.message-time');
        const timeCount = await timeInError.count();
        expect(timeCount).toBe(0);

        const scoreInError = parentMessage.locator('.message-score');
        const scoreCount = await scoreInError.count();
        expect(scoreCount).toBe(0);

        console.log('[Test] ✓ Only error reason displayed for wrong submission');
    });
});

test.describe('Submission Display - Score Values by Time', () => {
    test('should show +10分 for time <= 10s', async ({ page }) => {
        console.log('[Test] Testing +10分 for time <= 10s');

        await startEndlessMode(page);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(1500);

        const scoreSpan = page.locator('.message-score');
        const scoreText = await scoreSpan.textContent();
        expect(scoreText).toBe('+10分');
        console.log('[Test] ✓ +10分 displayed for fast response');
    });

    test('should show +9分 for 10s < time <= 20s', async ({ page }) => {
        console.log('[Test] Testing +9分 for 10s < time <= 20s');

        test.setTimeout(30000);

        await startEndlessMode(page);

        await page.waitForTimeout(12000);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(1500);

        const scoreSpan = page.locator('.message-score');
        const scoreText = await scoreSpan.textContent();
        expect(scoreText).toBe('+9分');
        console.log('[Test] ✓ +9分 displayed for medium response');
    });

    test('should show +8分 for 20s < time <= 30s', async ({ page }) => {
        console.log('[Test] Testing +8分 for 20s < time <= 30s');

        test.setTimeout(60000);

        await startEndlessMode(page);

        await page.waitForTimeout(22000);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(1500);

        const scoreSpan = page.locator('.message-score');
        const scoreText = await scoreSpan.textContent();
        expect(scoreText).toBe('+8分');
        console.log('[Test] ✓ +8分 displayed for slow response');
    });

    test('should show +7分 for 30s < time <= 60s', async ({ page }) => {
        console.log('[Test] Testing +7分 for 30s < time <= 60s');

        test.setTimeout(90000);

        await startEndlessMode(page);

        await page.waitForTimeout(35000);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(1500);

        const scoreSpan = page.locator('.message-score');
        const scoreText = await scoreSpan.textContent();
        expect(scoreText).toBe('+7分');
        console.log('[Test] ✓ +7分 displayed for very slow response');
    });

    test('should show +5分 for time > 60s', async ({ page }) => {
        console.log('[Test] Testing +5分 for time > 60s');

        test.setTimeout(120000);

        await startEndlessMode(page);

        await page.waitForTimeout(65000);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(1500);

        const scoreSpan = page.locator('.message-score');
        const scoreText = await scoreSpan.textContent();
        expect(scoreText).toBe('+5分');
        console.log('[Test] ✓ +5分 displayed for very very slow response');
    });
});

test.describe('Submission Display - Give Up Bubble', () => {
    test('should show give up bubble with -10分 in Endless mode', async ({ page }) => {
        console.log('[Test] Testing give up bubble in Endless mode');

        await startEndlessMode(page);

        const giveUpBtn = page.locator('#giveup-btn');
        await giveUpBtn.click();
        await page.waitForTimeout(1000);

        const giveUpBubble = page.locator('.message-bubble.give-up-bubble');
        await expect(giveUpBubble).toBeVisible();
        const bubbleText = await giveUpBubble.textContent();
        expect(bubbleText).toContain('放弃');
        console.log('[Test] ✓ Give up bubble displayed:', bubbleText);

        const scoreSpan = page.locator('.message-score-negative');
        await expect(scoreSpan).toBeVisible();
        const scoreText = await scoreSpan.textContent();
        expect(scoreText).toBe('-10分');
        console.log('[Test] ✓ -10分 displayed:', scoreText);
    });

    test('should show give up bubble with -10分 in Limited-Time mode', async ({ page }) => {
        console.log('[Test] Testing give up bubble in Limited-Time mode');

        await startLimitedTimeMode(page, 120);

        const giveUpBtn = page.locator('#giveup-btn');
        await giveUpBtn.click();
        await page.waitForTimeout(1000);

        const giveUpBubble = page.locator('.message-bubble.give-up-bubble');
        await expect(giveUpBubble).toBeVisible();
        const bubbleText = await giveUpBubble.textContent();
        expect(bubbleText).toContain('放弃');
        console.log('[Test] ✓ Give up bubble displayed:', bubbleText);

        const scoreSpan = page.locator('.message-score-negative');
        await expect(scoreSpan).toBeVisible();
        const scoreText = await scoreSpan.textContent();
        expect(scoreText).toBe('-10分');
        console.log('[Test] ✓ -10分 displayed:', scoreText);
    });

    test('should show multiple give up bubbles', async ({ page }) => {
        console.log('[Test] Testing multiple give up bubbles');

        await startEndlessMode(page);

        for (let i = 0; i < 3; i++) {
            const giveUpBtn = page.locator('#giveup-btn');
            await giveUpBtn.click();
            await page.waitForTimeout(1000);
        }

        const giveUpBubbles = page.locator('.message-bubble.give-up-bubble');
        const count = await giveUpBubbles.count();
        expect(count).toBe(3);
        console.log('[Test] ✓ 3 give up bubbles displayed');

        const negativeScores = page.locator('.message-score-negative');
        const scoreCount = await negativeScores.count();
        expect(scoreCount).toBe(3);
        console.log('[Test] ✓ 3 negative scores displayed');
    });

    test('should deduct score when giving up', async ({ page }) => {
        console.log('[Test] Testing score deduction on give up');

        await startEndlessMode(page);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];
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
        console.log('[Test] ✓ Score deducted by 10');
    });

    test('should show give up bubble between correct submissions', async ({ page }) => {
        console.log('[Test] Testing give up bubble between correct submissions');

        await startEndlessMode(page);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];
        await submitIdiom(page, userResponse);
        await page.waitForTimeout(1500);

        const giveUpBtn = page.locator('#giveup-btn');
        await giveUpBtn.click();
        await page.waitForTimeout(1500);

        const secondComputerIdiom = TEST_IDIOM_SEQUENCE[1];
        const secondUserResponse = TEST_USER_RESPONSES[secondComputerIdiom];
        await submitIdiom(page, secondUserResponse);
        await page.waitForTimeout(1500);

        const giveUpBubble = page.locator('.message-bubble.give-up-bubble');
        await expect(giveUpBubble).toBeVisible();
        console.log('[Test] ✓ Give up bubble displayed between submissions');

        const positiveScores = page.locator('.message-score:not(.message-score-negative)');
        const positiveCount = await positiveScores.count();
        expect(positiveCount).toBeGreaterThanOrEqual(1);
        console.log('[Test] ✓ Positive scores still displayed');
    });

    test('give up bubble should not be clickable', async ({ page }) => {
        console.log('[Test] Testing give up bubble is not clickable');

        await startEndlessMode(page);

        const giveUpBtn = page.locator('#giveup-btn');
        await giveUpBtn.click();
        await page.waitForTimeout(1000);

        const giveUpBubble = page.locator('.message-bubble.give-up-bubble');
        await giveUpBubble.click();
        await page.waitForTimeout(300);

        const modal = page.locator('#detail-modal.show');
        const modalVisible = await modal.isVisible().catch(() => false);
        expect(modalVisible).toBe(false);
        console.log('[Test] ✓ Give up bubble does not open modal');
    });
});
