import { expect, test } from "@playwright/test";
import { ROUTES } from "../support/routes";

async function measureMainOffset(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const target = document.querySelector("main article, main");
    return target?.getBoundingClientRect().left ?? 0;
  });
}

async function openSearchDialog(page: import("@playwright/test").Page) {
  const openSearchButton = page.locator("#search");
  const searchDialog = page.getByRole("dialog", { name: "Search" });

  if (await searchDialog.isVisible()) {
    return searchDialog;
  }

  /* eslint-disable no-await-in-loop */
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await openSearchButton.click({ force: true });

    if (await searchDialog.isVisible()) {
      return searchDialog;
    }

    await page.waitForTimeout(150);
  }
  /* eslint-enable no-await-in-loop */

  await expect(searchDialog).toBeVisible();
  return searchDialog;
}

test("@regression 搜索面板支持按钮关闭并恢复页面滚动", async ({ page }) => {
  await page.goto(ROUTES.home);

  const initialOverflow = await page.evaluate(() => {
    return document.body.style.overflow;
  });

  const searchDialog = await openSearchDialog(page);

  const searchInput = page.locator("pagefind-input input");
  await expect(searchInput).toBeVisible();
  await expect(searchInput).toBeFocused();

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return document.body.style.overflow;
      });
    })
    .toBe("hidden");

  await page.getByRole("button", { name: "Close search", exact: true }).click();
  await expect(searchDialog).not.toBeVisible();

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return document.body.style.overflow;
      });
    })
    .toBe(initialOverflow);
});

test("@regression 输入框聚焦时 Ctrl/Cmd+K 不应触发搜索面板", async ({ page }) => {
  await page.goto(ROUTES.home);

  const searchDialog = page.getByRole("dialog", { name: "Search" });
  const closeSearchButton = page.getByRole("button", {
    name: "Close search",
    exact: true,
  });
  const shortcut = process.platform === "darwin" ? "Meta+K" : "Control+K";

  await openSearchDialog(page);
  await closeSearchButton.click();
  await expect(searchDialog).not.toBeVisible();

  await page.keyboard.press(shortcut);
  await expect(searchDialog).toBeVisible();
  await closeSearchButton.click();
  await expect(searchDialog).not.toBeVisible();

  const editableInput = page.getByLabel("E2E editable input");

  await page.evaluate(() => {
    const existing = document.querySelector("#e2e-editable-input");
    if (existing instanceof HTMLInputElement) {
      existing.focus();
      return;
    }

    const input = document.createElement("input");
    input.id = "e2e-editable-input";
    input.setAttribute("aria-label", "E2E editable input");
    document.body.append(input);
    input.focus();
  });

  await expect(editableInput).toBeFocused();

  await page.keyboard.press(shortcut);
  await expect(searchDialog).not.toBeVisible();
});

test("@regression 打开搜索面板时页面主体不应因滚动条消失而横向偏移", async ({ page }) => {
  await page.goto(ROUTES.home);

  const beforeOpen = await measureMainOffset(page);
  await openSearchDialog(page);

  await expect
    .poll(async () => {
      return measureMainOffset(page);
    })
    .toBe(beforeOpen);
});
