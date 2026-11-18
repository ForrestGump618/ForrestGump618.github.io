<script lang="ts">
  import type { NavItemType } from "../navbar/NavTypes";

  interface Props {
    menu?: NavItemType[];
  }

  const { menu }: Props = $props();

  const getMenuIcon = (item: any): string => {
    return item?.icon ?? "";
  };

  const renderNavItems = (items: NavItemType[]) => {
    return items.map((item) => ({
      data: item,
      isDropdown:
        item.dropbox?.enable &&
        item.dropbox?.items &&
        item.dropbox.items.length > 0,
    }));
  };

  const menuItems = $derived(renderNavItems(menu || []));
</script>

<nav class="menu p-5 m-0 bg-transparent" aria-label="侧栏菜单导航">
  <ul class="menu-list list-none m-0 p-0">
    {#each menuItems as item (item.data.href)}
      {@const icon = item.data.icon}
      {@const text = item.data.text}
      {@const url = item.data.href}
      {@const dropboxItems = item.data.dropbox?.items || []}

      {#if item.isDropdown && dropboxItems.length > 0}
        <li class="item dropdown">
          <a href={url} rel="section">
            {#if icon}
              <div
                class={`ic ${icon} inline-flex justify-center items-center text-xl flex-wrap align-text-bottom mr-2.5`}
              ></div>
            {/if}
            {text}
          </a>
          <ul class="submenu">
            {#each dropboxItems as subItem (subItem.href)}
              <li class="item">
                <a href={subItem.href} rel="section">
                  {#if subItem.icon}
                    <div
                      class={`ic ${getMenuIcon(subItem)} inline-flex justify-center items-center text-xl flex-wrap align-text-bottom mr-2.5`}
                    ></div>
                  {/if}
                  {subItem.text}
                </a>
              </li>
            {/each}
          </ul>
        </li>
      {:else}
        <li class="item">
          <a href={url} rel="section">
            {#if icon}
              <div
                class={`ic ${icon} inline-flex justify-center items-center text-xl flex-wrap align-text-bottom mr-2.5`}
              ></div>
            {/if}
            {text}
          </a>
        </li>
      {/if}
    {/each}
  </ul>
</nav>

<style>
  /* 保留状态关联样式，无法用原子类替代 */
  .menu .item {
    border-radius: 0.9375rem;
    margin-bottom: 0.625rem;
    display: block;
    color: var(--grey-5);
    transition: all 0.2s ease-in-out;
    list-style: none;
  }

  .menu .item a {
    color: inherit;
    display: block;
    line-height: 3;
    text-decoration: none;
    transition: all 0.2s ease-in-out;
  }

  .menu .item .submenu {
    display: none;
    padding: 0;
    list-style: none;
    animation: slideDown 0.3s ease-in-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .menu .item:hover {
    background-color: var(--grey-9-a1);
    color: inherit;
  }

  .menu .item:hover .submenu {
    display: block;
  }

  .menu .item.active {
    background: linear-gradient(
      to right,
      var(--color-pink),
      var(--color-orange)
    );
    color: var(--grey-0);
  }

  .menu .item.active:hover {
    color: var(--grey-0);
  }
</style>
