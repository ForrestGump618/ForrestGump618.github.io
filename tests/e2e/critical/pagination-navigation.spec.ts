import { expect, test } from "@playwright/test";
import { LEGACY_POSTS, POSTS, ROUTES } from "../support/routes";

test("@critical 首页不再分页：最新笔记限 6 条并提供归档入口", async ({ page }) => {
  const response = await page.goto(ROUTES.home);
  expect(response?.ok()).toBeTruthy();

  await expect(page.locator("nav.pagination")).toHaveCount(0);
  const rows = page.locator(".post-row");
  await expect(rows).toHaveCount(6);
  await expect(page.getByRole("link", { name: "全部笔记" })).toHaveAttribute(
    "href",
    ROUTES.archives,
  );
});

test("@critical 旧分页 /page/N/ 重定向到归档页", async ({ page }) => {
  await page.goto(ROUTES.page2);
  await expect(page).toHaveURL(ROUTES.archives);

  await page.goto(ROUTES.page3);
  await expect(page).toHaveURL(ROUTES.archives);
});

test("@critical 旧双层文章 URL 重定向到单层地址", async ({ page }) => {
  await page.goto(LEGACY_POSTS.heart);
  await expect(page).toHaveURL(POSTS.heart);
  await expect(page.locator(".post-head__title")).toHaveText("心脏听诊总结");

  await page.goto(LEGACY_POSTS.linger);
  await expect(page).toHaveURL(POSTS.linger);
});

test("@critical 归档页按年份组织全部文章", async ({ page }) => {
  const response = await page.goto(ROUTES.archives);
  expect(response?.ok()).toBeTruthy();
  const archiveLinks = page.locator("main a[href^='/posts/']");
  expect(await archiveLinks.count()).toBeGreaterThan(6);
});
