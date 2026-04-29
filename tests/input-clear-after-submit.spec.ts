import { test, expect, Page } from '@playwright/test';
import { setupTestMode, TEST_IDIOM_SEQUENCE, TEST_USER_RESPONSES } from './testHelpers';

async function startEndlessMode(page: Page) {
    await page.goto('/');
    await page.waitForSelector('.mode-card');
    await setupTestMode(page);
    const endlessCard = page.locator('.mode-card[data-mode="endless"]');
    await endlessCard.click();
    await page.waitForSelector('.game-container');
    await page.waitForSelector('.message-bubble');
}

async function startChallengeMode(page: Page, lives: number = 3) {
    await page.goto('/');
    await page.waitForSelector('.mode-card');
    await setupTestMode(page);
    const challengeCard = page.locator('.mode-card[data-mode="challenge"]');
    await challengeCard.click();

    await page.waitForSelector('#lives-input');
    const livesInput = page.locator('#lives-input');
    const timeInput = page.locator('#time-input');
    await livesInput.fill(lives.toString());
    await timeInput.fill('0');

    const startBtn = page.locator('#start-challenge-btn');
    await startBtn.click();

    await page.waitForSelector('#idiom-input');
}

async function startLimitedTimeMode(page: Page, gameTimeLimitSeconds: number = 120) {
    await page.goto('/');
    await page.waitForSelector('.mode-card');
    await setupTestMode(page);
    const limitedTimeCard = page.locator('.mode-card[data-mode="limitedTime"]');
    await limitedTimeCard.click();

    await page.waitForSelector('#game-time-input');

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

test.describe('Input clearing after idiom submission', () => {
    test('should clear input after submitting a correct idiom in endless mode', async ({ page }) => {
        await startEndlessMode(page);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const correctResponse = TEST_USER_RESPONSES[firstComputerIdiom];

        const input = page.locator('#idiom-input');
        await input.fill(correctResponse);
        await input.press('Enter');
        await page.waitForTimeout(500);

        const inputValue = await input.inputValue();
        expect(inputValue).toBe('');
    });

    test('should clear input after submitting a non-existent idiom', async ({ page }) => {
        await startEndlessMode(page);

        const wrongIdiom = '不存在成语';
        await submitIdiom(page, wrongIdiom);

        const errorBubble = page.locator('.message-bubble.error-bubble');
        await expect(errorBubble).toBeVisible();

        const input = page.locator('#idiom-input');
        const inputValue = await input.inputValue();
        expect(inputValue).toBe('');
    });

    test('should clear input after submitting a duplicate idiom', async ({ page }) => {
        await startEndlessMode(page);

        const firstMessage = await page.locator('.computer-message .message-bubble').first().textContent();
        if (firstMessage) {
            await submitIdiom(page, firstMessage.trim());

            const errorBubble = page.locator('.message-bubble.error-bubble');
            await expect(errorBubble).toBeVisible();

            const input = page.locator('#idiom-input');
            const inputValue = await input.inputValue();
            expect(inputValue).toBe('');
        }
    });

    test('should clear input after submitting a pinyin-mismatch idiom', async ({ page }) => {
        await startEndlessMode(page);

        await submitIdiom(page, '张冠李戴');

        const errorBubble = page.locator('.message-bubble.error-bubble');
        await expect(errorBubble).toBeVisible();

        const input = page.locator('#idiom-input');
        const inputValue = await input.inputValue();
        expect(inputValue).toBe('');
    });

    test('should clear input after each submission in a sequence of wrong attempts', async ({ page }) => {
        await startEndlessMode(page);

        const wrongIdioms = ['错误一', '错误二', '错误三'];
        const input = page.locator('#idiom-input');

        for (const wrongIdiom of wrongIdioms) {
            await input.fill(wrongIdiom);
            expect(await input.inputValue()).toBe(wrongIdiom);

            await input.press('Enter');
            await page.waitForTimeout(300);

            const inputValue = await input.inputValue();
            expect(inputValue).toBe('');
        }
    });

    test('should clear input after wrong then correct submission', async ({ page }) => {
        await startEndlessMode(page);

        const input = page.locator('#idiom-input');

        // Submit wrong idiom
        await input.fill('错误成语');
        await input.press('Enter');
        await page.waitForTimeout(300);
        expect(await input.inputValue()).toBe('');

        // Submit correct idiom
        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const correctResponse = TEST_USER_RESPONSES[firstComputerIdiom];
        await input.fill(correctResponse);
        await input.press('Enter');
        await page.waitForTimeout(500);
        expect(await input.inputValue()).toBe('');
    });

    test('should clear input after wrong submission in challenge mode', async ({ page }) => {
        await startChallengeMode(page);

        await submitIdiom(page, '不存在成语');

        const errorBubble = page.locator('.message-bubble.error-bubble');
        await expect(errorBubble).toBeVisible();

        const input = page.locator('#idiom-input');
        const inputValue = await input.inputValue();
        expect(inputValue).toBe('');
    });

    test('should clear input after wrong submission in limited time mode', async ({ page }) => {
        await startLimitedTimeMode(page);

        await submitIdiom(page, '不存在成语');

        const errorBubble = page.locator('.message-bubble.error-bubble');
        await expect(errorBubble).toBeVisible();

        const input = page.locator('#idiom-input');
        const inputValue = await input.inputValue();
        expect(inputValue).toBe('');
    });

    test('should clear input when clicking submit button with wrong idiom', async ({ page }) => {
        await startEndlessMode(page);

        const input = page.locator('#idiom-input');
        await input.fill('错误成语');

        const submitBtn = page.locator('#submit-btn');
        await submitBtn.click();
        await page.waitForTimeout(300);

        const inputValue = await input.inputValue();
        expect(inputValue).toBe('');
    });
});
