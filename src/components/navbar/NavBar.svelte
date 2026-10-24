<script lang="ts">
  /**
   * 全站页头：细长的编辑式导航条。
   * - 桌面：品牌字标 + 内联导航（含「文章」下拉）+ 搜索 / 主题切换
   * - 移动：品牌 + 菜单按钮，展开为整块抽屉导航
   * 保留 #search 按钮契约（SearchPage 依赖），保留主题持久化 key。
   */
  import { onMount } from "svelte";
  import {
    initTheme,
    toggleThemeWithTransition,
    type ThemeMode,
  } from "@/toolkit/ui/theme";

  interface NavDropboxItem {
    href: string;
    text: string;
  }

  interface NavItem {
    href?: string;
    text: string;
    dropbox?: {
      enable?: boolean;
      items?: NavDropboxItem[];
    };
  }

  interface Props {
    name: string;
    navLinks?: NavItem[];
    clickToggleCallback?: () => void;
    onSearch?: () => void;
  }

  let { name, navLinks = [], clickToggleCallback, onSearch }: Props = $props();

  let isDark = $state<ThemeMode>("light");
  let scrolled = $state(false);
  let menuOpen = $state(false);
  let currentPath = $state("/");

  const normalize = (path: string) => {
    if (!path) return "/";
    const cleaned = path.replace(/(index\.html)?\/?$/, "/").replace(/\/+$/, "");
    return cleaned === "" ? "/" : `${cleaned}/`;
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    const target = normalize(href);
    if (target === "/") return currentPath === "/";
    return currentPath.startsWith(target);
  };

  const closeMenu = () => {
    menuOpen = false;
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  };

  onMount(() => {
    isDark = initTheme(document, window);
    currentPath = normalize(window.location.pathname);
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        scrolled = window.scrollY > 8;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeydown);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeydown);
    };
  });

  const switchTheme = () => {
    isDark = toggleThemeWithTransition(document, window, isDark);
  };

  const handleSearch = () => {
    onSearch?.();
    closeMenu();
  };

  const handleBrandClick = () => {
    clickToggleCallback?.();
    closeMenu();
  };
</script>

<header class="site-header" class:is-scrolled={scrolled} class:is-open={menuOpen}>
  <div class="site-header__inner">
    <a class="wordmark" href="/" onclick={handleBrandClick} aria-label={`${name} 首页`}>
      <span class="wordmark__name">{name}</span>
      <span class="wordmark__tag">Learn · Record</span>
    </a>

    <nav class="site-nav" aria-label="主导航">
      {#each navLinks as item (item.text)}
        {@const hasMenu = item.dropbox?.enable && (item.dropbox.items?.length ?? 0) > 0}
        {#if hasMenu}
          <div class="site-nav__group">
            <a
              class="site-nav__link"
              class:is-active={isActive(item.href)}
              href={item.href ?? "#"}
            >
              {item.text}
              <svg class="site-nav__chevron" width="9" height="9" viewBox="0 0 10 10" aria-hidden="true">
                <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              </svg>
            </a>
            <div class="site-nav__dropdown">
              {#each item.dropbox?.items ?? [] as sub (sub.text)}
                <a class="site-nav__sublink" href={sub.href} class:is-active={isActive(sub.href)}>
                  {sub.text}
                </a>
              {/each}
            </div>
          </div>
        {:else}
          <a
            class="site-nav__link"
            class:is-active={isActive(item.href)}
            href={item.href ?? "#"}
            aria-current={isActive(item.href) ? "page" : undefined}
          >
            {item.text}
          </a>
        {/if}
      {/each}
    </nav>

    <div class="site-tools">
      <button
        id="search"
        class="tool-btn"
        type="button"
        aria-label="搜索文章"
        title="搜索（标题 / 摘要 / 正文 / 标签）"
        onclick={handleSearch}
      >
        <svg width="17" height="17" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="8.8" cy="8.8" r="5.6" fill="none" stroke="currentColor" stroke-width="1.5" />
          <path d="M12.9 12.9l4.2 4.2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>

      <button
        class="tool-btn"
        type="button"
        aria-label={isDark === "dark" ? "切换到浅色模式" : "切换到深色模式"}
        title="切换主题"
        onclick={switchTheme}
      >
        {#if isDark === "dark"}
          <svg width="17" height="17" viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="10" cy="10" r="3.6" fill="none" stroke="currentColor" stroke-width="1.4" />
            <path
              d="M10 2.2v1.8M10 16v1.8M2.2 10h1.8M16 10h1.8M4.5 4.5l1.3 1.3M14.2 14.2l1.3 1.3M15.5 4.5l-1.3 1.3M5.8 14.2l-1.3 1.3"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
            />
          </svg>
        {:else}
          <svg width="17" height="17" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M16.2 12.4A6.8 6.8 0 017.6 3.8a6.9 6.9 0 108.6 8.6z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linejoin="round"
            />
          </svg>
        {/if}
      </button>

      <button
        class="tool-btn tool-btn--menu"
        type="button"
        aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
        aria-expanded={menuOpen}
        onclick={() => (menuOpen = !menuOpen)}
      >
        {#if menuOpen}
          <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        {:else}
          <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 6h14M3 10h14M3 14h9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        {/if}
      </button>
    </div>
  </div>

  {#if menuOpen}
    <div class="mobile-drawer">
      <nav class="mobile-nav" aria-label="移动端导航">
        {#each navLinks as item (item.text)}
          <div class="mobile-nav__group">
            <a
              class="mobile-nav__link"
              class:is-active={isActive(item.href)}
              href={item.href ?? "#"}
              onclick={closeMenu}
            >
              {item.text}
            </a>
            {#if item.dropbox?.enable && (item.dropbox.items?.length ?? 0) > 0}
              <div class="mobile-nav__sub">
                {#each item.dropbox.items as sub (sub.text)}
                  <a class="mobile-nav__sublink" href={sub.href} class:is-active={isActive(sub.href)} onclick={closeMenu}>
                    {sub.text}
                  </a>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </nav>
    </div>
  {/if}
</header>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: var(--z-floating, 80);
    width: 100%;
    border-bottom: 1px solid transparent;
    background: color-mix(in oklab, var(--surface-page, #fbfaf7) 82%, transparent);
    backdrop-filter: blur(14px) saturate(140%);
    -webkit-backdrop-filter: blur(14px) saturate(140%);
    transition: border-color 0.25s var(--ease-out, ease), background 0.25s ease;
  }

  .site-header.is-scrolled {
    border-bottom-color: var(--hairline, rgb(0 0 0 / 9%));
    background: color-mix(in oklab, var(--surface-page, #fbfaf7) 92%, transparent);
  }

  .site-header__inner {
    display: flex;
    align-items: center;
    gap: clamp(1rem, 3vw, 2.5rem);
    max-width: var(--container-wide, 84rem);
    margin: 0 auto;
    padding: 0 var(--gutter, clamp(1.25rem, 4vw, 2.75rem));
    min-height: var(--nav-height, 4rem);
  }

  .wordmark {
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.05rem;
    text-decoration: none;
    color: inherit;
    line-height: 1.05;
  }

  .wordmark__name {
    font-family: var(--font-serif, Georgia, "Noto Serif SC", serif);
    font-size: 1.22rem;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  .wordmark__tag {
    font-family: var(--font-sans, system-ui, sans-serif);
    font-size: 0.58rem;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-color-muted, #6b675f);
  }

  .site-nav {
    display: none;
    align-items: center;
    gap: clamp(0.35rem, 1.4vw, 1.1rem);
    margin-left: auto;
  }

  .site-nav__link,
  .site-nav__sublink {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.42rem 0.15rem;
    font-family: var(--font-sans, system-ui, sans-serif);
    font-size: 0.855rem;
    font-weight: 450;
    color: var(--text-color-muted, #6b675f);
    text-decoration: none;
    white-space: nowrap;
    transition: color 0.2s ease;
  }

  .site-nav__link::after,
  .site-nav__sublink::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0.12rem;
    height: 1px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.25s var(--ease-out, ease);
  }

  .site-nav__link:hover,
  .site-nav__link.is-active,
  .site-nav__sublink:hover,
  .site-nav__sublink.is-active {
    color: var(--text-color, #23211d);
  }

  .site-nav__link:hover::after,
  .site-nav__link.is-active::after {
    transform: scaleX(1);
  }

  .site-nav__group {
    position: relative;
  }

  .site-nav__chevron {
    opacity: 0.55;
  }

  .site-nav__dropdown {
    position: absolute;
    top: calc(100% + 0.35rem);
    left: 50%;
    display: flex;
    flex-direction: column;
    min-width: 8rem;
    padding: 0.4rem;
    border: 1px solid var(--hairline, rgb(0 0 0 / 9%));
    border-radius: var(--radius-sm, 0.375rem);
    background: var(--surface-raised, #fff);
    box-shadow: var(--shadow-card-hover, 0 12px 28px -18px rgb(0 0 0 / 40%));
    opacity: 0;
    visibility: hidden;
    transform: translate(-50%, -4px);
    transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s;
  }

  .site-nav__group:hover .site-nav__dropdown,
  .site-nav__group:focus-within .site-nav__dropdown {
    opacity: 1;
    visibility: visible;
    transform: translate(-50%, 0);
  }

  .site-nav__sublink {
    padding: 0.42rem 0.6rem;
    border-radius: calc(var(--radius-sm, 0.375rem) - 2px);
  }

  .site-nav__sublink:hover {
    background: var(--surface-subtle, #f3f1ed);
  }

  .site-tools {
    display: flex;
    align-items: center;
    gap: 0.15rem;
    margin-left: auto;
  }

  .site-nav + .site-tools {
    margin-left: 0.35rem;
  }

  .tool-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--text-color-muted, #6b675f);
    cursor: pointer;
    transition: color 0.2s ease, background 0.2s ease;
  }

  .tool-btn:hover {
    color: var(--text-color, #23211d);
    background: var(--surface-subtle, #f3f1ed);
  }

  .tool-btn:focus-visible {
    outline: 2px solid var(--primary-color, #7c3b52);
    outline-offset: 2px;
  }

  .mobile-drawer {
    border-bottom: 1px solid var(--hairline, rgb(0 0 0 / 9%));
    background: var(--surface-raised, #fff);
  }

  .mobile-nav {
    display: flex;
    flex-direction: column;
    max-width: var(--container-wide, 84rem);
    margin: 0 auto;
    padding: 0.5rem var(--gutter, 1.25rem) 1.25rem;
  }

  .mobile-nav__group {
    border-bottom: 1px solid var(--hairline, rgb(0 0 0 / 7%));
  }

  .mobile-nav__group:last-child {
    border-bottom: 0;
  }

  .mobile-nav__link {
    display: block;
    padding: 0.85rem 0.15rem;
    font-size: 0.98rem;
    color: var(--text-color, #23211d);
    text-decoration: none;
  }

  .mobile-nav__link.is-active {
    color: var(--primary-color, #7c3b52);
  }

  .mobile-nav__sub {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    padding: 0 0.15rem 0.85rem;
  }

  .mobile-nav__sublink {
    padding: 0.28rem 0.65rem;
    border: 1px solid var(--hairline, rgb(0 0 0 / 10%));
    border-radius: 999px;
    font-size: 0.82rem;
    color: var(--text-color-muted, #6b675f);
    text-decoration: none;
  }

  .mobile-nav__sublink.is-active {
    color: var(--primary-color, #7c3b52);
    border-color: color-mix(in oklab, var(--primary-color, #7c3b52) 35%, transparent);
  }

  @media (min-width: 900px) {
    .site-nav {
      display: flex;
    }

    .tool-btn--menu {
      display: none;
    }

    .mobile-drawer {
      display: none;
    }
  }
</style>
