export type ThemeMode = "light" | "dark";

interface ThemeDocument {
  documentElement: {
    dataset: {
      theme?: string;
    };
  };
  startViewTransition?: (updateCallback: () => void) => {
    finished: Promise<unknown>;
  };
}

interface ThemeWindow {
  localStorage: Pick<Storage, "getItem" | "setItem">;
  matchMedia(query: string): {
    matches: boolean;
  };
}

const STORAGE_KEY = "shokax-color-scheme";

function getStoredTheme(win: ThemeWindow): ThemeMode | null {
  try {
    const stored = win.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch (err) {
    console.warn("[ShokaX] Unable to read theme from storage", err);
  }

  return null;
}

function getPreferredTheme(win: ThemeWindow): ThemeMode {
  return win.matchMedia && win.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(doc: ThemeDocument, theme: ThemeMode) {
  doc.documentElement.dataset.theme = theme;
}

export function initTheme(doc: ThemeDocument, win: ThemeWindow): ThemeMode {
  const theme = getStoredTheme(win) ?? getPreferredTheme(win);
  applyTheme(doc, theme);
  return theme;
}

function prefersReducedMotion(win: ThemeWindow): boolean {
  return win.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function persistTheme(win: ThemeWindow, theme: ThemeMode) {
  try {
    win.localStorage.setItem(STORAGE_KEY, theme);
  } catch (err) {
    console.warn("[ShokaX] Unable to persist theme", err);
  }
}

export function toggleThemeWithTransition(
  doc: ThemeDocument,
  win: ThemeWindow,
  current: ThemeMode,
): ThemeMode {
  const next: ThemeMode = current === "dark" ? "light" : "dark";
  persistTheme(win, next);

  const startViewTransition = doc.startViewTransition;

  if (!startViewTransition || prefersReducedMotion(win)) {
    applyTheme(doc, next);

    return next;
  }

  const transition = startViewTransition(() => {
    applyTheme(doc, next);
  });

  transition.finished
    .then(() => {})
    .catch((err) => {
      console.warn("[ShokaX] Theme transition failed", err);
      persistTheme(win, next);
    });

  return next;
}

export function toggleTheme(doc: ThemeDocument, win: ThemeWindow, current: ThemeMode): ThemeMode {
  const next: ThemeMode = current === "dark" ? "light" : "dark";
  applyTheme(doc, next);
  persistTheme(win, next);

  return next;
}
