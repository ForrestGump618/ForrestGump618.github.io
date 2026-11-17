import { describe, expect, it } from "bun:test";
import { createToastController, type ToastItem } from "./toast";

function createSchedulerMock() {
  let nextTimer = 1;
  const pending = new Map<number, () => void>();
  return {
    scheduler: {
      setTimeout(handler: () => void) {
        const id = nextTimer++;
        pending.set(id, handler);
        return id;
      },
      clearTimeout(id: number) {
        pending.delete(id);
      },
    },
    fire(id: number) {
      const handler = pending.get(id);
      pending.delete(id);
      handler?.();
    },
    fireAll() {
      for (const id of Array.from(pending.keys())) {
        this.fire(id);
      }
    },
    get size() {
      return pending.size;
    },
  };
}

describe("createToastController", () => {
  it("展示提示并在到期后自动移除", () => {
    const mock = createSchedulerMock();
    let rendered: readonly ToastItem[] = [];
    const controller = createToastController((toasts) => (rendered = toasts), mock.scheduler);

    const id = controller.show("已复制", "success");
    expect(rendered).toHaveLength(1);
    expect(rendered[0]).toMatchObject({ message: "已复制", tone: "success" });

    mock.fireAll();
    expect(rendered).toHaveLength(0);
    expect(controller.getToasts()).toHaveLength(0);
    expect(id).toBeGreaterThan(0);
  });

  it("同屏条数受 max 限制，超出时淘汰最旧提示", () => {
    const mock = createSchedulerMock();
    let rendered: readonly ToastItem[] = [];
    const controller = createToastController((toasts) => (rendered = toasts), mock.scheduler, {
      max: 2,
    });

    controller.show("一");
    controller.show("二");
    controller.show("三");
    expect(rendered.map((toast) => toast.message)).toEqual(["二", "三"]);
  });

  it("重复文案重置计时而不堆叠", () => {
    const mock = createSchedulerMock();
    let rendered: readonly ToastItem[] = [];
    const controller = createToastController((toasts) => (rendered = toasts), mock.scheduler);

    controller.show("已复制", "success");
    controller.show("已复制", "success");
    expect(rendered).toHaveLength(1);
    expect(mock.size).toBe(1);
  });

  it("dismiss 立即移除并清理计时器", () => {
    const mock = createSchedulerMock();
    let rendered: readonly ToastItem[] = [];
    const controller = createToastController((toasts) => (rendered = toasts), mock.scheduler);

    const id = controller.show("提示");
    controller.dismiss(id);
    expect(rendered).toHaveLength(0);
    expect(mock.size).toBe(0);
  });
});
