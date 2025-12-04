/**
 * E2E tests for Loan Creation Flow
 * Tests complete loan creation process including error scenarios
 */

import { test, expect } from '@playwright/test';

test.describe('Loan Creation Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.getByTestId('duration-input').fill('12');

        // Select repayment cycle
        await page.getByTestId('repayment-cycle-select').click();
        await page.waitForSelector('[role="option"]', { state: 'visible' });
        await page.getByRole('option', { name: 'Monthly' }).click();

        // Submit form
        await page.getByTestId('submit-loan-button').click();

        // Verify success
        await expect(page.getByText(/Loan application created successfully/i)).toBeVisible({
            timeout: 5000,
        });

        // Verify dialog closes
        await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
    });

    test('should display validation errors for empty required fields', async ({ page }) => {
        // Click "New Application" button
        await page.getByRole('button', { name: /New Application/i }).click();

        // Wait for dialog to open and be ready
        await page.waitForSelector('[role="dialog"]', { state: 'visible' });
        await page.waitForSelector('form', { state: 'visible' });

        // Try to submit without filling any fields
        await page.getByTestId('submit-loan-button').click();

        // Verify validation errors appear
        await expect(page.getByText(/Borrower is required/i)).toBeVisible();
        await expect(page.getByText(/Loan Product is required/i)).toBeVisible();
    });

    test('should validate numeric fields are positive', async ({ page }) => {
        // Click "New Application" button
        await page.getByRole('button', { name: /New Application/i }).click();

        // Wait for dialog to open and be ready
        await page.waitForSelector('[role="dialog"]', { state: 'visible' });
        await page.waitForSelector('form', { state: 'visible' });

        // Select borrower and product
        await page.getByTestId('borrower-select').click();
        await page.waitForSelector('[role="option"]', { state: 'visible' });
        await page.getByRole('option').first().click();

        await page.getByTestId('loan-product-select').click();
        await page.waitForSelector('[role="option"]', { state: 'visible' });
        await page.getByRole('option').first().click();

        // Fill with invalid (negative) principal
        await page.getByTestId('principal-input').fill('-1000');
        await page.getByTestId('interest-rate-input').fill('10');
        await page.getByTestId('duration-input').fill('12');

        await page.getByTestId('repayment-cycle-select').click();
        await page.waitForSelector('[role="option"]', { state: 'visible' });
        await page.getByRole('option', { name: 'Monthly' }).click();

        // Submit form
        await page.getByTestId('submit-loan-button').click();

        // Verify validation error
        await expect(page.getByText(/Principal must be greater than 0/i)).toBeVisible();
    });

    test('should display loan products from API', async ({ page }) => {
        // Click "New Application" button
        await page.getByRole('button', { name: /New Application/i }).click();

        // Wait for dialog to open and be ready
        await page.waitForSelector('[role="dialog"]', { state: 'visible' });
        await page.waitForSelector('form', { state: 'visible' });

        // Open loan product dropdown
        await page.getByTestId('loan-product-select').click();
        await page.waitForSelector('[role="option"]', { state: 'visible' });

        // Verify loan products are loaded from API
        await expect(page.getByRole('option', { name: /Personal Loan \(10%\)/i })).toBeVisible();
        await expect(page.getByRole('option', { name: /Business Loan \(5%\)/i })).toBeVisible();
    });

    test('should show error message when loan products fail to load', async ({ page }) => {
        // Intercept API call and return error BEFORE navigation
        await page.route('**/api/loan-products', (route) => {
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Internal server error' }),
            });
        });

        // Navigate to loans page
        await page.goto('/loans');
        await page.waitForLoadState('networkidle');

        // Click "New Application" button
        await page.getByRole('button', { name: /New Application/i }).click();

        // Wait for dialog to open
        await page.waitForSelector('[role="dialog"]', { state: 'visible' });

        // Verify error message is displayed
        await expect(page.getByTestId('loan-products-error')).toBeVisible();
        await expect(page.getByText(/Failed to load loan products/i)).toBeVisible();
    });

    test('should show message when no loan products are available', async ({ page }) => {
        // Intercept API call and return empty array BEFORE navigation
        await page.route('**/api/loan-products', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([]),
            });
        });

        // Navigate to loans page
        await page.goto('/loans');
        await page.waitForLoadState('networkidle');

        // Click "New Application" button
        await page.getByRole('button', { name: /New Application/i }).click();

        // Wait for dialog to open
        await page.waitForSelector('[role="dialog"]', { state: 'visible' });

        // Verify message is displayed
        await expect(page.getByTestId('loan-products-empty')).toBeVisible();
        await expect(page.getByText(/No loan products available/i)).toBeVisible();
    });

    test('should show loading state while fetching loan products', async ({ page }) => {
        // Intercept API call with delay
        await page.route('**/api/loan-products', async (route) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: 'product-1',
                        name: 'Personal Loan (10%)',
                        minPrincipal: 1000,
                        maxPrincipal: 50000,
                        interestRate: 10,
                        interestType: 'REDUCING',
                        term: 12,
                        termUnit: 'MONTHS',
                        fees: null,
                        penalties: null,
                    },
                ]),
            });
        });

        // Navigate to loans page
        await page.goto('/loans');
        await page.waitForLoadState('networkidle');

        // Click "New Application" button
        await page.getByRole('button', { name: /New Application/i }).click();

        // Wait for dialog to open
        await page.waitForSelector('[role="dialog"]', { state: 'visible' });

        // Verify loading skeleton is shown
        const loadingElements = page.locator('.animate-pulse');
        await expect(loadingElements.first()).toBeVisible();

        // Wait for products to load
        await expect(page.getByTestId('loan-product-select')).toBeVisible({ timeout: 3000 });
    });

    test('should handle loan creation API error gracefully', async ({ page }) => {
        // Intercept loan creation API and return error
        await page.route('**/api/loans', (route) => {
            if (route.request().method() === 'POST') {
                route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Internal server error' }),
                });
            } else {
                route.continue();
            }
        });

        // Click "New Application" button
        await page.getByRole('button', { name: /New Application/i }).click();

        // Wait for dialog to open and be ready
        await page.waitForSelector('[role="dialog"]', { state: 'visible' });
        await page.waitForSelector('form', { state: 'visible' });

        // Fill out form
        await page.getByTestId('borrower-select').click();
        await page.waitForSelector('[role="option"]', { state: 'visible' });
        await page.getByRole('option').first().click();

        await page.getByTestId('loan-product-select').click();
        await page.waitForSelector('[role="option"]', { state: 'visible' });
        await page.getByRole('option').first().click();

        await page.getByTestId('principal-input').fill('10000');
        await page.getByTestId('interest-rate-input').fill('10');
        await page.getByTestId('duration-input').fill('12');

        await page.getByTestId('repayment-cycle-select').click();
        await page.waitForSelector('[role="option"]', { state: 'visible' });
        await page.getByRole('option', { name: 'Monthly' }).click();

        // Submit form
        await page.getByTestId('submit-loan-button').click();

        // Verify error toast is shown
        await expect(page.getByText(/Something went wrong/i)).toBeVisible({ timeout: 5000 });
    });

    test('should reset form after successful submission', async ({ page }) => {
        // Click "New Application" button
        await page.getByRole('button', { name: /New Application/i }).click();

        // Wait for dialog to open and be ready
        await page.waitForSelector('[role="dialog"]', { state: 'visible' });
        await page.waitForSelector('form', { state: 'visible' });

        // Fill out form
        await page.getByTestId('borrower-select').click();
        await page.waitForSelector('[role="option"]', { state: 'visible' });
        await page.getByRole('option').first().click();

        await page.getByTestId('loan-product-select').click();
        await page.waitForSelector('[role="option"]', { state: 'visible' });
        await page.getByRole('option').first().click();

        await page.getByTestId('principal-input').fill('10000');
        await page.getByTestId('interest-rate-input').fill('10');
        await page.getByTestId('duration-input').fill('12');

        await page.getByTestId('repayment-cycle-select').click();
        await page.waitForSelector('[role="option"]', { state: 'visible' });
        await page.getByRole('option', { name: 'Monthly' }).click();

        // Submit form
        await page.getByTestId('submit-loan-button').click();

        // Wait for success
        await expect(page.getByText(/Loan application created successfully/i)).toBeVisible({
            timeout: 5000,
        });

        // Wait for dialog to close
        await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });

        // Open form again
        await page.getByRole('button', { name: /New Application/i }).click();
        await page.waitForSelector('[role="dialog"]', { state: 'visible' });
        await page.waitForSelector('form', { state: 'visible' });

        // Verify form is reset
        await expect(page.getByTestId('principal-input')).toHaveValue('');
    });
});
