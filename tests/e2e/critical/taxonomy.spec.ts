import { expect, test } from "@playwright/test";
import { POSTS, ROUTES } from "../support/routes";

test("@critical 标签页可进入具体标签列表", async ({ page }) => {
  const tagsResponse = await page.goto(ROUTES.tags);
  expect(tagsResponse?.ok()).toBeTruthy();

  const firstTagLink = page.locator(".tag-list__item a").first();
  await expect(firstTagLink).toBeVisible();
  await firstTagLink.click();

  await expect(page).toHaveURL(/\/tags\/[^/]+\/$/);
  await expect(page.locator(".post-list__item").first()).toBeVisible();
});

test("@critical 分类页可进入具体分类列表", async ({ page }) => {
  const categoriesResponse = await page.goto(ROUTES.categories);
  expect(categoriesResponse?.ok()).toBeTruthy();

  const firstCategoryLink = page.locator(".cat-card__link").first();
  await expect(firstCategoryLink).toBeVisible();
  await firstCategoryLink.click();

  await expect(page).toHaveURL(/\/categories\/[^/]+\/$/);
  await expect(page.locator(".post-list__item").first()).toBeVisible();
});

test("@critical 分类列表中的文章链接可打开", async ({ page }) => {
  await page.goto(ROUTES.categories);
  await page.locator(".cat-card__link").first().click();

  const postLink = page.locator(".post-list__item a").first();
  await expect(postLink).toBeVisible();

  const href = await postLink.getAttribute("href");
  expect(href).toBeTruthy();

  if (!href) {
    return;
  }

  const response = await page.goto(href);
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator("article.post h1").first()).toBeVisible();
});

test("@critical 文章上下篇导航链接可用", async ({ page }) => {
  const postResponse = await page.goto(POSTS.heart);
  expect(postResponse?.ok()).toBeTruthy();

  const nav = page.locator(".post-nav");
  await expect(nav).toBeVisible();

  const prevLink = page.locator('.post-nav a[rel="prev"]');
  const nextLink = page.locator('.post-nav a[rel="next"]');

  const prevCount = await prevLink.count();
  const nextCount = await nextLink.count();
  expect(prevCount + nextCount).toBeGreaterThan(0);

  const targetLink = prevCount > 0 ? prevLink.first() : nextLink.first();
  const targetHref = await targetLink.getAttribute("href");
  expect(targetHref).toBeTruthy();

  if (!targetHref) {
    return;
  }

  const targetResponse = await page.goto(targetHref);
  expect(targetResponse?.ok()).toBeTruthy();
});
