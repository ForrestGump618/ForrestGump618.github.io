import { writable } from "svelte/store";

const STORAGE_KEY = "echo-fireworks";

function readInitial(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

/** 点击烟花开关：默认开启（恢复旧主题行为），可在悬浮工具栏关闭 */
export const fireworksEnabled = writable(readInitial());

export function toggleFireworks() {
  fireworksEnabled.update((enabled) => {
    const next = !enabled;
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {
      /* 存储不可用时仅影响本次会话 */
    }
    return next;
  });
}
