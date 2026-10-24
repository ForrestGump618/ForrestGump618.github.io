import { expect, test } from "@playwright/test";
import { POSTS } from "../support/routes";

test("@regression CodeBlock 支持复制与全屏", async ({ page }) => {
  const response = await page.goto(POSTS.suwen);
  expect(response?.ok()).toBeTruthy();

  const codeBlock = page.locator("code-block").first();
  await codeBlock.scrollIntoViewIfNeeded();
  await expect(codeBlock).toBeVisible();

  await codeBlock.getByRole("button", { name: "Copy code" }).click();

  await codeBlock.getByRole("button", { name: "Enter fullscreen" }).click();
  await expect(codeBlock.getByRole("button", { name: "Exit fullscreen" })).toBeVisible();
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return document.body.style.overflow;
      });
    })
    .toBe("hidden");

  await page.keyboard.press("Escape");
  await expect(codeBlock.getByRole("button", { name: "Enter fullscreen" })).toBeVisible();
});
