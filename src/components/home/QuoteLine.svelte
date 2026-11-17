<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { QUOTES, pickNextQuoteIndex } from "@/toolkit/ui/quotes";

  let index = $state(0);
  let fading = $state(false);
  let hydrated = $state(false);
  let timer: number | undefined;

  onMount(() => {
    hydrated = true;
  });

  const next = () => {
    if (fading) {
      return;
    }

    const target = pickNextQuoteIndex(index, Math.random);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      index = target;
      return;
    }

    fading = true;
    timer = window.setTimeout(() => {
      index = target;
      fading = false;
    }, 180);
  };

  onDestroy(() => {
    clearTimeout(timer);
  });
</script>

<p class="quote" class:is-fading={fading} aria-live="polite">
  <span class="quote__text">{QUOTES[index].text}</span>
  <span class="quote__source">—— {QUOTES[index].source}</span>
  <button
    type="button"
    class="quote__next"
    onclick={next}
    data-hydrated={hydrated ? "true" : undefined}
    aria-label="换一句"
    title="换一句"
  >
    <span class="i-ri-refresh-line" aria-hidden="true"></span>
  </button>
</p>

<style>
  .quote {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.35rem 0.6rem;
    margin: 0;
    font-family: var(--font-kai);
    font-size: var(--text-sm);
    line-height: var(--leading-snug);
    color: var(--text-color-muted);
    transition:
      opacity 180ms var(--ease-out),
      translate 180ms var(--ease-out);
  }

  .quote.is-fading {
    opacity: 0;
    translate: 0 4px;
  }

  .quote__source {
    font-size: var(--text-2xs);
    color: var(--text-color-subtle);
  }

  .quote__next {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.65rem;
    height: 1.65rem;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--text-color-subtle);
    font-size: 0.95rem;
    cursor: pointer;
    transition:
      color var(--dur-2) var(--ease-out),
      background-color var(--dur-2) var(--ease-out),
      rotate var(--dur-3) var(--ease-out);
  }

  .quote__next:hover,
  .quote__next:focus-visible {
    color: var(--primary-color);
    background: color-mix(in oklab, var(--primary-color) 10%, transparent);
    rotate: 90deg;
  }

  @media (prefers-reduced-motion: reduce) {
    .quote,
    .quote__next {
      transition: none;
    }
  }
</style>