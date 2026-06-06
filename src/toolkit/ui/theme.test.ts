import { describe, expect, it } from "bun:test";
import { initTheme, toggleTheme, toggleThemeWithTransition } from "./theme";

type StorageData = Map<string, string>;

function createStorage(initial: Record<string, string> = {}) {
  const data: StorageData = new Map(Object.entries(initial));

  return {
    getItem(key: string) {
      return data.has(key) ? data.get(key)! : null;
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
    data,
  };
}

function createDocumentMock() {
  const attrs = new Map<string, string>();

  const dataset = new Proxy({} as Record<string, string>, {
    set(_target, prop: string, value: string) {
      attrs.set(`data-${prop}`, value);
      return true;
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const doc = {
    documentElement: {
      dataset,
    },
  } as any;

  return {
    doc,
    attrs,
  };
}

function createWindowMock(options: {
  storage: ReturnType<typeof createStorage>;
  prefersDark?: boolean;
  prefersReducedMotion?: boolean;
}) {
  const { storage, prefersDark = false, prefersReducedMotion = false } = options;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return {
    localStorage: {
      getItem: (key: string) => storage.getItem(key),
      setItem: (key: string, value: string) => {
        storage.setItem(key, value);
      },
    },
    matchMedia(query: string) {
      if (query === "(prefers-color-scheme: dark)") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        return { matches: prefersDark } as any;
      }
      if (query === "(prefers-reduced-motion: reduce)") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        return { matches: prefersReducedMotion } as any;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      return { matches: false } as any;
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  } as any;
}

describe("theme helpers", () => {
  it("initializes from storage first", () => {
    const storage = createStorage({ "shokax-color-scheme": "dark" });
    const win = createWindowMock({ storage, prefersDark: false });
    const { doc, attrs } = createDocumentMock();

    const theme = initTheme(doc, win);

    expect(theme).toBe("dark");
    expect(attrs.get("data-theme")).toBe("dark");
  });

  it("falls back to system preference when storage is unavailable", () => {
    const { doc, attrs } = createDocumentMock();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const win = {
      localStorage: {
        getItem() {
          throw new Error("storage blocked");
        },
        setItem() {
          throw new Error("storage blocked");
        },
      },
      matchMedia(query: string) {
        if (query === "(prefers-color-scheme: dark)") {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          return { matches: true } as any;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        return { matches: false } as any;
      },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    } as any;

    const theme = initTheme(doc, win);

    expect(theme).toBe("dark");
    expect(attrs.get("data-theme")).toBe("dark");
  });

  it("degrades gracefully when view transition is unavailable", () => {
    const storage = createStorage();
    const win = createWindowMock({
      storage,
      prefersDark: false,
      prefersReducedMotion: true,
    });
    const { doc, attrs } = createDocumentMock();

    const next = toggleThemeWithTransition(doc, win, "dark");

    expect(next).toBe("light");
    expect(attrs.get("data-theme")).toBe("light");
    expect(storage.data.get("shokax-color-scheme")).toBe("light");
  });

  it("uses view transition and persists after completion", async () => {
    const storage = createStorage();
    const win = createWindowMock({
      storage,
      prefersDark: false,
      prefersReducedMotion: false,
    });
    const { doc, attrs } = createDocumentMock();

    let transitionCalled = false;
    (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      doc as Document & { startViewTransition: NonNullable<Document["startViewTransition"]> }
    ).startViewTransition =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      ((callbackOrOptions?: Parameters<NonNullable<Document["startViewTransition"]>>[0]) => {
        transitionCalled = true;
        if (typeof callbackOrOptions === "function") {
          callbackOrOptions();
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        return {
          finished: Promise.resolve(),
        } as any;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      }) as any;

    const next = toggleThemeWithTransition(doc, win, "light");
    await Promise.resolve();

    expect(next).toBe("dark");
    expect(transitionCalled).toBe(true);
    expect(attrs.get("data-theme")).toBe("dark");
    expect(storage.data.get("shokax-color-scheme")).toBe("dark");
  });

  it("supports non-transition toggle for backward compatibility", () => {
    const storage = createStorage({ "shokax-color-scheme": "light" });
    const win = createWindowMock({ storage, prefersDark: false });
    const { doc, attrs } = createDocumentMock();

    const next = toggleTheme(doc, win, "light");

    expect(next).toBe("dark");
    expect(attrs.get("data-theme")).toBe("dark");
    expect(storage.data.get("shokax-color-scheme")).toBe("dark");
  });
});
