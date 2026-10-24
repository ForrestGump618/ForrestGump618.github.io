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

  async function focusSearchInput() {
    if (typeof window === "undefined") return;
    if (isDev) return;

    // 等待 pagefind-input 自定义元素完成升级，
    // 确保 focus() 能委托到 shadow DOM 内部的 input
    if (
      typeof customElements !== "undefined" &&
      !customElements.get("pagefind-input")
    ) {
      await customElements.whenDefined("pagefind-input");
    }

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
    <div class="search-panel__bar">
      <span class="search-panel__label">
        <span class="search-panel__icon i-ri-search-line" aria-hidden="true"></span>
        全站搜索
      </span>
      <button
        type="button"
        class="search-panel__close"
        onclick={closeSearch}
        aria-label="Close search"
        aria-controls="pagefind-results-region"
      >
        <span class="i-ri-close-line" aria-hidden="true"></span>
      </button>
    </div>

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
            <pagefind-input
              instance={pagefindInstanceName}
              debounce={200}
              placeholder="搜索标题、摘要或正文…"
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
  padding: clamp(1rem, 7vh, 4.5rem) 1rem 1.5rem;
  pointer-events: none;
}

.search-shell[hidden] {
  display: none;
}

.search-shell-visible {
  pointer-events: auto;
}

.search-overlay {
  position: absolute;
  inset: 0;
  border: 0;
  padding: 0;
  background: color-mix(in oklab, var(--grey-9) 34%, transparent);
  opacity: 0;
  cursor: default;
  transition: opacity var(--dur-2) var(--ease-out);
}

.search-shell-visible .search-overlay {
  opacity: 1;
}

.pagefind-panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: min(100%, 46rem);
  max-height: min(82vh, 54rem);
  overflow: hidden;
  background: var(--surface-raised);
  border: 1px solid var(--border-color-muted);
  border-radius: var(--radius-lg);
  box-shadow:
    0 32px 80px -44px rgb(28 24 20 / 42%),
    0 6px 20px -12px rgb(28 24 20 / 16%);
  opacity: 0;
  transform: translateY(0.6rem);
  transition:
    opacity var(--dur-2) var(--ease-out),
    transform var(--dur-2) var(--ease-out);
}

.search-shell-visible .pagefind-panel {
  opacity: 1;
  transform: none;
}

.search-panel__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 0.75rem 0.7rem 1.2rem;
  border-bottom: 1px solid var(--hairline);
}

.search-panel__label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color-muted);
  font-size: var(--text-2xs);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
}

.search-panel__icon {
  font-size: 0.95rem;
  color: var(--text-color-subtle);
}

.search-panel__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 0;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-color-muted);
  font-size: 1.05rem;
  cursor: pointer;
  transition:
    background-color var(--dur-1) var(--ease-out),
    color var(--dur-1) var(--ease-out);
}

.search-panel__close:hover {
  background: var(--surface-subtle);
  color: var(--text-color);
}

.search-panel__close:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.search-panel__body {
  display: flex;
  flex-direction: column;
  padding: 1rem 1.2rem 1.15rem;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.dev-tip {
  padding: 0.85rem 1rem;
  border: 1px dashed var(--border-color-muted);
  border-radius: var(--radius-sm);
  color: var(--text-color-muted);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
}

.pagefind-component-shell {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  --pf-text: var(--text-color);
  --pf-text-secondary: var(--text-color-muted);
  --pf-text-muted: var(--text-color-subtle);
  --pf-background: var(--surface-raised);
  --pf-border: var(--border-color-muted);
  --pf-border-focus: var(--primary-color);
  --pf-skeleton: var(--surface-subtle);
  --pf-skeleton-shine: var(--surface-page);
  --pf-hover: var(--surface-subtle);
  --pf-mark: inherit;
  --pf-scroll-shadow: transparent;
  --pf-shadow-sm: var(--shadow-card-base);
  --pf-shadow-md: var(--shadow-card-hover);
  --pf-shadow-lg: var(--shadow-lg);
  --pf-outline-focus: var(--primary-color);
  --pf-outline-width: 2px;
  --pf-outline-offset: 2px;
  --pf-font: var(--font-sans);
  --pf-input-height: 2.75rem;
  --pf-input-font-size: 1rem;
  --pf-summary-font-size: 0.8rem;
  --pf-result-title-font-size: 0.98rem;
  --pf-result-excerpt-font-size: 0.84rem;
  --pf-results-gap: 0.45rem;
  --pf-border-radius: var(--radius-md);
  --pf-modal-backdrop: rgb(20 18 16 / 40%);
}

.pagefind-component-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pagefind-component-results {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: min(48vh, 32rem);
  overflow-y: auto;
  padding-right: 0.15rem;
  overscroll-behavior: contain;
}

.pagefind-component-footer {
  padding-top: 0.6rem;
  border-top: 1px solid var(--hairline);
  color: var(--text-color-subtle);
  font-size: var(--text-2xs);
}

.pagefind-component-shell :global(pagefind-keyboard-hints) {
  display: block;
  color: var(--text-color-subtle);
  font-size: 0.72rem;
}

.pagefind-component-shell :global(pagefind-results a) {
  border-radius: var(--radius-sm);
}

.pagefind-component-shell :global(pagefind-results a:focus-visible) {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.pagefind-component-shell :global(pagefind-results mark) {
  background: transparent;
  color: var(--primary-color);
  font-weight: 600;
}

@media (max-width: 1023px) {
  .search-shell {
    padding: 0.85rem 0.75rem 1rem;
  }

  .pagefind-panel {
    max-height: min(88vh, 60rem);
  }

  .search-panel__body {
    padding: 0.85rem 0.95rem 1rem;
  }
}

@media (max-width: 768px) {
  .pagefind-panel {
    max-height: calc(100dvh - 2rem);
    border-radius: var(--radius-md);
  }

  .search-panel__bar {
    padding: 0.6rem 0.6rem 0.6rem 1rem;
  }

  .pagefind-component-results {
    max-height: min(56vh, 30rem);
  }
}
</style>
