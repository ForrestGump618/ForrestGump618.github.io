import { describe, expect, test } from "bun:test";
import {
  PAGE_EXIT_ANIMATION,
  PAGE_EXIT_CLASS,
  isPlainPrimaryClick,
  resolvePostNavigation,
  runExitSequence,
  type ClickLike,
  type ExitClock,
  type ExitHost,
} from "./pageTransition";

const plainClick = (overrides: Partial<ClickLike> = {}): ClickLike => ({
  button: 0,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  defaultPrevented: false,
  ...overrides,
});

describe("isPlainPrimaryClick", () => {
  test("无修饰键的左键单击通过", () => {
    expect(isPlainPrimaryClick(plainClick())).toBe(true);
  });

  test("修饰键、非左键与已被拦截的点击不通过", () => {
    expect(isPlainPrimaryClick(plainClick({ metaKey: true }))).toBe(false);
    expect(isPlainPrimaryClick(plainClick({ ctrlKey: true }))).toBe(false);
    expect(isPlainPrimaryClick(plainClick({ shiftKey: true }))).toBe(false);
    expect(isPlainPrimaryClick(plainClick({ altKey: true }))).toBe(false);
    expect(isPlainPrimaryClick(plainClick({ button: 1 }))).toBe(false);
    expect(isPlainPrimaryClick(plainClick({ defaultPrevented: true }))).toBe(false);
  });
});

describe("resolvePostNavigation", () => {
  const base = "https://example.com/";

  test("相对与绝对的同源文章链接返回绝对 URL", () => {
    expect(resolvePostNavigation("/posts/eve/", base)).toBe("https://example.com/posts/eve/");
    expect(resolvePostNavigation("https://example.com/posts/a/b/", base)).toBe(
      "https://example.com/posts/a/b/",
    );
    expect(resolvePostNavigation("/posts/eve/#标题", base)).toBe(
      "https://example.com/posts/eve/#%E6%A0%87%E9%A2%98",
    );
  });

  test("跨站、非 http 协议与非文章路径不拦截", () => {
    expect(resolvePostNavigation("https://other.com/posts/eve/", base)).toBeNull();
    expect(resolvePostNavigation("mailto:a@example.com", base)).toBeNull();
    expect(resolvePostNavigation("javascript:void(0)", base)).toBeNull();
    expect(resolvePostNavigation("/about/", base)).toBeNull();
    expect(resolvePostNavigation("/posts", base)).toBeNull();
  });

  test("当前页纯锚点不拦截，查询参数不同视为新导航", () => {
    const current = "https://example.com/posts/eve/";
    expect(resolvePostNavigation("/posts/eve/#sec", current)).toBeNull();
    expect(resolvePostNavigation("/posts/eve/", current)).toBeNull();
    expect(resolvePostNavigation("/posts/eve/?ref=home", current)).toBe(
      "https://example.com/posts/eve/?ref=home",
    );
  });

  test("非法 URL 返回 null", () => {
    expect(resolvePostNavigation("https://example.com/posts/x/", "not a url")).toBeNull();
    expect(resolvePostNavigation("://bad", base)).toBeNull();
  });
});

class FakeClassList {
  private set = new Set<string>();

  add(name: string) {
    this.set.add(name);
  }

  remove(name: string) {
    this.set.delete(name);
  }

  contains(name: string) {
    return this.set.has(name);
  }
}

class FakeClock implements ExitClock {
  private nextId = 1;
  private handlers = new Map<number, () => void>();
  cleared: number[] = [];

  setTimeout(handler: () => void, _ms: number): number {
    const id = this.nextId++;
    this.handlers.set(id, handler);
    return id;
  }

  clearTimeout(id: number): void {
    this.cleared.push(id);
    this.handlers.delete(id);
  }

  fireAll() {
    const handlers = Array.from(this.handlers.values());
    this.handlers.clear();
    for (const handler of handlers) handler();
  }

  get pending() {
    return this.handlers.size;
  }
}

const makeHost = () => {
  const classList = new FakeClassList();
  const listeners: ((event: { animationName: string }) => void)[] = [];
  const host: ExitHost = {
    documentElement: { classList },
    addEventListener(_type, listener) {
      listeners.push(listener);
    },
    removeEventListener(_type, listener) {
      const index = listeners.indexOf(listener);
      if (index >= 0) listeners.splice(index, 1);
    },
  };
  const emit = (animationName: string) => {
    const snapshot = Array.from(listeners);
    for (const listener of snapshot) listener({ animationName });
  };
  return { host, classList, listeners, emit };
};

describe("runExitSequence", () => {
  test("reduced-motion 立即导航且不挂退出类名", () => {
    const { host, classList } = makeHost();
    const clock = new FakeClock();
    let navigated = 0;

    runExitSequence(host, clock, () => navigated++, true);

    expect(navigated).toBe(1);
    expect(classList.contains(PAGE_EXIT_CLASS)).toBe(false);
    expect(clock.pending).toBe(0);
  });

  test("退场动画结束后导航一次并清理兜底定时器与监听器", () => {
    const { host, classList, listeners, emit } = makeHost();
    const clock = new FakeClock();
    let navigated = 0;

    runExitSequence(host, clock, () => navigated++, false);

    expect(classList.contains(PAGE_EXIT_CLASS)).toBe(true);
    expect(navigated).toBe(0);

    emit("reveal-in");
    expect(navigated).toBe(0);

    emit(PAGE_EXIT_ANIMATION);
    expect(navigated).toBe(1);
    expect(clock.pending).toBe(0);
    expect(listeners.length).toBe(0);

    emit(PAGE_EXIT_ANIMATION);
    expect(navigated).toBe(1);
  });

  test("动画未触发时由兜底定时器导航且不重复", () => {
    const { host, classList, emit } = makeHost();
    const clock = new FakeClock();
    let navigated = 0;

    runExitSequence(host, clock, () => navigated++, false);
    expect(classList.contains(PAGE_EXIT_CLASS)).toBe(true);

    clock.fireAll();
    expect(navigated).toBe(1);

    emit(PAGE_EXIT_ANIMATION);
    expect(navigated).toBe(1);
  });
});
