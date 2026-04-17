import { test, expect, Page } from '@playwright/test';
import { setupTestMode, TEST_IDIOM_SEQUENCE, TEST_USER_RESPONSES } from './testHelpers';

async function startLimitedTimeMode(page: Page, gameTimeLimitSeconds: number = 120) {
    await page.goto('/');
    await page.waitForSelector('.mode-card');

    await setupTestMode(page);

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
        }
    }

    const startBtn = page.locator('#start-limited-time-btn');
    await startBtn.click();

    await page.waitForSelector('#idiom-input');
}

async function startEndlessMode(page: Page) {
    await page.goto('/');
    await page.waitForSelector('.mode-card');

    await setupTestMode(page);

    const endlessCard = page.locator('.mode-card[data-mode="endless"]');
    await endlessCard.click();

    await page.waitForSelector('#idiom-input');
}

test.describe('Pinyin Edit in Detail Modal - Limited-Time Mode', () => {
    test('should keep pinyin edit form open in limited-time mode after clicking correct button', async ({ page }) => {
        console.log('[Test] Testing pinyin edit stays open in limited-time mode');

        await startLimitedTimeMode(page, 120);

        // Open detail modal by clicking a message bubble
        const firstBubble = page.locator('.message-bubble').first();
        await firstBubble.click();
        await page.waitForSelector('#detail-modal.show', { timeout: 2000 });
        console.log('[Test] ✓ Detail modal opened');

        // Click the "correct pinyin" button
        const editBtn = page.locator('.pinyin-edit-btn');
        await expect(editBtn).toBeVisible();
        await editBtn.click();
        console.log('[Test] ✓ Clicked correct pinyin button');

        // The pinyin edit form should be visible
        const editInput = page.locator('.pinyin-edit-input');
        await expect(editInput).toBeVisible();
        console.log('[Test] ✓ Pinyin edit form is visible');

        // Wait for the game timer to tick at least once (limited-time mode updates every second)
        await page.waitForTimeout(2500);

        // The edit form should STILL be visible after the timer ticks
        await expect(editInput).toBeVisible();
        console.log('[Test] ✓ Pinyin edit form remains visible after timer ticks');

        // The edit button should NOT be visible (it's replaced by the edit form)
        await expect(editBtn).not.toBeVisible();
        console.log('[Test] ✓ Edit button hidden while editing');
    });

    test('should allow typing in pinyin edit input in limited-time mode', async ({ page }) => {
        console.log('[Test] Testing pinyin input stays focused in limited-time mode');

        await startLimitedTimeMode(page, 120);

        // Open detail modal
        const firstBubble = page.locator('.message-bubble').first();
        await firstBubble.click();
        await page.waitForSelector('#detail-modal.show', { timeout: 2000 });

        // Click the correct pinyin button
        const editBtn = page.locator('.pinyin-edit-btn');
        await editBtn.click();

        const editInput = page.locator('.pinyin-edit-input');
        await expect(editInput).toBeVisible();

        // Clear and type new pinyin
        await editInput.clear();
        await editInput.fill('xīn pinyin');

        // Wait for timer tick
        await page.waitForTimeout(2500);

        // The input should still have our value (not reset)
        await expect(editInput).toHaveValue('xīn pinyin');
        console.log('[Test] ✓ Pinyin input retains value after timer ticks');

        // The form should still be visible
        await expect(editInput).toBeVisible();
        console.log('[Test] ✓ Edit form remains open for saving');
    });

    test('should allow saving pinyin correction in limited-time mode', async ({ page }) => {
        console.log('[Test] Testing pinyin save in limited-time mode');

        await startLimitedTimeMode(page, 120);

        // Open detail modal
        const firstBubble = page.locator('.message-bubble').first();
        await firstBubble.click();
        await page.waitForSelector('#detail-modal.show', { timeout: 2000 });

        // Click the correct pinyin button
        const editBtn = page.locator('.pinyin-edit-btn');
        await editBtn.click();

        const editInput = page.locator('.pinyin-edit-input');
        await expect(editInput).toBeVisible();

        // Type corrected pinyin
        await editInput.clear();
        await editInput.fill('yì qì fēng fā');

        // Wait for timer tick
        await page.waitForTimeout(1500);

        // Click save
        const saveBtn = page.locator('.pinyin-edit-actions .btn-primary');
        await saveBtn.click();

        // The edit form should close and show the edit button again (with "修改拼音" text)
        const editBtnAfterSave = page.locator('.pinyin-edit-btn');
        await expect(editBtnAfterSave).toBeVisible();
        await expect(editBtnAfterSave).toContainText('修改拼音');
        console.log('[Test] ✓ Pinyin correction saved successfully');
    });
});

test.describe('Pinyin Edit in Detail Modal - Endless Mode (no regression)', () => {
    test('should keep pinyin edit form open in endless mode', async ({ page }) => {
        console.log('[Test] Testing pinyin edit stays open in endless mode');

        await startEndlessMode(page);

        // Open detail modal
        const firstBubble = page.locator('.message-bubble').first();
        await firstBubble.click();
        await page.waitForSelector('#detail-modal.show', { timeout: 2000 });

        // Click the correct pinyin button
        const editBtn = page.locator('.pinyin-edit-btn');
        await editBtn.click();

        const editInput = page.locator('.pinyin-edit-input');
        await expect(editInput).toBeVisible();

        // Wait a bit (no timer ticking in endless mode, but verify it stays)
        await page.waitForTimeout(2500);

        await expect(editInput).toBeVisible();
        console.log('[Test] ✓ Pinyin edit form remains visible in endless mode');
    });
});
