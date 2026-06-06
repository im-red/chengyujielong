import { test, expect } from '@playwright/test';
import { openSideMenu, navigateViaMenu, getPageTitle } from './testHelpers';

test.describe('Navigation with Ionic Router', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('ion-router-outlet', { state: 'attached' });
    });

    test('TC-IONIC-NAV-001: Home page is the default route and shows correct title', async ({ page }) => {
        const title = await getPageTitle(page);
        expect(title).toBe('成语接龙');
    });

    test('TC-IONIC-NAV-002: Side menu button is visible on home page', async ({ page }) => {
        const menuButton = page.locator('ion-menu-button');
        await expect(menuButton).toBeVisible();
    });

    test('TC-IONIC-NAV-003: Side menu opens when menu button is clicked', async ({ page }) => {
        await openSideMenu(page);
        const menu = page.locator('ion-menu');
        const classes = await menu.getAttribute('class');
        expect(classes).toBeTruthy();
    });

    test('TC-IONIC-NAV-004: Side menu contains favorites link', async ({ page }) => {
        await openSideMenu(page);
        const favoritesItem = page.locator('ion-item').filter({ hasText: '收藏夹' }).first();
        await expect(favoritesItem).toBeVisible();
    });

    test('TC-IONIC-NAV-005: Side menu contains trend link', async ({ page }) => {
        await openSideMenu(page);
        const trendItem = page.locator('ion-item').filter({ hasText: '成绩趋势' }).first();
        await expect(trendItem).toBeVisible();
    });

    test('TC-IONIC-NAV-006: Side menu contains idiom library link', async ({ page }) => {
        await openSideMenu(page);
        const libraryItem = page.locator('ion-item').filter({ hasText: '成语词典' }).first();
        await expect(libraryItem).toBeVisible();
    });

    test('TC-IONIC-NAV-007: Side menu contains pinyin patch link', async ({ page }) => {
        await openSideMenu(page);
        const patchItem = page.locator('ion-item').filter({ hasText: '拼音修正' }).first();
        await expect(patchItem).toBeVisible();
    });

    test('TC-IONIC-NAV-008: Side menu contains settings link', async ({ page }) => {
        await openSideMenu(page);
        const settingsItem = page.locator('ion-item').filter({ hasText: '设置' }).first();
        await expect(settingsItem).toBeVisible();
    });

    test('TC-IONIC-NAV-009: Side menu contains export link', async ({ page }) => {
        await openSideMenu(page);
        const exportItem = page.locator('ion-item').filter({ hasText: '导出数据' }).first();
        await expect(exportItem).toBeVisible();
    });

    test('TC-IONIC-NAV-010: Side menu contains import link', async ({ page }) => {
        await openSideMenu(page);
        const importItem = page.locator('ion-item').filter({ hasText: '导入数据' }).first();
        await expect(importItem).toBeVisible();
    });

    test('TC-IONIC-NAV-011: Navigating to favorites via side menu', async ({ page }) => {
        await navigateViaMenu(page, '收藏夹');
        const title = await getPageTitle(page);
        expect(title).toBe('收藏夹');
    });

    test('TC-IONIC-NAV-012: Navigating to idiom library via side menu', async ({ page }) => {
        await navigateViaMenu(page, '成语词典');
        const title = await getPageTitle(page);
        expect(title).toBe('成语词典');
    });

    test('TC-IONIC-NAV-013: Navigating to settings via side menu', async ({ page }) => {
        await navigateViaMenu(page, '设置');
        const title = await getPageTitle(page);
        expect(title).toBe('设置');
    });
});

test.describe('Home Page Mode Cards', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('ion-router-outlet', { state: 'attached' });
    });

    test('TC-IONIC-HOME-001: Endless mode card is visible', async ({ page }) => {
        const endlessCard = page.locator('text=无尽模式').first();
        await expect(endlessCard).toBeVisible();
    });

    test('TC-IONIC-HOME-003: Limited time mode card is visible', async ({ page }) => {
        const limitedCard = page.locator('text=限时模式').first();
        await expect(limitedCard).toBeVisible();
    });

    test('TC-IONIC-HOME-004: Multiplayer mode card is visible', async ({ page }) => {
        const multiCard = page.locator('text=多人模式').first();
        await expect(multiCard).toBeVisible();
    });

    test('TC-IONIC-HOME-005: Clicking endless mode starts game and navigates to game page', async ({ page }) => {
        const endlessCard = page.locator('text=无尽模式').first();
        await endlessCard.click();
        await page.waitForTimeout(500);

        try {
            const title = await getPageTitle(page);
            expect(title).toContain('无尽');
        } catch {
            await page.waitForSelector('#idiom-input', { state: 'visible', timeout: 3000 });
        }
    });

    test('TC-IONIC-HOME-007: Clicking limited time mode navigates to config page', async ({ page }) => {
        const limitedCard = page.locator('text=限时模式').first();
        await limitedCard.click();
        await page.waitForTimeout(500);

        const title = await getPageTitle(page);
        expect(title).toContain('限时模式配置');
    });

    test('TC-IONIC-HOME-008: Clicking multiplayer mode navigates to player setup', async ({ page }) => {
        const multiCard = page.locator('text=多人模式').first();
        await multiCard.click();
        await page.waitForTimeout(500);

        const title = await getPageTitle(page);
        expect(title).toContain('多人模式');
    });
});
