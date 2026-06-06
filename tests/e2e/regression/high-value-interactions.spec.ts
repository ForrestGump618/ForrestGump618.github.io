import { expect, test } from "@playwright/test";
import { POSTS, ROUTES, SEARCH_TERMS } from "../support/routes";

function escapeRegExp(input: string) {
  return input.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function readTheme(page: import("@playwright/test").Page) {
  return expect
    .poll(async () => {
      return page.evaluate(() => {
        return document.documentElement.dataset.theme;
      });
    })
    .toBeTruthy();
}

async function waitForEnabled(locator: import("@playwright/test").Locator) {
  await expect
    .poll(async () => {
      return locator.isEnabled();
    })
    .toBe(true);
}

test("@regression 加密文章密码链路：错误提示、正确解密、刷新回到锁定态", async ({ page }) => {
  await page.goto(POSTS.encryptedTest);

  const passwordInput = page.getByPlaceholder("请输入密码");
  const submitButton = page.getByRole("button", { name: "解密" });

  await expect(passwordInput).toBeVisible();
  await expect(page.getByText("这篇文章需要密码才能查看")).toBeVisible();

  await passwordInput.fill("wrong-password");
  await waitForEnabled(submitButton);
  await submitButton.click();
  await expect(page.getByText("密码错误，请重试")).toBeVisible();

  await passwordInput.fill("test123");
  await waitForEnabled(submitButton);
  await submitButton.click();

  await expect(page.getByText("这是一篇加密文章的测试内容。", { exact: true })).toBeVisible();
  await expect(passwordInput).not.toBeVisible();

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return sessionStorage.getItem(`encrypted_${window.location.pathname}`);
      });
    })
    .toBe("test123");

  await page.reload();
  await expect(passwordInput).toBeVisible();
  await expect(page.getByText("这是一篇加密文章的测试内容。", { exact: true })).not.toBeVisible();
});

test("@critical 搜索命中后可点击结果跳转到对应文章", async ({ page }) => {
  await page.goto(ROUTES.home);
  await page.getByRole("button", { name: "Search" }).click();

  const searchDialog = page.getByRole("dialog", { name: "Search" });
  const searchInput = page.locator("pagefind-input input");
  await expect(searchDialog).toBeVisible();
  await expect(searchInput).toBeVisible();

  await searchInput.fill(SEARCH_TERMS.publicPostTitle);

  const firstResult = page
    .locator("pagefind-results a", {
      hasText: SEARCH_TERMS.publicPostTitle,
    })
    .first();

  await expect(firstResult).toBeVisible();

  const href = await firstResult.getAttribute("href");
  expect(href).toBeTruthy();

  if (!href) {
    return;
  }

  const expectedPath = new URL(href, "https://example.com").pathname;
  await firstResult.click();

  await expect(page).toHaveURL(new RegExp(escapeRegExp(expectedPath)));
  await expect(page.locator("article.post")).toBeVisible();
  await expect(page.locator("h1").first()).toContainText(SEARCH_TERMS.publicPostTitle);
});

test("@critical 分页与标签/分类列表进入文章后回退，URL与列表状态保持一致", async ({ page }) => {
  await page.goto(ROUTES.page2);
  await expect(page).toHaveURL(ROUTES.page2);
  await expect(page.locator("nav.pagination [aria-current='page']")).toHaveText("2");

  const pagePostLink = page.locator("main article a[href^='/posts/']").first();
  await expect(pagePostLink).toBeVisible();
  const pagePostHref = await pagePostLink.getAttribute("href");
  expect(pagePostHref).toBeTruthy();
  await pagePostLink.click();
  await expect(page).toHaveURL(/\/posts\/[^/]+\/$/);

  await page.goBack();
  await expect(page).toHaveURL(ROUTES.page2);
  await expect(page.locator("nav.pagination [aria-current='page']")).toHaveText("2");

  await page.goto(ROUTES.tags);
  const firstTag = page.locator(".tag-cloud .tag-cloud-item").first();
  await expect(firstTag).toBeVisible();
  await firstTag.click();
  await expect(page).toHaveURL(/\/tags\/[^/]+\/?$/);

  const tagListingUrl = page.url();
  const tagPostLink = page.locator(".timeline article.item.normal .title a").first();
  await expect(tagPostLink).toBeVisible();
  await tagPostLink.click();
  await expect(page).toHaveURL(/\/posts\/[^/]+\/$/);

  await page.goBack();
  await expect(page).toHaveURL(tagListingUrl);
  await expect(page.locator(".timeline article.item.normal").first()).toBeVisible();

  await page.goto(ROUTES.categories);
  const firstCategory = page.locator(".timeline h2.item.header a").first();
  await expect(firstCategory).toBeVisible();
  await firstCategory.click();
  await expect(page).toHaveURL(/\/categories\/[^/]+\/?$/);

  const categoryListingUrl = page.url();
  const categoryPostLink = page.locator(".timeline article.item.normal .title a").first();
  await expect(categoryPostLink).toBeVisible();
  await categoryPostLink.click();
  await expect(page).toHaveURL(/\/posts\/[^/]+\/$/);

  await page.goBack();
  await expect(page).toHaveURL(categoryListingUrl);
  await expect(page.locator(".timeline article.item.normal").first()).toBeVisible();
});

test("@regression 主题切换后跨页面导航与刷新仍保持", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(ROUTES.home);

  await readTheme(page);

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

  const toggledTheme = await page.evaluate(() => {
    return document.documentElement.dataset.theme;
  });
  expect(toggledTheme).toBeTruthy();
  expect(["light", "dark"]).toContain(toggledTheme);

  await page.goto(ROUTES.tags);
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return document.documentElement.dataset.theme;
      });
    })
    .toBe(toggledTheme ?? null);

  await page.goto(POSTS.helloWorld);
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return document.documentElement.dataset.theme;
      });
    })
    .toBe(toggledTheme ?? null);

  await page.reload();

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return document.documentElement.dataset.theme;
      });
    })
    .toBe(toggledTheme ?? null);

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return window.localStorage.getItem("shokax-color-scheme");
      });
    })
    .toBe(toggledTheme);
});
