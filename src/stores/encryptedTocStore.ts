import type { TocItem } from "@/components/sidebar/SidebarTypes";

// 存储解密后的 TOC 数据
let decryptedToc: TocItem[] = [];

// 订阅者列表
type Subscriber = (toc: TocItem[]) => void;
const subscribers = new Set<Subscriber>();

export const encryptedTocStore = {
  // 获取当前 TOC
  get(): TocItem[] {
    return decryptedToc;
  },

  // 设置 TOC（解密成功后调用）
  set(toc: TocItem[]): void {
    decryptedToc = toc;
    subscribers.forEach((fn) => {
      fn(toc);
    });
  },

  // 清除 TOC
  clear(): void {
    decryptedToc = [];
    subscribers.forEach((fn) => {
      fn([]);
    });
  },

  // 订阅 TOC 变化
  subscribe(fn: Subscriber): () => void {
    subscribers.add(fn);
    // 立即调用一次，返回当前值
    fn(decryptedToc);
    // 返回取消订阅函数
    return () => subscribers.delete(fn);
  },
};
