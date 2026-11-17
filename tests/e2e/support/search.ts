import { expect, type Page } from "@playwright/test";

export async function openSearchDialog(page: Page) {
  const trigger = page.locator("#search");
  const dialog = page.getByRole("dialog", { name: "Search" });
  await expect(trigger).toBeEnabled();
  await trigger.click();
  await expect(dialog).toBeVisible();
  return dialog;
}

export async function openMobileMenu(page: Page) {
  const trigger = page.getByRole("button", { name: "打开菜单" });
  const navigation = page.getByRole("navigation", { name: "移动端导航" });
  await expect(trigger).toBeEnabled();
  await trigger.click();
  await expect(navigation).toBeVisible();
  return navigation;
}
