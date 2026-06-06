import { test, expect } from '@playwright/test';
import { startEndlessMode, startLimitedTimeMode, submitIdiom, getInputValue, setupTestMode } from './testHelpers';

test.describe('Core Game Mechanics with Ionic', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('ion-router-outlet', { state: 'attached' });
    });

    test('TC-IONIC-GAME-001: Starting endless mode shows first computer idiom', async ({ page }) => {
        await startEndlessMode(page);
        const firstBubble = page.locator('.computer-message .message-bubble').first();
        await expect(firstBubble).toBeVisible();
        const text = await firstBubble.textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
    });

    test('TC-IONIC-GAME-002: Input is visible and editable in endless mode', async ({ page }) => {
        await startEndlessMode(page);
        const input = page.locator('#idiom-input');
        await expect(input).toBeVisible();
        await input.fill('测试');
        const value = await input.inputValue();
        expect(value).toBe('测试');
    });

    test('TC-IONIC-GAME-003: Input clears after submitting an idiom', async ({ page }) => {
        await startEndlessMode(page);

        const firstComputerIdiom = (await page.locator('.computer-message .message-bubble').first().textContent())?.trim() || '一心一意';

        const validResponse = await page.evaluate((idiom) => {
            const lib = (window as any).idiomLib;
            const candidates = lib?.getUnusedCandidateList?.(idiom);
            return candidates?.[0] || null;
        }, firstComputerIdiom);

        const testIdiom = validResponse || '意气风发';

        await submitIdiom(page, testIdiom);
        await page.waitForTimeout(500);

        const value = await getInputValue(page);
        expect(value).toBe('');
    });

    test('TC-IONIC-GAME-004: Display error for non-existent idiom', async ({ page }) => {
        await startEndlessMode(page);
        await submitIdiom(page, '不存在成语');

        const errorBubble = page.locator('.error-bubble').first();
        await expect(errorBubble).toBeVisible({ timeout: 3000 });
    });

    test('TC-IONIC-GAME-005: Error reason shows for non-existent idiom', async ({ page }) => {
        await startEndlessMode(page);
        await submitIdiom(page, '不存在成语');

        const errorReason = page.locator('.message-error-reason').first();
        await expect(errorReason).toBeVisible({ timeout: 3000 });
        const text = await errorReason.textContent();
        expect(text).toContain('成语不存在');
    });

    test('TC-IONIC-GAME-006: Score is displayed during game', async ({ page }) => {
        await startEndlessMode(page);
        const scoreDisplay = page.locator('#score-display');
        await expect(scoreDisplay).toBeVisible();
    });

    test('TC-IONIC-GAME-007: Timer is displayed during endless mode', async ({ page }) => {
        await startEndlessMode(page);
        const timer = page.locator('#current-time-display');
        await expect(timer).toBeVisible();
    });

    test('TC-IONIC-GAME-008: Limited time mode config page has correct title', async ({ page }) => {
        await page.locator('text=限时模式').first().click();
        await page.waitForTimeout(500);
        const title = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-title').first();
        const textContent = await title.textContent();
        expect(textContent).toContain('限时模式');
    });

    test('TC-IONIC-GAME-009: Limited time mode config has start button', async ({ page }) => {
        await page.locator('text=限时模式').first().click();
        await page.waitForTimeout(500);
        const startBtn = page.locator('#start-limited-time-btn');
        await expect(startBtn).toBeVisible();
    });

    test('TC-IONIC-GAME-010: Limited time mode shows game timer', async ({ page }) => {
        await startLimitedTimeMode(page, 120);
        const gameTimer = page.locator('#game-time-display');
        await expect(gameTimer).toBeVisible({ timeout: 3000 });
    });

    test('TC-IONIC-GAME-013: Input clears after error submission', async ({ page }) => {
        await startEndlessMode(page);
        await submitIdiom(page, '不存在成语');
        await page.waitForTimeout(300);

        const value = await getInputValue(page);
        expect(value).toBe('');
    });

    test('TC-IONIC-GAME-014: Back button returns to home from game', async ({ page }) => {
        await startEndlessMode(page);
        const backButton = page.locator('ion-back-button');
        await backButton.click();
        await page.waitForTimeout(500);

        const title = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-title').first();
        expect(await title.textContent()).toBe('成语接龙');
    });

    test('TC-IONIC-GAME-015: Error message has no time cost display', async ({ page }) => {
        await startEndlessMode(page);
        await submitIdiom(page, '不存在成语');

        const errorBubble = page.locator('.error-bubble').first();
        await expect(errorBubble).toBeVisible({ timeout: 3000 });

        const parent = errorBubble.locator('..');
        const timeDisplay = parent.locator('.message-time');

        const count = await timeDisplay.count();
        expect(count).toBe(0);
    });

    test('TC-IONIC-GAME-016: Finishing a game adds a history record to home page', async ({ page }) => {
        await startEndlessMode(page);

        // Submit one valid idiom to generate some score/activity
        const firstComputerIdiom = (await page.locator('.computer-message .message-bubble').first().textContent())?.trim() || '一心一意';
        const validResponse = await page.evaluate((idiom) => {
            const lib = (window as any).idiomLib;
            const candidates = lib?.getUnusedCandidateList?.(idiom);
            return candidates?.[0] || null;
        }, firstComputerIdiom);
        const testIdiom = validResponse || '意气风发';
        
        await submitIdiom(page, testIdiom);
        await page.waitForTimeout(500);

        // Mock computer's pickNext to return null so the game ends on the next turn
        await page.evaluate(() => {
            (window as any).idiomLib.pickNext = () => null;
        });

        // Click give up to trigger computer turn, which will now fail and end the game
        await page.locator('#giveup-btn').click();
        
        // Wait for game over modal
        const gameOverModal = page.locator('.game-over-container');
        await expect(gameOverModal).toBeVisible({ timeout: 3000 });

        // Go back to home page
        await page.locator('#home-btn').click();
        await page.waitForTimeout(500);

        // Verify the history record exists on the home page
        const sessionCards = page.locator('.session-card');
        await expect(sessionCards.first()).toBeVisible({ timeout: 3000 });
        const count = await sessionCards.count();
        expect(count).toBeGreaterThan(0);
    });

    test('TC-IONIC-GAME-017: Latest history record should be sorted to the top', async ({ page }) => {
        test.setTimeout(20000);
        // Clear history first if any
        const clearBtn = page.locator('.btn-clear-history');
        if (await clearBtn.isVisible()) {
            await clearBtn.click();
            await page.locator('button.alert-button').filter({ hasText: '确定' }).click();
            await page.waitForTimeout(500);
        }

        // Game 1 (Endless Mode)
        await startEndlessMode(page);
        await page.evaluate(() => {
            (window as any).idiomLib.pickNext = () => null;
        });
        await page.locator('#giveup-btn').click();
        await expect(page.locator('.game-over-container')).toBeVisible({ timeout: 3000 });
        await page.locator('#home-btn').click();
        await page.waitForTimeout(500);

        // Game 2 (Limited Time Mode to differentiate)
        await startLimitedTimeMode(page, 60);
        await page.evaluate(() => {
            (window as any).idiomLib.pickNext = () => null;
        });
        await page.locator('#giveup-btn').click();
        await expect(page.locator('.game-over-container')).toBeVisible({ timeout: 3000 });
        await page.locator('#home-btn').click();
        await page.waitForTimeout(500);

        // Verify the latest record is at the top
        const sessionCards = page.locator('.session-card');
        await expect(sessionCards).toHaveCount(2);
        
        // The first card should be Game 2 (Limited Time Mode)
        const firstCardTitle = await sessionCards.nth(0).locator('.session-card-title').textContent();
        expect(firstCardTitle).toContain('限时');

        // The second card should be Game 1 (Endless Mode)
        const secondCardTitle = await sessionCards.nth(1).locator('.session-card-title').textContent();
        expect(secondCardTitle).toContain('无尽');
    });

    test('TC-IONIC-GAME-018: Chat container should auto-scroll to bottom on new messages', async ({ page }) => {
        await startEndlessMode(page);

        // We need to generate enough messages to cause scrolling.
        // Let's submit 5 idioms quickly.
        const testIdioms = [
            '一心一意',
            '意气风发',
            '发愤图强',
            '强人所难',
            '难言之隐'
        ];

        // Mock idiomLib to always accept these and respond
        await page.evaluate(() => {
            const lib = (window as any).idiomLib;
            if (lib) {
                // Mock appendIdiom to always succeed
                lib.appendIdiom = () => 0; // RecordType.NoError
                
                // Mock pickNext to return predictable responses
                let callCount = 0;
                const responses = ['意气相投', '发号施令', '强词夺理', '难能可贵', '隐隐约约'];
                lib.pickNext = () => responses[callCount++] || '约法三章';
            }
        });

        for (const idiom of testIdioms) {
            await submitIdiom(page, idiom);
            await page.waitForTimeout(600); // Wait for computer response
        }

        // Get the chat container element and check its scroll position
        const scrollInfo = await page.evaluate(() => {
            const container = document.querySelector('.chat-container');
            // Check scrollable content of IonContent if chat-container itself isn't scrolling
            const ionContent = document.querySelector('ion-content.game-page-content');
            
            // Look for the inner scroll element of IonContent
            const scrollElement = ionContent?.shadowRoot?.querySelector('.inner-scroll') || container;
            
            if (!scrollElement) return { error: 'Scroll element not found' };
            
            // Allow a small margin of error (e.g. 5px) for fractional pixel values
            const isScrolledToBottom = Math.abs(scrollElement.scrollHeight - scrollElement.clientHeight - scrollElement.scrollTop) < 5;
            
            return {
                scrollHeight: scrollElement.scrollHeight,
                clientHeight: scrollElement.clientHeight,
                scrollTop: scrollElement.scrollTop,
                isScrolledToBottom
            };
        });

        expect(scrollInfo.error).toBeUndefined();
        // The container should be scrollable (scrollHeight > clientHeight)
        expect(scrollInfo.scrollHeight).toBeGreaterThan(scrollInfo.clientHeight);
        // It should be scrolled to the bottom
        expect(scrollInfo.isScrolledToBottom).toBe(true);
    });

    test('TC-IONIC-GAME-019: Back button from limited time game returns directly to home page', async ({ page }) => {
        // Start a limited time game
        await startLimitedTimeMode(page, 120);
        
        // Wait for game page to load
        await page.waitForSelector('#idiom-input', { state: 'visible', timeout: 5000 }).catch(() => {
            return page.waitForSelector('input', { state: 'visible', timeout: 5000 });
        });

        // Click the back button
        const backButton = page.locator('ion-back-button');
        await backButton.click();
        await page.waitForTimeout(500);

        // Verify we are back on the Home page, NOT the config page
        const title = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-title').first();
        expect(await title.textContent()).toBe('成语接龙'); // Home page title
    });
});

