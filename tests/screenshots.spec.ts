import { test } from '@playwright/test';
import path from 'path';

test.describe('Capture Screenshots for README', () => {
    test.skip();
    test('capture home page', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.home-container');
        await page.screenshot({
            path: path.join('docs', 'screenshots', 'home-page.png'),
            fullPage: false
        });
    });

    test('capture game play screen', async ({ page }) => {
        await page.goto('/');
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('.game-container');
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(500);
        await page.screenshot({
            path: path.join('docs', 'screenshots', 'game-play.png'),
            fullPage: false
        });
    });

    test('capture detail modal', async ({ page }) => {
        await page.goto('/');
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('.game-container');
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(100);
        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.click();
        await page.waitForSelector('#detail-modal.show', { state: 'visible', timeout: 2000 });
        await page.waitForTimeout(300);
        await page.screenshot({
            path: path.join('docs', 'screenshots', 'detail-modal.png'),
            fullPage: false
        });
    });

    test('capture candidates modal', async ({ page }) => {
        await page.goto('/');
        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('.game-container');
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(500);
        const computerBubble = page.locator('.computer-message .message-bubble').first();
        await computerBubble.evaluate((el) => {
            const touchStartEvent = new TouchEvent('touchstart', {
                bubbles: true,
                cancelable: true,
                touches: [new Touch({
                    identifier: 0,
                    target: el,
                    clientX: el.getBoundingClientRect().left + el.offsetWidth / 2,
                    clientY: el.getBoundingClientRect().top + el.offsetHeight / 2
                })]
            });
            el.dispatchEvent(touchStartEvent);
        });
        await page.waitForTimeout(600);
        await page.waitForSelector('#candidates-modal.show', { state: 'visible', timeout: 1000 });
        await page.click('.stat-item[data-type="total"]');
        await page.waitForTimeout(300);
        await page.screenshot({
            path: path.join('docs', 'screenshots', 'candidates-modal.png'),
            fullPage: false
        });
    });

    test('capture side menu', async ({ page }) => {
        await page.goto('/');
        await page.click('.btn-menu');
        await page.waitForSelector('.side-menu--open');
        await page.waitForTimeout(300);
        await page.screenshot({
            path: path.join('docs', 'screenshots', 'side-menu.png'),
            fullPage: false
        });
    });

    test('capture favorites page', async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.setItem('chengyujielong_favorites', JSON.stringify([
                { idiom: '一心一意', addedAt: Date.now() },
                { idiom: '意气风发', addedAt: Date.now() },
                { idiom: '发愤图强', addedAt: Date.now() },
                { idiom: '强词夺理', addedAt: Date.now() },
                { idiom: '理直气壮', addedAt: Date.now() }
            ]));
        });
        await page.reload();
        await page.click('.btn-menu');
        await page.waitForSelector('.side-menu--open');
        await page.click('.side-menu-item:has-text("收藏夹")');
        await page.waitForSelector('.favorites-container');
        await page.waitForTimeout(300);
        await page.screenshot({
            path: path.join('docs', 'screenshots', 'favorites-page.png'),
            fullPage: false
        });
    });

    test('capture trend page', async ({ page }) => {
        await page.goto('/');
        const now = Date.now();
        const fakeSessions = [];
        for (let i = 0; i < 10; i++) {
            fakeSessions.push({
                id: `session-${i}`,
                mode: 'limitedTime',
                startTime: now - (10 - i) * 3600000,
                endTime: now - (10 - i) * 3600000 + 60000,
                messages: [],
                score: Math.floor(Math.random() * 50) + 10,
                isActive: false,
                limitedTimeConfig: { gameTimeLimit: 60 }
            });
        }
        for (let i = 0; i < 8; i++) {
            fakeSessions.push({
                id: `challenge-session-${i}`,
                mode: 'challenge',
                startTime: now - (8 - i) * 7200000,
                endTime: now - (8 - i) * 7200000 + 120000,
                messages: [],
                score: Math.floor(Math.random() * 30) + 5,
                lives: 0,
                maxLives: 3,
                timeLimit: 30,
                isActive: false,
                challengeConfig: { lives: 3, timeLimit: 30 }
            });
        }
        await page.evaluate((sessions) => {
            localStorage.setItem('chengyujielong_sessions', JSON.stringify(sessions));
        }, fakeSessions);
        await page.reload();
        await page.click('.btn-menu');
        await page.waitForSelector('.side-menu--open');
        await page.click('.side-menu-item:has-text("成绩趋势")');
        await page.waitForSelector('.trend-content');
        await page.waitForTimeout(500);
        await page.screenshot({
            path: path.join('docs', 'screenshots', 'trend-page.png'),
            fullPage: false
        });
    });

    test('capture idiom library page', async ({ page }) => {
        await page.goto('/');
        await page.click('.btn-menu');
        await page.waitForSelector('.side-menu--open');
        await page.click('.side-menu-item:has-text("成语词典")');
        await page.waitForSelector('.idiom-library-container');
        await page.fill('.search-input', '心');
        await page.waitForTimeout(300);
        await page.screenshot({
            path: path.join('docs', 'screenshots', 'idiom-library.png'),
            fullPage: false
        });
    });
});
