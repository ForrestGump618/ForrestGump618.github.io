<script lang="ts">
  import type { WalineInstance } from "@waline/client";
  import "@waline/client/style";
  import { onMount } from "svelte";
  import { currentLocale, t } from "@/i18n";

  interface Props {
    serverURL?: string;
    lang?: string;
    dark?: boolean | string;
    path?: string;
    pagePath?: string;
  }

  const {
    serverURL = "",
    lang = currentLocale,
    // 跟随站点主题：Waline 会在匹配该选择器时启用暗色样式
    dark = 'html[data-theme="dark"]',
    path = "",
    pagePath = "",
  }: Props = $props();

  let walineEl = $state<HTMLDivElement | null>(null);

  onMount(() => {
    if (!serverURL || !walineEl) {
      return;
    }

    const finalPath =
      path ||
      pagePath ||
      (typeof window !== "undefined" ? window.location.pathname : "/");

    // 动态加载评论客户端：避免大水合任务阻塞滚动与阅读
    let waline: WalineInstance | null = null;
    let destroyed = false;
    void import("@waline/client").then(({ init }) => {
      if (destroyed || !walineEl) {
        return;
      }
      waline = init({
        el: walineEl,
        serverURL,
        path: finalPath,
        lang,
        dark,
      });
    });

    return () => {
      destroyed = true;
      waline?.destroy();
    };
  });
</script>

{#if serverURL}
  <div bind:this={walineEl}></div>
{:else}
  <div class="waline-disabled">{t("footer.walineNotConfigured")}</div>
{/if}

<style>
  .waline-disabled {
    border: 1px dashed var(--grey-4);
    color: var(--grey-5);
    border-radius: 0.5rem;
    padding: 1rem;
    text-align: center;
    font-size: 0.875rem;
  }
</style>
