import { expect, type Page } from "@playwright/test";

/** 读取当前主题（light / dark） */
export async function readTheme(page: Page) {
  return page.evaluate(() => {
    return document.documentElement.dataset.theme ?? "";
  });
}

/**
 * 切换主题：NavBar 使用 client:load 水合，点击可能发生在水合完成前，
 * 因此这里轮询「点击 → 读主题」，直到主题确实改变。
 */
export async function toggleTheme(page: Page) {
  const initialTheme = await readTheme(page);
  const button = page.getByRole("button", { name: /切换到(深色|浅色)模式/ }).first();

  await expect(button).toBeVisible();
  await expect
    .poll(
      async () => {
        if ((await readTheme(page)) === initialTheme) {
          await button.click({ force: true });
        }

        return readTheme(page);
      },
      { timeout: 15000 },
    )
    .not.toBe(initialTheme);

  return readTheme(page);
}
