/**
 * 点击烟花：恢复旧主题 Mouse-firework 的交互趣味，改用品牌色相重绘。
 * 纯函数部分（spawnBurst / stepParticle）独立可测；DOM 部分只在浏览器运行。
 */

export interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  ttl: number;
  hue: number;
  size: number;
}

/** 品牌色相（HSL 角度）：蓝 / 紫 / 青 / 靛 + 一点暖琥珀做火花 */
export const FIREWORK_HUES = [243, 288, 196, 222, 42];

const GRAVITY = 340;
const DRAG = 1.7;

export function spawnBurst(
  x: number,
  y: number,
  rand: () => number = Math.random,
  count = 26,
): FireworkParticle[] {
  const particles: FireworkParticle[] = [];
  for (let i = 0; i < count; i += 1) {
    const angle = rand() * Math.PI * 2;
    const speed = 90 + rand() * 210;
    const ttl = 0.65 + rand() * 0.55;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 40,
      life: ttl,
      ttl,
      hue: FIREWORK_HUES[Math.floor(rand() * FIREWORK_HUES.length)] ?? 243,
      size: 1.4 + rand() * 1.9,
    });
  }
  return particles;
}

/** 推进一帧（dt 秒），返回粒子是否仍存活 */
export function stepParticle(p: FireworkParticle, dt: number): boolean {
  const damp = Math.exp(-DRAG * dt);
  p.vx *= damp;
  p.vy = p.vy * damp + GRAVITY * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.life -= dt;
  return p.life > 0;
}

export interface FireworksOptions {
  /** 每次点击时询问是否启用（工具栏开关） */
  isEnabled?: () => boolean;
}

export function initFireworks(
  doc: Document,
  win: Window,
  options: FireworksOptions = {},
): () => void {
  const reduced = win.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) {
    return () => {};
  }

  const canvas = doc.createElement("canvas");
  canvas.className = "fireworks-canvas";
  canvas.setAttribute("aria-hidden", "true");
  doc.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return () => {};
  }

  let particles: FireworkParticle[] = [];
  let raf = 0;
  let last = 0;
  let dpr = 1;

  const resize = () => {
    dpr = Math.min(win.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(win.innerWidth * dpr);
    canvas.height = Math.floor(win.innerHeight * dpr);
    canvas.style.width = `${win.innerWidth}px`;
    canvas.style.height = `${win.innerHeight}px`;
  };

  const draw = (now: number) => {
    const dt = Math.min((now - last) / 1000 || 0.016, 0.033);
    last = now;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, win.innerWidth, win.innerHeight);
    ctx.globalCompositeOperation = "lighter";

    particles = particles.filter((p) => stepParticle(p, dt));
    for (const p of particles) {
      const alpha = Math.max(p.life / p.ttl, 0);
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 86%, ${58 + alpha * 12}%, ${alpha})`;
      ctx.arc(p.x, p.y, p.size * (0.5 + alpha * 0.7), 0, Math.PI * 2);
      ctx.fill();
    }

    if (particles.length > 0) {
      raf = win.requestAnimationFrame(draw);
    } else {
      raf = 0;
      ctx.clearRect(0, 0, win.innerWidth, win.innerHeight);
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    if (doc.hidden || reduced.matches) return;
    if (options.isEnabled && !options.isEnabled()) return;

    particles.push(...spawnBurst(event.clientX, event.clientY));
    // 上限保护：连点时丢弃最旧的粒子，避免帧预算失控
    if (particles.length > 420) {
      particles = particles.slice(particles.length - 420);
    }
    if (!raf) {
      last = win.performance.now();
      raf = win.requestAnimationFrame(draw);
    }
  };

  resize();
  win.addEventListener("resize", resize, { passive: true });
  doc.addEventListener("pointerdown", onPointerDown);

  return () => {
    win.removeEventListener("resize", resize);
    doc.removeEventListener("pointerdown", onPointerDown);
    if (raf) win.cancelAnimationFrame(raf);
    particles = [];
    canvas.remove();
  };
}
