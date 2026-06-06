import { test, expect, Page } from '@playwright/test';
import { navigateViaMenu, startLimitedTimeMode, submitIdiom } from './testHelpers';

test.describe('TrendPage Features with Ionic', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('ion-router-outlet', { state: 'attached' });
    });

    test('TC-IONIC-TREND-001: Navigating to TrendPage from menu', async ({ page }) => {
        await navigateViaMenu(page, '成绩趋势');
        const title = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-title').first();
        expect(await title.textContent()).toContain('成绩趋势');
    });

    test('TC-IONIC-TREND-002: Shows empty state when no records exist', async ({ page }) => {
        // Ensure history is clear
        const clearBtn = page.locator('.btn-clear-history');
        if (await clearBtn.isVisible()) {
            await clearBtn.click();
            await page.locator('button.alert-button').filter({ hasText: '确定' }).click();
            await page.waitForTimeout(500);
        }

        await navigateViaMenu(page, '成绩趋势');
        const emptyState = page.locator('.trend-empty');
        await expect(emptyState).toBeVisible();
        expect(await emptyState.textContent()).toContain('暂无限时模式的游戏记录');
    });

    test('TC-IONIC-TREND-003: Shows chart, stats and history for limited time mode games', async ({ page }) => {
        test.setTimeout(30000);
        
        // Clear history first
        const clearBtn = page.locator('.btn-clear-history');
        if (await clearBtn.isVisible()) {
            await clearBtn.click();
            await page.locator('button.alert-button').filter({ hasText: '确定' }).click();
            await page.waitForTimeout(500);
        }

        // Play 1st Game (60 seconds)
        await startLimitedTimeMode(page, 60);
        await page.evaluate(() => {
            if ((window as any).idiomLib) {
                (window as any).idiomLib.pickNext = () => null;
            }
        });
        await page.locator('#giveup-btn').click();
        await expect(page.locator('.game-over-container')).toBeVisible({ timeout: 3000 });
        await page.locator('#home-btn').click();
        await page.waitForTimeout(500);

        // Play 2nd Game (60 seconds)
        await startLimitedTimeMode(page, 60);
        await page.evaluate(() => {
            if ((window as any).idiomLib) {
                (window as any).idiomLib.pickNext = () => null;
            }
        });
        await page.locator('#giveup-btn').click();
        await expect(page.locator('.game-over-container')).toBeVisible({ timeout: 3000 });
        await page.locator('#home-btn').click();
        await page.waitForTimeout(500);

        // Play 3rd Game (120 seconds) - different config
        await startLimitedTimeMode(page, 120);
        await page.evaluate(() => {
            if ((window as any).idiomLib) {
                (window as any).idiomLib.pickNext = () => null;
            }
        });
        await page.locator('#giveup-btn').click();
        await expect(page.locator('.game-over-container')).toBeVisible({ timeout: 3000 });
        await page.locator('#home-btn').click();
        await page.waitForTimeout(500);

        // Navigate to TrendPage
        await navigateViaMenu(page, '成绩趋势');

        // Verify filters are rendered correctly and sorted by time limit
        const filters = page.locator('.trend-filter-btn');
        await expect(filters).toHaveCount(2);
        
        // Verify text and the count inside the pill
        expect(await filters.nth(0).textContent()).toContain('1分钟 (2局)');
        expect(await filters.nth(1).textContent()).toContain('2分钟 (1局)');

        // Select the first filter (60 seconds)
        await filters.nth(0).click();

        // Verify stats panel
        const statsPanel = page.locator('.trend-stats-panel');
        await expect(statsPanel).toBeVisible();

        // There should be 2 games for 60 seconds config
        const gameCount = page.locator('.trend-stat-item').nth(0).locator('.trend-stat-value');
        expect(await gameCount.textContent()).toBe('2');

        // Verify chart is visible
        const chart = page.locator('.trend-chart-container canvas');
        await expect(chart).toBeVisible();

        // Verify history list has 2 items
        const historyCards = page.locator('.trend-history-card');
        await expect(historyCards).toHaveCount(2);

        // Switch to 120 seconds config
        await filters.nth(1).click();
        
        // Verify stats update (1 game for 120 seconds config)
        expect(await gameCount.textContent()).toBe('1');
        await expect(historyCards).toHaveCount(1);
    });
});
