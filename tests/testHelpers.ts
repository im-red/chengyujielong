import { Page, BrowserContext } from '@playwright/test';

export const TEST_IDIOM_SEQUENCE = [
    '一心一意',
    '意气风发',
    '发愤图强',
];

export const TEST_USER_RESPONSES: Record<string, string> = {
    '一心一意': '意气风发',
    '意气风发': '发愤图强',
    '发愤图强': '强人所难',
};


export async function setupTestMode(page: Page) {
    await page.evaluate(() => {
        (window as any).__TEST_MODE__ = true;
    });
}


export async function openSideMenu(page: Page) {
    const menuButton = page.locator('ion-menu-button');
    await menuButton.click();
    await page.waitForTimeout(400);
}


export async function navigateViaMenu(page: Page, menuText: string) {
    await openSideMenu(page);
    const menuItem = page.locator('ion-item').filter({ hasText: menuText }).first();
    await menuItem.click();
    await page.waitForTimeout(500);
}


export async function startEndlessMode(page: Page) {
    await page.goto('/');
    await page.waitForSelector('ion-router-outlet', { state: 'attached' });

    await setupTestMode(page);

    await page.locator('text=无尽模式').first().click();
    await page.waitForTimeout(500);
    await page.waitForSelector('#idiom-input', { state: 'visible', timeout: 5000 }).catch(() => {
        return page.waitForSelector('input', { state: 'visible', timeout: 5000 });
    });
}


export async function startLimitedTimeMode(page: Page, seconds: number = 120) {
    await page.goto('/');
    await page.waitForSelector('ion-router-outlet', { state: 'attached' });

    await setupTestMode(page);

    await page.locator('text=限时模式').first().click();
    await page.waitForTimeout(500);

    // Select the correct preset based on seconds
    if (seconds === 60) {
        await page.locator('ion-button').filter({ hasText: '1分钟' }).click();
    } else if (seconds === 120) {
        await page.locator('ion-button').filter({ hasText: '2分钟' }).click();
    } else if (seconds === 180) {
        await page.locator('ion-button').filter({ hasText: '3分钟' }).click();
    } else if (seconds === 300) {
        await page.locator('ion-button').filter({ hasText: '5分钟' }).click();
    }
    
    await page.locator('#start-limited-time-btn').click();
    await page.waitForTimeout(500);

    await page.waitForSelector('#idiom-input', { state: 'visible', timeout: 5000 }).catch(() => {
        return page.waitForSelector('input', { state: 'visible', timeout: 5000 });
    });
}


export async function submitIdiom(page: Page, idiom: string) {
    const input = page.locator('#idiom-input');
    await input.fill(idiom);
    await input.press('Enter');
    await page.waitForTimeout(300);
}


export async function getInputValue(page: Page): Promise<string> {
    const input = page.locator('#idiom-input');
    return await input.inputValue();
}


export async function getPageTitle(page: Page): Promise<string> {
    const title = page.locator('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-title').first();
    return (await title.textContent()) || '';
}


export async function openDetailModal(page: Page) {
    const messageBubble = page.locator('.message-bubble').first();
    await messageBubble.click();
    await page.waitForSelector('ion-modal.show-modal', { state: 'visible', timeout: 5000 });
    await page.waitForTimeout(300);
}

export async function closeModal(page: Page) {
    const closeBtn = page.locator('ion-modal.show-modal ion-button, ion-modal.show-modal .dialog-close-btn').first();
    await closeBtn.click();
    await page.waitForTimeout(300);
}


export function createMobileContext(browser: any): Promise<BrowserContext> {
    return browser.newContext({
        hasTouch: true,
        viewport: { width: 375, height: 667 }
    });
}
