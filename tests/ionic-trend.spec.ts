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

    test('TC-IONIC-TREND-004: Toggles between session and day views correctly', async ({ page }) => {
        test.setTimeout(30000);
        
        // Clear history first
        const clearBtn = page.locator('.btn-clear-history');
        if (await clearBtn.isVisible()) {
            await clearBtn.click();
            await page.locator('button.alert-button').filter({ hasText: '确定' }).click();
            await page.waitForTimeout(500);
        }

        // Generate mock data for the test directly into localStorage to simulate different days
        await page.evaluate(() => {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            const mockSessions = [
                {
                    id: '1',
                    mode: 'limitedTime',
                    startTime: yesterday.getTime(),
                    endTime: yesterday.getTime() + 60000,
                    score: 10,
                    messages: [],
                    limitedTimeConfig: { gameTimeLimit: 60, singleTurnTimeLimit: 15 }
                },
                {
                    id: '2',
                    mode: 'limitedTime',
                    startTime: yesterday.getTime() + 100000,
                    endTime: yesterday.getTime() + 160000,
                    score: 20,
                    messages: [],
                    limitedTimeConfig: { gameTimeLimit: 60, singleTurnTimeLimit: 15 }
                },
                {
                    id: '3',
                    mode: 'limitedTime',
                    startTime: today.getTime(),
                    endTime: today.getTime() + 60000,
                    score: 30,
                    messages: [],
                    limitedTimeConfig: { gameTimeLimit: 60, singleTurnTimeLimit: 15 }
                }
            ];
            
            // Set the correct state structure that useLocalStorageState expects
            localStorage.setItem('chengyujielong_sessions', JSON.stringify(mockSessions));
        });
        
        // Reload page to load mock data
        await page.goto('/');
        await page.waitForSelector('ion-router-outlet', { state: 'attached' });
        
        // Navigate to TrendPage
        await navigateViaMenu(page, '成绩趋势');
        
        // Wait for TrendPage to be fully loaded
        const title = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-title').first();
        expect(await title.textContent()).toContain('成绩趋势');
        
        // Ensure no empty state is shown
        const emptyState = page.locator('.trend-empty');
        await expect(emptyState).toBeHidden();
        
        // The mock data only has 1 config (60s limit), so filter buttons might not show up if there's only 1 config.
        // Wait for stats panel to be visible to ensure data is rendered
        const statsPanel = page.locator('.trend-stats-panel');
        await expect(statsPanel).toBeVisible({ timeout: 5000 });

        // Check segment control is visible
        const sessionSegmentBtn = page.locator('ion-segment-button[value="session"]');
        const daySegmentBtn = page.locator('ion-segment-button[value="day"]');
        
        await expect(sessionSegmentBtn).toBeVisible();
        await expect(daySegmentBtn).toBeVisible();
        
        // --- Verify Default (Session) View ---
        
        // 1. History should have 3 items
        const historyCards = page.locator('.trend-history-card');
        await expect(historyCards).toHaveCount(3);
        
        // 2. Verify Chart Data in Session View (should have 3 points: 10, 20, 30)
        const sessionChartData = await page.evaluate(() => {
            const chart = (window as any).__trendChartInstance;
            if (chart) {
                return {
                    labels: chart.data.labels,
                    data: chart.data.datasets[0].data
                };
            }
            return null;
        });
        
        expect(sessionChartData).not.toBeNull();
        expect(sessionChartData?.labels.length).toBe(3);
        expect(sessionChartData?.data).toEqual([10, 20, 30]);

        // --- Switch to Day View ---
        await daySegmentBtn.click();
        
        // Wait for the chart to update (animation)
        await page.waitForTimeout(500);
        
        // 1. History list should STILL have 3 items, it should not change
        await expect(historyCards).toHaveCount(3);
        
        // 2. Verify Chart Data in Day View 
        // (Yesterday avg = (10+20)/2 = 15; Today avg = 30/1 = 30) -> Should have 2 points: 15, 30
        const dayChartData = await page.evaluate(() => {
            const chart = (window as any).__trendChartInstance;
            if (chart) {
                return {
                    labels: chart.data.labels,
                    data: chart.data.datasets[0].data
                };
            }
            return null;
        });
        
        expect(dayChartData).not.toBeNull();
        expect(dayChartData?.labels.length).toBe(2);
        expect(dayChartData?.data).toEqual([15, 30]);
        
        // --- Switch back to Session View ---
        await sessionSegmentBtn.click();
        await page.waitForTimeout(500);
        
        // History list should STILL have 3 items
        await expect(historyCards).toHaveCount(3);
    });
});
