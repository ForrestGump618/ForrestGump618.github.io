/**
 * 按压涟漪：pointerdown 即刻在指针处扩散一枚品牌色圆环（transform/opacity，合成器友好），
 * 与点击烟花叠加成两层点击反馈；减少动画偏好下不启用。
 */
export const PRESS_RING_MS = 480;
export const PRESS_RING_MAX = 6;

export interface PressRingClickLike {
  button: number;
}

/** 仅主键按压触发；reduced 为 true 时关闭 */
export const shouldPressRing = (event: PressRingClickLike, reduced: boolean): boolean =>
  event.button === 0 && !reduced;

export function initPressRing(doc: Document, win: Window): () => void {
  const reduced = win.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) {
    return () => {};
  }

  const rings: HTMLElement[] = [];

  const onPointerDown = (event: PointerEvent) => {
    if (doc.hidden || !shouldPressRing(event, reduced.matches)) return;

    const ring = doc.createElement("span");
    ring.className = "press-ring";
    ring.setAttribute("aria-hidden", "true");
    ring.style.left = `${event.clientX}px`;
    ring.style.top = `${event.clientY}px`;
    doc.body.appendChild(ring);
    rings.push(ring);
    if (rings.length > PRESS_RING_MAX) {
      rings.shift()?.remove();
    }

    const animation = ring.animate(
      [
        { transform: "translate(-50%, -50%) scale(0.15)", opacity: 0.55 },
        { transform: "translate(-50%, -50%) scale(1)", opacity: 0 },
      ],
      { duration: PRESS_RING_MS, easing: "cubic-bezier(0.22, 0.61, 0.36, 1)" },
    );
    animation.onfinish = () => {
      ring.remove();
      const index = rings.indexOf(ring);
      if (index >= 0) rings.splice(index, 1);
    };
  };

  doc.addEventListener("pointerdown", onPointerDown, { capture: true });
  return () => {
    doc.removeEventListener("pointerdown", onPointerDown, { capture: true });
    for (const ring of rings) ring.remove();
    rings.length = 0;
  };
}
