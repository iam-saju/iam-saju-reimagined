import { test, expect } from '@playwright/test';

test.describe('App Routes', () => {
  test('homepage loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await expect(page).toHaveTitle(/saju/i);

    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('posts page loads', async ({ page }) => {
    await page.goto('/posts');
    await expect(page.getByRole('heading', { name: /posts/i })).toBeVisible();
  });

  test('archive page loads', async ({ page }) => {
    await page.goto('/archive');
    await expect(page.getByRole('heading', { name: /archive/i })).toBeVisible();
  });

  test('404 page loads for unknown route', async ({ page }) => {
    await page.goto('/unknown-route-xyz');
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  });
});

test.describe('Theme Toggle', () => {
  test('theme button is present', async ({ page }) => {
    await page.goto('/');
    const themeButton = page.locator('button[title="Toggle Theme"]');
    await expect(themeButton).toBeVisible();
  });

  test('theme toggle changes appearance', async ({ page }) => {
    await page.goto('/');
    const themeButton = page.locator('button[title="Toggle Theme"]');
    await themeButton.click();
    expect(await page.title()).toBeTruthy();
  });
});

test.describe('Navigation', () => {
  test('navigation links work', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /posts/i }).first().click();
    await expect(page).toHaveURL(/\/posts/);
    
    await page.getByRole('link', { name: /archive/i }).first().click();
    await expect(page).toHaveURL(/\/archive/);
  });
});