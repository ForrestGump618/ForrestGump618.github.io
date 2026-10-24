/**
 * 全站统一的日期展示格式，避免首页、归档、文章页各自 toLocaleString。
 */

const pad = (input: number) => String(input).padStart(2, "0");

/** 中文长格式：2024 年 5 月 3 日 */
export function formatDateLong(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return `${value.getFullYear()} 年 ${value.getMonth() + 1} 月 ${value.getDate()} 日`;
}

/** 紧凑格式（列表/元信息）：2024.05.03 */
export function formatDateShort(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return `${value.getFullYear()}.${pad(value.getMonth() + 1)}.${pad(value.getDate())}`;
}

/** 机器可读格式：2024-05-03 */
export function formatDateMachine(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}
