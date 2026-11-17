import { describe, expect, it } from "bun:test";
import { createScrollHeightCache } from "./scrollHeightCache";

function makeView() {
  let callback: (() => void) | null = null;
  let observed = 0;
  let disconnected = 0;
  class FakeObserver {
    constructor(cb: () => void) {
      callback = cb;
    }
    observe() {
      observed += 1;
    }
    disconnect() {
      disconnected += 1;
    }
  }
  return {
    view: { ResizeObserver: FakeObserver },
    fire: () => callback?.(),
    counts: () => ({ observed, disconnected }),
  };
}

describe("createScrollHeightCache", () => {
  it("初始读取文档高度，ResizeObserver 触发后更新缓存", () => {
    const doc = { documentElement: { scrollHeight: 1000 }, body: {} };
    const { view, fire } = makeView();
    const cache = createScrollHeightCache(doc, view);
    expect(cache.get()).toBe(1000);

    doc.documentElement.scrollHeight = 2400;
    expect(cache.get()).toBe(1000); // 未触发观察前保持缓存
    fire();
    expect(cache.get()).toBe(2400);
  });

  it("observe 文档 body，destroy 断开观察", () => {
    const doc = { documentElement: { scrollHeight: 100 }, body: {} };
    const { view, counts } = makeView();
    const cache = createScrollHeightCache(doc, view);
    expect(counts().observed).toBe(1);
    cache.destroy();
    expect(counts().disconnected).toBe(1);
  });

  it("缺少 ResizeObserver 时回退为即时读取", () => {
    const doc = { documentElement: { scrollHeight: 100 }, body: {} };
    const cache = createScrollHeightCache(doc, {});
    doc.documentElement.scrollHeight = 999;
    expect(cache.get()).toBe(999);
    cache.destroy();
  });
});
