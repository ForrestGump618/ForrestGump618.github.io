export type PaginationItem = number | "…";

function clampToPositiveInteger(value: number): number {
  return Math.max(1, Math.floor(value || 1));
}

export function buildPaginationItems(currentPage: number, lastPage: number): PaginationItem[] {
  const current = clampToPositiveInteger(currentPage);
  const last = clampToPositiveInteger(lastPage);

  if (last <= 1) {
    return [1];
  }

  if (last <= 4) {
    return Array.from({ length: last }, (_, index) => index + 1);
  }

  const items: PaginationItem[] = [];
  const add = (item: PaginationItem) => {
    if (items.length === 0 || items.at(-1) !== item) {
      items.push(item);
    }
  };

  const windowStart = Math.max(2, current - 1);
  const windowEnd = Math.min(last - 1, current + 1);

  add(1);

  if (windowStart > 2) {
    add("…");
  }

  for (let page = windowStart; page <= windowEnd; page += 1) {
    add(page);
  }

  if (windowEnd < last - 1) {
    add("…");
  }

  add(last);

  return items;
}
