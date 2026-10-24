import { expect, test } from "@playwright/test";
import { POSTS, ROUTES, SEARCH_TERMS } from "../support/routes";
import { openSearchDialog } from "../support/search";
import { readTheme, toggleTheme } from "../support/theme";

test("@critical 搜索命中后可点击结果跳转到对应文章", async ({ page }) => {
  await page.goto(ROUTES.home);
  await openSearchDialog(page);

  const searchInput = page.locator("pagefind-input input");
  await expect(searchInput).toBeVisible();

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

test("@critical 分页进入文章后回退，URL 与列表状态保持一致", async ({ page }) => {
  await page.goto(ROUTES.page2);
  await expect(page).toHaveURL(ROUTES.page2);
  await expect(page.locator("nav.pagination [aria-current='page']")).toHaveText("2");

  const pagePostLink = page.locator(".post-row__link").first();
  await expect(pagePostLink).toBeVisible();
  await pagePostLink.click();
  await expect(page).toHaveURL(/\/posts\/.+/);

  await page.goBack();
  await expect(page).toHaveURL(ROUTES.page2);
  await expect(page.locator("nav.pagination [aria-current='page']")).toHaveText("2");
});

test("@regression 标签与分类列表进入文章后可回退", async ({ page }) => {
  await page.goto(ROUTES.tags);
  const firstTag = page.locator(".tag-list__item a").first();
  await expect(firstTag).toBeVisible();
  await firstTag.click();
  await expect(page).toHaveURL(/\/tags\/[^/]+\/$/);

  const tagListingUrl = page.url();
  const tagPostLink = page.locator(".post-list__item a").first();
  await expect(tagPostLink).toBeVisible();
  await tagPostLink.click();
  await expect(page).toHaveURL(/\/posts\/.+/);

  await page.goBack();
  await expect(page).toHaveURL(tagListingUrl);
  await expect(page.locator(".post-list__item").first()).toBeVisible();

  await page.goto(ROUTES.categories);
  const firstCategory = page.locator(".cat-card__link").first();
  await expect(firstCategory).toBeVisible();
  await firstCategory.click();
  await expect(page).toHaveURL(/\/categories\/[^/]+\/$/);

  const categoryListingUrl = page.url();
  const categoryPostLink = page.locator(".post-list__item a").first();
  await expect(categoryPostLink).toBeVisible();
  await categoryPostLink.click();
  await expect(page).toHaveURL(/\/posts\/.+/);

  await page.goBack();
  await expect(page).toHaveURL(categoryListingUrl);
  await expect(page.locator(".post-list__item").first()).toBeVisible();
});

test("@regression 主题切换后跨页面导航与刷新仍保持", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(ROUTES.home);

  const initialTheme = await readTheme(page);
  const toggledTheme = await toggleTheme(page);
  expect(toggledTheme).not.toBe(initialTheme);

  await page.goto(ROUTES.tags);
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return document.documentElement.dataset.theme;
      });
    })
    .toBe(toggledTheme);

  await page.goto(POSTS.helloWorld);
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return document.documentElement.dataset.theme;
      });
    })
    .toBe(toggledTheme);

  await page.reload();
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return document.documentElement.dataset.theme;
      });
    })
    .toBe(toggledTheme);
});
