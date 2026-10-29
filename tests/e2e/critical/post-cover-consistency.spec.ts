import { expect, test } from "@playwright/test";
import { POSTS } from "../support/routes";

test("@critical 文章页封面应展示文章真实配图与来源", async ({ page }) => {
  const response = await page.goto(POSTS.suwen);
  expect(response?.ok()).toBeTruthy();

  const cover = page.locator("figure.post-cover img").first();
  await expect(cover).toBeVisible();

  const naturalWidth = await cover.evaluate((element) => {
    return element instanceof HTMLImageElement ? element.naturalWidth : 0;
  });
  expect(naturalWidth).toBeGreaterThan(0);

  const alt = await cover.getAttribute("alt");
  expect(alt).toContain("Eve");

  // 正文图的图注需要标明来源，避免把学术图当装饰图使用
  await expect(page.locator(".article-body figcaption").first()).toContainText("来源");
});

test("@critical 科研图表封面应完整展示而非裁切", async ({ page }) => {
  const response = await page.goto(POSTS.heart);
  expect(response?.ok()).toBeTruthy();

  const fitCover = page.locator(".cover-media--fit").first();
  await expect(fitCover).toBeVisible();

  const fitImage = fitCover.locator("img").first();
  await expect(fitImage).toBeVisible();

  const naturalWidth = await fitImage.evaluate((element) => {
    return element instanceof HTMLImageElement ? element.naturalWidth : 0;
  });
  expect(naturalWidth).toBeGreaterThan(0);
});

test("@critical 文章上下篇导航可跳转", async ({ page }) => {
  await page.goto(POSTS.suwen);

  const nav = page.locator(".post-nav");
  await expect(nav).toBeVisible();

  const links = nav.locator("a");
  expect(await links.count()).toBeGreaterThan(0);

  const href = await links.first().getAttribute("href");
  expect(href).toBeTruthy();

  if (!href) {
    return;
  }

  const response = await page.goto(href);
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator("h1").first()).toBeVisible();
});
