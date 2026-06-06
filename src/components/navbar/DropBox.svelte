<script lang="ts">
  import type { NavItemType } from "./NavTypes";
  import { fly } from "svelte/transition";
  import DropBoxItem from "./DropBoxItem.svelte";
  import NavItem from "./NavItem.svelte";

  interface Props {
    icon?: string;
    navLinks?: NavItemType[];
    rootText: string;
    class?: string;
  }

  const {
    icon,
    navLinks = [],
    rootText,
    class: className = "",
  }: Props = $props();

  let linkHover = $state(false);
  let submenuHover = $state(false);
  let linkTimer: ReturnType<typeof setTimeout> | undefined = $state();
  let submenuTimer: ReturnType<typeof setTimeout> | undefined =
    $state();

  const setLinkHover = (value: boolean) => {
    if (linkTimer) clearTimeout(linkTimer);

    linkTimer = undefined;
    if (value) {
      linkHover = true;
    } else {
      linkTimer = setTimeout(() => {
        linkHover = false;
      }, 300);
    }
  };

  const setSubHover = (value: boolean) => {
    if (submenuTimer) clearTimeout(submenuTimer);

    submenuTimer = undefined;
    if (value) {
      submenuHover = true;
    } else {
      submenuTimer = setTimeout(() => {
        submenuHover = false;
      }, 100);
    }
  };

  const hovering = $derived(linkHover || submenuHover);
  const iconClasses = $derived(
    icon ? `${icon} text-xl vertical-text-bottom inline-block` : "",
  );
  const mergedClass = $derived([className].filter(Boolean).join(" "));
</script>

<NavItem class={mergedClass}>
  <button
    type="button"
    aria-haspopup="true"
    aria-expanded={hovering}
    onclick={(e) => e.preventDefault()}
    onmouseenter={() => setLinkHover(true)}
    onmouseleave={() => setLinkHover(false)}
    class="text-inherit font-inherit border-none bg-transparent inline-block cursor-pointer"
  >
    {#if icon}
      <div class={iconClasses}></div>
    {/if}
    {rootText}
    <div
      class="i-ri-arrow-drop-down-fill text-xl vertical-text-bottom inline-block"
    ></div>
  </button>
  {#if hovering}
    <div
      class="relative z-10"
      role="menu"
      tabindex="-1"
      onmouseenter={() => setSubHover(true)}
      onmouseleave={() => setSubHover(false)}
      transition:fly|local={{ y: 12, duration: 300 }}
    >
      <DropBoxItem {navLinks} />
    </div>
  {/if}
</NavItem>

<style>
  button {
    padding: 0;
    font-size: inherit;
    line-height: inherit;
  }
</style>
