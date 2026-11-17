/** 页面滚动进度（0 → 1），用于导航底部的品牌渐变进度条。 */
export const computeScrollProgress = (
  scrollY: number,
  scrollHeight: number,
  clientHeight: number,
): number => {
  const scrollable = scrollHeight - clientHeight;
  if (scrollable <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, scrollY / scrollable));
};
