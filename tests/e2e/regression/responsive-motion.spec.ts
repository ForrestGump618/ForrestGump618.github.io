import { expect, test, type Page } from "@playwright/test";
import { POSTS, ROUTES } from "../support/routes";

async function checkHomeLayout(page: Page) {
  const layout = await page.evaluate(async () => {
    const profile = document.querySelector(".profile")!;
    const image = profile.querySelector("img")!;
    const before = profile.getBoundingClientRect();
    await image.decode();
    const after = profile.getBoundingClientRect();
    const article = document.querySelector(".home-list")!.getBoundingClientRect();
    return {
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
      localOverflow: profile.scrollWidth - profile.clientWidth,
      avatar: image.getBoundingClientRect().width - image.getBoundingClientRect().height,
      imageShift: Math.abs(before.height - after.height),
      sideBySide: before.right <= article.left,
      topDifference: Math.abs(before.top - article.top),
      stackGap: article.top - before.bottom,
    };
  });

  expect(layout.content).toBe(layout.viewport);
  expect(layout.localOverflow).toBeLessThanOrEqual(1);
  expect(Math.abs(layout.avatar)).toBeLessThanOrEqual(1);
  expect(layout.imageShift).toBeLessThanOrEqual(1);
  if (layout.sideBySide) expect(layout.topDifference).toBeLessThanOrEqual(1);
  else expect(layout.stackGap).toBeGreaterThan(0);
}

test("@regression @responsive 首页头像尺寸稳定，发布列表按时间倒序", async ({ page }, info) => {
  const widths = info.project.use.isMobile
    ? [info.project.use.viewport!.width]
    : [375, 768, 900, 1024, 1440];
  /* eslint-disable no-await-in-loop -- 同一页面逐个验证视口。 */
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(ROUTES.home);
    await expect(page.locator(".profile h1")).toHaveText("Forrest Gump");
    await checkHomeLayout(page);
  }

  /* eslint-enable no-await-in-loop */

  const dates = await page
    .locator(".post-list time")
    .evaluateAll((elements) => elements.map((element) => element.getAttribute("datetime") ?? ""));
  expect(dates.length).toBeGreaterThan(1);
  expect(dates).toEqual([...dates].toSorted().toReversed());
});

test("@regression @responsive 冷启动搜索按一次即打开，关闭后恢复焦点并可马上重开", async ({
  page,
}, info) => {
  const heavyLoads: string[] = [];
  page.on("request", (request) => {
    if (/component-ui\.|\/pagefind\//.test(request.url())) heavyLoads.push(request.url());
  });
  const hydration = Promise.withResolvers<void>();
  await page.route(/\/_astro\/NavBar\.[^/]+\.js$/, async (route) => {
    await hydration.promise;
    await route.continue();
  });
  const trigger = page.locator("#search");
  const dialog = page.locator("dialog#site-search");
  try {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await expect(trigger).toBeDisabled();
    await expect(page.locator("#mobile-drawer")).toBeHidden();
    expect(
      await page
        .locator(".site-nav__dropdown")
        .evaluateAll((elements) =>
          elements.every((element) => getComputedStyle(element).visibility === "hidden"),
        ),
    ).toBe(true);
    const header = await page.locator(".site-header").boundingBox();
    expect(header?.height).toBeLessThan(80);
  } finally {
    hydration.resolve();
  }
  await expect(trigger).toBeEnabled();
  expect(heavyLoads).toEqual([]);
  if (info.project.use.hasTouch) await trigger.tap();
  else await trigger.click();
  await expect(dialog).toHaveAttribute("open", "");
  const input = dialog.locator("pagefind-input input");
  await expect(input).toBeFocused();
  await input.fill("Eve");
  await expect(dialog.locator("pagefind-results a").first()).toBeVisible();
  expect(heavyLoads.length).toBeGreaterThan(0);

  await dialog.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const pointer = { bubbles: true, clientX: bounds.left + 1, clientY: bounds.top + 1 };
    element.dispatchEvent(new PointerEvent("pointerdown", pointer));
    element.dispatchEvent(new PointerEvent("pointerup", pointer));
  });
  await expect(dialog).toHaveAttribute("open", "");

  await page.mouse.click(5, 5);
  await expect(dialog).not.toHaveAttribute("open");
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Control+k");
  await expect(dialog).toHaveAttribute("open", "");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toHaveAttribute("open");
});

test("@regression 桌面下拉跨区悬停、键盘聚焦和 Escape 可连续操作", async ({ page }) => {
  await page.goto(ROUTES.home);
  const nav = page.getByRole("navigation", { name: "主导航" });
  const trigger = nav.getByRole("button", { name: "文章子菜单" });
  const category = nav.getByRole("link", { name: "分类", exact: true });

  await expect(trigger).toBeEnabled();
  await trigger.hover();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const from = (await trigger.boundingBox())!;
  const to = (await category.boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height + 2, { steps: 5 });
  await expect(category).toBeVisible();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 5 });
  await expect(category).toBeVisible();
  await page.mouse.move(4, 4);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");

  await trigger.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(category).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.press("Space");
  await category.click();
  await expect(page).toHaveURL("/categories/");
});

test("@regression @responsive 移动菜单可中途反向，开启和关闭时正文及滚动位置稳定", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 375, height: 470 });
  await page.goto(ROUTES.home);
  const trigger = page.locator(".tool-btn--menu");
  const drawer = page.locator("#mobile-drawer");
  await expect(trigger).toBeEnabled();

  const position = () =>
    page.evaluate(() => ({
      main: document.querySelector("main")!.getBoundingClientRect().top,
      scroll: window.scrollY,
    }));
  const activate = async () => {
    const box = (await trigger.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    if (info.project.use.hasTouch) await page.touchscreen.tap(x, y);
    else await page.mouse.click(x, y);
  };
  await page.evaluate(() => window.scrollTo({ top: 450, behavior: "instant" }));
  const before = await position();

  await activate();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(await position()).toEqual(before);
  expect((await drawer.boundingBox())!.height).toBeLessThan(470);
  await trigger.evaluate((button) => {
    if (!(button instanceof HTMLButtonElement)) throw new Error("菜单入口应为按钮");
    button.click();
    button.click();
  });
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();

  await activate();
  if (info.project.use.hasTouch) await page.touchscreen.tap(5, 260);
  else await page.mouse.click(5, 260);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(await position()).toEqual(before);

  await activate();
  await page
    .getByRole("navigation", { name: "移动端导航" })
    .getByRole("link", { name: "标签", exact: true })
    .click();
  await expect(page).toHaveURL("/tags/");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("@regression @responsive 系统减少动画偏好作用于菜单和搜索", async ({ page }, info) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(ROUTES.home);
  const reduced = info.project.use.contextOptions?.reducedMotion === "reduce";
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(
    reduced,
  );
  const hasDuration = async (selector: string) =>
    page.locator(selector).evaluate((element) =>
      getComputedStyle(element)
        .transitionDuration.split(",")
        .some((part) => parseFloat(part) > 0),
    );
  await expect.poll(() => hasDuration("#mobile-drawer")).toBe(!reduced);
  await expect.poll(() => hasDuration("#site-search")).toBe(!reduced);
});

test("@regression @responsive 文章图片可键盘预览，退出后可以立即再次打开", async ({ page }) => {
  await page.goto(POSTS.suwen);
  const image = page.locator(".post-content image-zoom img[tabindex='0']").first();
  await expect(image).toBeVisible();
  const preview = page.locator("image-zoom dialog[open]");

  await image.press("Enter");
  await expect(preview).toBeVisible();
  await expect(preview.locator(".image-zoom-content")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(preview).toHaveCount(0);
  await expect(image).toBeFocused();

  await image.press("Enter");
  await expect(preview).toBeVisible();
  await preview.locator(".image-zoom-close").click();
  await expect(preview).toHaveCount(0);
});

test("@regression @responsive 首页无精选卡片，最新列表首行直达文章", async ({ page }, info) => {
  await page.goto(ROUTES.home);
  const profile = page.locator(".profile");
  const about = profile.getByRole("link", { name: "关于我" });
  await expect(about).toHaveCSS("text-decoration-line", "none");
  await expect(profile.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", /github.com/);
  await expect(profile.getByRole("link", { name: "邮箱" })).toHaveAttribute("href", /^mailto:/);
  if (info.project.use.hasTouch) await about.tap();
  else await about.press("Enter");
  await expect(page).toHaveURL(ROUTES.about);

  await page.goto(ROUTES.home);
  await expect(page.locator(".home-featured")).toHaveCount(0);
  const firstRow = page.locator(".post-row__link").first();
  await expect(firstRow).toHaveAttribute("href", POSTS.suwen);
  if (info.project.use.hasTouch) await firstRow.tap();
  else await firstRow.click();
  await expect(page).toHaveURL(POSTS.suwen);
});
