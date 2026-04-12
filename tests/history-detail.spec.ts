import { test, expect, Page } from '@playwright/test';
import { setupTestMode, TEST_IDIOM_SEQUENCE, TEST_USER_RESPONSES } from './testHelpers';

async function startEndlessMode(page: Page) {
    await page.goto('/');
    await page.waitForSelector('.mode-card');
    await setupTestMode(page);

    const endlessCard = page.locator('.mode-card[data-mode="endless"]');
    await endlessCard.click();

    await page.waitForSelector('.game-container');
    await page.waitForSelector('.message-bubble');
}

async function submitIdiom(page: Page, idiom: string) {
    const input = page.locator('#idiom-input');
    await input.fill(idiom);
    await input.press('Enter');
    await page.waitForTimeout(300);
}

async function goHome(page: Page) {
    const backBtn = page.locator('.btn-back');
    await backBtn.click();
    await page.waitForSelector('.mode-card', { timeout: 5000 });
}

async function openHistoryDetail(page: Page, index: number = 0) {
    const sessionCard = page.locator('.session-card').nth(index);
    await sessionCard.click();
    await page.waitForSelector('.history-detail-container', { timeout: 5000 });
}

test.describe('History Detail View', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test('should display correct score in history detail', async ({ page }) => {
        console.log('[Test] Testing score accuracy in history detail');

        await startEndlessMode(page);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];
        console.log('[Test] Submitting:', userResponse);

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(500);

        const scoreDisplay = page.locator('#score-display');
        const scoreText = await scoreDisplay.textContent();
        const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
        console.log('[Test] Current score:', score);

        await goHome(page);

        const sessionScore = page.locator('.session-stats span').first();
        const sessionScoreText = await sessionScore.textContent();
        console.log('[Test] Session score in list:', sessionScoreText);

        await openHistoryDetail(page);

        const detailScore = page.locator('.summary-value').first();
        const detailScoreText = await detailScore.textContent();
        console.log('[Test] Detail score:', detailScoreText);

        expect(detailScoreText).toBe(score.toString());
        console.log('[Test] ✓ Score matches in history detail');
    });

    test('should display correct rounds count in history detail', async ({ page }) => {
        console.log('[Test] Testing rounds count accuracy in history detail');

        await startEndlessMode(page);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(500);

        const messages = page.locator('.message-bubble');
        const messageCount = await messages.count();
        console.log('[Test] Message count in game:', messageCount);

        await goHome(page);

        const roundsText = await page.locator('.session-stats span').nth(1).textContent();
        console.log('[Test] Rounds in list:', roundsText);

        await openHistoryDetail(page);

        const detailRounds = page.locator('.summary-value').nth(1);
        const detailRoundsText = await detailRounds.textContent();
        console.log('[Test] Detail rounds:', detailRoundsText);

        expect(detailRoundsText).toBe(messageCount.toString());
        console.log('[Test] ✓ Rounds count matches in history detail');
    });

    test('should display correct duration in history detail', async ({ page }) => {
        console.log('[Test] Testing duration accuracy in history detail');

        await startEndlessMode(page);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(2000);

        await goHome(page);

        const sessionStats = page.locator('.session-stats');
        const statsText = await sessionStats.textContent();
        console.log('[Test] Session stats in list:', statsText);

        await openHistoryDetail(page);

        const detailDuration = page.locator('.summary-value').nth(2);
        const detailDurationText = await detailDuration.textContent();
        console.log('[Test] Detail duration:', detailDurationText);

        expect(detailDurationText).toBeTruthy();
        expect(detailDurationText).toMatch(/\d+秒|\d+分/);
        console.log('[Test] ✓ Duration displayed in history detail');
    });

    test('should calculate duration from last message when game is not ended', async ({ page }) => {
        console.log('[Test] Testing duration calculation for active game');

        await startEndlessMode(page);

        await page.waitForTimeout(1000);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(1000);

        const sessionData = await page.evaluate(() => {
            const stored = localStorage.getItem('chengyujielong_sessions');
            return stored ? JSON.parse(stored) : null;
        });
        console.log('[Test] Session data before going home:', JSON.stringify(sessionData, null, 2));

        await goHome(page);
        await openHistoryDetail(page);

        const detailDuration = page.locator('.summary-value').nth(2);
        const detailDurationText = await detailDuration.textContent();
        console.log('[Test] Detail duration for active game:', detailDurationText);

        expect(detailDurationText).toBeTruthy();
        const durationMatch = detailDurationText?.match(/(\d+)/);
        expect(durationMatch).toBeTruthy();
        const durationSeconds = parseInt(durationMatch![1]);
        expect(durationSeconds).toBeGreaterThanOrEqual(1);
        console.log('[Test] ✓ Duration calculated correctly from last message');
    });

    test('should display all messages in history detail', async ({ page }) => {
        console.log('[Test] Testing message display in history detail');

        await startEndlessMode(page);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(500);

        const gameMessageCount = await page.locator('.message-bubble').count();
        console.log('[Test] Message count in game:', gameMessageCount);

        await goHome(page);
        await openHistoryDetail(page);

        await page.waitForSelector('.chat-container .message-bubble', { timeout: 5000 });

        const detailMessageCount = await page.locator('.chat-container .message-bubble').count();
        console.log('[Test] Message count in detail:', detailMessageCount);

        expect(detailMessageCount).toBe(gameMessageCount);
        console.log('[Test] ✓ All messages displayed in history detail');
    });

    test('should display correct mode name in history detail header', async ({ page }) => {
        console.log('[Test] Testing mode name in history detail header');

        await startEndlessMode(page);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(500);

        await goHome(page);
        await openHistoryDetail(page);

        const headerTitle = page.locator('.game-header h1');
        const headerText = await headerTitle.textContent();
        console.log('[Test] Header text:', headerText);

        expect(headerText).toContain('无尽模式');
        console.log('[Test] ✓ Correct mode name in history detail header');
    });

    test('should display date in history detail', async ({ page }) => {
        console.log('[Test] Testing date display in history detail');

        await startEndlessMode(page);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(500);

        await goHome(page);
        await openHistoryDetail(page);

        const dateValue = page.locator('.summary-date');
        const dateText = await dateValue.textContent();
        console.log('[Test] Date text:', dateText);

        expect(dateText).toBeTruthy();
        expect(dateText).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/);
        console.log('[Test] ✓ Date displayed in history detail');
    });

    test('should show score for each user message in endless mode', async ({ page }) => {
        console.log('[Test] Testing score display per message in history detail');

        await startEndlessMode(page);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(500);

        const scoreInGame = await page.locator('.message-score').first().textContent();
        console.log('[Test] Score in game:', scoreInGame);

        await goHome(page);
        await openHistoryDetail(page);

        const scoreInDetail = await page.locator('.message-score').first().textContent();
        console.log('[Test] Score in detail:', scoreInDetail);

        expect(scoreInDetail).toBe(scoreInGame);
        console.log('[Test] ✓ Score per message matches in history detail');
    });

    test('should handle multiple rounds correctly', async ({ page }) => {
        console.log('[Test] Testing multiple rounds in history detail');

        test.setTimeout(60000);

        await startEndlessMode(page);

        let totalScore = 0;

        for (let i = 0; i < 3; i++) {
            const computerIdiom = TEST_IDIOM_SEQUENCE[i % TEST_IDIOM_SEQUENCE.length];
            const userResponse = TEST_USER_RESPONSES[computerIdiom];

            if (userResponse) {
                await submitIdiom(page, userResponse);
                await page.waitForTimeout(500);

                const scoreText = await page.locator('#score-display').textContent();
                totalScore = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
                console.log(`[Test] Round ${i + 1}: score=${totalScore}`);
            }
        }

        const messageCount = await page.locator('.message-bubble').count();
        console.log('[Test] Total messages in game:', messageCount);

        await goHome(page);

        const sessionScoreText = await page.locator('.session-stats span').first().textContent();
        const sessionRoundsText = await page.locator('.session-stats span').nth(1).textContent();
        console.log('[Test] Session score:', sessionScoreText, 'rounds:', sessionRoundsText);

        await openHistoryDetail(page);

        const detailScore = await page.locator('.summary-value').first().textContent();
        const detailRounds = await page.locator('.summary-value').nth(1).textContent();

        console.log('[Test] Detail score:', detailScore, 'rounds:', detailRounds);

        expect(parseInt(detailScore || '0')).toBe(totalScore);
        expect(parseInt(detailRounds || '0')).toBe(messageCount);
        console.log('[Test] ✓ Multiple rounds handled correctly');
    });

    test('should show error messages in history detail', async ({ page }) => {
        console.log('[Test] Testing error message display in history detail');

        await startEndlessMode(page);

        await submitIdiom(page, '错误成语');
        await page.waitForTimeout(300);

        const errorBubble = page.locator('.message-bubble.error-bubble');
        await expect(errorBubble).toBeVisible();
        const errorText = await errorBubble.textContent();
        console.log('[Test] Error message in game:', errorText);

        await goHome(page);
        await openHistoryDetail(page);

        const errorBubbleInDetail = page.locator('.message-bubble.error-bubble');
        await expect(errorBubbleInDetail).toBeVisible();
        const errorTextInDetail = await errorBubbleInDetail.textContent();
        console.log('[Test] Error message in detail:', errorTextInDetail);

        expect(errorTextInDetail?.trim()).toBe(errorText?.trim());
        console.log('[Test] ✓ Error message displayed in history detail');
    });

    test('should navigate back to home from history detail', async ({ page }) => {
        console.log('[Test] Testing navigation back to home');

        await startEndlessMode(page);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(500);

        await goHome(page);
        await openHistoryDetail(page);

        const backBtn = page.locator('.btn-back');
        await backBtn.click();
        await page.waitForSelector('.mode-card', { timeout: 5000 });

        const homeHeader = page.locator('.app-header h1');
        const headerText = await homeHeader.textContent();
        expect(headerText).toContain('成语接龙');
        console.log('[Test] ✓ Navigated back to home from history detail');
    });
});

test.describe('History Detail - Challenge Mode', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test('should display challenge mode config in history detail', async ({ page }) => {
        console.log('[Test] Testing challenge mode config in history detail');

        await page.goto('/');
        await page.waitForSelector('.mode-card');
        await setupTestMode(page);

        const challengeCard = page.locator('.mode-card[data-mode="challenge"]');
        await challengeCard.click();
        await page.waitForSelector('.config-form');

        const startBtn = page.locator('.btn-large');
        await startBtn.click();
        await page.waitForSelector('.game-container');
        await page.waitForSelector('.message-bubble');

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];
        await submitIdiom(page, userResponse);
        await page.waitForTimeout(500);

        await goHome(page);
        await openHistoryDetail(page);

        const headerTitle = page.locator('.game-header h1');
        const headerText = await headerTitle.textContent();
        console.log('[Test] Header text:', headerText);

        expect(headerText).toContain('挑战模式');
        console.log('[Test] ✓ Challenge mode config displayed in history detail');
    });
});

test.describe('History Detail - Limited Time Mode', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test('should display limited time mode config in history detail', async ({ page }) => {
        console.log('[Test] Testing limited time mode config in history detail');

        test.setTimeout(60000);

        await page.goto('/');
        await page.waitForSelector('.mode-card');
        await setupTestMode(page);

        const limitedTimeCard = page.locator('.mode-card[data-mode="limitedTime"]');
        await limitedTimeCard.click();
        await page.waitForSelector('.config-form');

        const presetBtn = page.locator('.btn-preset').first();
        await presetBtn.click();

        const startBtn = page.locator('.btn-large');
        await startBtn.click();
        await page.waitForSelector('.game-container');
        await page.waitForSelector('.message-bubble');

        await page.waitForTimeout(35000);

        await goHome(page);
        await openHistoryDetail(page);

        const headerTitle = page.locator('.game-header h1');
        const headerText = await headerTitle.textContent();
        console.log('[Test] Header text:', headerText);

        expect(headerText).toContain('限时模式');
        console.log('[Test] ✓ Limited time mode config displayed in history detail');
    });
});

test.describe('Game Over Modal', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test('should have horizontally centered title', async ({ page }) => {
        console.log('[Test] Testing game over modal title alignment');

        await page.goto('/');
        await page.waitForSelector('.mode-card');
        await setupTestMode(page);

        const challengeCard = page.locator('.mode-card[data-mode="challenge"]');
        await challengeCard.click();
        await page.waitForSelector('.config-form');

        const livesInput = page.locator('#lives-input');
        await livesInput.fill('1');

        const startBtn = page.locator('.btn-large');
        await startBtn.click();
        await page.waitForSelector('.game-container');
        await page.waitForSelector('.message-bubble');

        await submitIdiom(page, '错误成语');
        await page.waitForTimeout(500);

        const gameOverModal = page.locator('#game-over-modal');
        await expect(gameOverModal).toBeVisible();
        console.log('[Test] Game over modal visible');

        const gameOverTitle = page.locator('.game-over-title');
        await expect(gameOverTitle).toBeVisible();

        const modalContent = page.locator('.game-over-modal-content');
        const modalBox = await modalContent.boundingBox();
        const titleBox = await gameOverTitle.boundingBox();

        console.log('[Test] Modal content box:', modalBox);
        console.log('[Test] Title box:', titleBox);

        const modalCenterX = modalBox!.x + modalBox!.width / 2;
        const titleCenterX = titleBox!.x + titleBox!.width / 2;

        const centerDiff = Math.abs(modalCenterX - titleCenterX);
        console.log('[Test] Center difference:', centerDiff);

        expect(centerDiff).toBeLessThan(5);
        console.log('[Test] ✓ Game over modal title is horizontally centered');
    });

    test('should verify padding is symmetric for center calculation', async ({ page }) => {
        console.log('[Test] Verifying padding affects boundingBox calculation');

        await page.goto('/');
        await page.waitForSelector('.mode-card');
        await setupTestMode(page);

        const challengeCard = page.locator('.mode-card[data-mode="challenge"]');
        await challengeCard.click();
        await page.waitForSelector('.config-form');

        const livesInput = page.locator('#lives-input');
        await livesInput.fill('1');

        const startBtn = page.locator('.btn-large');
        await startBtn.click();
        await page.waitForSelector('.game-container');
        await page.waitForSelector('.message-bubble');

        await submitIdiom(page, '错误成语');
        await page.waitForTimeout(500);

        const gameOverModal = page.locator('#game-over-modal');
        await expect(gameOverModal).toBeVisible();

        const modalContent = page.locator('.game-over-modal-content');
        const gameOverTitle = page.locator('.game-over-title');

        const modalBox = await modalContent.boundingBox();
        const titleBox = await gameOverTitle.boundingBox();

        console.log('[Test] Modal box:', modalBox);
        console.log('[Test] Title box:', titleBox);

        const leftPadding = titleBox!.x - modalBox!.x;
        const rightPadding = (modalBox!.x + modalBox!.width) - (titleBox!.x + titleBox!.width);

        console.log('[Test] Left padding (from boundingBox):', leftPadding);
        console.log('[Test] Right padding (from boundingBox):', rightPadding);
        console.log('[Test] Padding difference:', Math.abs(leftPadding - rightPadding));

        expect(leftPadding).toBeGreaterThan(0);
        expect(rightPadding).toBeGreaterThan(0);
        expect(Math.abs(leftPadding - rightPadding)).toBeLessThan(2);
        console.log('[Test] ✓ Padding is symmetric (within 2px tolerance)');

        const computedStyle = await modalContent.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
                paddingLeft: parseFloat(style.paddingLeft),
                paddingRight: parseFloat(style.paddingRight),
                paddingTop: parseFloat(style.paddingTop),
                paddingBottom: parseFloat(style.paddingBottom),
            };
        });
        console.log('[Test] Computed padding style:', computedStyle);

        expect(computedStyle.paddingLeft).toBe(computedStyle.paddingRight);
        console.log('[Test] ✓ CSS padding is symmetric:', computedStyle.paddingLeft, 'px');

        const modalCenterX = modalBox!.x + modalBox!.width / 2;
        const titleCenterX = titleBox!.x + titleBox!.width / 2;
        const contentCenterX = modalBox!.x + computedStyle.paddingLeft + (modalBox!.width - computedStyle.paddingLeft - computedStyle.paddingRight) / 2;

        console.log('[Test] Modal center X:', modalCenterX);
        console.log('[Test] Title center X:', titleCenterX);
        console.log('[Test] Content area center X:', contentCenterX);

        expect(Math.abs(titleCenterX - contentCenterX)).toBeLessThan(2);
        console.log('[Test] ✓ Title is centered within content area');

        expect(Math.abs(modalCenterX - titleCenterX)).toBeLessThan(2);
        console.log('[Test] ✓ Title is centered within modal (due to symmetric padding)');
    });

    test('should verify boundingBox includes padding with border-box', async ({ page }) => {
        console.log('[Test] Verifying boundingBox behavior with box-sizing');

        await page.goto('/');
        await page.waitForSelector('.mode-card');
        await setupTestMode(page);

        const challengeCard = page.locator('.mode-card[data-mode="challenge"]');
        await challengeCard.click();
        await page.waitForSelector('.config-form');

        const livesInput = page.locator('#lives-input');
        await livesInput.fill('1');

        const startBtn = page.locator('.btn-large');
        await startBtn.click();
        await page.waitForSelector('.game-container');
        await page.waitForSelector('.message-bubble');

        await submitIdiom(page, '错误成语');
        await page.waitForTimeout(500);

        const gameOverModal = page.locator('#game-over-modal');
        await expect(gameOverModal).toBeVisible();

        const modalContent = page.locator('.game-over-modal-content');
        const gameOverTitle = page.locator('.game-over-title');

        const modalBox = await modalContent.boundingBox();
        const titleBox = await gameOverTitle.boundingBox();

        const modalStyles = await modalContent.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
                boxSizing: style.boxSizing,
                width: style.width,
                paddingLeft: style.paddingLeft,
                paddingRight: style.paddingRight,
                borderLeft: style.borderLeftWidth,
                borderRight: style.borderRightWidth,
            };
        });

        const titleStyles = await gameOverTitle.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
                boxSizing: style.boxSizing,
                width: style.width,
                marginLeft: style.marginLeft,
                marginRight: style.marginRight,
                paddingLeft: style.paddingLeft,
                paddingRight: style.paddingRight,
            };
        });

        console.log('[Test] Modal styles:', modalStyles);
        console.log('[Test] Title styles:', titleStyles);
        console.log('[Test] Modal boundingBox width:', modalBox!.width);
        console.log('[Test] Title boundingBox width:', titleBox!.width);

        expect(modalStyles.boxSizing).toBe('border-box');
        console.log('[Test] ✓ Modal uses border-box');

        expect(titleStyles.boxSizing).toBe('border-box');
        console.log('[Test] ✓ Title uses border-box');

        expect(titleStyles.marginLeft).toBe('0px');
        expect(titleStyles.marginRight).toBe('0px');
        console.log('[Test] ✓ Title has no margin (reset to 0)');

        const cssPaddingLeft = parseFloat(modalStyles.paddingLeft);
        const cssPaddingRight = parseFloat(modalStyles.paddingRight);
        const calculatedPaddingLeft = titleBox!.x - modalBox!.x;
        const calculatedPaddingRight = (modalBox!.x + modalBox!.width) - (titleBox!.x + titleBox!.width);

        console.log('[Test] CSS padding-left:', cssPaddingLeft);
        console.log('[Test] Calculated left offset:', calculatedPaddingLeft);
        console.log('[Test] Are they equal?', Math.abs(cssPaddingLeft - calculatedPaddingLeft) < 1);

        expect(Math.abs(cssPaddingLeft - calculatedPaddingLeft)).toBeLessThan(1);
        expect(Math.abs(cssPaddingRight - calculatedPaddingRight)).toBeLessThan(1);
        console.log('[Test] ✓ Calculated offsets match CSS padding');

        const cssWidth = parseFloat(modalStyles.width);
        console.log('[Test] CSS width:', cssWidth);
        console.log('[Test] boundingBox width:', modalBox!.width);
        console.log('[Test] Are they equal?', Math.abs(cssWidth - modalBox!.width) < 1);

        expect(Math.abs(cssWidth - modalBox!.width)).toBeLessThan(1);
        console.log('[Test] ✓ boundingBox width equals CSS width (border-box)');

        const contentWidth = cssWidth - cssPaddingLeft - cssPaddingRight;
        const titleWidth = parseFloat(titleStyles.width);
        console.log('[Test] Content width (CSS width - padding):', contentWidth);
        console.log('[Test] Title CSS width:', titleWidth);
        console.log('[Test] Title boundingBox width:', titleBox!.width);

        expect(Math.abs(contentWidth - titleWidth)).toBeLessThan(1);
        expect(Math.abs(contentWidth - titleBox!.width)).toBeLessThan(1);
        console.log('[Test] ✓ Title fills the content area');

        console.log('[Test]');
        console.log('[Test] === SUMMARY ===');
        console.log('[Test] With border-box:');
        console.log('[Test]   - boundingBox().width = CSS width (includes padding)');
        console.log('[Test]   - Content area = CSS width - padding');
        console.log('[Test]   - Title offset from modal edge = CSS padding');
        console.log('[Test]   - Title width = Content area width');
    });
});

test.describe('Modal Title and Close Button Alignment', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.mode-card');
        await setupTestMode(page);
    });

    test('detail modal title and close button should be vertically aligned', async ({ page }) => {
        console.log('[Test] Testing detail modal title and close button vertical alignment');

        await startEndlessMode(page);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];

        await submitIdiom(page, userResponse);
        await page.waitForTimeout(500);

        const userBubble = page.locator('.user-message .message-bubble').first();
        await userBubble.click();

        const detailModal = page.locator('#detail-modal');
        await expect(detailModal).toBeVisible();
        await page.waitForTimeout(300);
        console.log('[Test] Detail modal visible');

        const modalContent = detailModal.locator('.modal-content');
        const modalHeader = modalContent.locator('.modal-header');
        const title = modalHeader.locator('h2');
        const closeButton = modalHeader.locator('.close-modal');

        const printGeometry = async (element: any, name: string) => {
            const box = await element.boundingBox();
            const styles = await element.evaluate((el) => {
                const style = window.getComputedStyle(el);
                return {
                    position: style.position,
                    top: style.top,
                    right: style.right,
                    bottom: style.bottom,
                    left: style.left,
                    marginTop: style.marginTop,
                    marginBottom: style.marginBottom,
                    marginLeft: style.marginLeft,
                    marginRight: style.marginRight,
                    paddingTop: style.paddingTop,
                    paddingBottom: style.paddingBottom,
                    paddingLeft: style.paddingLeft,
                    paddingRight: style.paddingRight,
                    borderTop: style.borderTopWidth,
                    borderBottom: style.borderBottomWidth,
                    borderLeft: style.borderLeftWidth,
                    borderRight: style.borderRightWidth,
                    lineHeight: style.lineHeight,
                    fontSize: style.fontSize,
                    height: style.height,
                    width: style.width,
                    display: style.display,
                    alignItems: style.alignItems,
                };
            });
            console.log(`[Test] ${name} geometry:`);
            console.log(`  boundingBox: x=${box?.x}, y=${box?.y}, width=${box?.width}, height=${box?.height}`);
            console.log(`  center: (${box?.x! + box?.width! / 2}, ${box?.y! + box?.height! / 2})`);
            console.log(`  CSS styles:`, styles);
            return { box, styles };
        };

        await printGeometry(modalContent, 'modal-content');
        await printGeometry(modalHeader, 'modal-header');
        const titleInfo = await printGeometry(title, 'title h2');
        const closeInfo = await printGeometry(closeButton, 'close-button');

        const titleCenterY = titleInfo.box!.y + titleInfo.box!.height / 2;
        const closeButtonCenterY = closeInfo.box!.y + closeInfo.box!.height / 2;

        const verticalDiff = Math.abs(titleCenterY - closeButtonCenterY);
        console.log('[Test] Vertical difference:', verticalDiff);

        expect(verticalDiff).toBeLessThan(3);
        console.log('[Test] ✓ Title and close button are vertically aligned');
    });

    test('candidates modal title and close button should be vertically aligned', async ({ page }) => {
        console.log('[Test] Testing candidates modal title and close button vertical alignment');

        await startEndlessMode(page);

        const firstComputerIdiom = TEST_IDIOM_SEQUENCE[0];
        const userResponse = TEST_USER_RESPONSES[firstComputerIdiom];

        await submitIdiom(page, userResponse);
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

        const candidatesModal = page.locator('#candidates-modal');
        await expect(candidatesModal).toBeVisible();
        await page.waitForTimeout(300);
        console.log('[Test] Candidates modal visible');

        const modalContent = candidatesModal.locator('.modal-content');
        const modalHeader = modalContent.locator('.modal-header');
        const title = modalHeader.locator('h2');
        const closeButton = modalHeader.locator('.close-modal');

        const printGeometry = async (element: any, name: string) => {
            const box = await element.boundingBox();
            const styles = await element.evaluate((el) => {
                const style = window.getComputedStyle(el);
                return {
                    position: style.position,
                    top: style.top,
                    right: style.right,
                    bottom: style.bottom,
                    left: style.left,
                    marginTop: style.marginTop,
                    marginBottom: style.marginBottom,
                    marginLeft: style.marginLeft,
                    marginRight: style.marginRight,
                    paddingTop: style.paddingTop,
                    paddingBottom: style.paddingBottom,
                    paddingLeft: style.paddingLeft,
                    paddingRight: style.paddingRight,
                    borderTop: style.borderTopWidth,
                    borderBottom: style.borderBottomWidth,
                    borderLeft: style.borderLeftWidth,
                    borderRight: style.borderRightWidth,
                    lineHeight: style.lineHeight,
                    fontSize: style.fontSize,
                    height: style.height,
                    width: style.width,
                    display: style.display,
                    alignItems: style.alignItems,
                };
            });
            console.log(`[Test] ${name} geometry:`);
            console.log(`  boundingBox: x=${box?.x}, y=${box?.y}, width=${box?.width}, height=${box?.height}`);
            console.log(`  center: (${box?.x! + box?.width! / 2}, ${box?.y! + box?.height! / 2})`);
            console.log(`  CSS styles:`, styles);
            return { box, styles };
        };

        await printGeometry(modalContent, 'modal-content');
        await printGeometry(modalHeader, 'modal-header');
        const titleInfo = await printGeometry(title, 'title h2');
        const closeInfo = await printGeometry(closeButton, 'close-button');

        const titleCenterY = titleInfo.box!.y + titleInfo.box!.height / 2;
        const closeButtonCenterY = closeInfo.box!.y + closeInfo.box!.height / 2;

        const verticalDiff = Math.abs(titleCenterY - closeButtonCenterY);
        console.log('[Test] Vertical difference:', verticalDiff);

        expect(verticalDiff).toBeLessThan(3);
        console.log('[Test] ✓ Title and close button are vertically aligned');
    });
});
