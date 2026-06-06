import { expect, test } from "@playwright/test";
import { ROUTES } from "../support/routes";

async function openSearchDialog(page: import("@playwright/test").Page) {
  const openSearchButton = page.locator("#search");
  const searchDialog = page.getByRole("dialog", { name: "Search" });

  await expect(openSearchButton).toBeVisible();

  if (await searchDialog.isVisible()) {
    return searchDialog;
  }

  /* eslint-disable no-await-in-loop */
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await openSearchButton.dispatchEvent("click");

    if (await searchDialog.isVisible()) {
      return searchDialog;
    }

    await page.waitForTimeout(150);
  }
  /* eslint-enable no-await-in-loop */

  await expect(searchDialog).toBeVisible();
  return searchDialog;
}

test("@regression 主题切换后刷新仍保持", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
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

  const toggledTheme = await page.evaluate(() => {
    return document.documentElement.dataset.theme;
  });

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return window.localStorage.getItem("shokax-color-scheme");
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

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return window.localStorage.getItem("shokax-color-scheme");
      });
    })
    .toBe(toggledTheme);
});

test("@regression Ctrl/Cmd+K 可唤起搜索面板", async ({ page }) => {
  await page.goto(ROUTES.home);

  const searchDialog = await openSearchDialog(page);

  await page.keyboard.press("Escape");
  await expect(searchDialog).not.toBeVisible();

  await page.evaluate(() => {
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
  });

  const shortcut = process.platform === "darwin" ? "Meta+K" : "Control+K";
  await page.keyboard.press(shortcut);
  await expect(searchDialog).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(searchDialog).not.toBeVisible();
});
