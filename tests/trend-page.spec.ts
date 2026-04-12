import { test, expect } from '@playwright/test';

async function openSideMenu(page: any) {
    await page.click('.btn-menu');
    await page.waitForSelector('.side-menu--open', { state: 'visible' });
    await page.waitForTimeout(400);
}

async function navigateToTrendPage(page: any) {
    await openSideMenu(page);
    await page.click('.side-menu-item:has-text("成绩趋势")');
    await page.waitForSelector('.trend-content', { state: 'visible' });
}

async function createGameSession(page: any, mode: string, config: any, score: number) {
    await page.evaluate(({ mode, config, score }) => {
        const sessions = JSON.parse(localStorage.getItem('chengyujielong_sessions') || '[]');
        const now = Date.now();
        const session = {
            id: `game_${now}_${Math.random().toString(36).substr(2, 9)}`,
            mode,
            startTime: now - Math.floor(Math.random() * 86400000),
            endTime: now - Math.floor(Math.random() * 3600000),
            messages: [],
            score,
            isActive: false
        };

        if (mode === 'challenge') {
            session.challengeConfig = config;
            session.lives = config.lives;
            session.maxLives = config.lives;
            session.timeLimit = config.timeLimit;
        } else if (mode === 'limitedTime') {
            session.limitedTimeConfig = config;
            session.gameTimeLimit = config.gameTimeLimit;
        }

        sessions.push(session);
        localStorage.setItem('chengyujielong_sessions', JSON.stringify(sessions));
    }, { mode, config, score });
}

async function clearAllSessions(page: any) {
    await page.evaluate(() => {
        localStorage.removeItem('chengyujielong_sessions');
    });
}

test.describe('Trend Page - Side Menu Entry', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
    });

    test('side menu should have 成绩趋势 menu item', async ({ page }) => {
        await openSideMenu(page);
        const menuItem = page.locator('.side-menu-item:has-text("成绩趋势")');
        await expect(menuItem).toBeVisible();
    });

    test('clicking 成绩趋势 should navigate to trend page', async ({ page }) => {
        await navigateToTrendPage(page);
        await expect(page.locator('.trend-content')).toBeVisible();
    });

    test('side menu should close after clicking 成绩趋势', async ({ page }) => {
        await openSideMenu(page);
        await page.click('.side-menu-item:has-text("成绩趋势")');
        await page.waitForSelector('.trend-content', { state: 'visible' });
        await page.waitForSelector('.side-menu--open', { state: 'hidden', timeout: 1000 });
    });
});

test.describe('Trend Page - Visibility', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
    });

    test('trend page should be visible', async ({ page }) => {
        await navigateToTrendPage(page);
        const container = page.locator('.trend-content');
        await expect(container).toBeVisible();
    });

    test('header should show 成绩趋势 title', async ({ page }) => {
        await navigateToTrendPage(page);
        const title = page.locator('.app-header .header-title h1');
        await expect(title).toHaveText('成绩趋势');
    });

    test('tabs should be visible', async ({ page }) => {
        await navigateToTrendPage(page);
        const tabs = page.locator('.trend-tabs');
        await expect(tabs).toBeVisible();
    });

    test('limited time tab should be visible', async ({ page }) => {
        await navigateToTrendPage(page);
        const tab = page.locator('.trend-tab:has-text("限时模式")');
        await expect(tab).toBeVisible();
    });

    test('challenge tab should be visible', async ({ page }) => {
        await navigateToTrendPage(page);
        const tab = page.locator('.trend-tab:has-text("挑战模式")');
        await expect(tab).toBeVisible();
    });

    test('limited time tab should be active by default', async ({ page }) => {
        await navigateToTrendPage(page);
        const tab = page.locator('.trend-tab:has-text("限时模式")');
        await expect(tab).toHaveClass(/trend-tab--active/);
    });
});

test.describe('Trend Page - Empty State', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
        await clearAllSessions(page);
    });

    test('should show empty state when no limited time sessions', async ({ page }) => {
        await navigateToTrendPage(page);
        const emptyState = page.locator('.trend-empty');
        await expect(emptyState).toBeVisible();
        await expect(emptyState).toContainText('暂无限时模式的游戏记录');
    });

    test('should show empty state when no challenge sessions', async ({ page }) => {
        await navigateToTrendPage(page);
        await page.click('.trend-tab:has-text("挑战模式")');
        await page.waitForTimeout(200);

        const emptyState = page.locator('.trend-empty');
        await expect(emptyState).toBeVisible();
        await expect(emptyState).toContainText('暂无挑战模式的游戏记录');
    });
});

test.describe('Trend Page - With Limited Time Sessions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');

        await clearAllSessions(page);

        await createGameSession(page, 'limitedTime', { gameTimeLimit: 120 }, 50);
        await createGameSession(page, 'limitedTime', { gameTimeLimit: 120 }, 75);
        await createGameSession(page, 'limitedTime', { gameTimeLimit: 120 }, 60);

        await page.reload();
        await page.waitForSelector('.mode-card');
    });

    test('should show config selector', async ({ page }) => {
        await navigateToTrendPage(page);
        const selector = page.locator('.trend-config-select');
        await expect(selector).toBeVisible();
    });

    test('should show stats', async ({ page }) => {
        await navigateToTrendPage(page);
        const stats = page.locator('.trend-stats');
        await expect(stats).toBeVisible();
    });

    test('should show game count in stats', async ({ page }) => {
        await navigateToTrendPage(page);
        const gameCount = page.locator('.trend-stat-item').first().locator('.trend-stat-value');
        await expect(gameCount).toHaveText('3');
    });

    test('should show average score in stats', async ({ page }) => {
        await navigateToTrendPage(page);
        const avgScore = page.locator('.trend-stat-item').nth(1).locator('.trend-stat-value');
        const text = await avgScore.textContent();
        expect(parseInt(text!)).toBe(62);
    });

    test('should show max score in stats', async ({ page }) => {
        await navigateToTrendPage(page);
        const maxScore = page.locator('.trend-stat-item').nth(2).locator('.trend-stat-value');
        await expect(maxScore).toHaveText('75');
    });

    test('should show min score in stats', async ({ page }) => {
        await navigateToTrendPage(page);
        const minScore = page.locator('.trend-stat-item').nth(3).locator('.trend-stat-value');
        await expect(minScore).toHaveText('50');
    });

    test('should show chart', async ({ page }) => {
        await navigateToTrendPage(page);
        const chart = page.locator('.trend-chart');
        await expect(chart).toBeVisible();
    });

    test('should show history list', async ({ page }) => {
        await navigateToTrendPage(page);
        const historyList = page.locator('.trend-history-list');
        await expect(historyList).toBeVisible();
    });

    test('history list should show all sessions', async ({ page }) => {
        await navigateToTrendPage(page);
        const items = page.locator('.trend-history-item');
        await expect(items).toHaveCount(3);
    });
});

test.describe('Trend Page - With Challenge Sessions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');

        await clearAllSessions(page);

        await createGameSession(page, 'challenge', { lives: 3, timeLimit: 30 }, 100);
        await createGameSession(page, 'challenge', { lives: 3, timeLimit: 30 }, 120);
        await createGameSession(page, 'challenge', { lives: 5, timeLimit: 0 }, 80);

        await page.reload();
        await page.waitForSelector('.mode-card');
    });

    test('should switch to challenge tab', async ({ page }) => {
        await navigateToTrendPage(page);
        await page.click('.trend-tab:has-text("挑战模式")');
        await page.waitForTimeout(200);

        const tab = page.locator('.trend-tab:has-text("挑战模式")');
        await expect(tab).toHaveClass(/trend-tab--active/);
    });

    test('should show challenge sessions after switching tab', async ({ page }) => {
        await navigateToTrendPage(page);
        await page.click('.trend-tab:has-text("挑战模式")');
        await page.waitForTimeout(200);

        const stats = page.locator('.trend-stats');
        await expect(stats).toBeVisible();
    });

    test('should show config options for different challenge configs', async ({ page }) => {
        await navigateToTrendPage(page);
        await page.click('.trend-tab:has-text("挑战模式")');
        await page.waitForTimeout(200);

        const selector = page.locator('.trend-config-select');
        const options = await selector.locator('option').count();
        expect(options).toBe(2);
    });
});

test.describe('Trend Page - Config Filtering', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');

        await clearAllSessions(page);

        await createGameSession(page, 'limitedTime', { gameTimeLimit: 60 }, 40);
        await createGameSession(page, 'limitedTime', { gameTimeLimit: 60 }, 50);
        await createGameSession(page, 'limitedTime', { gameTimeLimit: 120 }, 80);
        await createGameSession(page, 'limitedTime', { gameTimeLimit: 120 }, 90);

        await page.reload();
        await page.waitForSelector('.mode-card');
    });

    test('should filter by selected config', async ({ page }) => {
        await navigateToTrendPage(page);

        const selector = page.locator('.trend-config-select');
        await selector.selectOption({ index: 0 });
        await page.waitForTimeout(200);

        const items = page.locator('.trend-history-item');
        const count = await items.count();
        expect(count).toBeGreaterThan(0);
    });

    test('should update stats when config changes', async ({ page }) => {
        await navigateToTrendPage(page);

        const selector = page.locator('.trend-config-select');
        await selector.selectOption({ index: 0 });
        await page.waitForTimeout(200);

        const gameCount = page.locator('.trend-stat-item').first().locator('.trend-stat-value');
        const text = await gameCount.textContent();
        expect(parseInt(text!)).toBeGreaterThan(0);
    });
});

test.describe('Trend Page - Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
    });

    test('back button should return to home page', async ({ page }) => {
        await navigateToTrendPage(page);
        await page.click('.btn-back');
        await page.waitForSelector('.home-container', { state: 'visible' });
        await expect(page.locator('.home-container')).toBeVisible();
    });
});

test.describe('Trend Page - Mobile Viewport', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');

        await clearAllSessions(page);

        await createGameSession(page, 'limitedTime', { gameTimeLimit: 120 }, 50);

        await page.reload();
        await page.waitForSelector('.mode-card');
    });

    test('trend page should be visible on mobile', async ({ page }) => {
        await navigateToTrendPage(page);
        await expect(page.locator('.trend-content')).toBeVisible();
    });

    test('tabs should be visible on mobile', async ({ page }) => {
        await navigateToTrendPage(page);
        const tabs = page.locator('.trend-tabs');
        await expect(tabs).toBeVisible();
    });

    test('chart should be visible on mobile', async ({ page }) => {
        await navigateToTrendPage(page);
        const chart = page.locator('.trend-chart');
        await expect(chart).toBeVisible();
    });

    test('stats should adapt to mobile layout', async ({ page }) => {
        await navigateToTrendPage(page);
        const stats = page.locator('.trend-stats');
        await expect(stats).toBeVisible();
    });
});
