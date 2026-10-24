import { expect, test } from "@playwright/test";
import { POSTS, ROUTES } from "../support/routes";
import { openSearchDialog } from "../support/search";
import { readTheme, toggleTheme } from "../support/theme";

test("@smoke 首页、分页与文章页面可访问", async ({ page }) => {
  const homeResponse = await page.goto(ROUTES.home);
  expect(homeResponse?.ok()).toBeTruthy();
  await expect(page.getByRole("navigation", { name: "主导航" })).toBeVisible();

  const page2Response = await page.goto(ROUTES.page2);
  expect(page2Response?.ok()).toBeTruthy();
  await expect(page).toHaveURL(ROUTES.page2);

  const postResponse = await page.goto(POSTS.helloWorld);
  expect(postResponse?.ok()).toBeTruthy();
  await expect(page.locator("article.post .post-head__title")).toHaveText("Hello World！");
});

test("@smoke 搜索面板可打开并通过 Escape 关闭", async ({ page }) => {
  await page.goto(ROUTES.home);

  const searchDialog = await openSearchDialog(page);
  await expect(searchDialog).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(searchDialog).not.toBeVisible();
});

test("@smoke 主题切换与 moments 页面可达", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(ROUTES.home);

  const initialTheme = await readTheme(page);
  const toggledTheme = await toggleTheme(page);
  expect(toggledTheme).not.toBe(initialTheme);

  await page.goto(ROUTES.moments);
  await expect(page).toHaveURL(ROUTES.moments);
  await expect(page.locator(".moment").first()).toBeVisible();
});
