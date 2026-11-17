import { expect, test } from "@playwright/test";
import { POSTS, ROUTES } from "../support/routes";

test("@regression 漫览画廊可放大浏览并进入原文", async ({ page }) => {
  await page.goto(ROUTES.home);
  const gallery = page.locator(".gallery-grid");
  await expect(gallery).toBeVisible();
  const cards = gallery.locator(".gallery-card");
  expect(await cards.count()).toBeGreaterThan(0);

  // 等待 image-zoom 自定义元素完成升级（client:idle 水合）后再交互
  const firstImage = cards.first().locator("image-zoom img[tabindex='0']");
  await firstImage.scrollIntoViewIfNeeded();
  await expect(firstImage).toBeVisible();
  await firstImage.click();
  const preview = page.locator("image-zoom dialog[open]");
  await expect(preview).toBeVisible();
  await expect(preview.locator(".image-zoom-content")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(preview).toHaveCount(0);

  const enter = cards.first().locator(".gallery-card__enter");
  const href = await enter.getAttribute("href");
  expect(href).toMatch(/^\/posts\/.+/);
  await enter.click();
  await expect(page).toHaveURL(href!);
});

test("@regression 收藏页即时检索、计数与空态恢复", async ({ page }) => {
  await page.goto(ROUTES.stars);
  const toolbar = page.locator("[data-stars-toolbar]");
  await expect(toolbar).toBeVisible();

  const input = page.locator("[data-stars-input]");
  const count = page.locator("[data-stars-count]");
  const items = page.locator("[data-stars-item]");
  const total = await items.count();
  expect(total).toBeGreaterThan(0);
  await expect(count).toHaveText(`共 ${total} 个收藏`);

  await input.fill("z-lib");
  await expect(count).toContainText("匹配");
  const matched = await page.locator("[data-stars-item]:not([hidden])").count();
  expect(matched).toBeGreaterThan(0);
  expect(matched).toBeLessThan(total);

  await input.fill("不存在的收藏关键词");
  await expect(page.locator("[data-stars-empty]")).toBeVisible();
  await expect(page.locator("[data-stars-item]:not([hidden])")).toHaveCount(0);

  await page.locator("[data-stars-reset]").click();
  await expect(page.locator("[data-stars-empty]")).toBeHidden();
  await expect(count).toHaveText(`共 ${total} 个收藏`);
  await expect(input).toBeFocused();
});

test("@regression 章节链接复制有 toast 反馈", async ({ page, context, browserName }) => {
  if (browserName === "chromium") {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  }
  await page.goto(POSTS.suwen);
  const copyButton = page.locator(".post-content h2 .heading-copy").first();
  await copyButton.scrollIntoViewIfNeeded();
  await copyButton.click();
  await expect(page.locator(".toast-region .toast").first()).toContainText(
    /已复制本节链接|复制失败/,
  );
});

test("@regression 目录高亮随滚动前进与回退，指示条可见", async ({ page }) => {
  await page.goto(POSTS.suwen);
  const links = page.locator(".toc--desktop .toc__item a");
  expect(await links.count()).toBeGreaterThan(2);
  const indicator = page.locator(".toc--desktop .toc__indicator");

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, document.body.scrollHeight * 0.6);
  });
  await expect(page.locator(".toc--desktop .toc__item a.is-active")).toHaveCount(1);
  await expect(indicator).toHaveClass(/is-visible/);
  const midHref = await page.locator(".toc--desktop .toc__item a.is-active").getAttribute("href");

  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await expect
    .poll(async () => {
      return page.locator(".toc--desktop .toc__item a.is-active").getAttribute("href");
    })
    .toBe(await links.last().getAttribute("href"));

  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await expect
    .poll(async () => {
      return page.locator(".toc--desktop .toc__item a.is-active").getAttribute("href");
    })
    .toBe(await links.first().getAttribute("href"));
  expect(midHref).toBeTruthy();
});

test("@regression 探索分组键盘可展开、进入子项并退出", async ({ page }) => {
  await page.goto(ROUTES.home);
  const nav = page.getByRole("navigation", { name: "主导航" });
  const trigger = nav.getByRole("button", { name: "探索", exact: true });
  await expect(trigger).toBeEnabled();

  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  const firstSub = nav.getByRole("link", { name: "收藏", exact: true });
  await expect(firstSub).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});
