/**
 * 轻量 Toast：微反馈提示（复制成功/失败等），屏幕阅读器通过 aria-live 播报。
 * 控制器与 DOM 渲染分离，控制器可独立单元测试。
 */

export type ToastTone = "info" | "success" | "error";

export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

export interface ToastScheduler {
  setTimeout(handler: () => void, ms: number): number;
  clearTimeout(id: number): void;
}

export interface ToastControllerOptions {
  /** 同屏最多展示条数 */
  max?: number;
  /** 展示时长（毫秒） */
  duration?: number;
}

export function createToastController(
  render: (toasts: readonly ToastItem[]) => void,
  scheduler: ToastScheduler,
  options: ToastControllerOptions = {},
) {
  const max = options.max ?? 3;
  const duration = options.duration ?? 2600;

  let toasts: ToastItem[] = [];
  let nextId = 1;
  const timers = new Map<number, number>();

  const dismiss = (id: number) => {
    const timer = timers.get(id);
    if (timer !== undefined) {
      scheduler.clearTimeout(timer);
      timers.delete(id);
    }
    toasts = toasts.filter((toast) => toast.id !== id);
    render(toasts);
  };

  const show = (message: string, tone: ToastTone = "info") => {
    // 相同文案重复触发时重置计时，而不是堆叠重复提示
    const existing = toasts.find((toast) => toast.message === message && toast.tone === tone);
    if (existing) {
      dismiss(existing.id);
    }

    const item: ToastItem = { id: nextId++, message, tone };
    const next = [...toasts, item];
    // 淘汰最旧提示时同步清理其计时器
    for (const dropped of next.slice(0, Math.max(0, next.length - max))) {
      const timer = timers.get(dropped.id);
      if (timer !== undefined) {
        scheduler.clearTimeout(timer);
        timers.delete(dropped.id);
      }
    }
    toasts = next.slice(-max);
    render(toasts);
    timers.set(
      item.id,
      scheduler.setTimeout(() => dismiss(item.id), duration),
    );
    return item.id;
  };

  return { show, dismiss, getToasts: () => toasts };
}

let browserController: ReturnType<typeof createToastController> | null = null;

function ensureRegion(doc: Document): HTMLElement {
  let region = doc.querySelector<HTMLElement>(".toast-region");
  if (!region) {
    region = doc.createElement("div");
    region.className = "toast-region";
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    doc.body.append(region);
  }
  return region;
}

/** 浏览器端单例入口：在页面任意位置调用即可弹出提示 */
export function showToast(message: string, tone: ToastTone = "info") {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  browserController ??= createToastController(
    (toasts) => {
      const region = ensureRegion(document);
      region.replaceChildren(
        ...toasts.map((toast) => {
          const el = document.createElement("div");
          el.className = `toast toast--${toast.tone}`;
          el.textContent = toast.message;
          return el;
        }),
      );
    },
    {
      setTimeout: (handler, ms) => window.setTimeout(handler, ms),
      clearTimeout: (id) => window.clearTimeout(id),
    },
  );

  browserController.show(message, tone);
}
