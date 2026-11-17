import { describe, expect, test } from "bun:test";
import { initScrollReveal } from "./scrollReveal";

class FakeClassList {
  private set = new Set<string>();

  add(...names: string[]) {
    for (const name of names) this.set.add(name);
  }

  remove(...names: string[]) {
    for (const name of names) this.set.delete(name);
  }

  contains(name: string) {
    return this.set.has(name);
  }
}

interface FakeElement {
  classList: FakeClassList;
}

const makeElement = (): FakeElement => ({ classList: new FakeClassList() });

class FakeObserver {
  static instances: FakeObserver[] = [];
  callback: (entries: { isIntersecting: boolean; target: FakeElement }[]) => void;
  observed: FakeElement[] = [];
  unobserved: FakeElement[] = [];
  disconnected = false;

  constructor(callback: (entries: { isIntersecting: boolean; target: FakeElement }[]) => void) {
    this.callback = callback;
    FakeObserver.instances.push(this);
  }

  observe(target: FakeElement) {
    this.observed.push(target);
  }

  unobserve(target: FakeElement) {
    this.unobserved.push(target);
  }

  disconnect() {
    this.disconnected = true;
  }
}

const makeView = (options: { reduced?: boolean; withObserver?: boolean } = {}) => ({
  matchMedia: () => ({ matches: options.reduced ?? false }),
  IntersectionObserver: options.withObserver === false ? undefined : FakeObserver,
});

const makeRoot = (elements: FakeElement[]) => ({
  querySelectorAll: () => elements,
});

describe("initScrollReveal", () => {
  test("进入视口后标记入场并停止观察", () => {
    FakeObserver.instances = [];
    const element = makeElement();
    const cleanup = initScrollReveal(makeRoot([element]), makeView());

    expect(element.classList.contains("scroll-reveal-pending")).toBe(true);
    const observer = FakeObserver.instances[0];
    expect(observer.observed).toEqual([element]);

    observer.callback([{ isIntersecting: false, target: element }]);
    expect(element.classList.contains("scroll-reveal-in")).toBe(false);

    observer.callback([{ isIntersecting: true, target: element }]);
    expect(element.classList.contains("scroll-reveal-in")).toBe(true);
    expect(observer.unobserved).toEqual([element]);

    cleanup();
    expect(observer.disconnected).toBe(true);
    expect(element.classList.contains("scroll-reveal-pending")).toBe(false);
  });

  test("减少动画偏好下不隐藏内容", () => {
    FakeObserver.instances = [];
    const element = makeElement();
    const cleanup = initScrollReveal(makeRoot([element]), makeView({ reduced: true }));

    expect(element.classList.contains("scroll-reveal-pending")).toBe(false);
    expect(FakeObserver.instances.length).toBe(0);
    cleanup();
  });

  test("缺少 IntersectionObserver 时保持可见", () => {
    const element = makeElement();
    const cleanup = initScrollReveal(makeRoot([element]), makeView({ withObserver: false }));

    expect(element.classList.contains("scroll-reveal-pending")).toBe(false);
    cleanup();
  });

  test("没有目标元素时直接返回空清理函数", () => {
    FakeObserver.instances = [];
    const cleanup = initScrollReveal(makeRoot([]), makeView());

    expect(FakeObserver.instances.length).toBe(0);
    cleanup();
  });
});
