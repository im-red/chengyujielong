import { test, expect } from '@playwright/test';

test.describe('Favorites Feature', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.removeItem('chengyujielong_favorites');
        });
        await page.reload();
    });

    test.describe('Side Menu Entry', () => {
        test('side menu should have favorites menu item', async ({ page }) => {
            await page.click('.btn-menu');
            await page.waitForSelector('.side-menu--open');
            await expect(page.locator('.side-menu-item:has-text("收藏夹")')).toBeVisible();
        });

        test('clicking favorites should navigate to FavoritesPage', async ({ page }) => {
            await page.click('.btn-menu');
            await page.waitForSelector('.side-menu--open');
            await page.click('.side-menu-item:has-text("收藏夹")');
            await expect(page.locator('.favorites-container')).toBeVisible();
            await expect(page.locator('.app-header h1')).toHaveText('收藏夹');
        });

        test('side menu should close after clicking favorites', async ({ page }) => {
            await page.click('.btn-menu');
            await page.waitForSelector('.side-menu--open');
            await page.click('.side-menu-item:has-text("收藏夹")');
            await expect(page.locator('.side-menu--open')).not.toBeVisible();
        });

        test('badge should show favorites count', async ({ page }) => {
            await page.evaluate(() => {
                localStorage.setItem('chengyujielong_favorites', JSON.stringify([
                    { idiom: '一心一意', addedAt: Date.now() },
                    { idiom: '二话不说', addedAt: Date.now() }
                ]));
            });
            await page.reload();
            await page.click('.btn-menu');
            await page.waitForSelector('.side-menu--open');
            const badge = page.locator('.side-menu-item:has-text("收藏夹") .side-menu-badge');
            await expect(badge).toBeVisible();
            await expect(badge).toHaveText('2');
        });
    });

    test.describe('FavoritesPage Visibility', () => {
        test('FavoritesPage should be visible', async ({ page }) => {
            await page.click('.btn-menu');
            await page.waitForSelector('.side-menu--open');
            await page.click('.side-menu-item:has-text("收藏夹")');
            await expect(page.locator('.favorites-container')).toBeVisible();
        });

        test('header should show correct title', async ({ page }) => {
            await page.click('.btn-menu');
            await page.waitForSelector('.side-menu--open');
            await page.click('.side-menu-item:has-text("收藏夹")');
            await expect(page.locator('.app-header h1')).toHaveText('收藏夹');
        });

        test('empty state should show when no favorites', async ({ page }) => {
            await page.click('.btn-menu');
            await page.waitForSelector('.side-menu--open');
            await page.click('.side-menu-item:has-text("收藏夹")');
            await page.waitForSelector('.favorites-container');
            const favorites = await page.evaluate(() => {
                return JSON.parse(localStorage.getItem('chengyujielong_favorites') || '[]');
            });
            expect(favorites.length).toBe(0);
            await expect(page.locator('.favorites-empty')).toBeVisible();
        });

        test('stats should show correct count', async ({ page }) => {
            await page.evaluate(() => {
                localStorage.setItem('chengyujielong_favorites', JSON.stringify([
                    { idiom: '一心一意', addedAt: Date.now() }
                ]));
            });
            await page.reload();
            await page.click('.btn-menu');
            await page.waitForSelector('.side-menu--open');
            await page.click('.side-menu-item:has-text("收藏夹")');
            await expect(page.locator('.favorites-stats')).toContainText('共 1 个成语');
        });
    });

    test.describe('FavoritesPage with Favorites', () => {
        test('should show favorites grouped by leading pinyin', async ({ page }) => {
            await page.evaluate(() => {
                localStorage.setItem('chengyujielong_favorites', JSON.stringify([
                    { idiom: '一心一意', addedAt: Date.now() },
                    { idiom: '一马当先', addedAt: Date.now() }
                ]));
            });
            await page.reload();
            await page.click('.btn-menu');
            await page.waitForSelector('.side-menu--open');
            await page.click('.side-menu-item:has-text("收藏夹")');
            await expect(page.locator('.favorites-section')).toBeVisible();
        });

        test('should show pinyin section headers', async ({ page }) => {
            await page.evaluate(() => {
                localStorage.setItem('chengyujielong_favorites', JSON.stringify([
                    { idiom: '一心一意', addedAt: Date.now() }
                ]));
            });
            await page.reload();
            await page.click('.btn-menu');
            await page.waitForSelector('.side-menu--open');
            await page.click('.side-menu-item:has-text("收藏夹")');
            await expect(page.locator('.favorites-section-pinyin')).toBeVisible();
        });

        test('should show idiom items under each section', async ({ page }) => {
            await page.evaluate(() => {
                localStorage.setItem('chengyujielong_favorites', JSON.stringify([
                    { idiom: '一心一意', addedAt: Date.now() }
                ]));
            });
            await page.reload();
            await page.click('.btn-menu');
            await page.waitForSelector('.side-menu--open');
            await page.click('.side-menu-item:has-text("收藏夹")');
            await expect(page.locator('.favorites-item')).toBeVisible();
            await expect(page.locator('.favorites-item-word')).toHaveText('一心一意');
        });

        test('clicking an idiom should open detail modal', async ({ page }) => {
            await page.evaluate(() => {
                localStorage.setItem('chengyujielong_favorites', JSON.stringify([
                    { idiom: '一心一意', addedAt: Date.now() }
                ]));
            });
            await page.reload();
            await page.click('.btn-menu');
            await page.waitForSelector('.side-menu--open');
            await page.click('.side-menu-item:has-text("收藏夹")');
            await page.click('.favorites-item');
            await expect(page.locator('#detail-modal.show')).toBeVisible();
        });

        test('sections should be collapsible', async ({ page }) => {
            await page.evaluate(() => {
                localStorage.setItem('chengyujielong_favorites', JSON.stringify([
                    { idiom: '一心一意', addedAt: Date.now() }
                ]));
            });
            await page.reload();
            await page.click('.btn-menu');
            await page.waitForSelector('.side-menu--open');
            await page.click('.side-menu-item:has-text("收藏夹")');
            await expect(page.locator('.favorites-section-items')).toBeVisible();
            await page.click('.favorites-section-header');
            await expect(page.locator('.favorites-section-items')).not.toBeVisible();
            await page.click('.favorites-section-header');
            await expect(page.locator('.favorites-section-items')).toBeVisible();
        });
    });

    test.describe('DetailModal - Star Icon', () => {
        test('star icon should be visible in DetailModal', async ({ page }) => {
            await page.click('.mode-card:has-text("无尽模式")');
            await page.waitForSelector('.game-container');
            await page.fill('#idiom-input', '一心一意');
            await page.click('#submit-btn');
            await page.waitForSelector('.message-bubble');
            await page.waitForTimeout(100);
            const userBubble = page.locator('.user-message .message-bubble').first();
            await userBubble.click();
            await page.waitForSelector('#detail-modal.show', { state: 'visible', timeout: 2000 });
            await expect(page.locator('.favorite-btn')).toBeVisible();
        });

        test('star should be empty when idiom is not favorited', async ({ page }) => {
            await page.click('.mode-card:has-text("无尽模式")');
            await page.waitForSelector('.game-container');
            await page.fill('#idiom-input', '一心一意');
            await page.click('#submit-btn');
            await page.waitForSelector('.message-bubble');
            await page.waitForTimeout(100);
            const userBubble = page.locator('.user-message .message-bubble').first();
            await userBubble.click();
            await page.waitForSelector('#detail-modal.show', { state: 'visible', timeout: 2000 });
            await expect(page.locator('.favorite-btn')).toHaveText('☆');
        });

        test('star should be filled when idiom is favorited', async ({ page }) => {
            await page.evaluate(() => {
                localStorage.setItem('chengyujielong_favorites', JSON.stringify([
                    { idiom: '一心一意', addedAt: Date.now() }
                ]));
            });
            await page.reload();
            await page.click('.mode-card:has-text("无尽模式")');
            await page.waitForSelector('.game-container');
            await page.fill('#idiom-input', '一心一意');
            await page.click('#submit-btn');
            await page.waitForSelector('.message-bubble');
            await page.waitForTimeout(100);
            const userBubble = page.locator('.user-message .message-bubble').first();
            await userBubble.click();
            await page.waitForSelector('#detail-modal.show', { state: 'visible', timeout: 2000 });
            await expect(page.locator('.favorite-btn.favorited')).toBeVisible();
            await expect(page.locator('.favorite-btn')).toHaveText('★');
        });

        test('clicking empty star should add to favorites', async ({ page }) => {
            await page.click('.mode-card:has-text("无尽模式")');
            await page.waitForSelector('.game-container');
            await page.fill('#idiom-input', '一心一意');
            await page.click('#submit-btn');
            await page.waitForSelector('.message-bubble');
            await page.waitForTimeout(100);
            const userBubble = page.locator('.user-message .message-bubble').first();
            await userBubble.click();
            await page.waitForSelector('#detail-modal.show', { state: 'visible', timeout: 2000 });
            await page.click('.favorite-btn');
            await expect(page.locator('.favorite-btn.favorited')).toBeVisible();
            const favorites = await page.evaluate(() => {
                return JSON.parse(localStorage.getItem('chengyujielong_favorites') || '[]');
            });
            expect(favorites.length).toBe(1);
            expect(favorites[0].idiom).toBe('一心一意');
        });

        test('clicking filled star should remove from favorites', async ({ page }) => {
            await page.evaluate(() => {
                localStorage.setItem('chengyujielong_favorites', JSON.stringify([
                    { idiom: '一心一意', addedAt: Date.now() }
                ]));
            });
            await page.reload();
            await page.click('.mode-card:has-text("无尽模式")');
            await page.waitForSelector('.game-container');
            await page.fill('#idiom-input', '一心一意');
            await page.click('#submit-btn');
            await page.waitForSelector('.message-bubble');
            await page.waitForTimeout(100);
            const userBubble = page.locator('.user-message .message-bubble').first();
            await userBubble.click();
            await page.waitForSelector('#detail-modal.show', { state: 'visible', timeout: 2000 });
            await expect(page.locator('.favorite-btn.favorited')).toBeVisible();
            await page.click('.favorite-btn');
            await expect(page.locator('.favorite-btn.favorited')).not.toBeVisible();
            const favorites = await page.evaluate(() => {
                return JSON.parse(localStorage.getItem('chengyujielong_favorites') || '[]');
            });
            expect(favorites.length).toBe(0);
        });

        test('star state should persist after closing and reopening modal', async ({ page }) => {
            await page.click('.mode-card:has-text("无尽模式")');
            await page.waitForSelector('.game-container');
            await page.fill('#idiom-input', '一心一意');
            await page.click('#submit-btn');
            await page.waitForSelector('.message-bubble');
            await page.waitForTimeout(100);
            const userBubble = page.locator('.user-message .message-bubble').first();
            await userBubble.click();
            await page.waitForSelector('#detail-modal.show', { state: 'visible', timeout: 2000 });
            await page.click('.favorite-btn');
            await expect(page.locator('.favorite-btn.favorited')).toBeVisible();
            const favoritesBefore = await page.evaluate(() => {
                return JSON.parse(localStorage.getItem('chengyujielong_favorites') || '[]');
            });
            expect(favoritesBefore.length).toBe(1);
            expect(favoritesBefore[0].idiom).toBe('一心一意');
            await page.keyboard.press('Escape');
            await page.waitForFunction(() => {
                const modal = document.getElementById('detail-modal');
                return modal && !modal.classList.contains('show');
            });
            await userBubble.click();
            await page.waitForSelector('#detail-modal.show', { state: 'visible', timeout: 2000 });
            await expect(page.locator('.favorite-btn.favorited')).toBeVisible();
        });
    });

    test.describe('CandidatesModal - Long Press', () => {
        test('long press on candidate item should toggle favorite', async ({ page }) => {
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
            const candidateItem = page.locator('.candidate-item').first();
            const box = await candidateItem.boundingBox();
            if (box) {
                await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                await page.mouse.down();
                await page.waitForTimeout(600);
                await page.mouse.up();
            }
            const favorites = await page.evaluate(() => {
                return JSON.parse(localStorage.getItem('chengyujielong_favorites') || '[]');
            });
            expect(favorites.length).toBe(1);
        });
    });

    test.describe('Favorites Persistence', () => {
        test('favorites should persist in localStorage', async ({ page }) => {
            await page.evaluate(() => {
                localStorage.setItem('chengyujielong_favorites', JSON.stringify([
                    { idiom: '一心一意', addedAt: Date.now() }
                ]));
            });
            await page.reload();
            const favorites = await page.evaluate(() => {
                return JSON.parse(localStorage.getItem('chengyujielong_favorites') || '[]');
            });
            expect(favorites.length).toBe(1);
            expect(favorites[0].idiom).toBe('一心一意');
        });

        test('favorites should load on app start', async ({ page }) => {
            await page.evaluate(() => {
                localStorage.setItem('chengyujielong_favorites', JSON.stringify([
                    { idiom: '一心一意', addedAt: Date.now() }
                ]));
            });
            await page.reload();
            await page.click('.btn-menu');
            await page.waitForSelector('.side-menu--open');
            const badge = page.locator('.side-menu-item:has-text("收藏夹") .side-menu-badge');
            await expect(badge).toBeVisible();
            await expect(badge).toHaveText('1');
        });
    });

    test.describe('FavoritesPage - Remove from Favorites', () => {
        test('should be able to remove from favorites page', async ({ page }) => {
            await page.evaluate(() => {
                localStorage.setItem('chengyujielong_favorites', JSON.stringify([
                    { idiom: '一心一意', addedAt: Date.now() }
                ]));
            });
            await page.reload();
            await page.click('.btn-menu');
            await page.waitForSelector('.side-menu--open');
            await page.click('.side-menu-item:has-text("收藏夹")');
            await expect(page.locator('.favorites-item')).toBeVisible();
            await page.click('.favorites-item-remove');
            await expect(page.locator('.favorites-empty')).toBeVisible();
        });

        test('removing should update the list immediately', async ({ page }) => {
            await page.evaluate(() => {
                localStorage.setItem('chengyujielong_favorites', JSON.stringify([
                    { idiom: '一心一意', addedAt: Date.now() },
                    { idiom: '二话不说', addedAt: Date.now() }
                ]));
            });
            await page.reload();
            await page.click('.btn-menu');
            await page.waitForSelector('.side-menu--open');
            await page.click('.side-menu-item:has-text("收藏夹")');
            await expect(page.locator('.favorites-item')).toHaveCount(2);
            await page.locator('.favorites-item').first().locator('.favorites-item-remove').click();
            await expect(page.locator('.favorites-item')).toHaveCount(1);
        });

        test('removing should update the badge count', async ({ page }) => {
            await page.evaluate(() => {
                localStorage.setItem('chengyujielong_favorites', JSON.stringify([
                    { idiom: '一心一意', addedAt: Date.now() }
                ]));
            });
            await page.reload();
            await page.click('.btn-menu');
            await page.waitForSelector('.side-menu--open');
            await page.click('.side-menu-item:has-text("收藏夹")');
            await page.click('.favorites-item-remove');
            await page.click('.btn-back');
            await page.click('.btn-menu');
            await page.waitForSelector('.side-menu--open');
            await expect(page.locator('.side-menu-item:has-text("收藏夹") .side-menu-badge')).not.toBeVisible();
        });
    });
});

test.describe('Favorites Feature - Mobile Viewport', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.removeItem('chengyujielong_favorites');
        });
        await page.reload();
    });

    test('side menu should work on mobile', async ({ page }) => {
        await page.click('.btn-menu');
        await page.waitForSelector('.side-menu--open');
        await expect(page.locator('.side-menu-item:has-text("收藏夹")')).toBeVisible();
    });

    test('favorites page should be visible on mobile', async ({ page }) => {
        await page.click('.btn-menu');
        await page.waitForSelector('.side-menu--open');
        await page.click('.side-menu-item:has-text("收藏夹")');
        await expect(page.locator('.favorites-container')).toBeVisible();
    });

    test('long press on candidate should work on mobile', async ({ browser }) => {
        const context = await browser.newContext({
            hasTouch: true,
            viewport: { width: 375, height: 667 }
        });
        const page = await context.newPage();
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.removeItem('chengyujielong_favorites');
        });

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
        const candidateItem = page.locator('.candidate-item').first();
        const box = await candidateItem.boundingBox();
        if (box) {
            await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
            await page.waitForTimeout(600);
        }
        await context.close();
    });

    test('detail modal star should work on mobile', async ({ browser }) => {
        const context = await browser.newContext({
            hasTouch: true,
            viewport: { width: 375, height: 667 }
        });
        const page = await context.newPage();
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.removeItem('chengyujielong_favorites');
        });

        await page.click('.mode-card:has-text("无尽模式")');
        await page.waitForSelector('.game-container');
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble');
        await page.waitForTimeout(100);
        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.tap();
        await page.waitForSelector('#detail-modal.show', { state: 'visible', timeout: 2000 });
        await expect(page.locator('.favorite-btn')).toBeVisible();
        await page.click('.favorite-btn');
        await expect(page.locator('.favorite-btn.favorited')).toBeVisible();
        await context.close();
    });
});
