import type { Locator, Page } from "@playwright/test";

/** Page 与 Locator 的 evaluate 重载签名不同，联合类型不可直接调用；用结构化最小接口收敛。 */
interface EvaluateHost {
  evaluate(fn: () => Promise<void>): Promise<void>;
}

/**
 * 入场动效现在等 html.fonts-ready 才挂载：先等该标记（兜底 2s），
 * 再等两帧让动画/过渡创建，最后等全部结束。
 * 入场位移期间派发指针事件，WebKit 会把 click 合成到移动后的其他元素上，导致导航丢失。
 */
async function waitFontsReady(page: EvaluateHost): Promise<void> {
  await page.evaluate(async () => {
    const html = document.documentElement;
    if (!html.classList.contains("fonts-ready")) {
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, 2000);
        const observer = new MutationObserver(() => {
          if (html.classList.contains("fonts-ready")) {
            clearTimeout(timer);
            observer.disconnect();
            resolve();
          }
        });
        observer.observe(html, { attributes: true, attributeFilter: ["class"] });
      });
    }
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
}

/** 等待目标所在的首屏入场动画结束再点击/轻触。 */
export async function settleEntrance(locator: Locator): Promise<void> {
  await waitFontsReady(locator);
  await locator.evaluate((element) => {
    const host = element.closest(".reveal") ?? element;
    return Promise.all(host.getAnimations().map((animation) => animation.finished));
  });
}

/** 等待文章页错峰入场动画（post-enter-*）全部结束，避免位移期间点击丢失 */
export async function settleArticleEntrance(page: Page): Promise<void> {
  await waitFontsReady(page);
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
