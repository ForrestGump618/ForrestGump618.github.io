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