<script lang="ts">
  import { gradeReaction, formatReactionMs, reactionDelayMs } from "@/toolkit/ui/reaction";
  import { onDestroy, onMount } from "svelte";

  type Phase = "idle" | "waiting" | "ready" | "result" | "early";

  const BEST_KEY = "echo-reaction-best";

  let phase = $state<Phase>("idle");
  let elapsed = $state(0);
  let best = $state<number | null>(null);
  let hydrated = $state(false);
  let readyAt = 0;
  let timer: number | undefined;

  const grade = $derived(gradeReaction(elapsed));

  onMount(() => {
    hydrated = true;
    try {
      const raw = window.localStorage.getItem(BEST_KEY);
      const parsed = raw === null ? NaN : Number(raw);
      best = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    } catch {
      best = null;
    }
  });

  const start = () => {
    window.clearTimeout(timer);
    phase = "waiting";
    timer = window.setTimeout(() => {
      readyAt = performance.now();
      phase = "ready";
    }, reactionDelayMs(Math.random));
  };

  const hit = () => {
    if (phase === "waiting") {
      window.clearTimeout(timer);
      phase = "early";
      return;
    }

    if (phase === "ready") {
      elapsed = performance.now() - readyAt;
      if (best === null || elapsed < best) {
        best = elapsed;
        try {
          window.localStorage.setItem(BEST_KEY, String(Math.round(elapsed)));
        } catch {
          /* 存储不可用时仅保留本次成绩 */
        }
      }

      phase = "result";
      return;
    }

    start();
  };

  onDestroy(() => {
    clearTimeout(timer);
  });
</script>

<div class="reaction">
  <button
    type="button"
    class="reaction__pad"
    data-phase={phase}
    data-hydrated={hydrated ? "true" : undefined}
    onclick={hit}
  >
    {#if phase === "idle"}
      <span class="reaction__line">反应速度测试</span>
      <span class="reaction__sub">点击开始，变绿后再点击</span>
    {:else if phase === "waiting"}
      <span class="reaction__line">等待绿色…</span>
      <span class="reaction__sub">提前点击会判犯规</span>
    {:else if phase === "ready"}
      <span class="reaction__line">点击！</span>
    {:else if phase === "early"}
      <span class="reaction__line">太早了</span>
      <span class="reaction__sub">点击重新开始</span>
    {:else}
      <span class="reaction__line">{formatReactionMs(elapsed)}</span>
      <span class="reaction__sub">{grade.label} · {grade.comment}</span>
    {/if}
  </button>
  <p class="reaction__best" aria-live="polite">
    {best !== null ? `最佳 ${formatReactionMs(best)}` : "尚无记录"}
  </p>
</div>

<style>
  .reaction {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    height: 100%;
  }

  .reaction__pad {
    display: grid;
    place-items: center;
    gap: 0.3rem;
    flex: 1;
    min-height: 9.5rem;
    padding: 1rem;
    border: var(--hairline);
    border-radius: var(--radius-md);
    background: var(--surface-tinted);
    color: var(--text-color);
    font-family: var(--font-sans);
    cursor: pointer;
    transition:
      background-color var(--dur-2) var(--ease-out),
      border-color var(--dur-2) var(--ease-out),
      scale var(--dur-1) var(--ease-press);
  }

  .reaction__pad:active {
    scale: 0.98;
  }

  .reaction__pad[data-phase="waiting"] {
    background: color-mix(in oklab, var(--color-orange) 14%, var(--surface-raised));
    border-color: color-mix(in oklab, var(--color-orange) 40%, transparent);
  }

  .reaction__pad[data-phase="ready"] {
    background: var(--color-green);
    border-color: var(--color-green);
    color: oklch(1 0 0);
  }

  .reaction__pad[data-phase="early"] {
    background: color-mix(in oklab, var(--color-red) 12%, var(--surface-raised));
    border-color: color-mix(in oklab, var(--color-red) 40%, transparent);
  }

  .reaction__pad[data-phase="result"] {
    background: color-mix(in oklab, var(--primary-color) 10%, var(--surface-raised));
    border-color: color-mix(in oklab, var(--primary-color) 40%, transparent);
  }

  .reaction__line,
  .reaction__sub {
    animation: reaction-in var(--dur-3) var(--ease-out) both;
  }

  .reaction__line {
    font-family: var(--font-serif);
    font-size: 1.35rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .reaction__sub {
    font-size: var(--text-2xs);
    opacity: 0.82;
  }

  .reaction__best {
    margin: 0;
    font-family: var(--font-sans);
    font-size: var(--text-2xs);
    font-variant-numeric: tabular-nums;
    color: var(--text-color-subtle);
    text-align: right;
  }

  @keyframes reaction-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }

    to {
      opacity: 1;
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .reaction__pad,
    .reaction__line,
    .reaction__sub {
      transition: none;
      animation: none;
    }
  }
</style>