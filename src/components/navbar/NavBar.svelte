<script lang="ts">
  import { onMount } from "svelte";
  import SearchPage from "@/components/search/SearchPage.svelte";
  import { initTheme, toggleTheme, type ThemeMode } from "@/toolkit/ui/theme";

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

  let { name, navLinks = [], path }: {
    name: string;
    navLinks?: NavItem[];
    path: string;
  } = $props();

  let isDark = $state<ThemeMode>("light");
  let ready = $state(false);
  let scrolled = $state(false);
  let menuOpen = $state(false);
  let dropdown = $state<string>();
  let pinned = false;
  let drawer = $state<HTMLElement>();
  let menuToggle = $state<HTMLButtonElement>();
  let desktopNav = $state<HTMLElement>();
  let searchPanel = $state<ReturnType<typeof SearchPage>>();
  let shortcutHint = $state("Ctrl K");
  // 滑动悬停胶囊：跟随当前悬停/聚焦的导航项
  let pillX = $state(0);
  let pillW = $state(0);
  let pillVisible = $state(false);

  function movePill(target: HTMLElement | null) {
    if (!target || !desktopNav) return;
    const navRect = desktopNav.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    pillX = rect.left - navRect.left;
    pillW = rect.width;
    pillVisible = true;
  }

  function hidePill() {
    pillVisible = false;
  }

  const normalize = (url: string) => url.replace(/(?:index\.html)?\/?$/, "/");
  const isActive = (href?: string) => {
    if (!href) return false;
    const target = normalize(href);
    const current = normalize(path);
    return target === "/" ? current === "/" : current.startsWith(target);
  };

  function closeDropdown() {
    dropdown = undefined;
    pinned = false;
  }

  function showDropdown(item: string, pointerType: string) {
    if (pointerType !== "mouse" || dropdown === item) return;
    pinned = false;
    dropdown = item;
  }

  function toggleDropdown(item: string) {
    if (dropdown === item && pinned) {
      closeDropdown();
      return;
    }
    dropdown = item;
    pinned = true;
  }

  function closeMenu() {
    menuOpen = false;
  }

  function onPointerDown(event: PointerEvent) {
    if (!(event.target instanceof Node)) return;
    if (!drawer?.contains(event.target) && !menuToggle?.contains(event.target)) {
      closeMenu();
    }
    if (!desktopNav?.contains(event.target)) closeDropdown();
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented || event.key !== "Escape") return;
    if (menuOpen) {
      closeMenu();
      menuToggle?.focus({ preventScroll: true });
    }
    if (dropdown) {
      const trigger = desktopNav?.querySelector<HTMLButtonElement>('button[aria-expanded="true"]');
      const group = trigger?.closest(".site-nav__group");
      if (group?.contains(document.activeElement)) trigger?.focus({ preventScroll: true });
      closeDropdown();
    }
  }

  onMount(() => {
    isDark = initTheme(document, window);
    ready = true;
    if (/Mac|iPhone|iPad/i.test(navigator.platform)) {
      shortcutHint = "⌘K";
    }
    let frame = 0;
    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        scrolled = window.scrollY > 8;
        frame = 0;
      });
    }
    const desktop = window.matchMedia("(min-width: 900px)");
    function onResize() {
      closeMenu();
      closeDropdown();
      hidePill();
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    desktop.addEventListener("change", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      desktop.removeEventListener("change", onResize);
    };
  });
</script>

<svelte:window onpointerdown={onPointerDown} onkeydown={onKeydown} />

<header class="site-header" class:is-scrolled={scrolled} class:is-open={menuOpen}>
  <div class="site-header__inner">
    <a class="wordmark" href="/" onclick={closeMenu} aria-label={`${name} 首页`}>
      <span class="wordmark__name">{name}</span>
    </a>

    <nav
      class="site-nav"
      aria-label="主导航"
      bind:this={desktopNav}
      onpointerleave={hidePill}
      onfocusout={(event) => {
        if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) {
          hidePill();
        }
      }}
    >
      <span
        class="site-nav__pill"
        class:is-visible={pillVisible}
        style={`--pill-x:${pillX}px;--pill-w:${pillW}px`}
        aria-hidden="true"
      ></span>
      {#each navLinks as item, index (item.text)}
        {@const hasMenu = item.dropbox?.enable && (item.dropbox.items?.length ?? 0) > 0}
        {#if hasMenu}
          {@const expanded = dropdown === item.text}
          {@const groupActive = isActive(item.href) || (item.dropbox?.items ?? []).some((sub) => isActive(sub.href))}
          <div
            class="site-nav__group"
            role="group"
            onpointerenter={(event) => {
              showDropdown(item.text, event.pointerType);
              if (event.pointerType === "mouse") movePill(event.currentTarget);
            }}
            onpointerleave={() => { if (!pinned) closeDropdown(); }}
            onfocusin={(event) => movePill(event.currentTarget)}
            onfocusout={(event) => {
              if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) {
                closeDropdown();
              }
            }}
          >
            {#if item.href}
              <a class="site-nav__link" href={item.href}
                class:is-active={groupActive}>{item.text}</a>
              <button
                class="site-nav__toggle"
                type="button"
                disabled={!ready}
                aria-label={`${item.text}子菜单`}
                aria-controls={`nav-dropdown-${index}`}
                aria-expanded={expanded}
                onclick={() => toggleDropdown(item.text)}
              >
                <span class="i-ri-arrow-down-s-line" aria-hidden="true"></span>
              </button>
            {:else}
              <button
                class="site-nav__link site-nav__link--trigger"
                type="button"
                disabled={!ready}
                class:is-active={groupActive}
                aria-controls={`nav-dropdown-${index}`}
                aria-expanded={expanded}
                onclick={() => toggleDropdown(item.text)}
              >
                {item.text}
                <span class="i-ri-arrow-down-s-line site-nav__chevron" class:is-open={expanded} aria-hidden="true"></span>
              </button>
            {/if}
            <div
              class="site-nav__dropdown"
              class:is-visible={expanded}
              inert={!expanded}
              id={`nav-dropdown-${index}`}
            >
              {#each item.dropbox?.items ?? [] as sub (sub.text)}
                <a class="site-nav__sublink" href={sub.href}
                  aria-current={isActive(sub.href) ? "page" : undefined}
                  class:is-active={isActive(sub.href)}>{sub.text}</a>
              {/each}
            </div>
          </div>
        {:else}
          <a
            class="site-nav__link"
            class:is-active={isActive(item.href)}
            href={item.href ?? "#"}
            aria-current={isActive(item.href) ? "page" : undefined}
            onpointerenter={(event) => {
              if (event.pointerType === "mouse") movePill(event.currentTarget);
            }}
            onfocusin={(event) => movePill(event.currentTarget)}
          >
            {item.text}
          </a>
        {/if}
      {/each}
    </nav>

    <div class="site-tools">
      <button
        id="search"
        class="tool-btn tool-btn--search"
        type="button"
        aria-label="搜索文章"
        aria-haspopup="dialog"
        aria-controls="site-search"
        aria-keyshortcuts="Control+K Meta+K"
        title="搜索文章（Ctrl / ⌘ + K）"
        disabled={!ready}
        onclick={(event) => {
          searchPanel?.openSearch(event.currentTarget);
        }}
      >
        <svg width="17" height="17" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="8.8" cy="8.8" r="5.6" fill="none" stroke="currentColor" stroke-width="1.5" />
          <path d="M12.9 12.9l4.2 4.2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <kbd class="tool-btn__kbd" aria-hidden="true">{shortcutHint}</kbd>
      </button>

      <button
        class="tool-btn"
        type="button"
        aria-label={isDark === "dark" ? "切换到浅色模式" : "切换到深色模式"}
        title="切换主题"
        disabled={!ready}
        onclick={() => (isDark = toggleTheme(document, window, isDark))}
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
        aria-controls="mobile-drawer"
        disabled={!ready}
        bind:this={menuToggle}
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

  <div class="mobile-scrim" aria-hidden="true"></div>
  <div class="mobile-drawer" id="mobile-drawer" inert={!menuOpen} bind:this={drawer}>
      <nav class="mobile-nav" aria-label="移动端导航">
        {#each navLinks as item (item.text)}
          <div class="mobile-nav__group">
            {#if item.href}
              <a
                class="mobile-nav__link"
                class:is-active={isActive(item.href)}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                onclick={closeMenu}
              >
                {item.text}
              </a>
            {:else}
              <p class="mobile-nav__label">{item.text}</p>
            {/if}
            {#if item.dropbox?.enable && (item.dropbox.items?.length ?? 0) > 0}
              <div class="mobile-nav__sub">
                {#each item.dropbox.items as sub (sub.text)}
                  <a class="mobile-nav__sublink" href={sub.href} class:is-active={isActive(sub.href)} aria-current={isActive(sub.href) ? "page" : undefined} onclick={closeMenu}>
                    {sub.text}
                  </a>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </nav>
  </div>
</header>

<SearchPage bind:this={searchPanel} onOpen={() => { closeMenu(); closeDropdown(); }} />
