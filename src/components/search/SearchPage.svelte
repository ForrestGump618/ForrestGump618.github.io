<script lang="ts">
  import { onMount } from "svelte";
  import { lockBodyScroll } from "@/toolkit/ui/scrollLock";

  let { onOpen }: { onOpen?: () => void } = $props();

  const isDev = import.meta.env.DEV;
  const pagefindInstanceName = "global-search";
  let panelElement = $state<HTMLDialogElement>();
  let closeButton = $state<HTMLButtonElement>();
  let returnFocus: HTMLElement | undefined;
  let unlock: (() => void) | undefined;
  let pressOnBackdrop = false;
  let loading = $state(false);
  let loaded = $state(false);
  let failed = $state(false);
  let pagefindTheme = $state<"light" | "dark">("light");

  function loadPagefindStyles() {
    return new Promise<void>((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/pagefind/pagefind-component-ui.css";
      link.addEventListener("load", () => resolve(), { once: true });
      link.addEventListener("error", () => {
        link.remove();
        reject(new Error("Pagefind 样式加载失败"));
      }, { once: true });
      document.head.append(link);
    });
  }

  async function loadPagefind() {
    if (isDev || loading || loaded) return;
    loading = true;
    failed = false;
    try {
      await Promise.all([
        import("@pagefind/component-ui"),
        loadPagefindStyles(),
      ]);
      loaded = true;
    } catch (error) {
      failed = true;
      console.warn("Pagefind 加载失败", error);
    } finally {
      loading = false;
    }
  }

  export function openSearch(trigger?: HTMLElement) {
    if (!panelElement || !closeButton) return;
    if (panelElement.open) {
      panelElement.removeAttribute("data-closing");
      return;
    }
    onOpen?.();
    returnFocus = trigger;
    panelElement.showModal();
    closeButton.focus({ preventScroll: true });
    unlock = lockBodyScroll(document, {
      innerWidth: window.innerWidth,
      getComputedPaddingInlineEnd: () => window.getComputedStyle(document.body).paddingInlineEnd,
    });
    if (loaded) focusSearchInput();
    else void loadPagefind();
  }

  async function closeSearch() {
    if (!panelElement?.open || panelElement.hasAttribute("data-closing")) return;
    if (!CSS.supports("overlay", "auto")) {
      panelElement.setAttribute("data-closing", "");
      await Promise.allSettled(panelElement.getAnimations().map((animation) => animation.finished));
      if (!panelElement?.hasAttribute("data-closing")) return;
      panelElement.removeAttribute("data-closing");
    }
    panelElement.close();
    unlock?.();
    unlock = undefined;
    returnFocus?.focus({ preventScroll: true });
    returnFocus = undefined;
  }

  function focusSearchInput() {
    requestAnimationFrame(() => {
      if (!panelElement?.open || document.activeElement !== closeButton) return;
      panelElement.querySelector<HTMLElement>("pagefind-input")?.focus();
    });
  }

  function isBackdrop(event: PointerEvent) {
    if (event.target !== panelElement || !panelElement) return false;
    const bounds = panelElement.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom;
  }

  $effect(() => {
    if (loaded) focusSearchInput();
  });

  function onShortcut(event: KeyboardEvent) {
    if (event.defaultPrevented || event.repeat || !(event.ctrlKey || event.metaKey)
      || event.altKey || event.shiftKey || event.key.toLowerCase() !== "k") return;

    const editable = event.composedPath().some((item) =>
      item instanceof HTMLElement && (item.matches("input, textarea, select") || item.isContentEditable),
    );
    if (editable) return;
    event.preventDefault();
    openSearch();
  }

  onMount(() => {
    const root = document.documentElement;
    const syncTheme = () => {
      pagefindTheme = root.dataset.theme === "dark" ? "dark" : "light";
    };
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      unlock?.();
      observer.disconnect();
    };
  });
</script>

<svelte:window onkeydown={onShortcut} />
<dialog
  id="site-search"
  class="pagefind-panel"
  aria-label="Search"
  {...{ closedby: "any" }}
  bind:this={panelElement}
  data-pf-theme={pagefindTheme}
  oncancel={(event) => {
    event.preventDefault();
    void closeSearch();
  }}
  onpointerdown={(event) => {
    if (!("closedBy" in HTMLDialogElement.prototype)) {
      pressOnBackdrop = isBackdrop(event);
    }
  }}
  onpointerup={(event) => {
    if (pressOnBackdrop && isBackdrop(event)) void closeSearch();
    pressOnBackdrop = false;
  }}
>
    <div class="search-panel__bar">
      <span class="search-panel__label">
        <span class="search-panel__icon i-ri-search-line" aria-hidden="true"></span>
        全站搜索
      </span>
      <button
        bind:this={closeButton}
        type="button"
        class="search-panel__close"
        onclick={closeSearch}
        aria-label="Close search"
      >
        <span class="i-ri-close-line" aria-hidden="true"></span>
      </button>
    </div>

    <div class="search-panel__body">
      {#if isDev}
        <p class="dev-tip">开发模式未生成搜索索引。请构建站点后使用预览验证搜索。</p>
      {:else if failed}
        <div class="dev-tip" role="status">
          搜索加载失败。
          <button type="button" onclick={loadPagefind}>重试</button>
        </div>
      {:else if !loaded}
        <p class="search-panel__loading" role="status">正在加载搜索…</p>
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
</dialog>

<style>
  .pagefind-panel {
    position: fixed;
    inset: max(clamp(0.875rem, 7dvh, 4rem), env(safe-area-inset-top)) 0 auto;
    width: min(calc(100% - 2rem), 43rem);
    max-width: none;
    max-height: min(82dvh, calc(100dvh - env(safe-area-inset-bottom) - 2rem));
    margin: 0 auto;
    padding: 0;
    overflow: hidden;
    background: var(--surface-raised);
    color: var(--text-color);
    border: var(--hairline);
    border-radius: var(--radius-lg);
    box-shadow: var(--search-panel-shadow);
    opacity: 0;
    transform: translateY(-0.5rem) scale(0.985);
    transition: opacity var(--dur-2) var(--ease-out), transform var(--dur-3) var(--ease-out);
  }

  .pagefind-panel[open] {
    display: flex;
    flex-direction: column;
  }

  .pagefind-panel[open]:where(:not([data-closing])) {
    opacity: 1;
    transform: none;
  }

  .pagefind-panel::backdrop {
    background: var(--search-overlay-bg);
    opacity: 0;
    transition: opacity var(--dur-2) var(--ease-out);
  }

  .pagefind-panel[open]:where(:not([data-closing]))::backdrop {
    opacity: 1;
  }

  @supports (overlay: auto) {
    .pagefind-panel {
      transition: opacity var(--dur-2) var(--ease-out), transform var(--dur-3) var(--ease-out),
        display var(--dur-3), overlay var(--dur-3);
      transition-behavior: allow-discrete;
    }

    .pagefind-panel::backdrop {
      transition: opacity var(--dur-2) var(--ease-out), display var(--dur-3), overlay var(--dur-3);
      transition-behavior: allow-discrete;
    }

    .pagefind-panel:not([open]),
    .pagefind-panel:not([open])::backdrop {
      pointer-events: none;
    }
  }

  @starting-style {
    .pagefind-panel[open]:where(:not([data-closing])) {
      opacity: 0;
      transform: translateY(-0.5rem) scale(0.985);
    }

    .pagefind-panel[open]:where(:not([data-closing]))::backdrop {
      opacity: 0;
    }
  }

.search-panel__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 0.75rem 0.7rem 1.2rem;
  border-bottom: var(--hairline);
}

.search-panel__label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color-muted);
  font-size: var(--text-2xs);
}

.search-panel__icon {
  font-size: 0.95rem;
  color: var(--text-color-subtle);
}

.search-panel__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  border: 0;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-color-muted);
  font-size: 1.05rem;
  cursor: pointer;
  transition: background-color var(--dur-2) var(--ease-out), scale var(--dur-1) var(--ease-press);
}

.search-panel__close:is(:hover, :active) {
  background: var(--surface-subtle);
  color: var(--text-color);
}

.search-panel__close:active {
  scale: 0.92;
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

.search-panel__loading,
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
  max-height: min(48dvh, 32rem);
  overflow-y: auto;
  padding-right: 0.15rem;
  overscroll-behavior: contain;
}

.pagefind-component-footer {
  padding-top: 0.6rem;
  border-top: var(--hairline);
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
  .search-panel__body {
    padding: 0.85rem 0.95rem 1rem;
  }
}

@media (max-width: 768px) {
  .pagefind-panel {
    border-radius: var(--radius-md);
  }

  .search-panel__bar {
    padding: 0.6rem 0.6rem 0.6rem 1rem;
  }

  .pagefind-component-results {
    max-height: min(56dvh, 30rem);
  }
}
</style>
