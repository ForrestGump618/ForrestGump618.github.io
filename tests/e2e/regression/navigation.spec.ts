import { expect, test } from "@playwright/test";
import { POSTS, ROUTES } from "../support/routes";
import { openMobileMenu } from "../support/search";

test("@regression 桌面导航可进入关于与友链页面", async ({ page }) => {
  await page.goto(ROUTES.home);

  const nav = page.getByRole("navigation", { name: "主导航" });
  await expect(nav).toBeVisible();

  await nav.getByRole("link", { name: "关于", exact: true }).click();
  await expect(page).toHaveURL(/\/about\/$/);

  await page.goto(ROUTES.home);
  await nav.getByRole("link", { name: "友链" }).click();
  await expect(page).toHaveURL(/\/friends\/$/);
});

test("@regression 移动端抽屉菜单可打开、导航并关闭", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(ROUTES.home);

  const mobileNav = await openMobileMenu(page);
  await expect(mobileNav).toBeVisible();

  await mobileNav.getByRole("link", { name: "动态" }).click();
  await expect(page).toHaveURL(/\/moments\/$/);
  await expect(page.getByRole("button", { name: "打开菜单" })).toBeVisible();
});

test("@regression 移动端文章目录可展开", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(POSTS.suwen);

  const tocSummary = page.locator(".toc--mobile .toc__summary");
  await expect(tocSummary).toBeVisible();
  await tocSummary.click();

  const mobileTocLinks = page.locator(".toc--mobile .toc__item a");
  await expect(mobileTocLinks.first()).toBeVisible();
  expect(await mobileTocLinks.count()).toBeGreaterThan(0);
});

test("@regression 文章页返回顶部按钮在长文中可用", async ({ page }) => {
  await page.goto(POSTS.suwen);

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, document.body.scrollHeight);
  });

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
});
