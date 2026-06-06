<script lang='ts'>
  import type { TocItem } from './SidebarTypes'
  import { onMount } from 'svelte'

  interface Props {
    toc?: TocItem[]
    isActive?: boolean
  }

  const { toc = [], isActive = false }: Props = $props()

  let activeIndex = $state(0)
  let currentItems = $state(new Set<number>())
  let containerElement: HTMLElement | null = $state(null)

  // Helper function to render nested TOC items
  function getTocItemClass(index: number): string {
    const classes = ['toc-item']
    if (currentItems.has(index)) {
      classes.push('current')
    }
    if (activeIndex === index) {
      classes.push('active')
    }
    return classes.join(' ')
  }

  function handleTocClick(event: MouseEvent, id: string, index: number) {
    event.preventDefault()
    const target = document.getElementById(id)
    if (target) {
      const scrollTop = target.offsetTop - 100
      window.scrollTo({
        top: scrollTop,
        behavior: 'smooth',
      })
      activeIndex = index
    }
  }

  onMount(() => {
    if (typeof window === 'undefined' || toc.length === 0)
      return

    // Get all section elements
    const sections: HTMLElement[] = toc.map((item) => {
      return document.getElementById(item.id) as HTMLElement
    }).filter(Boolean)

    if (sections.length === 0)
      return

    const activeLock: number | null = null

    const activateNavByIndex = (index: number): void => {
      if (index < 0 || index >= toc.length)
        return

      activeIndex = index
      currentItems = new Set([index])

      // Update parent items
      let currentToc = toc[index]
      for (let i = index - 1; i >= 0; i--) {
        if (toc[i].level < currentToc.level) {
          currentItems.add(i)
          currentToc = toc[i]
        }
      }

      // Scroll TOC into view if needed
      if (isActive && containerElement) {
        const activeElement = containerElement.querySelector('.toc-item.active') as HTMLElement
        if (activeElement) {
          const offsetTop = activeElement.offsetTop - containerElement.clientHeight / 4
          containerElement.scrollTo({
            top: offsetTop,
            behavior: 'smooth',
          })
        }
      }
    }

    const findIndex = (entries: IntersectionObserverEntry[]): number => {
      let index = 0
      let entry = entries[index]

      if (entry && entry.boundingClientRect.top > 0) {
        index = sections.indexOf(entry.target as HTMLElement)
        return index === 0 ? 0 : Math.max(0, index - 1)
      }

      for (; index < entries.length; index++) {
        if (entries[index].boundingClientRect.top <= 0) {
          entry = entries[index]
        }
        else {
          return Math.max(0, sections.indexOf(entry.target as HTMLElement))
        }
      }

      return Math.max(0, sections.indexOf(entry?.target as HTMLElement))
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (activeLock === null) {
          const index = findIndex(entries)
          activateNavByIndex(index)
        }
      },
      {
        rootMargin: '0px 0px -100% 0px',
        threshold: 0,
      },
    )

    sections.forEach((element) => {
      if (element)
        observer.observe(element)
    })

    return () => {
      observer.disconnect()
    }
  })
</script>

<div class='contents' bind:this={containerElement}>
  {#if toc.length > 0}
    <ol class='toc'>
      {#each toc as item, index (item.id)}
        <li
          class={getTocItemClass(index)}
          style={`padding-left: ${(item.level - 1) * 0.75}rem`}
        >
          <a
            href={`#${item.id}`}
            class='toc-link'
            onclick={e => handleTocClick(e, item.id, index)}
          >
            {item.text}
          </a>
          {#if item.children && item.children.length > 0}
            <ol class='toc-child'>
              {#each item.children as child}
                <li class='toc-item'>
                  <a href={`#${child.id}`} class='toc-link'>
                    {child.text}
                  </a>
                </li>
              {/each}
            </ol>
          {/if}
        </li>
      {/each}
    </ol>
  {:else}
    <p class='no-toc'>No contents available</p>
  {/if}
</div>

<style>
  .contents ol {
    padding: 0 0.125rem 0.3125rem 0.625rem;
    text-align: left;
    list-style: none;
    margin: 0;
  }

  .contents .toc-item {
    font-size: 0.875rem;
    line-height: 1.8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .contents .toc-child {
    display: none;
  }

  .contents .active > .toc-child {
    display: block;
  }

  .contents .current > .toc-child {
    display: block;
  }

  .contents .current > .toc-child > .toc-item {
    display: block;
  }

  .contents .active > a {
    color: var(--primary-color);
  }

  .contents .current > a {
    color: var(--primary-color);
  }

  .contents .current > a:hover {
    color: var(--primary-color);
  }

  .contents .toc-link {
    color: inherit;
    text-decoration: none;
    display: block;
    transition: color 0.2s ease;
  }

  .contents .toc-link:hover {
    color: var(--primary-color);
  }

  .no-toc {
    color: var(--grey-5);
    text-align: center;
    font-size: 0.875rem;
  }
</style>
