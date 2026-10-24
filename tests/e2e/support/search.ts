import { expect, type Page } from "@playwright/test";

/**
 * 打开搜索面板，兼容 client:idle 水合延迟。
 *
 * SearchPage 使用 client:idle 指令，点击监听器在 Svelte 水合后才挂载到 #search 按钮。
 * 若在水合完成前点击，对话框不会打开，因此需要重试直到对话框出现在 DOM 中。
 * 注意：一旦对话框已挂载就不再点击，避免二次点击把面板关掉。
 */
export async function openSearchDialog(page: Page) {
  const openSearchButton = page.locator("#search");
  const searchDialog = page.getByRole("dialog", { name: "Search" });

  await expect(openSearchButton).toBeVisible();

  /* eslint-disable no-await-in-loop */
  for (let attempt = 0; attempt < 15; attempt += 1) {
    if ((await searchDialog.count()) > 0) {
      break;
    }

    await openSearchButton.click({ force: true });
    await page.waitForTimeout(200);
  }
  /* eslint-enable no-await-in-loop */

  await expect(searchDialog).toBeVisible();
  return searchDialog;
}

/**
 * 打开移动端抽屉菜单，同样需要兼容 NavBar client:load 的水合延迟。
 */
export async function openMobileMenu(page: Page) {
  const openMenuButton = page.getByRole("button", { name: "打开菜单" });
  const mobileNav = page.getByRole("navigation", { name: "移动端导航" });

  await expect(openMenuButton).toBeVisible();

  /* eslint-disable no-await-in-loop */
  for (let attempt = 0; attempt < 15; attempt += 1) {
    if ((await mobileNav.count()) > 0 && (await mobileNav.isVisible())) {
      break;
    }

    await openMenuButton.click({ force: true });
    await page.waitForTimeout(200);
  }
  /* eslint-enable no-await-in-loop */

  await expect(mobileNav).toBeVisible();
  return mobileNav;
}
