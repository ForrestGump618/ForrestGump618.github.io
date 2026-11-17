<script lang="ts">
  import { onMount } from "svelte";
  import { sidebarOpen, toggleSidebar } from "@/stores/sidebarStore";
  import { fireworksEnabled, toggleFireworks } from "@/stores/fireworksStore";
  import { createScrollHeightCache, type ScrollHeightCache } from "@/toolkit/ui/scrollHeightCache";
  import type { ShokaXThemeConfig } from "@/toolkit/themeConfig";

  interface Props {
    nyxPlayer?: ShokaXThemeConfig["nyxPlayer"];
  }

  let { nyxPlayer }: Props = $props();

  let scrollPercent = $state(0);
  let hasComments = $state(false);
  let isMobile = $state(false);
  let isVisible = $state(true);
  let hydrated = $state(false);
  let heightCache: ScrollHeightCache | null = null;

  const percentLabel = $derived(`${Math.max(0, Math.round(scrollPercent))}%`);
  const nyxEnabled = $derived(
    Boolean(nyxPlayer?.enable && nyxPlayer.urls && nyxPlayer.urls.length > 0),
  );

  const updateScrollPercent = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    // 读缓存而非 scrollHeight，避免 scroll 事件内强制同步整页布局
    const scrollHeight =
      (heightCache?.get() ?? document.documentElement.scrollHeight) - window.innerHeight;
    scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  };

  const updateHasComments = () => {
    hasComments = Boolean(document.querySelector("#comments"));
  };

  const updateIsMobile = () => {
    isMobile = window.innerWidth <= 1023;
  };

  const scrollBehavior = (): ScrollBehavior =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: scrollBehavior(),
    });
  };

  const scrollToComments = () => {
    const target = document.querySelector("#comments");
    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: scrollBehavior(),
      block: "start",
    });
  };

  const toggleSidebarOnMobile = () => {
    if (!isMobile) {
      return;
    }

    toggleSidebar();
  };

  const initializeNyxPlayer = async () => {
    if (
      typeof window === "undefined" ||
      typeof document === "undefined" ||
      !nyxEnabled
    ) {
      return;
    }

    const player = document.querySelector("#player") as HTMLElement | null;
    const showBtn = document.querySelector("#nyx-show-btn");

    if (!player || !showBtn) {
      return;
    }

    if (player.dataset.nyxInited === "true") {
      return;
    }

    await import("nyx-player/style");
    const { initPlayer } = await import("nyx-player");

    initPlayer(
      "#player",
      "#nyx-show-btn",
      nyxPlayer?.urls || [],
      "#nyx-play-btn",
      nyxPlayer?.darkModeTarget || ':root[data-theme="dark"]',
      nyxPlayer?.preset || "shokax",
    );

    player.dataset.nyxInited = "true";
  };

  onMount(() => {
    if (typeof window === "undefined" || typeof document === "undefined")
      return;

    hydrated = true;
    heightCache = createScrollHeightCache(document, window);
    updateScrollPercent();
    updateHasComments();
    updateIsMobile();
    void initializeNyxPlayer();

    let lastScrollY = window.scrollY;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const updateVisibility = () => {
      const currentScrollY = window.scrollY;
      const isScrollingUp = currentScrollY < lastScrollY;

      if (currentScrollY <= 8) {
        isVisible = true;
      } else if (isScrollingUp) {
        isVisible = true;
      } else {
        isVisible = false;
      }

      lastScrollY = currentScrollY;

      if (idleTimer) {
        clearTimeout(idleTimer);
      }

      idleTimer = setTimeout(() => {
        isVisible = true;
      }, 180);
    };

    window.addEventListener("scroll", updateScrollPercent, { passive: true });
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateIsMobile, { passive: true });

    let observer: MutationObserver | null = null;

    if (!hasComments) {
      observer = new MutationObserver(() => {
        if (hasComments) {
          observer?.disconnect();
          return;
        }

        updateHasComments();
        if (hasComments) {
          observer?.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      window.removeEventListener("scroll", updateScrollPercent);
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateIsMobile);
      observer?.disconnect();
      heightCache?.destroy();
      heightCache = null;
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
    };
  });
</script>

<ul
  class="floating-toolbar"
  class:is-hidden={!isVisible}
  inert={!isVisible}
  data-hydrated={hydrated ? "true" : undefined}
>
  <li class="tool top">
    <button type="button" data-back-to-top onclick={scrollToTop} aria-label="返回顶部">
      <i class="i-ri-arrow-up-line"></i>
    </button>
    <span class="percent">{percentLabel}</span>
  </li>
  <li class="tool">
    <button
      type="button"
      onclick={toggleFireworks}
      aria-label={$fireworksEnabled ? "关闭点击烟花" : "开启点击烟花"}
      aria-pressed={$fireworksEnabled}
      title="点击烟花"
      class:is-off={!$fireworksEnabled}
    >
      <i class="i-ri-magic-line"></i>
    </button>
  </li>
  {#if hasComments}
    <li class="tool">
      <button type="button" onclick={scrollToComments} aria-label="前往评论区">
        <i class="i-ri-chat-1-line"></i>
      </button>
    </li>
  {/if}
  {#if nyxEnabled}
    <li class="tool">
      <button id="nyx-show-btn" type="button" aria-label="显示或隐藏播放器">
        <i class="i-ri-music-2-line"></i>
      </button>
    </li>
    <li class="tool">
      <button id="nyx-play-btn" type="button" aria-label="播放或暂停">
        <i class="i-ri-play-circle-line"></i>
      </button>
    </li>
  {/if}
  <li class="tool mobile-only">
    <button
      type="button"
      onclick={toggleSidebarOnMobile}
      aria-label="切换侧栏"
      aria-pressed={$sidebarOpen}
      class:active={$sidebarOpen}
    >
      <i class="i-ri-layout-right-2-line"></i>
    </button>
  </li>
</ul>

{#if nyxEnabled}
  <div id="player"></div>
{/if}

<style>
  .floating-toolbar {
    position: fixed;
    right: 1rem;
    bottom: 1rem;
    z-index: var(--z-floating);
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.5rem 0.4rem;
    margin: 0;
    list-style: none;
    border-radius: var(--radius-md, 0.75rem);
    background: color-mix(in oklab, var(--surface-raised) 82%, transparent);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition:
      transform var(--dur-2, 0.2s) var(--ease-out, ease),
      opacity var(--dur-2, 0.2s) var(--ease-out, ease);
  }

  .floating-toolbar.is-hidden {
    transform: translateY(0.5rem);
    opacity: 0;
    pointer-events: none;
  }

  .tool {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 0.25rem;
  }

  .tool button {
    width: 2.125rem;
    height: 2.125rem;
    border-radius: 0.625rem;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      color var(--dur-1, 0.15s) var(--ease-out, ease),
      background-color var(--dur-1, 0.15s) var(--ease-out, ease),
      transform var(--dur-1, 0.15s) var(--ease-press, ease);
  }

  .tool button:active {
    transform: scale(0.92);
  }

  .tool button i {
    font-size: 1.1rem;
  }

  .tool button:hover,
  .tool button:focus-visible {
    color: var(--primary-color);
    background: color-mix(in oklab, var(--primary-color) 12%, transparent);
  }

  .tool button.active {
    color: var(--primary-color);
    background: color-mix(in oklab, var(--primary-color) 12%, transparent);
  }

  .tool button.is-off {
    color: var(--text-color-subtle);
  }

  .percent {
    font-size: 0.6875rem;
    line-height: 1;
    color: var(--grey-5);
  }

  .mobile-only {
    display: none;
  }

  @media (max-width: 1023px) {
    .mobile-only {
      display: flex;
    }
  }
</style>
