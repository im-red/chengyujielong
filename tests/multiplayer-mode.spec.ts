import { test, expect } from '@playwright/test';

test.describe('Multiplayer Mode - Player Setup', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should show multiplayer mode option on home page', async ({ page }) => {
        const multiplayerCard = page.locator('.mode-card:has-text("多人模式")');
        await expect(multiplayerCard).toBeVisible();
        await expect(multiplayerCard.locator('.mode-icon')).toHaveText('👥');
    });

    test('should navigate to player setup page when selecting multiplayer', async ({ page }) => {
        await page.click('.mode-card:has-text("多人模式")');

        await expect(page.locator('.app-header h1')).toHaveText('多人模式');
        await expect(page.locator('.player-input-section')).toBeVisible();
        await expect(page.locator('.player-name-input')).toBeVisible();
        await expect(page.locator('button:has-text("添加玩家")')).toBeVisible();
    });

    test('should add player when entering name and clicking add button', async ({ page }) => {
        await page.click('.mode-card:has-text("多人模式")');

        await page.fill('.player-name-input', '玩家一');
        await page.click('button:has-text("添加玩家")');

        await expect(page.locator('.player-list-item')).toHaveCount(1);
        await expect(page.locator('.player-list-item-name')).toHaveText('玩家一');
        await expect(page.locator('.player-name-input')).toHaveValue('');
    });

    test('should add player when pressing Enter', async ({ page }) => {
        await page.click('.mode-card:has-text("多人模式")');

        await page.fill('.player-name-input', '玩家一');
        await page.press('.player-name-input', 'Enter');

        await expect(page.locator('.player-list-item')).toHaveCount(1);
        await expect(page.locator('.player-list-item-name')).toHaveText('玩家一');
    });

    test('should show error when adding player with empty name', async ({ page }) => {
        await page.click('.mode-card:has-text("多人模式")');

        await page.click('button:has-text("添加玩家")');

        await expect(page.locator('.player-setup-error')).toHaveText('请输入玩家名称');
    });

    test('should add multiple players', async ({ page }) => {
        await page.click('.mode-card:has-text("多人模式")');

        await page.fill('.player-name-input', '玩家一');
        await page.click('button:has-text("添加玩家")');

        await page.fill('.player-name-input', '玩家二');
        await page.click('button:has-text("添加玩家")');

        await expect(page.locator('.player-list-item')).toHaveCount(2);
        await expect(page.locator('.player-list-item-name').nth(0)).toHaveText('玩家一');
        await expect(page.locator('.player-list-item-name').nth(1)).toHaveText('玩家二');
    });

    test('should show player count info', async ({ page }) => {
        await page.click('.mode-card:has-text("多人模式")');

        await expect(page.locator('.player-count-info')).toContainText('当前玩家: 0/8');
        await expect(page.locator('.player-count-info')).toContainText('至少需要2人');

        await page.fill('.player-name-input', '玩家一');
        await page.click('button:has-text("添加玩家")');

        await expect(page.locator('.player-count-info')).toContainText('当前玩家: 1/8');

        await page.fill('.player-name-input', '玩家二');
        await page.click('button:has-text("添加玩家")');

        await expect(page.locator('.player-count-info')).toContainText('当前玩家: 2/8');
        await expect(page.locator('.player-count-info')).not.toContainText('至少需要');
    });

    test('should remove player when clicking remove button', async ({ page }) => {
        await page.click('.mode-card:has-text("多人模式")');

        await page.fill('.player-name-input', '玩家一');
        await page.click('button:has-text("添加玩家")');

        await page.fill('.player-name-input', '玩家二');
        await page.click('button:has-text("添加玩家")');

        await expect(page.locator('.player-list-item')).toHaveCount(2);

        await page.locator('.player-list-item').first().locator('.btn-remove-player').click();

        await expect(page.locator('.player-list-item')).toHaveCount(1);
        await expect(page.locator('.player-list-item-name')).toHaveText('玩家二');
    });

    test('should disable start game button with less than 2 players', async ({ page }) => {
        await page.click('.mode-card:has-text("多人模式")');

        await expect(page.locator('button:has-text("开始游戏")')).toBeDisabled();

        await page.fill('.player-name-input', '玩家一');
        await page.click('button:has-text("添加玩家")');

        await expect(page.locator('button:has-text("开始游戏")')).toBeDisabled();
    });

    test('should enable start game button with 2 or more players', async ({ page }) => {
        await page.click('.mode-card:has-text("多人模式")');

        await page.fill('.player-name-input', '玩家一');
        await page.click('button:has-text("添加玩家")');

        await page.fill('.player-name-input', '玩家二');
        await page.click('button:has-text("添加玩家")');

        await expect(page.locator('button:has-text("开始游戏")')).toBeEnabled();
    });

    test('should limit maximum players to 8', async ({ page }) => {
        await page.click('.mode-card:has-text("多人模式")');

        for (let i = 1; i <= 8; i++) {
            await page.fill('.player-name-input', `玩家${i}`);
            await page.click('button:has-text("添加玩家")');
        }

        await expect(page.locator('.player-list-item')).toHaveCount(8);
        await expect(page.locator('button:has-text("添加玩家")')).toBeDisabled();
    });

    test('should navigate back to home page', async ({ page }) => {
        await page.click('.mode-card:has-text("多人模式")');

        await expect(page.locator('.app-header h1')).toHaveText('多人模式');

        await page.click('.btn-back');

        await expect(page.locator('.app-header h1')).toHaveText('成语接龙');
    });
});

test.describe('Multiplayer Mode - Game Play', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.click('.mode-card:has-text("多人模式")');

        await page.fill('.player-name-input', '张三');
        await page.click('button:has-text("添加玩家")');

        await page.fill('.player-name-input', '李四');
        await page.click('button:has-text("添加玩家")');

        await page.click('button:has-text("开始游戏")');
    });

    test('should start multiplayer game with scoreboard', async ({ page }) => {
        await expect(page.locator('.game-header h1')).toHaveText('多人模式');
        await expect(page.locator('.scoreboard')).toBeVisible();
        await expect(page.locator('.scoreboard-item')).toHaveCount(2);
    });

    test('should show first player turn indicator', async ({ page }) => {
        await expect(page.locator('.current-turn-indicator')).toBeVisible();
        await expect(page.locator('.current-turn-name')).toContainText('张三');
        await expect(page.locator('.current-turn-indicator')).toContainText('的回合');
    });

    test('should show first turn hint when no messages', async ({ page }) => {
        await expect(page.locator('.first-turn-hint')).toBeVisible();
        await expect(page.locator('.first-turn-hint')).toContainText('张三');
        await expect(page.locator('.first-turn-hint')).toContainText('先手');
        await expect(page.locator('.first-turn-hint')).toContainText('请输入任意成语开始游戏');
    });

    test('should show player avatar in input section', async ({ page }) => {
        await expect(page.locator('.multiplayer-input-header')).toBeVisible();
        await expect(page.locator('.multiplayer-input-name')).toHaveText('张三');
    });

    test('should accept any valid idiom as first submission', async ({ page }) => {
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');

        await page.waitForSelector('.message-bubble:has-text("一心一意")', { timeout: 5000 });
        await expect(page.locator('.message-bubble:has-text("一心一意")')).toBeVisible();
    });

    test('should show player info on message', async ({ page }) => {
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');

        await page.waitForSelector('.message:has-text("一心一意")', { timeout: 5000 });

        const message = page.locator('.message:has-text("一心一意")');
        await expect(message.locator('.player-avatar')).toBeVisible();
    });

    test('should rotate to next player after successful submission', async ({ page }) => {
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');

        await page.waitForSelector('.message-bubble:has-text("一心一意")', { timeout: 5000 });

        await expect(page.locator('.current-turn-name')).toContainText('李四');
        await expect(page.locator('.multiplayer-input-name')).toHaveText('李四');
    });

    test('should highlight current player in scoreboard', async ({ page }) => {
        const firstPlayerItem = page.locator('.scoreboard-item').first();
        await expect(firstPlayerItem).toHaveClass(/scoreboard-item--active/);

        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');

        await page.waitForSelector('.message-bubble:has-text("一心一意")', { timeout: 5000 });

        const secondPlayerItem = page.locator('.scoreboard-item').last();
        await expect(secondPlayerItem).toHaveClass(/scoreboard-item--active/);
    });

    test('should update player score after successful submission', async ({ page }) => {
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');

        await page.waitForSelector('.message-bubble:has-text("一心一意")', { timeout: 5000 });

        const firstPlayerScore = page.locator('.scoreboard-item').first().locator('.scoreboard-score');
        const scoreText = await firstPlayerScore.textContent();
        expect(scoreText).toMatch(/\d+分/);
        expect(parseInt(scoreText!)).toBeGreaterThan(0);
    });

    test('should show player info on error message', async ({ page }) => {
        await page.fill('#idiom-input', '不是成语');
        await page.click('#submit-btn');

        await page.waitForSelector('.error-bubble:has-text("不是成语")', { timeout: 5000 });

        const errorMessage = page.locator('.message:has-text("不是成语")');
        await expect(errorMessage.locator('.player-avatar')).toBeVisible();
        await expect(errorMessage.locator('.message-error-reason')).toHaveText('成语不存在');
    });

    test('should not rotate player on error submission', async ({ page }) => {
        await page.fill('#idiom-input', '不是成语');
        await page.click('#submit-btn');

        await page.waitForSelector('.error-bubble', { timeout: 5000 });

        await expect(page.locator('.current-turn-name')).toContainText('张三');
        await expect(page.locator('.multiplayer-input-name')).toHaveText('张三');
    });

    test('should rotate player on give up without score deduction', async ({ page }) => {
        const initialScores = await page.locator('.scoreboard-score').allTextContents();

        await page.click('#giveup-btn');

        await page.waitForSelector('.give-up-bubble', { timeout: 5000 });

        await expect(page.locator('.current-turn-name')).toContainText('李四');

        const giveUpMessage = page.locator('.message:has-text("放弃")');
        await expect(giveUpMessage.locator('.player-avatar')).toBeVisible();

        await expect(giveUpMessage.locator('.message-score-negative')).not.toBeVisible();
    });

    test('should allow multiple turns in sequence', async ({ page }) => {
        await page.fill('#idiom-input', '马到成功');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble:has-text("马到成功")', { timeout: 5000 });

        await expect(page.locator('.current-turn-name')).toContainText('李四');

        await page.fill('#idiom-input', '功成名就');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble:has-text("功成名就")', { timeout: 5000 });

        await expect(page.locator('.current-turn-name')).toContainText('张三');

        await expect(page.locator('.message-bubble')).toHaveCount(2);
    });

    test('should allow players to take turns with valid idioms', async ({ page }) => {
        await page.fill('#idiom-input', '马到成功');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble:has-text("马到成功")', { timeout: 5000 });

        await expect(page.locator('.current-turn-name')).toContainText('李四');

        const secondIdiom = '功成名就';
        await page.fill('#idiom-input', secondIdiom);
        await page.click('#submit-btn');
        await page.waitForSelector(`.message-bubble:has-text("${secondIdiom}")`, { timeout: 5000 });

        await expect(page.locator('.current-turn-name')).toContainText('张三');

        await expect(page.locator('.message-bubble')).toHaveCount(2);
    });

    test('should hide first turn hint after first submission', async ({ page }) => {
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');

        await page.waitForSelector('.message-bubble:has-text("一心一意")', { timeout: 5000 });

        await expect(page.locator('.first-turn-hint')).not.toBeVisible();
    });

    test('should navigate back to home page from game', async ({ page }) => {
        await page.click('#back-btn');

        await expect(page.locator('.app-header h1')).toHaveText('成语接龙');
    });
});

test.describe('Multiplayer Mode - Scoreboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.click('.mode-card:has-text("多人模式")');

        await page.fill('.player-name-input', '张三');
        await page.click('button:has-text("添加玩家")');

        await page.fill('.player-name-input', '李四');
        await page.click('button:has-text("添加玩家")');

        await page.fill('.player-name-input', '王五');
        await page.click('button:has-text("添加玩家")');

        await page.click('button:has-text("开始游戏")');
    });

    test('should display all players in scoreboard', async ({ page }) => {
        const playerNames = page.locator('.scoreboard-name');
        await expect(playerNames).toHaveCount(3);
        await expect(playerNames.nth(0)).toHaveText('张三');
        await expect(playerNames.nth(1)).toHaveText('李四');
        await expect(playerNames.nth(2)).toHaveText('王五');
    });

    test('should show all scores as 0 initially', async ({ page }) => {
        const scores = page.locator('.scoreboard-score');
        await expect(scores).toHaveCount(3);

        for (let i = 0; i < 3; i++) {
            await expect(scores.nth(i)).toHaveText('0分');
        }
    });

    test('should sort players by score descending', async ({ page }) => {
        await page.fill('#idiom-input', '一心一意');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble:has-text("一心一意")', { timeout: 5000 });

        await page.fill('#idiom-input', '意气风发');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble:has-text("意气风发")', { timeout: 5000 });

        await page.fill('#idiom-input', '发愤图强');
        await page.click('#submit-btn');
        await page.waitForSelector('.message-bubble:has-text("发愤图强")', { timeout: 5000 });

        const firstScore = await page.locator('.scoreboard-score').first().textContent();
        const secondScore = await page.locator('.scoreboard-score').nth(1).textContent();

        expect(parseInt(firstScore!)).toBeGreaterThanOrEqual(parseInt(secondScore!));
    });
});

test.describe('Multiplayer Mode - Player Avatar', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.click('.mode-card:has-text("多人模式")');
    });

    test('should show avatar with first character of player name', async ({ page }) => {
        await page.fill('.player-name-input', '张三');
        await page.click('button:has-text("添加玩家")');

        const avatar = page.locator('.player-list-item .player-avatar');
        await expect(avatar).toHaveText('张');
    });

    test('should show different colors for different players', async ({ page }) => {
        await page.fill('.player-name-input', '张三');
        await page.click('button:has-text("添加玩家")');

        await page.fill('.player-name-input', '李四');
        await page.click('button:has-text("添加玩家")');

        const avatar1 = page.locator('.player-list-item').first().locator('.player-avatar');
        const avatar2 = page.locator('.player-list-item').last().locator('.player-avatar');

        const color1 = await avatar1.evaluate(el => getComputedStyle(el).backgroundColor);
        const color2 = await avatar2.evaluate(el => getComputedStyle(el).backgroundColor);

        expect(color1).not.toBe(color2);
    });

    test('should show consistent color for same player name', async ({ page }) => {
        await page.fill('.player-name-input', '张三');
        await page.click('button:has-text("添加玩家")');

        const avatar1 = page.locator('.player-list-item .player-avatar');
        const color1 = await avatar1.evaluate(el => getComputedStyle(el).backgroundColor);

        await page.locator('.btn-remove-player').click();

        await page.fill('.player-name-input', '张三');
        await page.click('button:has-text("添加玩家")');

        const avatar2 = page.locator('.player-list-item .player-avatar');
        const color2 = await avatar2.evaluate(el => getComputedStyle(el).backgroundColor);

        expect(color1).toBe(color2);
    });
});
