import { expect, test } from "@playwright/test";
import { POSTS } from "../support/routes";

test("@critical 文章目录可跳转并高亮当前章节", async ({ page }) => {
  await page.goto(POSTS.suwen);

  const tocLinks = page.locator(".toc--desktop .toc__item a");
  await expect(tocLinks.first()).toBeVisible();
  expect(await tocLinks.count()).toBeGreaterThan(2);

  const href = await tocLinks.nth(1).getAttribute("href");
  expect(href).toBeTruthy();

  if (!href) {
    return;
  }

  await tocLinks.nth(1).click();
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return decodeURIComponent(window.location.hash);
      });
    })
    .toBe(decodeURIComponent(href));
});

test("@critical 阅读进度、返回顶部与代码块全屏可用", async ({ page }) => {
  await page.goto(POSTS.suwen);

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, document.body.scrollHeight * 0.4);
  });

  const progressScale = await page.evaluate(() => {
    const bar = document.querySelector("[data-reading-progress-bar]");
    if (!bar) {
      return 0;
    }

    const transform = window.getComputedStyle(bar).transform;
    const matrix = /matrix\(([^)]+)\)/.exec(transform);

    return matrix ? Number(matrix[1].split(",")[0]) : 0;
  });
  expect(progressScale).toBeGreaterThan(0);

  const backToTop = page.locator("button[data-back-to-top]");
  await expect(backToTop).toBeVisible();
  await backToTop.click();
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return window.scrollY;
      });
    })
    .toBeLessThan(80);

  const codeBlock = page.locator("code-block").first();
  await codeBlock.scrollIntoViewIfNeeded();
  await expect(codeBlock).toBeVisible();

  await codeBlock.getByRole("button", { name: "Enter fullscreen" }).click();
  await expect(codeBlock.getByRole("button", { name: "Exit fullscreen" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(codeBlock.getByRole("button", { name: "Enter fullscreen" })).toBeVisible();
});
