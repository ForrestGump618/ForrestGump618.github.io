import { expect, test, type TestInfo } from "@playwright/test";
import { settleArticleEntrance, settleEntrance } from "../support/entrance";
import { POSTS, ROUTES } from "../support/routes";

const isReducedProject = (info: TestInfo) =>
  info.project.use.contextOptions?.reducedMotion === "reduce";

test("@regression @responsive 点击文章链接先播放退场动效再导航", async ({ page }, info) => {
  test.setTimeout(60_000);
  const reduced = isReducedProject(info);
  await page.goto(ROUTES.home);

  const firstRow = page.locator(".post-row__link").first();
  await expect(firstRow).toBeVisible();
  await settleEntrance(firstRow);

  // 用 MutationObserver + sessionStorage 记录退场类名与动画名：
  // 导航会销毁当前文档，直接断言类名存在竞态，sessionStorage 可跨导航读取
  await page.evaluate(() => {
    sessionStorage.removeItem("exit-observed");
    sessionStorage.removeItem("exit-animation");
    const observer = new MutationObserver(() => {
      if (!document.documentElement.classList.contains("is-page-exiting")) return;
      sessionStorage.setItem("exit-observed", "true");
      const container = document.getElementById("container");
      sessionStorage.setItem(
        "exit-animation",
        container ? getComputedStyle(container).animationName : "",
      );
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
  });

  await expect(async () => {
    if (new URL(page.url()).pathname !== POSTS.suwen) {
      if (info.project.use.hasTouch) await firstRow.tap();
      else await firstRow.click();
    }
    await expect(page).toHaveURL(POSTS.suwen, { timeout: 5_000 });
  }).toPass({ timeout: 20_000 });

  const observed = await page.evaluate(() => sessionStorage.getItem("exit-observed"));
  const animation = await page.evaluate(() => sessionStorage.getItem("exit-animation"));
  if (reduced) {
    expect(observed).toBeNull();
  } else {
    expect(observed).toBe("true");
    expect(animation).toBe("page-exit");
  }
});

test("@regression 文章页入场动画按区块错峰挂载", async ({ page }, info) => {
  const reduced = isReducedProject(info);
  await page.goto(POSTS.suwen);
  await expect(page.locator(".post-head__title")).toBeVisible();

  const animationName = (selector: string) =>
    page
      .locator(selector)
      .first()
      .evaluate((element) => getComputedStyle(element).animationName);

  if (reduced) {
    expect(await animationName(".post-head__title")).toBe("none");
    expect(await animationName(".body.md")).toBe("none");
  } else {
    expect(await animationName(".post-head__eyebrow")).toBe("post-enter-rise");
    expect(await animationName(".post-head__title")).toBe("post-enter-rise");
    expect(await animationName(".post-head__meta")).toBe("post-enter-rise");
    expect(await animationName(".body.md")).toBe("post-enter-rise");
    expect(await animationName(".toc--desktop")).toBe("post-enter-side");
  }

  // 入场结束后内容必须完全不透明、无位移残留
  await settleArticleEntrance(page);
  const opacity = await page
    .locator(".post-head__title")
    .evaluate((element) => getComputedStyle(element).opacity);
  expect(opacity).toBe("1");
});

test("@regression Ctrl+点击在新标签页打开且不播放退场", async ({ page }, info) => {
  test.skip(info.project.use.hasTouch === true, "触屏项目无 Ctrl+点击语义");
  await page.goto(ROUTES.home);

  const firstRow = page.locator(".post-row__link").first();
  await expect(firstRow).toBeVisible();
  await settleEntrance(firstRow);

  // Ctrl+点击在 headless Chromium 中按“新标签页”而非 window.open 弹窗打开，
  // 用 context 的 page 事件捕获（page 的 popup 事件不会触发）
  const popupPromise = page.context().waitForEvent("page");
  await firstRow.click({ modifiers: ["Control"] });
  const popup = await popupPromise;
  await popup.waitForURL(POSTS.suwen);

  await expect(page).toHaveURL(ROUTES.home);
  await expect(page.locator("html")).not.toHaveClass(/is-page-exiting/);
  await popup.close();
});

test("@regression 文章目录锚点不触发退场动效", async ({ page }) => {
  await page.goto(POSTS.suwen);
  await settleArticleEntrance(page);

  const tocLink = page.locator(".toc--desktop .toc__list a").first();
  await expect(tocLink).toBeVisible();
  const href = await tocLink.getAttribute("href");
  expect(href?.startsWith("#")).toBe(true);

  await tocLink.click();
  await expect(page).toHaveURL(new RegExp(`${POSTS.suwen}#`));
  await expect(page.locator("html")).not.toHaveClass(/is-page-exiting/);
});

test("@regression @responsive 进入文章后回退，内容恢复不透明", async ({ page }, info) => {
  test.setTimeout(60_000);
  await page.goto(ROUTES.home);

  const firstRow = page.locator(".post-row__link").first();
  await expect(firstRow).toBeVisible();
  await settleEntrance(firstRow);

  await expect(async () => {
    if (new URL(page.url()).pathname !== POSTS.suwen) {
      if (info.project.use.hasTouch) await firstRow.tap();
      else await firstRow.click();
    }
    await expect(page).toHaveURL(POSTS.suwen, { timeout: 5_000 });
  }).toPass({ timeout: 20_000 });

  await page.goBack();
  await expect(page).toHaveURL(ROUTES.home);
  await expect(page.locator("html")).not.toHaveClass(/is-page-exiting/);
  await expect(firstRow).toBeVisible();
  const opacity = await page
    .locator("#container")
    .evaluate((element) => getComputedStyle(element).opacity);
  expect(opacity).toBe("1");
});
