import { expect, type Page } from "@playwright/test";

/**
 * 打开搜索面板，兼容 client:idle 水合延迟。
 *
 * SearchPage 使用 client:idle 指令，点击监听器在 Svelte 水合后才挂载到 #search 按钮。
 * 若在水合完成前点击，对话框不会打开，因此需要重试直到对话框可见。
 */
export async function openSearchDialog(page: Page) {
  const openSearchButton = page.locator("#search");
  const searchDialog = page.getByRole("dialog", { name: "Search" });

  await expect(openSearchButton).toBeVisible();

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
