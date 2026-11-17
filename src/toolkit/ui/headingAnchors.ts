/**
 * 章节链接复制：为正文 h2/h3/h4 追加「复制链接」按钮，
 * 复制结果通过 Toast 给出可见反馈（成功/失败都有提示）。
 */
import { showToast } from "./toast";

/** 由当前页面地址与标题 id 组装绝对链接 */
export function buildHeadingUrl(origin: string, pathname: string, id: string): string {
  return new URL(`${pathname}#${encodeURIComponent(id)}`, origin).href;
}

const BOUND_KEY = "headingCopyBound";

export function bindHeadingCopyButtons(doc: Document, win: Window) {
  const headings = doc.querySelectorAll<HTMLElement>(".post-content :is(h2, h3, h4)[id]");

  for (const heading of headings) {
    if (heading.dataset[BOUND_KEY] === "true") {
      continue;
    }
    heading.dataset[BOUND_KEY] = "true";

    const button = doc.createElement("button");
    button.type = "button";
    button.className = "heading-copy";
    button.setAttribute("aria-label", `复制本节链接：${heading.textContent?.trim() ?? ""}`);
    button.title = "复制本节链接";

    const icon = doc.createElement("span");
    icon.className = "i-ri-link";
    icon.setAttribute("aria-hidden", "true");
    button.append(icon);

    button.addEventListener("click", async () => {
      const url = buildHeadingUrl(win.location.origin, win.location.pathname, heading.id);
      try {
        await win.navigator.clipboard.writeText(url);
        showToast("已复制本节链接", "success");
      } catch {
        showToast("复制失败，请手动复制地址栏链接", "error");
      }
    });

    heading.append(button);
  }
}
