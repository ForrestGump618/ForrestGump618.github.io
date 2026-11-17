import type { Locator, Page } from "@playwright/test";

/**
 * 等待目标所在的首屏入场动画结束再点击/轻触。
 * 入场位移期间派发指针事件，WebKit 会把 click 合成到移动后的其他元素上，导致导航丢失。
 */
export async function settleEntrance(locator: Locator) {
  await locator.evaluate((element) => {
    const host = element.closest(".reveal") ?? element;
    return Promise.all(host.getAnimations().map((animation) => animation.finished));
  });
}

/** 等待文章页错峰入场动画（post-enter-*）全部结束，避免位移期间点击丢失 */
export async function settleArticleEntrance(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation instanceof CSSAnimation && animation.animationName.startsWith("post-enter-"),
        )
        .map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
}
