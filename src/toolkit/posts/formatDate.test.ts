import { describe, expect, test } from "bun:test";

import { formatDateLong, formatDateMachine, formatDateShort } from "./formatDate";

const date = new Date(2024, 4, 3);

describe("日期格式化", () => {
  test("中文长格式", () => {
    expect(formatDateLong(date)).toBe("2024 年 5 月 3 日");
  });

  test("紧凑格式补零", () => {
    expect(formatDateShort(date)).toBe("2024.05.03");
  });

  test("机器可读格式", () => {
    expect(formatDateMachine(date)).toBe("2024-05-03");
  });

  test("接受 ISO 字符串", () => {
    expect(formatDateMachine("2024-05-03T10:00:00.000Z")).toBe("2024-05-03");
  });

  test("无效日期返回空串", () => {
    expect(formatDateShort("not-a-date")).toBe("");
  });
});
