import { expect, test } from "@playwright/test";
import { POSTS, ROUTES, SEARCH_TERMS } from "../support/routes";
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

  await searchInput.fill(SEARCH_TERMS.publicPostTitle);

  await expect
    .poll(async () => {
      return page
        .locator("pagefind-results a", {
          hasText: SEARCH_TERMS.publicPostTitle,
        })
        .count();
    })
    .toBeGreaterThan(0);
});

test("@critical 搜索结果排除加密文章", async ({ page }) => {
  const searchInput = await openSearchPanel(page);

  await searchInput.fill(SEARCH_TERMS.encryptedPostTitle);

  await expect
    .poll(async () => {
      return page.locator(`pagefind-results a[href*="${POSTS.encryptedTest}"]`).count();
    })
    .toBe(0);

  await searchInput.fill(SEARCH_TERMS.encryptedOnlyText);

  await expect
    .poll(async () => {
      return page.locator(`pagefind-results a[href*="${POSTS.encryptedTest}"]`).count();
    })
    .toBe(0);
});
