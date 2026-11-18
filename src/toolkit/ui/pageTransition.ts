/**
 * 文章翻页过渡：点击文章链接时立即发起导航，同时挂上退场类名。
 * MPA 在新页响应提交前不会卸载旧文档，退场动效恰好在新页请求窗口内并行播放，
 * 输入路径零附加延迟。决策逻辑为纯函数，便于单元测试。
 */

export const PAGE_EXIT_CLASS = "is-page-exiting";
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
}

/**
 * 挂上退出类名并立即导航，不等待退场动画结束。
 * reduced 为 true 时跳过动效，仅导航。
 */
export const runExitSequence = (host: ExitHost, navigate: () => void, reduced: boolean): void => {
  if (!reduced) host.documentElement.classList.add(PAGE_EXIT_CLASS);
  navigate();
};

/**
 * 在文档上挂载文章翻页过渡。点击符合条件的文章链接时立即导航并并行播放退场；
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

    const reduced = win.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const container = doc.querySelector("#container");
    exiting = true;
    runExitSequence(
      doc,
      () => {
        win.location.href = href;
      },
      reduced || !container,
    );

    // 导航被取消（如 beforeunload 挽留）时恢复内容，避免页面停在淡出态
    restoreId = win.setTimeout(reset, EXIT_RESTORE_MS);
  };

  doc.addEventListener("click", onClick);
  win.addEventListener("pageshow", reset);
};
