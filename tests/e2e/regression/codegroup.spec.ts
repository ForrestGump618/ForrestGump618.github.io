import { expect, test } from "@playwright/test";
import { POSTS } from "../support/routes";

test("@regression Code Group 渲染多 tab 并可切换", async ({ page }) => {
  const response = await page.goto(POSTS.noteMdxDemo);
  expect(response?.ok()).toBeTruthy();

  // 定位 code-group（区别于普通 MDX Tabs）
  const codeGroup = page.locator(".md .tabs.code-group").first();
  await expect(codeGroup).toBeVisible();
  await expect(codeGroup).toHaveAttribute("data-tab-count", "2");

  // 两个 tab 按钮均带语言徽标
  const tabs = codeGroup.getByRole("tab");
  await expect(tabs).toHaveCount(2);

  // 首个 tab 默认激活
  const firstTab = tabs.first();
  await expect(firstTab).toHaveAttribute("aria-selected", "true");
  await expect(firstTab.locator(".lang-badge")).toBeVisible();

  // 切换到第二个 tab
  const secondTab = tabs.nth(1);
  await secondTab.click();
  await expect(secondTab).toHaveAttribute("aria-selected", "true");
  await expect(firstTab).toHaveAttribute("aria-selected", "false");

  // 激活 tab 的 li 持有 active 类（驱动顶部指示条）
  await expect(secondTab.locator("xpath=ancestor::li[1]")).toHaveClass(/active/);
});

test("@regression Code Group 语言徽标按语言着色", async ({ page }) => {
  await page.goto(POSTS.noteMdxDemo);

  const codeGroup = page.locator(".md .tabs.code-group").first();
  const badges = codeGroup.locator(".nav .lang-badge");
  await expect(badges).toHaveCount(2);

  // 每个徽标都应设置 --lang-color 为 var(--lang-ring-N)
  const firstColor = await badges.first().evaluate((el) => {
    return el.style.getPropertyValue("--lang-color");
  });
  expect(firstColor).toMatch(/var\(--lang-ring-\d+\)/);

  const secondColor = await badges.nth(1).evaluate((el) => {
    return el.style.getPropertyValue("--lang-color");
  });
  expect(secondColor).toMatch(/var\(--lang-ring-\d+\)/);
});

test("@regression Code Group 内 code-block 融入卡片", async ({ page }) => {
  await page.goto(POSTS.noteMdxDemo);

  const codeGroup = page.locator(".md .tabs.code-group").first();

  // 多 tab 时 code-block 应带 in-group 与 in-multi-tab 类
  const codeBlock = codeGroup.locator("code-block").first();
  await expect(codeBlock).toBeAttached();

  // 等待自定义元素水合（client:idle），shadow DOM 内出现 .codeblock
  const classList = await codeBlock.evaluate((el) => {
    return new Promise<string>((resolve) => {
      const read = () => {
        const root = el.shadowRoot?.querySelector(".codeblock");
        if (root) return resolve(root.className);
        requestAnimationFrame(read);
      };
      read();
    });
  });
  expect(classList).toContain("in-group");
  expect(classList).toContain("in-multi-tab");
});
