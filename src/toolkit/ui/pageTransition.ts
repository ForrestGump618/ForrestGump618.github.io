/**
 * 文章翻页过渡：点击文章链接时先播放退场动效再导航，进入文章页由 CSS 错峰入场。
 * 决策逻辑为纯函数，退场编排器接受注入的宿主与时钟，便于单元测试。
 */

export const PAGE_EXIT_CLASS = "is-page-exiting";
export const PAGE_EXIT_ANIMATION = "page-exit";
const EXIT_FALLBACK_MS = 360;
const EXIT_RESTORE_MS = 1500;

export interface ClickLike {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
}

/** 仅拦截无修饰键的左键单击；修饰键/中键保留浏览器默认行为（新标签页等） */
export const isPlainPrimaryClick = (event: ClickLike): boolean =>
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey &&
  !event.defaultPrevented;

/**
 * 解析可拦截的文章导航：同源、/posts/ 前缀、且不是当前页（含纯锚点）。
 * 返回绝对 URL；不满足条件返回 null。
 */
export const resolvePostNavigation = (href: string, baseUrl: string): string | null => {
  let target: URL;
  let base: URL;
  try {
    target = new URL(href, baseUrl);
    base = new URL(baseUrl);
  } catch {
    return null;
  }

  if (target.protocol !== "http:" && target.protocol !== "https:") return null;
  if (target.origin !== base.origin) return null;
  if (!target.pathname.startsWith("/posts/")) return null;
  if (target.pathname === base.pathname && target.search === base.search) return null;

  return target.href;
};

export interface ClassListLike {
  add(className: string): void;
  remove(className: string): void;
}

export interface ExitHost {
  documentElement: { classList: ClassListLike };
  addEventListener(
    type: "animationend",
    listener: (event: { animationName: string }) => void,
  ): void;
  removeEventListener(
    type: "animationend",
    listener: (event: { animationName: string }) => void,
  ): void;
}

export interface ExitClock {
  setTimeout(handler: () => void, ms: number): number;
  clearTimeout(id: number): void;
}

/**
 * 播放退场：挂上退出类名，等退场动画结束（或兜底超时）后导航，仅导航一次。
 * reduced 为 true 时跳过动效立即导航。
 */
export const runExitSequence = (
  host: ExitHost,
  clock: ExitClock,
  navigate: () => void,
  reduced: boolean,
): void => {
  if (reduced) {
    navigate();
    return;
  }

  let done = false;
  let fallbackId: number | undefined;

  const finish = () => {
    if (done) return;
    done = true;
    if (fallbackId !== undefined) clock.clearTimeout(fallbackId);
    host.removeEventListener("animationend", onAnimationEnd);
    navigate();
  };

  const onAnimationEnd = (event: { animationName: string }) => {
    if (event.animationName === PAGE_EXIT_ANIMATION) finish();
  };

  host.addEventListener("animationend", onAnimationEnd);
  host.documentElement.classList.add(PAGE_EXIT_CLASS);
  fallbackId = clock.setTimeout(finish, EXIT_FALLBACK_MS);
};

/**
 * 在文档上挂载文章翻页过渡。点击符合条件的文章链接时先退场再导航；
 * pageshow（含 bfcache 恢复）时清理退出状态，避免回退后内容停留在淡出态。
 */
export const initPageTransition = (doc: Document, win: Window): void => {
  let exiting = false;
  let restoreId: number | undefined;

  const clearRestore = () => {
    if (restoreId !== undefined) {
      win.clearTimeout(restoreId);
      restoreId = undefined;
    }
  };

  const reset = () => {
    exiting = false;
    clearRestore();
    doc.documentElement.classList.remove(PAGE_EXIT_CLASS);
  };

  const onClick = (event: MouseEvent) => {
    if (exiting) {
      event.preventDefault();
      return;
    }
    if (!isPlainPrimaryClick(event)) return;

    const target = event.target instanceof Element ? event.target : null;
    const anchor = target?.closest("a[href]");
    if (!(anchor instanceof HTMLAnchorElement)) return;
    if (anchor.target && anchor.target !== "_self") return;
    if (anchor.hasAttribute("download")) return;
    if (anchor.dataset.noTransition !== undefined) return;

    const href = resolvePostNavigation(anchor.href, win.location.href);
    if (!href) return;

    event.preventDefault();

    if (win.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      win.location.href = href;
      return;
    }

    const container = doc.querySelector("#container");
    if (!container) {
      win.location.href = href;
      return;
    }

    exiting = true;
    runExitSequence(
      doc,
      win,
      () => {
        win.location.href = href;
      },
      false,
    );

    // 导航被取消（如 beforeunload 挽留）时恢复内容，避免页面停在淡出态
    restoreId = win.setTimeout(reset, EXIT_RESTORE_MS);
  };

  doc.addEventListener("click", onClick);
  win.addEventListener("pageshow", reset);
};
