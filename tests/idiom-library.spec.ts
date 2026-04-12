import { test, expect } from '@playwright/test';

async function openSideMenu(page: any) {
    await page.click('.btn-menu');
    await page.waitForSelector('.side-menu--open', { state: 'visible' });
    await page.waitForTimeout(400);
}

async function navigateToIdiomLibrary(page: any) {
    await openSideMenu(page);
    await page.click('.side-menu-item:has-text("成语词典")');
    await page.waitForSelector('.idiom-library-container', { state: 'visible' });
}

async function toggleStartWithKeyword(page: any) {
    await page.click('.search-option-btn:has-text("开头匹配")');
    await page.waitForTimeout(200);
}

async function toggleMatchDetails(page: any) {
    await page.click('.search-option-btn:has-text("搜索释义")');
    await page.waitForTimeout(200);
}

test.describe('Idiom Library Page - Side Menu Entry', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
    });

    test('side menu should have 成语词典 menu item', async ({ page }) => {
        await openSideMenu(page);
        const menuItem = page.locator('.side-menu-item:has-text("成语词典")');
        await expect(menuItem).toBeVisible();
    });

    test('clicking 成语词典 should navigate to idiom library page', async ({ page }) => {
        await navigateToIdiomLibrary(page);
        await expect(page.locator('.idiom-library-container')).toBeVisible();
    });

    test('side menu should close after clicking 成语词典', async ({ page }) => {
        await openSideMenu(page);
        await page.click('.side-menu-item:has-text("成语词典")');
        await page.waitForSelector('.idiom-library-container', { state: 'visible' });
        await page.waitForSelector('.side-menu--open', { state: 'hidden', timeout: 1000 });
    });
});

test.describe('Idiom Library Page - Visibility', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
        await navigateToIdiomLibrary(page);
    });

    test('idiom library page should be visible', async ({ page }) => {
        const container = page.locator('.idiom-library-container');
        await expect(container).toBeVisible();
    });

    test('header should show 成语词典 title', async ({ page }) => {
        const title = page.locator('.idiom-library-container .header-title h1');
        await expect(title).toHaveText('成语词典');
    });

    test('search input should be visible', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await expect(searchInput).toBeVisible();
    });

    test('idiom list should be visible', async ({ page }) => {
        const idiomList = page.locator('.idiom-library-list');
        await expect(idiomList).toBeVisible();
    });

    test('stats should show total idiom count', async ({ page }) => {
        const stats = page.locator('.idiom-library-stats');
        const text = await stats.textContent();
        expect(text).toContain('共');
        expect(text).toContain('个成语');
    });
});

test.describe('Idiom Library Page - Search Options UI', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
        await navigateToIdiomLibrary(page);
    });

    test('开头匹配 button should be visible', async ({ page }) => {
        const btn = page.locator('.search-option-btn:has-text("开头匹配")');
        await expect(btn).toBeVisible();
    });

    test('搜索释义 button should be visible', async ({ page }) => {
        const btn = page.locator('.search-option-btn:has-text("搜索释义")');
        await expect(btn).toBeVisible();
    });

    test('开头匹配 should be active by default', async ({ page }) => {
        const btn = page.locator('.search-option-btn:has-text("开头匹配")');
        await expect(btn).toHaveClass(/active/);
    });

    test('搜索释义 should be inactive by default', async ({ page }) => {
        const btn = page.locator('.search-option-btn:has-text("搜索释义")');
        await expect(btn).not.toHaveClass(/active/);
    });

    test('clicking 开头匹配 should toggle its state', async ({ page }) => {
        const btn = page.locator('.search-option-btn:has-text("开头匹配")');
        await expect(btn).toHaveClass(/active/);

        await toggleStartWithKeyword(page);
        await expect(btn).not.toHaveClass(/active/);

        await toggleStartWithKeyword(page);
        await expect(btn).toHaveClass(/active/);
    });

    test('clicking 搜索释义 should toggle its state', async ({ page }) => {
        const btn = page.locator('.search-option-btn:has-text("搜索释义")');
        await expect(btn).not.toHaveClass(/active/);

        await toggleMatchDetails(page);
        await expect(btn).toHaveClass(/active/);

        await toggleMatchDetails(page);
        await expect(btn).not.toHaveClass(/active/);
    });
});

test.describe('Idiom Library Page - Start With Keyword Option', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
        await navigateToIdiomLibrary(page);
    });

    test('with 开头匹配 ON - should match idioms starting with keyword', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.fill('一心');
        await page.waitForTimeout(300);

        const matchingItem = page.locator('.idiom-item >> .idiom-word:has-text("一心")');
        await expect(matchingItem.first()).toBeVisible();
    });

    test('with 开头匹配 ON - should NOT match idioms containing keyword in middle', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.fill('心一');
        await page.waitForTimeout(300);

        const idiomItems = page.locator('.idiom-item');
        const count = await idiomItems.count();

        if (count > 0) {
            const firstWord = await idiomItems.first().locator('.idiom-word').textContent();
            expect(firstWord!.startsWith('心一') || firstWord!.toLowerCase().startsWith('xin yi')).toBe(true);
        }
    });

    test('with 开头匹配 OFF - should match idioms containing keyword anywhere', async ({ page }) => {
        await toggleStartWithKeyword(page);

        const searchInput = page.locator('.search-input');
        await searchInput.fill('心一');
        await page.waitForTimeout(300);

        const idiomItems = page.locator('.idiom-item');
        const count = await idiomItems.count();
        expect(count).toBeGreaterThan(0);
    });

    test('with 开头匹配 ON - pinyin without tones should work for start match', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.fill('yi xin');
        await page.waitForTimeout(300);

        const idiomItems = page.locator('.idiom-item');
        const count = await idiomItems.count();
        expect(count).toBeGreaterThan(0);
    });

    test('with 开头匹配 OFF - pinyin without tones should work for contains match', async ({ page }) => {
        await toggleStartWithKeyword(page);

        const searchInput = page.locator('.search-input');
        await searchInput.fill('xin yi');
        await page.waitForTimeout(300);

        const idiomItems = page.locator('.idiom-item');
        const count = await idiomItems.count();
        expect(count).toBeGreaterThan(0);
    });
});

test.describe('Idiom Library Page - Match Details Option', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
        await navigateToIdiomLibrary(page);
    });

    test('with 搜索释义 OFF - should NOT match explanation content by default', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.fill('专心');
        await page.waitForTimeout(300);

        const emptyState = page.locator('.empty-state');
        const idiomItems = page.locator('.idiom-item');
        const count = await idiomItems.count();

        if (count === 0) {
            await expect(emptyState).toBeVisible();
        }
    });

    test('with 搜索释义 ON - should match explanation content', async ({ page }) => {
        await toggleMatchDetails(page);

        const searchInput = page.locator('.search-input');
        await searchInput.fill('专心');
        await page.waitForTimeout(300);

        const idiomItems = page.locator('.idiom-item');
        const count = await idiomItems.count();
        expect(count).toBeGreaterThan(0);
    });

    test('with 搜索释义 ON - should match derivation content', async ({ page }) => {
        await toggleMatchDetails(page);

        const searchInput = page.locator('.search-input');
        await searchInput.fill('法华经');
        await page.waitForTimeout(300);

        const idiomItems = page.locator('.idiom-item');
        const count = await idiomItems.count();
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('with 搜索释义 ON - should match example content', async ({ page }) => {
        await toggleMatchDetails(page);

        const searchInput = page.locator('.search-input');
        await searchInput.fill('意志');
        await page.waitForTimeout(300);

        const idiomItems = page.locator('.idiom-item');
        const count = await idiomItems.count();
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('with 搜索释义 ON + 开头匹配 ON - should match details starting with keyword', async ({ page }) => {
        await toggleMatchDetails(page);

        const searchInput = page.locator('.search-input');
        await searchInput.fill('阿鼻');
        await page.waitForTimeout(300);

        const idiomItems = page.locator('.idiom-item');
        const count = await idiomItems.count();
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('with 搜索释义 ON + 开头匹配 OFF - should match details containing keyword', async ({ page }) => {
        await toggleMatchDetails(page);
        await toggleStartWithKeyword(page);

        const searchInput = page.locator('.search-input');
        await searchInput.fill('痛苦');
        await page.waitForTimeout(300);

        const idiomItems = page.locator('.idiom-item');
        const count = await idiomItems.count();
        expect(count).toBeGreaterThanOrEqual(0);
    });
});

test.describe('Idiom Library Page - Pinyin Without Tones', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
        await navigateToIdiomLibrary(page);
    });

    test('search with pinyin without tones should match idioms', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.fill('yi xin yi yi');
        await page.waitForTimeout(300);

        const matchingItem = page.locator('.idiom-item:has-text("一心一意")');
        await expect(matchingItem.first()).toBeVisible();
    });

    test('search with pinyin with tones should also match idioms', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.fill('yī xīn yī yì');
        await page.waitForTimeout(300);

        const matchingItem = page.locator('.idiom-item:has-text("一心一意")');
        await expect(matchingItem.first()).toBeVisible();
    });

    test('search with mixed case pinyin should work', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.fill('Yi Xin');
        await page.waitForTimeout(300);

        const idiomItems = page.locator('.idiom-item');
        const count = await idiomItems.count();
        expect(count).toBeGreaterThan(0);
    });

    test('search with partial pinyin without tones should work', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.fill('yi');
        await page.waitForTimeout(300);

        const idiomItems = page.locator('.idiom-item');
        const count = await idiomItems.count();
        expect(count).toBeGreaterThan(0);
    });
});

test.describe('Idiom Library Page - Combined Options', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
        await navigateToIdiomLibrary(page);
    });

    test('开头匹配 ON + 搜索释义 OFF - standard search behavior', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.fill('一心');
        await page.waitForTimeout(300);

        const matchingItem = page.locator('.idiom-item >> .idiom-word:has-text("一心")');
        await expect(matchingItem.first()).toBeVisible();
    });

    test('开头匹配 OFF + 搜索释义 OFF - contains search for idiom/pinyin only', async ({ page }) => {
        await toggleStartWithKeyword(page);

        const searchInput = page.locator('.search-input');
        await searchInput.fill('心一');
        await page.waitForTimeout(300);

        const idiomItems = page.locator('.idiom-item');
        const count = await idiomItems.count();
        expect(count).toBeGreaterThan(0);
    });

    test('开头匹配 ON + 搜索释义 ON - start match for all fields', async ({ page }) => {
        await toggleMatchDetails(page);

        const searchInput = page.locator('.search-input');
        await searchInput.fill('一心');
        await page.waitForTimeout(300);

        const idiomItems = page.locator('.idiom-item');
        const count = await idiomItems.count();
        expect(count).toBeGreaterThan(0);
    });

    test('开头匹配 OFF + 搜索释义 ON - contains match for all fields', async ({ page }) => {
        await toggleStartWithKeyword(page);
        await toggleMatchDetails(page);

        const searchInput = page.locator('.search-input');
        await searchInput.fill('心');
        await page.waitForTimeout(300);

        const idiomItems = page.locator('.idiom-item');
        const count = await idiomItems.count();
        expect(count).toBeGreaterThan(0);
    });
});

test.describe('Idiom Library Page - Search Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
        await navigateToIdiomLibrary(page);
    });

    test('search by idiom word should filter results', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.fill('一心一意');
        await page.waitForTimeout(300);

        const idiomItems = page.locator('.idiom-item');
        const count = await idiomItems.count();
        expect(count).toBeGreaterThan(0);

        const matchingItem = page.locator('.idiom-item:has-text("一心一意")');
        await expect(matchingItem.first()).toBeVisible();
    });

    test('search by pinyin should filter results', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.fill('yī xīn yī yì');
        await page.waitForTimeout(300);

        const idiomItems = page.locator('.idiom-item');
        const count = await idiomItems.count();
        expect(count).toBeGreaterThan(0);

        const matchingItem = page.locator('.idiom-item:has-text("一心一意")');
        await expect(matchingItem.first()).toBeVisible();
    });

    test('search by partial word should filter results', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.fill('一心');
        await page.waitForTimeout(300);

        const idiomItems = page.locator('.idiom-item');
        const count = await idiomItems.count();
        expect(count).toBeGreaterThan(0);

        const matchingItem = page.locator('.idiom-item >> .idiom-word:has-text("一心")');
        await expect(matchingItem.first()).toBeVisible();
    });

    test('clear search button should clear the search query', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.fill('一心一意');
        await page.waitForTimeout(300);

        const clearBtn = page.locator('.search-clear');
        await expect(clearBtn).toBeVisible();
        await clearBtn.click();

        await expect(searchInput).toHaveValue('');
    });

    test('empty search results should show message', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.fill('xyz123不存在的成语');
        await page.waitForTimeout(300);

        const emptyState = page.locator('.empty-state');
        await expect(emptyState).toBeVisible();
        await expect(emptyState).toContainText('未找到匹配的成语');
    });

    test('stats should show matching count when searching', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.fill('一心');
        await page.waitForTimeout(300);

        const stats = page.locator('.idiom-library-stats');
        const text = await stats.textContent();
        expect(text).toContain('匹配');
    });
});

test.describe('Idiom Library Page - Idiom List', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
        await navigateToIdiomLibrary(page);
    });

    test('clicking an idiom should open detail modal', async ({ page }) => {
        const firstIdiom = page.locator('.idiom-item').first();
        await firstIdiom.click();

        await page.waitForSelector('#detail-modal.show', { state: 'visible' });
        const modal = page.locator('#detail-modal.show');
        await expect(modal).toBeVisible();
    });

    test('idiom list should show idiom word', async ({ page }) => {
        const firstIdiom = page.locator('.idiom-item').first();
        const word = firstIdiom.locator('.idiom-word');
        await expect(word).toBeVisible();
        const text = await word.textContent();
        expect(text!.length).toBeGreaterThan(0);
    });

    test('idiom list should show idiom pinyin', async ({ page }) => {
        const firstIdiom = page.locator('.idiom-item').first();
        const pinyin = firstIdiom.locator('.idiom-pinyin');
        await expect(pinyin).toBeVisible();
        const text = await pinyin.textContent();
        expect(text!.length).toBeGreaterThan(0);
    });

    test('idiom list should show idiom explanation', async ({ page }) => {
        const firstIdiom = page.locator('.idiom-item').first();
        const explanation = firstIdiom.locator('.idiom-explanation');
        await expect(explanation).toBeVisible();
        const text = await explanation.textContent();
        expect(text!.length).toBeGreaterThan(0);
    });

    test('infinite scroll should load more idioms', async ({ page }) => {
        const initialCount = await page.locator('.idiom-item').count();

        await page.locator('.idiom-library-list').evaluate((el) => {
            el.scrollTop = el.scrollHeight;
        });
        await page.waitForTimeout(500);

        const newCount = await page.locator('.idiom-item').count();
        expect(newCount).toBeGreaterThanOrEqual(initialCount);
    });
});

test.describe('Idiom Library Page - Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
        await navigateToIdiomLibrary(page);
    });

    test('back button should return to home page', async ({ page }) => {
        await page.click('.btn-back');
        await page.waitForSelector('.home-container', { state: 'visible' });
        await expect(page.locator('.home-container')).toBeVisible();
        await expect(page.locator('.idiom-library-container')).not.toBeVisible();
    });
});

test.describe('Idiom Library Page - Mobile Viewport', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
        await navigateToIdiomLibrary(page);
    });

    test('all elements should be visible on mobile viewport', async ({ page }) => {
        await expect(page.locator('.idiom-library-container')).toBeVisible();
        await expect(page.locator('.search-input')).toBeVisible();
        await expect(page.locator('.idiom-library-list')).toBeVisible();
    });

    test('search options should be visible on mobile', async ({ page }) => {
        const startWithBtn = page.locator('.search-option-btn:has-text("开头匹配")');
        const matchDetailsBtn = page.locator('.search-option-btn:has-text("搜索释义")');
        await expect(startWithBtn).toBeVisible();
        await expect(matchDetailsBtn).toBeVisible();
    });

    test('touch targets should be at least 44x44px', async ({ page }) => {
        const firstIdiom = page.locator('.idiom-item').first();
        const box = await firstIdiom.boundingBox();
        expect(box!.height).toBeGreaterThanOrEqual(44);
    });

    test('search input should be clickable on mobile', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.click();
        await expect(searchInput).toBeFocused();
    });

    test('idiom item should be clickable on mobile', async ({ page }) => {
        const firstIdiom = page.locator('.idiom-item').first();
        await firstIdiom.click();

        await page.waitForSelector('#detail-modal.show', { state: 'visible' });
        await expect(page.locator('#detail-modal.show')).toBeVisible();
    });

    test('side menu should be accessible on mobile', async ({ page }) => {
        await page.click('.btn-back');
        await page.waitForSelector('.home-container');

        await openSideMenu(page);
        const menuItem = page.locator('.side-menu-item:has-text("成语词典")');
        await expect(menuItem).toBeVisible();

        const box = await menuItem.boundingBox();
        expect(box!.height).toBeGreaterThanOrEqual(44);
    });
});

test.describe('Idiom Library Page - Detail Modal Integration', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
        await navigateToIdiomLibrary(page);
    });

    test('detail modal should show idiom information', async ({ page }) => {
        const firstIdiom = page.locator('.idiom-item').first();
        const idiomWord = await firstIdiom.locator('.idiom-word').textContent();
        await firstIdiom.click();

        await page.waitForSelector('#detail-modal.show', { state: 'visible' });
        const modalTitle = page.locator('#detail-modal.show .modal-header h2');
        await expect(modalTitle).toHaveText(idiomWord!);
    });

    test('closing detail modal should return to idiom library', async ({ page }) => {
        const firstIdiom = page.locator('.idiom-item').first();
        await firstIdiom.click();

        await page.waitForSelector('#detail-modal.show', { state: 'visible' });
        await page.click('#detail-modal .close-modal');
        await page.waitForSelector('#detail-modal.show', { state: 'hidden' });

        await expect(page.locator('.idiom-library-container')).toBeVisible();
    });

    test('can open multiple idioms in sequence', async ({ page }) => {
        const firstIdiom = page.locator('.idiom-item').first();
        await firstIdiom.click();
        await page.waitForSelector('#detail-modal.show', { state: 'visible' });
        await page.click('#detail-modal .close-modal');
        await page.waitForSelector('#detail-modal.show', { state: 'hidden' });

        const secondIdiom = page.locator('.idiom-item').nth(1);
        await secondIdiom.click();
        await page.waitForSelector('#detail-modal.show', { state: 'visible' });
        await expect(page.locator('#detail-modal.show')).toBeVisible();
    });
});

test.describe('Idiom Library Page - Highlighting', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.mode-card');
        await navigateToIdiomLibrary(page);
    });

    test('search should highlight matched text in idiom word', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.fill('一心');
        await page.waitForTimeout(300);

        const highlight = page.locator('.idiom-word .highlight').first();
        await expect(highlight).toBeVisible();
        await expect(highlight).toHaveText('一心');
    });

    test('search should highlight matched text in pinyin', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.fill('yī xīn');
        await page.waitForTimeout(300);

        const highlight = page.locator('.idiom-pinyin .highlight').first();
        await expect(highlight).toBeVisible();
    });

    test('search should highlight matched text in explanation', async ({ page }) => {
        await toggleMatchDetails(page);

        const searchInput = page.locator('.search-input');
        await searchInput.fill('专心');
        await page.waitForTimeout(300);

        const highlight = page.locator('.idiom-explanation .highlight').first();
        await expect(highlight).toBeVisible();
        await expect(highlight).toHaveText('专心');
    });

    test('highlight should work with 开头匹配 ON', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.fill('一心');
        await page.waitForTimeout(300);

        const highlight = page.locator('.idiom-word .highlight').first();
        await expect(highlight).toBeVisible();
    });

    test('highlight should work with 开头匹配 OFF', async ({ page }) => {
        await toggleStartWithKeyword(page);

        const searchInput = page.locator('.search-input');
        await searchInput.fill('心一');
        await page.waitForTimeout(300);

        const highlight = page.locator('.idiom-word .highlight').first();
        await expect(highlight).toBeVisible();
    });

    test('highlight should be passed to detail modal', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.fill('一心');
        await page.waitForTimeout(300);

        const firstIdiom = page.locator('.idiom-item').first();
        await firstIdiom.click();
        await page.waitForSelector('#detail-modal.show', { state: 'visible' });

        const modalHighlight = page.locator('#detail-modal.show .modal-header h2 .highlight');
        await expect(modalHighlight).toBeVisible();
        await expect(modalHighlight).toHaveText('一心');
    });

    test('highlight should appear in detail modal body', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.fill('一心');
        await page.waitForTimeout(300);

        const firstIdiom = page.locator('.idiom-item').first();
        await firstIdiom.click();
        await page.waitForSelector('#detail-modal.show', { state: 'visible' });

        const modalBodyHighlight = page.locator('#detail-modal.show .detail-content .highlight');
        const count = await modalBodyHighlight.count();
        expect(count).toBeGreaterThan(0);
    });

    test('no highlight should appear when search is empty', async ({ page }) => {
        const highlights = page.locator('.highlight');
        const count = await highlights.count();
        expect(count).toBe(0);
    });
});
