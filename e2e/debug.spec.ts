import { test, expect } from '@playwright/test';

test('debug borrower select', async ({ page }) => {
    await page.goto('/loans');
    await page.waitForLoadState('networkidle');

    console.log('1. Clicking New Application');
    await page.getByRole('button', { name: /New Application/i }).click();

    console.log('2. Waiting for dialog');
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 });

    console.log('3. Waiting for borrower select to appear');
    await page.waitForSelector('[data-testid="borrower-select"]', { state: 'visible', timeout: 15000 });

    console.log('4. Clicking borrower select');
    await page.getByTestId('borrower-select').click();

    console.log('5. Waiting a bit for dropdown animation');
    await page.waitForTimeout(500);

    console.log('6. Checking for options in portals');
    const portals = await page.locator('[data-radix-popper-content-wrapper]').count();
    console.log(`Found ${portals} Radix portals`);

    console.log('7. Waiting for options');
    await page.waitForSelector('[role="option"]', { state: 'visible', timeout: 15000 });

    console.log('8. Checking for options');
    const options = await page.locator('[role="option"]').count();
    console.log(`Found ${options} options`);

    console.log('9. Test passed!');
});
