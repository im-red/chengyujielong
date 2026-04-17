import { test, expect } from '@playwright/test';

test.describe('Import and Export Data', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Clear local storage to start fresh
        await page.evaluate(() => {
            localStorage.clear();
        });
        await page.reload();
    });

    test('should export data to a JSON file with correct naming and format', async ({ page }) => {
        // Set some dummy data
        await page.evaluate(() => {
            localStorage.setItem('chengyujielong_favorites', JSON.stringify([{ idiom: '一心一意', addedAt: 12345 }]));
        });
        await page.reload();

        // Open menu
        await page.click('button.btn-menu');

        // Wait for download and click export
        const downloadPromise = page.waitForEvent('download');
        await page.click('text=导出数据');
        const download = await downloadPromise;

        // Verify file name
        const suggestedFilename = download.suggestedFilename();
        expect(suggestedFilename).toMatch(/^chengyujielong_\d{8}_\d{6}\.json$/);

        // Read downloaded file
        const path = await download.path();
        const fs = require('fs');
        const content = fs.readFileSync(path, 'utf-8');
        const parsed = JSON.parse(content);

        // Verify content
        expect(parsed).toHaveProperty('sessions');
        expect(parsed).toHaveProperty('patches');
        expect(parsed).toHaveProperty('favorites');
        expect(parsed.favorites).toHaveLength(1);
        expect(parsed.favorites[0].idiom).toBe('一心一意');
    });

    test('should import valid JSON data successfully', async ({ page }, testInfo) => {
        // Prepare a valid JSON file
        const validData = {
            sessions: [],
            patches: [],
            favorites: [{ idiom: '发愤图强', addedAt: 67890 }]
        };
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, `valid_import_${testInfo.project.name}.json`);
        fs.writeFileSync(filePath, JSON.stringify(validData));

        // Open menu
        await page.click('button.btn-menu');

        // Listen for alert
        page.on('dialog', dialog => {
            expect(dialog.message()).toBe('导入成功！');
            dialog.accept();
        });

        // Click import and set file
        const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'),
            page.click('text=导入数据')
        ]);
        await fileChooser.setFiles(filePath);

        // Verify the data is reflected in UI
        // We can check local storage or UI
        await page.waitForTimeout(500); // give it time to process
        const storedFavorites = await page.evaluate(() => localStorage.getItem('chengyujielong_favorites'));
        expect(storedFavorites).toContain('发愤图强');

        // Cleanup
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });

    test('should show error alert on invalid JSON data import', async ({ page }, testInfo) => {
        // Prepare an invalid JSON file
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, `invalid_import_${testInfo.project.name}.txt`);
        fs.writeFileSync(filePath, 'this is not a valid json');

        // Open menu
        await page.click('button.btn-menu');

        let alertTriggered = false;
        page.on('dialog', dialog => {
            expect(dialog.message()).toBe('导入失败，文件格式可能不正确。');
            alertTriggered = true;
            dialog.accept();
        });

        // Click import and set file
        const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'),
            page.click('text=导入数据')
        ]);
        await fileChooser.setFiles(filePath);

        await page.waitForTimeout(500);
        expect(alertTriggered).toBe(true);

        // Cleanup
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });
});
