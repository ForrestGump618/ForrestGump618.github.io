/**
 * 文档滚动高度缓存：用 ResizeObserver 在布局完成后更新缓存，
 * 滚动处理只读缓存值，避免在 scroll 事件里读 scrollHeight 强制同步整页布局。
 * 缺少 ResizeObserver 时回退为即时读取（渐进增强）。
 */

export interface ScrollHeightCacheView {
  ResizeObserver?: new (callback: () => void) => {
    observe(target: unknown): void;
    disconnect(): void;
  };
}

export interface ScrollHeightCache {
  get(): number;
  destroy(): void;
}

export const createScrollHeightCache = (
  doc: { documentElement: { scrollHeight: number }; body: unknown },
  view: ScrollHeightCacheView,
): ScrollHeightCache => {
  const readLive = () => doc.documentElement.scrollHeight;
  let height = readLive();

  const Observer = view.ResizeObserver;
  if (typeof Observer !== "function") {
    return { get: readLive, destroy: () => {} };
  }

  const observer = new Observer(() => {
    height = readLive();
  });
  observer.observe(doc.body);

  return {
    get: () => height,
    destroy: () => {
      observer.disconnect();
    },
  };
};
