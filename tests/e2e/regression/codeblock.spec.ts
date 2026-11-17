import { expect, test } from "@playwright/test";
import { POSTS } from "../support/routes";

test("@regression CodeBlock 复制有可见反馈，全屏可进出", async ({ page, context, browserName }) => {
  // WebKit 不支持 clipboard 权限授予，走「复制失败已选中」兜底分支
  if (browserName === "chromium") {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  }
  const response = await page.goto(POSTS.suwen);
  expect(response?.ok()).toBeTruthy();

  const codeBlock = page.locator(".post-content > code-block").first();
  await codeBlock.scrollIntoViewIfNeeded();
  await expect(codeBlock).toBeVisible();

  await codeBlock.getByRole("button", { name: "复制代码" }).click();
  await expect(codeBlock.locator(".copy-status")).toHaveText(
    browserName === "chromium" ? "已复制" : /已复制|复制失败，已选中代码/,
  );

  await codeBlock.getByRole("button", { name: "进入全屏" }).click();
  await expect(codeBlock.getByRole("button", { name: "退出全屏" })).toBeVisible();
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return document.body.style.overflow;
      });
    })
    .toBe("hidden");

  await page.keyboard.press("Escape");
  await expect(codeBlock.getByRole("button", { name: "进入全屏" })).toBeVisible();
});

test("@regression CodeBlock 操作按钮满足触屏尺寸", async ({ page }) => {
  await page.goto(POSTS.suwen);
  const codeBlock = page.locator(".post-content > code-block").first();
  await codeBlock.scrollIntoViewIfNeeded();

  const copyButton = codeBlock.getByRole("button", { name: "复制代码" });
  const box = (await copyButton.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(32);
  expect(box.height).toBeGreaterThanOrEqual(32);
});
