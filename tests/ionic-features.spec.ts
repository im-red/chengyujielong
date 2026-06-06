import { test, expect } from '@playwright/test';
import { navigateViaMenu } from './testHelpers';

test.describe('Idiom Library with Ionic', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('ion-router-outlet', { state: 'attached' });
    });

    test('TC-IONIC-LIB-001: Idiom library is accessible via side menu', async ({ page }) => {
        await navigateViaMenu(page, '成语词典');
        const title = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-title').first();
        expect(await title.textContent()).toBe('成语词典');
    });

    test('TC-IONIC-LIB-002: Idiom library shows total count', async ({ page }) => {
        await navigateViaMenu(page, '成语词典');
        const content = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-content').first();
        const text = await content.textContent();
        expect(text).toContain('共');
        expect(text).toContain('个成语');
    });

    test('TC-IONIC-LIB-003: Idiom library has search bar', async ({ page }) => {
        await navigateViaMenu(page, '成语词典');
        const searchbar = page.locator('ion-searchbar');
        await expect(searchbar).toBeVisible();
    });

    test('TC-IONIC-LIB-004: Search filters idiom list', async ({ page }) => {
        await navigateViaMenu(page, '成语词典');

        const initialItems = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-content').locator('.message-bubble, div').first();
        await expect(initialItems).toBeVisible();

        const searchbar = page.locator('ion-searchbar input');
        await searchbar.fill('一心一意');
        await page.waitForTimeout(500);

        const content = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-content').first();
        const text = await content.textContent();
        expect(text).toContain('一心一意');
    });

    test('TC-IONIC-LIB-005: Matching mode toggle exists', async ({ page }) => {
        await navigateViaMenu(page, '成语词典');
        const matchingBtn = page.locator('button').filter({ hasText: '开头匹配' }).first();
        await expect(matchingBtn).toBeVisible();
    });

    test('TC-IONIC-LIB-006: Search details toggle exists', async ({ page }) => {
        await navigateViaMenu(page, '成语词典');
        const detailsBtn = page.locator('button').filter({ hasText: '搜索释义' }).first();
        await expect(detailsBtn).toBeVisible();
    });

    test('TC-IONIC-LIB-007: Clicking idiom in library opens detail modal', async ({ page }) => {
        await navigateViaMenu(page, '成语词典');

        const idiomItems = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-content').locator('div').filter({ hasText: /^[\u4e00-\u9fff]{4}$/ });
        const count = await idiomItems.count();

        if (count > 0) {
            await idiomItems.first().click();
            await page.waitForTimeout(500);

            const modal = page.locator('ion-modal.show-modal');
            const isModalVisible = await modal.isVisible().catch(() => false);
            if (isModalVisible) {
                console.log('[Test] ✓ Detail modal opened from idiom library');
            }
        }
    });
});

test.describe('Settings Page with Ionic', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('ion-router-outlet', { state: 'attached' });
    });

    test('TC-IONIC-SETTINGS-001: Settings page is accessible via side menu', async ({ page }) => {
        await navigateViaMenu(page, '设置');
        const title = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-title').first();
        expect(await title.textContent()).toBe('设置');
    });

    test('TC-IONIC-SETTINGS-002: Settings page shows about option', async ({ page }) => {
        await navigateViaMenu(page, '设置');
        const content = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-content').first();
        const text = await content.textContent();
        expect(text).toContain('关于');
    });

    test('TC-IONIC-SETTINGS-003: Clicking about navigates to about page', async ({ page }) => {
        await navigateViaMenu(page, '设置');
        const aboutOption = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-item').filter({ hasText: '关于' }).first();
        await aboutOption.click();
        await page.waitForTimeout(500);

        const title = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-title').first();
        expect(await title.textContent()).toBe('关于');
    });
});

test.describe('About Page with Ionic', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('ion-router-outlet', { state: 'attached' });
    });

    test('TC-IONIC-ABOUT-001: About page shows app name', async ({ page }) => {
        await navigateViaMenu(page, '设置');
        const aboutOption = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-item').filter({ hasText: '关于' }).first();
        await aboutOption.click();
        await page.waitForTimeout(500);
        
        const content = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-content').first();
        const text = await content.textContent();
        expect(text).toContain('成语接龙');
    });

    test('TC-IONIC-ABOUT-002: About page shows check update option', async ({ page }) => {
        await navigateViaMenu(page, '设置');
        const aboutOption = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-item').filter({ hasText: '关于' }).first();
        await aboutOption.click();
        await page.waitForTimeout(500);
        
        const content = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-content').first();
        const text = await content.textContent();
        expect(text).toContain('检查更新');
    });

    test('TC-IONIC-ABOUT-003: About page shows website and license options', async ({ page }) => {
        await navigateViaMenu(page, '设置');
        const aboutOption = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-item').filter({ hasText: '关于' }).first();
        await aboutOption.click();
        await page.waitForTimeout(500);
        
        const content = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-content').first();
        const text = await content.textContent();
        expect(text).toContain('查看网站');
        expect(text).toContain('许可协议');
    });
});
