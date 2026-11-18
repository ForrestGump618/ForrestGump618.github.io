<script lang="ts">
  import type { PanelConfig } from "./SidebarTypes";

  interface Props {
    panels?: PanelConfig[];
    activePanel?: string;
    onSelect?: (panelId: string) => void;
  }

  const {
    panels = [],
    activePanel = "",
    onSelect = () => {},
  }: Props = $props();
</script>

{#if panels.length > 1}
  <ul class="tab absolute inline-flex pt-[30px] pb-2.5 px-0 m-0 min-h-[30px] list-none">
    {#each panels as panel, i (panel.id)}
      {@const iconClass =
        panel.id === "contents"
          ? "i-ri-list-ordered"
          : panel.id === "related"
            ? "i-ri-git-branch-line"
          : panel.id === "overview"
              ? "i-ri-home-2-line"
              : ""}
      <li>
        <button
          aria-label={panel.title}
          class={`item ${panel.id} ${activePanel === panel.id ? "active" : ""} ${i === 1 ? "mx-2.5" : ""}`}
          onclick={() => onSelect(panel.id)}
          type="button"
        >
          {#if iconClass}
            <div aria-hidden="true" class={`${iconClass}`}></div>
          {/if}
          {#if activePanel === panel.id}
            <span class="ml-[5px] break-keep">{panel.title}</span>
          {/if}
        </button>
      </li>
    {/each}
  </ul>
{/if}

<style>
  .tab li {
    display: inline-flex;
  }

  .tab .item {
    cursor: pointer;
    display: inline-flex;
    font-size: 0.8125rem;
    padding: 0.3125rem 0.9375rem;
    color: var(--grey-5);
    border-radius: var(--radius-sm, 5px);
    text-align: center;
    text-decoration: none;
    background-color: color-mix(in oklch, var(--grey-9) 8%, transparent);
    transition: all 0.2s ease-out;
    border: none;
    flex-wrap: wrap;
    align-items: center;
  }

  .tab .item:hover,
  .tab .item.active {
    background: linear-gradient(
      to right,
      var(--color-pink),
      var(--color-orange)
    );
    color: var(--grey-0);
  }
</style>
