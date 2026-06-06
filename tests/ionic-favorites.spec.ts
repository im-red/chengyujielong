import { test, expect } from '@playwright/test';
import { navigateViaMenu, startEndlessMode, openDetailModal, closeModal } from './testHelpers';

test.describe('Favorites Feature with Ionic', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.waitForSelector('ion-router-outlet', { state: 'attached' });
    });

    test('TC-IONIC-FAV-001: Favorites page is accessible via side menu', async ({ page }) => {
        await navigateViaMenu(page, '收藏夹');
        const title = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-title').first();
        expect(await title.textContent()).toBe('收藏夹');
    });

    test('TC-IONIC-FAV-002: Empty favorites page shows placeholder text', async ({ page }) => {
        await navigateViaMenu(page, '收藏夹');
        const content = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-content').first();
        const text = await content.textContent();
        expect(text).toContain('暂无收藏的成语');
    });

    test('TC-IONIC-FAV-003: Detail modal has favorite button', async ({ page }) => {
        await startEndlessMode(page);

        const firstBubble = page.locator('.message-bubble').first();
        await firstBubble.click();

        const modal = page.locator('ion-modal.show-modal');
        await expect(modal).toBeVisible({ timeout: 5000 });

        const favBtn = page.locator('.favorite-btn');
        await expect(favBtn).toBeVisible();
    });

    test('TC-IONIC-FAV-004: Favorite button toggle adds and removes favorite', async ({ page }) => {
        await startEndlessMode(page);

        const firstBubble = page.locator('.message-bubble').first();
        await firstBubble.click();

        const modal = page.locator('ion-modal.show-modal');
        await expect(modal).toBeVisible({ timeout: 5000 });

        const favBtn = page.locator('.favorite-btn');
        const initialClass = await favBtn.getAttribute('class');
        expect(initialClass).not.toContain('favorited');

        await favBtn.click();
        await page.waitForTimeout(300);

        const classAfterFav = await favBtn.getAttribute('class');
        expect(classAfterFav).toContain('favorited');

        await favBtn.click();
        await page.waitForTimeout(300);

        const classAfterUnfav = await favBtn.getAttribute('class');
        expect(classAfterUnfav).not.toContain('favorited');
    });

    test('TC-IONIC-FAV-005: Favorited idiom appears in favorites page', async ({ page }) => {
        await startEndlessMode(page);

        const firstBubble = page.locator('.message-bubble').first();
        const idiomText = (await firstBubble.textContent())?.trim() || '';
        await firstBubble.click();

        const modal = page.locator('ion-modal.show-modal');
        await expect(modal).toBeVisible({ timeout: 5000 });

        const favBtn = page.locator('.favorite-btn');
        await favBtn.click();
        await page.waitForTimeout(300);

        await closeModal(page);
        await page.waitForTimeout(500);

        const backBtn = page.locator('ion-back-button');
        await backBtn.click();
        await page.waitForTimeout(500);

        await navigateViaMenu(page, '收藏夹');

        const content = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-content').first();
        const text = await content.textContent();
        expect(text).toContain(idiomText);
    });
});
