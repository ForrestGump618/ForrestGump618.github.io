<script lang="ts">
  import type { NavItemType } from "./NavTypes";
  import NavLinkItem from "./NavLinkItem.svelte";

  interface Props {
    navLinks?: NavItemType[];
    class?: string;
  }

  const { navLinks = [], class: className = "" }: Props = $props();

  const mergedClass = $derived([className].filter(Boolean).join(" "));
</script>

<ul
  class={`dropbox-menu box-shadow mt-2 p-0 rounded-br-2.5 rounded-tl-2.5 w-max absolute first:rounded-tl-2.5 ${mergedClass}`.trim()}
>
  {#each navLinks as { href, text, icon } (href)}
    <div class="color-btn first:rounded-tl-2.5 last:rounded-br-2.5">
      <NavLinkItem
        {href}
        {text}
        {icon}
        class="ml-1 mr-1 block transition-300 transition-all transition-ease-in-out hover:translate-x-1.5"
      />
    </div>
  {/each}
</ul>

<style>
  .box-shadow {
    box-shadow: none;
  }

  .dropbox-menu {
    color: var(--text-color);
    background-color: var(--grey-1);
  }

  :global(.dropbox-menu a) {
    color: inherit;
  }

  .color-btn:hover {
    z-index: var(--z-base);
    color: var(--grey-0);
    background-image: linear-gradient(
      to right,
      var(--color-pink) 0,
      var(--color-orange) 100%
    );
  }
</style>
