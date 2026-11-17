/**
 * 滚动入场：为 [data-scroll-reveal] 元素挂载待入场状态，
 * 进入视口后淡入上浮；同组元素用 --reveal-i 做错峰延迟。
 * 减少动画偏好或缺少 IntersectionObserver 时保持内容直接可见（渐进增强）。
 */

interface ClassListLike {
  add(...names: string[]): void;
  remove(...names: string[]): void;
}

export interface ScrollRevealView<T extends { classList: ClassListLike }> {
  matchMedia(query: string): { matches: boolean };
  IntersectionObserver?: new (
    callback: (entries: { isIntersecting: boolean; target: T }[]) => void,
    options?: { threshold?: number; rootMargin?: string },
  ) => {
    observe(target: T): void;
    unobserve(target: T): void;
    disconnect(): void;
  };
}

export const initScrollReveal = <T extends { classList: ClassListLike }>(
  root: { querySelectorAll(selectors: string): ArrayLike<T> },
  view: ScrollRevealView<T>,
): (() => void) => {
  const targets = Array.from(root.querySelectorAll("[data-scroll-reveal]"));
  if (targets.length === 0) {
    return () => {};
  }

  if (view.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  const Observer = view.IntersectionObserver;
  if (typeof Observer !== "function") {
    return () => {};
  }

  const observer = new Observer(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }

        entry.target.classList.add("scroll-reveal-in");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );

  for (const target of targets) {
    target.classList.add("scroll-reveal-pending");
    observer.observe(target);
  }

  return () => {
    observer.disconnect();
    for (const target of targets) {
      target.classList.remove("scroll-reveal-pending", "scroll-reveal-in");
    }
  };
};
