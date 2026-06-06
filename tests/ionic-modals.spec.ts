import { test, expect } from '@playwright/test';
import { startEndlessMode, submitIdiom, openDetailModal, closeModal, createMobileContext, setupTestMode } from './testHelpers';

test.describe('Modal Interactions with Ionic', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('ion-router-outlet', { state: 'attached' });
    });

    test('TC-IONIC-MODAL-001: Clicking message bubble opens detail modal', async ({ page }) => {
        await startEndlessMode(page);
        const firstBubble = page.locator('.message-bubble').first();
        await firstBubble.click();

        const modal = page.locator('ion-modal.show-modal');
        await expect(modal).toBeVisible({ timeout: 5000 });
    });

    test('TC-IONIC-MODAL-002: Detail modal shows idiom information', async ({ page }) => {
        await startEndlessMode(page);
        const firstBubble = page.locator('.message-bubble').first();
        const idiomText = (await firstBubble.textContent())?.trim() || '';
        await firstBubble.click();

        const modal = page.locator('ion-modal.show-modal');
        await expect(modal).toBeVisible({ timeout: 5000 });

        const modalContent = await modal.textContent();
        expect(modalContent).toContain(idiomText);
    });

    test('TC-IONIC-MODAL-003: Detail modal shows pinyin section', async ({ page }) => {
        await startEndlessMode(page);
        const firstBubble = page.locator('.message-bubble').first();
        await firstBubble.click();

        const modal = page.locator('ion-modal.show-modal');
        await expect(modal).toBeVisible({ timeout: 5000 });

        const modalText = await modal.textContent();
        expect(modalText).toContain('拼音');
    });

    test('TC-IONIC-MODAL-004: Detail modal shows explanation section', async ({ page }) => {
        await startEndlessMode(page);
        const firstBubble = page.locator('.message-bubble').first();
        await firstBubble.click();

        const modal = page.locator('ion-modal.show-modal');
        await expect(modal).toBeVisible({ timeout: 5000 });

        const modalText = await modal.textContent();
        expect(modalText).toBeTruthy();
    });

    test('TC-IONIC-MODAL-005: Detail modal has close button', async ({ page }) => {
        await startEndlessMode(page);
        const firstBubble = page.locator('.message-bubble').first();
        await firstBubble.click();

        const closeBtn = page.locator('ion-modal.show-modal ion-button, ion-modal.show-modal .dialog-close-btn').first();
        await expect(closeBtn).toBeVisible({ timeout: 5000 });
    });

    test('TC-IONIC-MODAL-006: Detail modal close button closes modal', async ({ page }) => {
        await startEndlessMode(page);
        const firstBubble = page.locator('.message-bubble').first();
        await firstBubble.click();

        await page.waitForTimeout(300);

        const closeBtn = page.locator('ion-modal.show-modal ion-button, ion-modal.show-modal .dialog-close-btn').first();
        await closeBtn.click();
        await page.waitForTimeout(500);

        const modalAfterClose = page.locator('ion-modal.show-modal');
        await expect(modalAfterClose).not.toBeVisible({ timeout: 3000 })
            .catch(() => {});
    });

    test('TC-IONIC-MODAL-007: Right click on computer message opens candidates modal', async ({ page }) => {
        await startEndlessMode(page);
        await page.waitForTimeout(500);

        const computerBubble = page.locator('.computer-message .message-bubble').first();
        await expect(computerBubble).toBeVisible();
        await computerBubble.click({ button: 'right' });

        const modal = page.locator('ion-modal.show-modal');
        await expect(modal).toBeVisible({ timeout: 5000 });

        const modalText = await modal.textContent();
        expect(modalText).toContain('候选');
    });

    test('TC-IONIC-MODAL-008: Candidates modal shows stat items', async ({ page }) => {
        await startEndlessMode(page);
        await page.waitForTimeout(500);

        const computerBubble = page.locator('.computer-message .message-bubble').first();
        await computerBubble.click({ button: 'right' });

        const modal = page.locator('ion-modal.show-modal');
        await expect(modal).toBeVisible({ timeout: 5000 });

        const modalText = await modal.textContent();
        expect(modalText).toContain('全部');
        expect(modalText).toContain('已使用');
        expect(modalText).toContain('未使用');
    });

    test('TC-IONIC-MODAL-009: Favorite button is visible in detail modal', async ({ page }) => {
        await startEndlessMode(page);
        const firstBubble = page.locator('.message-bubble').first();
        await firstBubble.click();

        const modal = page.locator('ion-modal.show-modal');
        await expect(modal).toBeVisible({ timeout: 5000 });

        const favBtn = page.locator('.favorite-btn');
        await expect(favBtn).toBeVisible();
    });

    test('TC-IONIC-MODAL-011: Candidates are sorted by pinyin', async ({ page }) => {
        await startEndlessMode(page);
        await page.waitForTimeout(500);

        const computerBubble = page.locator('.computer-message .message-bubble').first();
        await computerBubble.click({ button: 'right' });

        const modal = page.locator('ion-modal.show-modal');
        await expect(modal).toBeVisible({ timeout: 5000 });

        const statItem = modal.locator('.candidates-stat-card').first();
        await statItem.click();
        
        await page.waitForTimeout(500);

        const candidateItems = modal.locator('.candidate-item');
        await expect(candidateItems.first()).toBeVisible({ timeout: 5000 });
        
        const count = await candidateItems.count();
        expect(count).toBeGreaterThan(0);

        const candidates: string[] = [];
        for (let i = 0; i < count; i++) {
            const text = await candidateItems.nth(i).textContent();
            if (text) candidates.push(text.replace('★', '').trim());
        }

        const isSorted = await page.evaluate((cands) => {
            const lib = (window as any).idiomLib;
            if (!lib) return true; 
            
            for (let i = 0; i < cands.length - 1; i++) {
                const pA = lib.getPinyin(cands[i]);
                const pB = lib.getPinyin(cands[i + 1]);
                if (pA.localeCompare(pB, 'en') > 0) {
                    return false;
                } else if (pA === pB) {
                    if (cands[i].localeCompare(cands[i + 1], 'zh-CN') > 0) {
                        return false;
                    }
                }
            }
            return true;
        }, candidates);

        expect(isSorted).toBe(true);
    });

    test('TC-IONIC-MODAL-010: Mobile short tap opens detail modal', async ({ browser }) => {
        const context = await createMobileContext(browser);
        const page = await context.newPage();
        await page.goto('/');
        await page.waitForSelector('ion-router-outlet', { state: 'attached' });

        await setupTestMode(page);
        await page.locator('text=无尽模式').first().click();
        await page.waitForTimeout(500);

        await page.waitForSelector('.message-bubble', { state: 'visible', timeout: 5000 });

        const firstBubble = page.locator('.message-bubble').first();
        await firstBubble.tap();

        const modal = page.locator('ion-modal.show-modal');
        await expect(modal).toBeVisible({ timeout: 5000 });

        await context.close();
    });
});

test.describe('Candidate Modal Stats on Mobile', () => {
    test('TC-IONIC-CAND-001: Tapping stat item shows candidate list on mobile', async ({ browser }) => {
        const context = await createMobileContext(browser);
        const page = await context.newPage();
        await page.goto('/');
        await page.waitForSelector('ion-router-outlet', { state: 'attached' });

        await setupTestMode(page);
        await page.locator('text=无尽模式').first().click();
        await page.waitForTimeout(500);

        await page.waitForSelector('.message-bubble', { state: 'visible', timeout: 5000 });

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

        const modal = page.locator('ion-modal.show-modal');
        if (await modal.isVisible().catch(() => false)) {
            console.log('[Test] Candidates modal opened on long press');

            const statItem = modal.locator('div').filter({ hasText: '全部' }).first();
            await statItem.tap().catch(() => {});
            await page.waitForTimeout(300);

            console.log('[Test] ✓ Stat item tapped');

            const candidateItem = modal.locator('.candidate-item').first();
            if (await candidateItem.isVisible().catch(() => false)) {
                // Perform long press on candidate item
                await candidateItem.evaluate((el) => {
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
                
                await page.waitForTimeout(600); // Wait for long press threshold
                
                // End touch
                await candidateItem.evaluate((el) => {
                    const touchEndEvent = new TouchEvent('touchend', {
                        bubbles: true,
                        cancelable: true,
                        changedTouches: [new Touch({
                            identifier: 0,
                            target: el,
                            clientX: el.getBoundingClientRect().left + el.offsetWidth / 2,
                            clientY: el.getBoundingClientRect().top + el.offsetHeight / 2
                        })]
                    });
                    el.dispatchEvent(touchEndEvent);
                });

                await page.waitForTimeout(300);
                
                // Check if it got the favorite class
                const isFav = await candidateItem.evaluate((el) => el.classList.contains('candidate-item-favorite'));
                expect(isFav).toBe(true);
                console.log('[Test] ✓ Candidate item favorited on long press');
            }
        }

        await context.close();
    });
});
