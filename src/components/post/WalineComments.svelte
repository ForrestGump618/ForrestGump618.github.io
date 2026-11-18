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
  <div class="waline-host" bind:this={walineEl}></div>
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

  /* Waline 暗色默认把 info/light-grey 设为 #666（对比度仅 2.6）。
     在评论容器上重设这些变量：子树继承覆盖 html 上的注入值，
     一次性提亮时间、浏览器/系统/地区徽标、计数、排序与订阅等全部 meta 文本。 */
  :global(html[data-theme="dark"] .waline-host) {
    --waline-info-color: var(--text-color-muted);
    --waline-light-grey: var(--text-color-muted);
    --waline-dark-grey: var(--text-color);
    --waline-color: var(--text-color);
  }

  :global(html[data-theme="dark"] .wl-sort li.active) {
    color: var(--primary-color);
  }
</style>
