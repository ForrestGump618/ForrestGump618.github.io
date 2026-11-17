<script lang="ts">
  import { init, type WalineInstance } from "@waline/client";
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

    const waline: WalineInstance | null = init({
      el: walineEl,
      serverURL,
      path: finalPath,
      lang,
      dark,
    });

    return () => {
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
