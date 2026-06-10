<svelte:options customElement="code-block" />

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { css } from "../assets/fonts/MapleMono-CN-Regular.ttf?subsets";
  import ArrowDownSLine from "@/assets/icons/arrow-down-s-line.svg";
  import ArrowUpSLine from "@/assets/icons/arrow-up-s-line.svg";
  import CheckFill from "@/assets/icons/check-fill.svg";
  import FileCopyFill from "@/assets/icons/file-copy-fill.svg";
  import FullscreenLine from "@/assets/icons/fullscreen-line.svg";
  import FullscreenExitLine from "@/assets/icons/fullscreen-exit-line.svg";

  let container = $state<HTMLElement | null>(null);
  let copied = $state(false);
  let codeLanguage = $state("");
  let isDark = $state(false);
  let isCollapsed = $state(false);
  let shouldShowCollapse = $state(false);
  let isFullscreen = $state(false);
  let isExiting = $state(false);
  let codeblockElement = $state<HTMLElement | null>(null);

  const COLLAPSE_THRESHOLD = 15;

  async function copyCode() {
    const slot = container?.querySelector("slot") as HTMLSlotElement;
    const assignedElements = slot?.assignedElements({ flatten: true }) ?? [];
    const preElement = assignedElements.find((el) => el.tagName === "PRE") as
      | HTMLPreElement
      | undefined;

    if (!preElement) return;

    const code = preElement.textContent ?? "";

    try {
      await navigator.clipboard.writeText(code);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  // 获取语言逻辑
  function getCodeLanguage() {
    const slot = container?.querySelector("slot") as HTMLSlotElement;
    const assignedElements = slot?.assignedElements({ flatten: true }) ?? [];
    const preElement = assignedElements.find((el) => el.tagName === "PRE") as
      | HTMLPreElement
      | undefined;
    if (!preElement) return "";

    const language = preElement.dataset.language;
    return language ?? "";
  }

  // 检查代码行数
  function checkCodeLength() {
    const slot = container?.querySelector("slot") as HTMLSlotElement;
    const assignedElements = slot?.assignedElements({ flatten: true }) ?? [];
    const preElement = assignedElements.find((el) => el.tagName === "PRE") as
      | HTMLPreElement
      | undefined;

    if (!preElement) return;

    const codeElement = preElement.querySelector("code");
    if (!codeElement) return;

    const lines = codeElement.querySelectorAll(".line");
    if (lines.length > COLLAPSE_THRESHOLD) {
      shouldShowCollapse = true;
      isCollapsed = true;
    }
  }

  function toggleCollapse() {
    isCollapsed = !isCollapsed;
  }

  function toggleFullscreen() {
    if (isFullscreen) {
      // 退出全屏：先播放退出动画
      isExiting = true;
      setTimeout(() => {
        isFullscreen = false;
        isExiting = false;
        if (typeof document !== "undefined") {
          document.body.style.overflow = "";
        }
      }, 300); // 与动画时长一致
    } else {
      // 进入全屏
      isFullscreen = true;
      if (typeof document !== "undefined") {
        document.body.style.overflow = "hidden";
      }
    }
  }

  // 监听 ESC 键退出全屏
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && isFullscreen) {
      toggleFullscreen();
    }
  }

  onMount(async () => {
    codeLanguage = getCodeLanguage();

    // 延迟检查，确保内容已完全渲染
    setTimeout(() => {
      checkCodeLength();
    }, 100);

    // 添加键盘事件监听
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeydown);
    }
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleKeydown);
    }
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
  });

  const updateTheme = () => {
    const theme = document.documentElement.dataset.theme;
    isDark = theme === "dark";
  };

  $effect(() => {
    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  });
</script>

<div
  bind:this={codeblockElement}
  class="codeblock {isDark ? 'dark' : ''} {isFullscreen
    ? 'fullscreen'
    : ''} {isExiting ? 'exiting' : ''}"
>
  <div class="header">
    <div class="controls">
      <div class="dot red"></div>
      <div class="dot yellow"></div>
      <div class="dot green"></div>
      {#if codeLanguage}
        <span class="lang-text">{codeLanguage}</span>
      {/if}
    </div>
    <div class="actions">
      <button
        class="action-btn"
        style="mask-image: url({copied
          ? CheckFill.src
          : FileCopyFill.src}); -webkit-mask-image: url({copied
          ? CheckFill.src
          : FileCopyFill.src});"
        onclick={copyCode}
        aria-label="Copy code"
      ></button>
      <button
        class="action-btn"
        style="mask-image: url({isFullscreen
          ? FullscreenExitLine.src
          : FullscreenLine.src}); -webkit-mask-image: url({isFullscreen
          ? FullscreenExitLine.src
          : FullscreenLine.src});"
        onclick={toggleFullscreen}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      ></button>
    </div>
  </div>

  <div class="content-container {isCollapsed ? 'collapsed' : ''}">
    <div
      bind:this={container}
      class="content-wrapper"
      style="font-family: {css.family};"
    >
      <slot />
    </div>

    {#if shouldShowCollapse && !isFullscreen}
      <button
        class="collapse-btn"
        style="mask-image: url({isCollapsed
          ? ArrowDownSLine.src
          : ArrowUpSLine.src}); -webkit-mask-image: url({isCollapsed
          ? ArrowDownSLine.src
          : ArrowUpSLine.src});"
        onclick={toggleCollapse}
        aria-label={isCollapsed ? "Expand code" : "Collapse code"}
      ></button>
    {/if}
  </div>
</div>

<style>
  /* 基础布局 */
  .codeblock {
    margin: 1.5rem 0;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: var(--codeblock-shadow);
    font-family: "Maple Mono", "Courier New", monospace;
  }

  .dark.codeblock {
    box-shadow: none;
  }

  /* Header 样式 */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: var(--surface-code-header);
    min-height: 1.5rem;
    border-top-right-radius: 0.5rem;
    border-top-left-radius: 0.5rem;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-left: 0.8125rem;
  }

  .dot {
    width: 0.9375rem;
    height: 0.9375rem;
    border-radius: 50%;
  }
  .red {
    background: var(--codeblock-dot-red);
  }
  .yellow {
    background: var(--codeblock-dot-yellow);
  }
  .green {
    background: var(--codeblock-dot-green);
  }

  .lang-text {
    margin-left: 0.75rem;
    font-size: 1rem;
    color: var(--text-color-muted);
    text-transform: uppercase;
  }

  .actions {
    display: flex;
    flex-direction: row;
    gap: 0.75rem;
    padding-right: 1.5rem;
    color: var(--text-color-muted);
  }

  .action-btn {
    border: none;
    cursor: pointer;
    background-color: var(--codeblock-action-color);
    width: 1.1rem;
    height: 1.1rem;
    mask-size: contain;
    mask-repeat: no-repeat;
    mask-position: center;
    -webkit-mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center;
    transition: background-color 0.2s;
  }

  .action-btn:hover {
    background-color: var(--codeblock-action-hover-color);
  }

  /* 内容容器 - 支持折叠 */
  .content-container {
    position: relative;
    transition: max-height 0.3s ease-in-out;
  }

  .content-container.collapsed {
    max-height: 400px;
    overflow: hidden;
  }

  .content-container.collapsed::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(
      to bottom,
      transparent,
      var(--codeblock-collapse-gradient-end)
    );
    pointer-events: none;
  }

  .collapse-btn {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--codeblock-action-color);
    border: 1px solid var(--border-color-muted);
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    mask-size: 1.75rem;
    mask-repeat: no-repeat;
    mask-position: center;
    -webkit-mask-size: 1.25rem;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: var(--codeblock-button-shadow);
    z-index: var(--z-dropdown);
    animation: float 2s ease-in-out infinite;
    scale: 1.5;
  }

  .collapse-btn:hover {
    background-color: var(--codeblock-action-hover-color);
    transform: translateX(-50%) scale(1.1);
    box-shadow: var(--codeblock-button-shadow-hover);
  }

  /* 飘动动画 */
  @keyframes float {
    0%,
    100% {
      transform: translateX(-50%) translateY(0);
    }
    50% {
      transform: translateX(-50%) translateY(-6px);
    }
  }

  .collapse-btn:hover {
    animation-play-state: paused;
  }

  /* 核心：处理插槽内的样式 */
  :global(code-block pre *) {
    font-family: "Maple Mono", "Courier New", Courier, monospace;
    font-size: 0.925rem;
    line-height: 1.25rem;
    line-break: anywhere;
    white-space: break-spaces;
  }

  :global(code-block pre) {
    padding: 0.925rem;
    margin: 0;
    border-bottom-right-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
    background-color: var(--surface-code) !important;
    overflow-x: auto;
  }

  :global(html[data-theme="dark"] code-block span) {
    color: var(--shiki-dark) !important;
  }

  /* 行号样式 */
  :global(code-block .line) {
    color: inherit;
    text-indent: -2.5rem;
    padding-left: 2.5rem;
    display: block;
    min-height: 1.25rem;
    contain-intrinsic-height: 24px;
    transition:
      background-color 0.15s ease,
      opacity 0.15s ease,
      box-shadow 0.15s ease;
  }

  :global(code-block .line):hover {
    background-color: var(--line-hover-bg);
  }

  :global(code-block code) {
    counter-reset: step;
    counter-increment: step 0;
    display: flex;
    flex-direction: column;
  }

  :global(code-block code .line::before) {
    content: counter(step);
    counter-increment: step;
    width: 1rem;
    margin-right: 1.5rem;
    display: inline-block;
    text-align: right;
    color: var(--text-color-muted);
  }

  /* 行高亮（highlight + meta highlight 复用同一个 class） */
  :global(code-block .line.highlighted) {
    background-color: var(--cb-line-highlight-bg);
    box-shadow: inset 0.25rem 0 0 var(--cb-line-highlight-border);
  }

  /* Diff（增删行） */
  :global(code-block .line.diff.add) {
    background-color: var(--cb-diff-add-bg);
    box-shadow: inset 0.25rem 0 0 var(--cb-diff-add-border);
  }

  :global(code-block .line.diff.remove) {
    background-color: var(--cb-diff-remove-bg);
    box-shadow: inset 0.25rem 0 0 var(--cb-diff-remove-border);
  }

  /* 不占用额外 DOM 的情况下，用行号前缀标识 + / -（避免覆盖 .line::before 计数逻辑） */
  :global(code-block code .line.diff.add::before) {
    content: counter(step) " +";
    color: var(--cb-diff-add-border);
  }

  :global(code-block code .line.diff.remove::before) {
    content: counter(step) " -";
    color: var(--cb-diff-remove-border);
  }

  /* Focus（聚焦显示）：当存在 focused 行时，其他行整体淡化 */
  :global(code-block pre.has-focused .line) {
    opacity: var(--cb-focus-dim-opacity);
  }

  :global(code-block pre.has-focused .line.focused) {
    opacity: 1;
    background-color: var(--cb-focus-bg);
    box-shadow: inset 0.25rem 0 0 var(--cb-focus-border);
  }

  /* Error / Warning（基于 transformerNotationErrorLevel） */
  :global(code-block .line.highlighted.error) {
    background-color: var(--cb-error-bg);
    box-shadow: inset 0.25rem 0 0 var(--cb-error-border);
  }

  :global(code-block .line.highlighted.warning) {
    background-color: var(--cb-warning-bg);
    box-shadow: inset 0.25rem 0 0 var(--cb-warning-border);
  }

  :global(code-block .highlighted-word) {
    background-color: var(--cb-highlighted-word-bg);
    border-radius: 0.2rem;
    padding: 0.05rem 0.15rem;
  }

  :global(code-block .dark) {
    box-shadow: none;
  }

  /* 全屏样式 */
  .fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    margin: 0;
    z-index: var(--z-fullscreen);
    border-radius: 0;
    animation: fullscreenIn 0.3s ease-out;
    display: flex;
    flex-direction: column;
    background-color: var(--codeblock-overlay-bg);
    backdrop-filter: blur(8px);
    padding: 2rem;
    box-sizing: border-box;
  }

  .fullscreen .header {
    border-radius: 0.5rem 0.5rem 0 0;
  }

  .fullscreen .content-container {
    flex: 1;
    overflow: auto;
    max-height: none !important;
    border-radius: 0 0 0.5rem 0.5rem;
  }

  .fullscreen .content-container.collapsed {
    max-height: none !important;
  }

  .fullscreen .content-container::after {
    display: none;
  }

  .fullscreen :global(pre) {
    border-radius: 0 0 0.5rem 0.5rem !important;
  }

  @keyframes fullscreenIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .exiting {
    animation: fullscreenOut 0.3s ease-in forwards;
  }

  @keyframes fullscreenOut {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.95);
    }
  }
</style>
