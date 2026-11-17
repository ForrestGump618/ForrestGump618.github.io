<script lang="ts">
  import { onMount } from "svelte";

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    hue: number;
    alpha: number;
    phase: number;
  }

  const HUES = [262, 295, 200];

  let canvas = $state<HTMLCanvasElement>();
  let running = $state(true);
  let hydrated = $state(false);
  let toggleHandler: (() => void) | null = null;

  onMount(() => {
    hydrated = true;
    const element = canvas;
    if (!element) {
      return;
    }

    const ctx = element.getContext("2d");
    if (!ctx) {
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let inView = true;
    let tick = 0;
    const pointer = { x: 0, y: 0, active: false };

    const seed = () => {
      const count = Math.max(24, Math.min(70, Math.round((width * height) / 11000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: 1 + Math.random() * 1.8,
        hue: HUES[Math.floor(Math.random() * HUES.length)],
        alpha: 0.3 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const rect = element.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      element.width = Math.max(1, Math.round(width * dpr));
      element.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reduced || !running) {
        draw();
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      for (const particle of particles) {
        const twinkle = reduced ? 1 : 0.75 + 0.25 * Math.sin(tick / 40 + particle.phase);
        ctx.fillStyle = `oklch(0.62 0.13 ${particle.hue} / ${particle.alpha * twinkle})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
    };

    const step = () => {
      tick += 1;
      for (const particle of particles) {
        if (pointer.active) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 140 && distance > 0.001) {
            const force = 0.02 * (1 - distance / 140);
            particle.vx += (dx / distance) * force;
            particle.vy += (dy / distance) * force;
          }
        }

        particle.vx *= 0.985;
        particle.vy *= 0.985;
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -4) particle.x = width + 4;
        if (particle.x > width + 4) particle.x = -4;
        if (particle.y < -4) particle.y = height + 4;
        if (particle.y > height + 4) particle.y = -4;
      }

      draw();
    };

    const loop = () => {
      frame = 0;
      if (!running || !inView || document.hidden || reduced) {
        return;
      }

      step();
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (!frame && running && inView && !document.hidden && !reduced) {
        frame = requestAnimationFrame(loop);
      }
    };

    const stop = () => {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
        if (inView) {
          start();
        } else {
          stop();
        }
      },
      { threshold: 0.05 },
    );

    resize();
    observer.observe(element);
    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    if (reduced) {
      running = false;
      draw();
    } else {
      start();
    }

    toggleHandler = () => {
      running = !running;
      if (running) {
        start();
      } else {
        stop();
        draw();
      }
    };

    return () => {
      stop();
      observer.disconnect();
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  });
</script>

<div class="aurora">
  <canvas bind:this={canvas} class="aurora__canvas" aria-hidden="true"></canvas>
  <button
    type="button"
    class="aurora__toggle"
    onclick={() => toggleHandler?.()}
    data-hydrated={hydrated ? "true" : undefined}
    aria-pressed={!running}
  >
    <span class={running ? "i-ri-pause-line" : "i-ri-play-line"} aria-hidden="true"></span>
    {running ? "暂停" : "继续"}
  </button>
</div>

<style>
  .aurora {
    position: relative;
    flex: 1;
    min-height: 9.5rem;
    border: var(--hairline);
    border-radius: var(--radius-md);
    background:
      radial-gradient(60% 80% at 20% 20%, var(--aurora-blue), transparent 70%),
      radial-gradient(50% 70% at 80% 30%, var(--aurora-violet), transparent 70%),
      radial-gradient(70% 80% at 55% 90%, var(--aurora-teal), transparent 72%),
      var(--surface-raised);
    overflow: hidden;
  }

  .aurora__canvas {
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
  }

  .aurora__toggle {
    position: absolute;
    right: 0.6rem;
    bottom: 0.6rem;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.28rem 0.7rem;
    border: var(--hairline);
    border-radius: var(--radius-full);
    background: color-mix(in oklab, var(--surface-raised) 82%, transparent);
    backdrop-filter: blur(6px);
    color: var(--text-color-muted);
    font-family: var(--font-sans);
    font-size: var(--text-2xs);
    cursor: pointer;
    transition:
      color var(--dur-2) var(--ease-out),
      border-color var(--dur-2) var(--ease-out);
  }

  .aurora__toggle:hover,
  .aurora__toggle:focus-visible {
    color: var(--primary-color);
    border-color: color-mix(in oklab, var(--primary-color) 45%, transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    .aurora__toggle {
      display: none;
    }
  }
</style>