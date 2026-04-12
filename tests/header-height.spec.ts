import { test, expect } from '@playwright/test';
import { setupTestMode } from './testHelpers';

test.describe('Header Height Consistency', () => {
    test('should have same header height on home page and game page', async ({ page }) => {
        console.log('[Test] Testing header height consistency');

        await page.goto('/');
        await page.waitForSelector('.app-header');

        const homeHeader = page.locator('.app-header');
        const homeHeaderBox = await homeHeader.boundingBox();
        const homeHeaderHeight = homeHeaderBox?.height || 0;
        console.log('[Test] Home header height:', homeHeaderHeight);

        const homeHeaderStyles = await homeHeader.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
                paddingTop: style.paddingTop,
                paddingBottom: style.paddingBottom,
                paddingLeft: style.paddingLeft,
                paddingRight: style.paddingRight,
                height: style.height,
            };
        });
        console.log('[Test] Home header styles:', homeHeaderStyles);

        const endlessCard = page.locator('.mode-card[data-mode="endless"]');
        await endlessCard.click();
        await page.waitForSelector('.game-header');

        const gameHeader = page.locator('.game-header');
        const gameHeaderBox = await gameHeader.boundingBox();
        const gameHeaderHeight = gameHeaderBox?.height || 0;
        console.log('[Test] Game header height:', gameHeaderHeight);

        const gameHeaderStyles = await gameHeader.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
                paddingTop: style.paddingTop,
                paddingBottom: style.paddingBottom,
                paddingLeft: style.paddingLeft,
                paddingRight: style.paddingRight,
                height: style.height,
            };
        });
        console.log('[Test] Game header styles:', gameHeaderStyles);

        const heightDiff = Math.abs(homeHeaderHeight - gameHeaderHeight);
        console.log('[Test] Height difference:', heightDiff);

        expect(heightDiff).toBeLessThan(2);
        console.log('[Test] ✓ Header heights are consistent');
    });

    test('should have same header height on home page and history detail page', async ({ page }) => {
        console.log('[Test] Testing header height consistency with history detail');

        test.setTimeout(60000);

        await page.goto('/');
        await page.waitForSelector('.app-header');

        const homeHeader = page.locator('.app-header');
        const homeHeaderBox = await homeHeader.boundingBox();
        const homeHeaderHeight = homeHeaderBox?.height || 0;
        console.log('[Test] Home header height:', homeHeaderHeight);

        await setupTestMode(page);

        await page.waitForSelector('.mode-card[data-mode="limitedTime"]', { state: 'visible' });
        const limitedTimeCard = page.locator('.mode-card[data-mode="limitedTime"]');
        await limitedTimeCard.click();
        await page.waitForSelector('#game-time-input');

        const minusBtn = page.locator('.btn-adjust').first();
        for (let i = 0; i < 3; i++) {
            await minusBtn.click();
            await page.waitForTimeout(100);
        }

        const startBtn = page.locator('#start-limited-time-btn');
        await startBtn.click();
        await page.waitForSelector('.game-header');

        await page.waitForTimeout(35000);

        const gameOverModal = page.locator('#game-over-modal.show');
        await expect(gameOverModal).toBeVisible({ timeout: 5000 });

        const homeBtn = page.locator('#home-btn');
        await homeBtn.click();
        await page.waitForSelector('.session-card', { timeout: 5000 });

        const sessionCard = page.locator('.session-card').first();
        await sessionCard.click();
        await page.waitForSelector('.history-detail-container');

        const historyHeader = page.locator('.game-header');
        const historyHeaderBox = await historyHeader.boundingBox();
        const historyHeaderHeight = historyHeaderBox?.height || 0;
        console.log('[Test] History detail header height:', historyHeaderHeight);

        const heightDiff = Math.abs(homeHeaderHeight - historyHeaderHeight);
        console.log('[Test] Height difference:', heightDiff);

        expect(heightDiff).toBeLessThan(2);
        console.log('[Test] ✓ Header heights are consistent');
    });

    test('should verify header button sizes are consistent', async ({ page }) => {
        console.log('[Test] Testing header button size consistency');

        await page.goto('/');
        await page.waitForSelector('.app-header');

        const menuBtn = page.locator('.btn-menu');
        const menuBtnBox = await menuBtn.boundingBox();
        console.log('[Test] Menu button size:', menuBtnBox?.width, 'x', menuBtnBox?.height);

        const endlessCard = page.locator('.mode-card[data-mode="endless"]');
        await endlessCard.click();
        await page.waitForSelector('.game-header');

        const backBtn = page.locator('.btn-back');
        const backBtnBox = await backBtn.boundingBox();
        console.log('[Test] Back button size:', backBtnBox?.width, 'x', backBtnBox?.height);

        const menuBtnHeight = menuBtnBox?.height || 0;
        const backBtnHeight = backBtnBox?.height || 0;
        const heightDiff = Math.abs(menuBtnHeight - backBtnHeight);
        console.log('[Test] Button height difference:', heightDiff);

        expect(heightDiff).toBeLessThan(2);
        console.log('[Test] ✓ Header button sizes are consistent');
    });
});
