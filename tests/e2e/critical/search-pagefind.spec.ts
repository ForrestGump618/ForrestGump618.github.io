import { expect, test } from "@playwright/test";
import { ROUTES, SEARCH_TERMS } from "../support/routes";
import { openSearchDialog } from "../support/search";

async function openSearchPanel(page: import("@playwright/test").Page) {
  await page.goto(ROUTES.home);
  await openSearchDialog(page);

  const searchInput = page.locator("pagefind-input input");
  await expect(searchInput).toBeVisible();

  return searchInput;
}

test("@critical 搜索可命中公开文章", async ({ page }) => {
  const searchInput = await openSearchPanel(page);

  await searchInput.fill(SEARCH_TERMS.heart);

  const results = page.locator("pagefind-results a");
  await expect.poll(async () => results.count()).toBeGreaterThan(0);
  await expect(results.first()).toContainText(SEARCH_TERMS.heart);
});

test("@critical 搜索结果不包含草稿文章", async ({ page }) => {
  const searchInput = await openSearchPanel(page);

  await searchInput.fill(SEARCH_TERMS.draftTitle);

  const draftResult = page.locator('pagefind-results a[href*="深度学习笔记九"]');
  await expect.poll(async () => draftResult.count()).toBe(0);
});

test("@critical 搜索结果可点击进入文章", async ({ page }) => {
  const searchInput = await openSearchPanel(page);

  await searchInput.fill(SEARCH_TERMS.heart);

  const firstResult = page.locator("pagefind-results a").first();
  await expect(firstResult).toBeVisible();

  const href = await firstResult.getAttribute("href");
  expect(href).toBeTruthy();

  if (!href) {
    return;
  }

  await firstResult.click();
  await expect(page).toHaveURL(/\/posts\//);
  await expect(page.locator("article.post h1").first()).toBeVisible();
});
