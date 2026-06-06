<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { currentLocale, getT } from "@/i18n";
  import { lockBodyScroll } from "@/toolkit/ui/scrollLock";

  const isDev = import.meta.env.DEV;
  const searchPanelTransitionMs = 350;

  interface Props {
    selector?: string | HTMLElement;
    showSearch?: boolean;
  }

  let { selector, showSearch = $bindable(false) }: Props = $props();
  const t = getT(currentLocale);

  let internalVisible = $state(false);
  let rendered = $state(false);
  let animatedVisible = $state(false);
  let cleanupListener: (() => void) | null = null;
  let cleanupKeyboard: (() => void) | null = null;
  let cleanupThemeObserver: (() => void) | null = null;
  let panelElement: HTMLDivElement | null = null;
  let hideTimeoutId: number | null = null;
  const pagefindInstanceName = "global-search";
  const visible = $derived(selector ? internalVisible : Boolean(showSearch));
  let pagefindTheme = $state<"light" | "dark">("light");

  interface PagefindFocusable extends HTMLElement {
    focus(): void;
  }

  async function initPagefindComponentUi() {
    if (isDev) return;

    try {
      await Promise.all([
        import("@pagefind/component-ui"),
        import("@pagefind/component-ui/css"),
      ]);
    } catch (error) {
      console.warn("Pagefind Component UI 初始化失败：", error);
    }
  }

  function clearHideTimeout() {
    if (hideTimeoutId === null || typeof window === "undefined") return;

    window.clearTimeout(hideTimeoutId);
    hideTimeoutId = null;
  }

  function openSearch() {
    if (selector) {
      internalVisible = true;
      return;
    }

    showSearch = true;
  }

  function closeSearch() {
    if (selector) {
      internalVisible = false;
      return;
    }

    showSearch = false;
  }

  function toggleVisibility() {
    if (selector) {
      internalVisible = !internalVisible;
      return;
    }

    showSearch = !showSearch;
  }

  function focusSearchInput() {
    if (typeof window === "undefined") return;

    window.requestAnimationFrame(() => {
      const inputComponent =
        panelElement?.querySelector<PagefindFocusable>("pagefind-input");

      if (!inputComponent || typeof inputComponent.focus !== "function") {
        return;
      }

      inputComponent.focus();
    });
  }

  function isEditableTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false;

    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target.isContentEditable
    );
  }

  function resolveThemeFromRoot(): "light" | "dark" {
    if (typeof document === "undefined") return "light";

    return document.documentElement.dataset.theme === "dark"
      ? "dark"
      : "light";
  }

  onMount(() => {
    initPagefindComponentUi();

    // Setup selector listener
    if (selector) {
      let element: HTMLElement | null = null;

      if (typeof selector === "string") {
        element = document.querySelector(selector);
      } else if (selector instanceof HTMLElement) {
        element = selector;
      }

      if (element) {
        element.addEventListener("click", toggleVisibility);
        cleanupListener = () => {
          element?.removeEventListener("click", toggleVisibility);
        };
      } else {
        console.warn("Invalid selector provided for PagefindSearch component.");
      }
    }

    const handleKeydown = (event: KeyboardEvent) => {
      const isSearchShortcut =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k" &&
        !event.altKey;

      if (isSearchShortcut && !isEditableTarget(event.target)) {
        event.preventDefault();
        openSearch();
        focusSearchInput();
        return;
      }

      if (event.key === "Escape") {
        closeSearch();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    cleanupKeyboard = () => {
      window.removeEventListener("keydown", handleKeydown);
    };

    const root = document.documentElement;
    const syncPagefindTheme = () => {
      pagefindTheme = resolveThemeFromRoot();
    };

    syncPagefindTheme();

    const observer = new MutationObserver(syncPagefindTheme);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    cleanupThemeObserver = () => {
      observer.disconnect();
    };
  });

  onDestroy(() => {
    clearHideTimeout();

    if (cleanupListener) {
      cleanupListener();
      cleanupListener = null;
    }
    if (cleanupKeyboard) {
      cleanupKeyboard();
      cleanupKeyboard = null;
    }
    if (cleanupThemeObserver) {
      cleanupThemeObserver();
      cleanupThemeObserver = null;
    }
  });

  $effect(() => {
    clearHideTimeout();

    if (visible) {
      rendered = true;

      if (typeof window === "undefined") {
        animatedVisible = true;
        return;
      }

      const frameId = window.requestAnimationFrame(() => {
        animatedVisible = true;
      });

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    animatedVisible = false;

    if (typeof window === "undefined") {
      rendered = false;
      return;
    }

    const currentTimeoutId = window.setTimeout(() => {
      rendered = false;
      hideTimeoutId = null;
    }, searchPanelTransitionMs);

    hideTimeoutId = currentTimeoutId;

    return () => {
      window.clearTimeout(currentTimeoutId);
      if (hideTimeoutId === currentTimeoutId) {
        hideTimeoutId = null;
      }
    };
  });

  $effect(() => {
    if (!visible) return;

    focusSearchInput();
  });

  $effect(() => {
    if (typeof document === "undefined" || !visible) return;

    return lockBodyScroll(document, {
      innerWidth: window.innerWidth,
      getComputedPaddingInlineEnd: () => window.getComputedStyle(document.body).paddingInlineEnd,
    });
  });
</script>

<div
  class="search-shell"
  class:search-shell-visible={animatedVisible}
  hidden={!rendered}
  aria-hidden={!animatedVisible}
  data-pf-theme={pagefindTheme}
>
  <button
    type="button"
    class="search-overlay"
    aria-label="Close search overlay"
    onclick={closeSearch}
  ></button>

  <div
    bind:this={panelElement}
    class="pagefind-panel"
    role="dialog"
    aria-modal="true"
    aria-label="Search"
  >
    <div class="search-panel__ornament" aria-hidden="true">
      <span class="search-panel__icon i-ri-search-line"></span>
      <span class="search-panel__glow"></span>
    </div>

    <button
      type="button"
      class="search-panel__close"
      onclick={closeSearch}
      aria-label="Close search"
      aria-controls="pagefind-results-region"
    >
      <span class="i-ri-close-line"></span>
    </button>

    <div class="search-panel__body">
      {#if isDev}
        <div class="dev-tip">
          {t("search.devModeSkipped")}<br />
          {t("search.buildHint")}
        </div>
      {:else}
        <div
          class="pagefind-component-shell"
          data-testid="pagefind-component-shell"
        >
          <pagefind-config
            instance={pagefindInstanceName}
            bundle-path="/pagefind/"
          ></pagefind-config>

          <div class="pagefind-component-header">
            <pagefind-input instance={pagefindInstanceName} debounce={200}
            ></pagefind-input>
          </div>

          <div
            class="pagefind-component-results"
            id="pagefind-results-region"
            data-testid="pagefind-results-region"
          >
            <pagefind-summary instance={pagefindInstanceName}
            ></pagefind-summary>
            <pagefind-results instance={pagefindInstanceName}
            ></pagefind-results>
          </div>

          <div class="pagefind-component-footer">
            <pagefind-keyboard-hints instance={pagefindInstanceName}
            ></pagefind-keyboard-hints>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .search-shell {
    position: fixed;
    inset: 0;
    z-index: var(--z-search-overlay);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 4.5rem 1rem 1rem;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .search-shell[hidden] {
    display: none !important;
  }

  .search-shell-visible {
    opacity: 1;
    pointer-events: auto;
  }

  .search-overlay {
    position: absolute;
    inset: 0;
    border: 0;
    padding: 0;
    cursor: pointer;
    background:
      radial-gradient(circle at top, var(--grey-1-a3), transparent 55%),
      var(--search-overlay-bg);
    backdrop-filter: blur(14px) saturate(140%);
    transition: opacity 0.3s ease;
  }

  .pagefind-panel {
    position: relative;
    z-index: var(--z-content);
    display: flex;
    min-height: min(32rem, calc(100vh - 6rem));
    max-height: calc(100vh - 6rem);
    width: min(100%, 72rem);
    flex-direction: column;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--grey-4) 20%, transparent);
    border-radius: 1.25rem;
    background: linear-gradient(
      145deg,
      color-mix(in srgb, var(--grey-1) 94%, var(--color-cyan-light) 6%),
      color-mix(in srgb, var(--grey-2) 92%, var(--color-pink-light) 8%)
    );
    box-shadow: var(--search-panel-shadow), var(--search-panel-inset);
    backdrop-filter: blur(20px) saturate(180%);
    transform: translateY(-1.5rem) scale(0.98);
    transition:
      transform 0.35s ease,
      box-shadow 0.35s ease;
  }

  .search-shell-visible .pagefind-panel {
    transform: translateY(0) scale(1);
    box-shadow:
      var(--search-panel-shadow-active), var(--search-panel-inset-active);
  }

  .search-panel__ornament {
    position: absolute;
    left: 1.5rem;
    top: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-red);
    pointer-events: none;
  }

  .search-panel__icon {
    display: inline-flex;
    font-size: 1.1rem;
    opacity: 0.95;
  }

  .search-panel__glow {
    height: 0.625rem;
    width: 4.5rem;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--color-red), transparent);
    opacity: 0.5;
  }

  .search-panel__close {
    position: absolute;
    right: 1rem;
    top: 1rem;
    z-index: var(--z-elevated);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2.75rem;
    width: 2.75rem;
    border: 1px solid color-mix(in srgb, var(--grey-4) 24%, transparent);
    border-radius: 999px;
    background: color-mix(in srgb, var(--grey-1) 82%, transparent);
    color: var(--text-color);
    cursor: pointer;
    transition:
      transform 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease,
      background 0.2s ease,
      box-shadow 0.2s ease;
  }

  .search-panel__close:hover,
  .search-panel__close:focus-visible {
    transform: translateY(-1px) scale(1.03);
    border-color: color-mix(in srgb, var(--color-red) 30%, var(--grey-4));
    background: color-mix(in srgb, var(--color-red-a1) 55%, var(--grey-1));
    color: var(--color-red);
    box-shadow: var(--search-accent-shadow);
    outline: none;
  }

  .search-panel__body {
    display: flex;
    flex: 1;
    min-height: 0;
    padding: 1rem;
    padding-top: 3.75rem;
  }

  .dev-tip {
    display: grid;
    flex: 1;
    place-items: center;
    border: 1px dashed color-mix(in srgb, var(--grey-4) 35%, transparent);
    border-radius: 1rem;
    background: linear-gradient(
      145deg,
      color-mix(in srgb, var(--grey-0) 84%, transparent),
      color-mix(in srgb, var(--grey-2) 90%, transparent)
    );
    color: var(--text-color);
    line-height: 1.9;
    padding: 2rem;
    text-align: center;
  }

  .pagefind-component-shell {
    display: flex;
    flex: 1;
    min-height: 0;
    flex-direction: column;
    width: 100%;
  }

  .pagefind-component-shell {
    --pagefind-ui-scale: 1;
    --pagefind-ui-primary: var(--color-red);
    --pagefind-ui-text: var(--text-color);
    --pagefind-ui-secondary: var(--grey-6);
    --pagefind-ui-accent: color-mix(in srgb, var(--color-red) 24%, transparent);
    --pagefind-ui-background: color-mix(
      in srgb,
      var(--grey-0) 92%,
      transparent
    );
    --pagefind-ui-background-alt: color-mix(
      in srgb,
      var(--grey-1) 92%,
      transparent
    );
    --pagefind-ui-border: color-mix(in srgb, var(--grey-4) 25%, transparent);
    --pagefind-ui-border-focus: color-mix(
      in srgb,
      var(--color-red) 34%,
      var(--grey-4)
    );
    --pagefind-ui-tag: color-mix(in srgb, var(--grey-2) 90%, transparent);
    --pagefind-ui-link: var(--text-color);
    --pagefind-ui-link-hover: var(--color-red);
    --pagefind-ui-border-width: 1px;
    --pagefind-ui-border-radius: 0.9rem;
    --pagefind-ui-font: inherit;
    --pagefind-ui-muted: var(--grey-5);
    --pagefind-ui-overlay: transparent;
    --pagefind-ui-backdrop: transparent;
    overflow: hidden;
  }

  :global(:root[data-theme="dark"]) .pagefind-component-shell {
    --pagefind-ui-primary: color-mix(
      in srgb,
      var(--color-red) 88%,
      #ffffff 12%
    );
    --pagefind-ui-text: var(--grey-8);
    --pagefind-ui-secondary: var(--grey-6);
    --pagefind-ui-accent: color-mix(in srgb, var(--color-red) 35%, transparent);
    --pagefind-ui-background: color-mix(
      in srgb,
      var(--grey-2) 86%,
      #000000 14%
    );
    --pagefind-ui-background-alt: color-mix(
      in srgb,
      var(--grey-3) 82%,
      #000000 18%
    );
    --pagefind-ui-border: color-mix(in srgb, var(--grey-5) 56%, transparent);
    --pagefind-ui-border-focus: color-mix(
      in srgb,
      var(--color-red) 52%,
      var(--grey-5)
    );
    --pagefind-ui-tag: color-mix(in srgb, var(--grey-3) 75%, transparent);
    --pagefind-ui-link: var(--grey-8);
    --pagefind-ui-link-hover: color-mix(
      in srgb,
      var(--color-red) 84%,
      #fff 16%
    );
    --pagefind-ui-muted: var(--grey-6);
  }

  .pagefind-component-header {
    flex: 0 0 auto;
  }

  .pagefind-component-results {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    margin-top: 1rem;
    overflow: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, var(--grey-4) 80%, transparent)
      transparent;
  }

  .pagefind-component-footer {
    flex: 0 0 auto;
    margin-top: 0.8rem;
    opacity: 0.8;
  }

  .pagefind-component-shell :global(pagefind-input),
  .pagefind-component-shell :global(pagefind-summary),
  .pagefind-component-shell :global(pagefind-results),
  .pagefind-component-shell :global(pagefind-keyboard-hints) {
    width: 100%;
  }

  .pagefind-component-shell :global(pagefind-results a) {
    color: var(--pagefind-ui-link);
    transition: color 0.2s ease;
  }

  .pagefind-component-shell :global(pagefind-results a:hover),
  .pagefind-component-shell :global(pagefind-results a:focus-visible) {
    color: var(--pagefind-ui-link-hover);
  }

  .pagefind-component-shell :global(mark) {
    border-radius: 0.35rem;
    background: color-mix(in srgb, var(--color-yellow) 30%, transparent);
    color: inherit;
    padding: 0.05rem 0.25rem;
  }

  @media (max-width: 1023px) {
    .search-shell {
      padding-top: 4rem;
    }

    .pagefind-panel {
      min-height: min(30rem, calc(100vh - 5rem));
      max-height: calc(100vh - 5rem);
      border-radius: 1rem;
    }

    .search-panel__body {
      padding: 0.875rem;
      padding-top: 3.5rem;
    }
  }

  @media (max-width: 768px) {
    .search-shell {
      padding: 3.5rem 0.75rem 0.75rem;
    }

    .search-overlay {
      backdrop-filter: blur(10px) saturate(125%);
    }

    .pagefind-panel {
      min-height: calc(100vh - 4.25rem);
      max-height: calc(100vh - 4.25rem);
      width: 100%;
      border-radius: 0.9rem;
    }

    .search-panel__ornament {
      left: 1rem;
      top: 1rem;
    }

    .search-panel__glow {
      width: 3rem;
    }

    .search-panel__close {
      right: 0.75rem;
      top: 0.75rem;
      height: 2.5rem;
      width: 2.5rem;
    }

    .search-panel__body {
      padding-top: 3.25rem;
    }

    .pagefind-component-footer {
      margin-top: 0.65rem;
    }
  }
</style>
