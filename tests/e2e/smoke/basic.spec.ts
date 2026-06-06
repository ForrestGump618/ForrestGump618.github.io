import { expect, test } from "@playwright/test";
import { POSTS, ROUTES } from "../support/routes";

test("@smoke 首页、分页与文章页面可访问", async ({ page }) => {
  const homeResponse = await page.goto(ROUTES.home);
  expect(homeResponse?.ok()).toBeTruthy();
  await expect(page.getByRole("navigation", { name: "主导航" })).toBeVisible();

  const page2Response = await page.goto(ROUTES.page2);
  expect(page2Response?.ok()).toBeTruthy();
  await expect(page).toHaveURL(ROUTES.page2);

  const postResponse = await page.goto(POSTS.helloWorld);
  expect(postResponse?.ok()).toBeTruthy();
  await expect(page.locator("article.post h1.title")).toHaveText("Hello World!");
});

test("@smoke 搜索面板可打开并通过 Escape 关闭", async ({ page }) => {
  await page.goto(ROUTES.home);

  await page.getByRole("button", { name: "Search" }).click();
  const searchDialog = page.getByRole("dialog", { name: "Search" });
  await expect(searchDialog).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(searchDialog).not.toBeVisible();
});

test("@smoke 主题切换与 moments 页面可达", async ({ page }) => {
  await page.goto(ROUTES.home);

  const initialTheme = await page.evaluate(() => {
    return document.documentElement.dataset.theme;
  });

  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return document.documentElement.dataset.theme;
      });
    })
    .not.toBe(initialTheme);

  await page.goto(ROUTES.moments);
  await expect(page).toHaveURL(ROUTES.moments);
  await expect(page.locator(".moment-card").first()).toBeVisible();
});
