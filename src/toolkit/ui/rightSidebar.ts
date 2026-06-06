export const RIGHT_SIDEBAR_CARD_ORDER = [
  "announcement",
  "search",
  "calendar",
  "recentMoments",
  "randomPosts",
  "tagCloud",
] as const;

export type RightSidebarCardKey = (typeof RIGHT_SIDEBAR_CARD_ORDER)[number];

export function normalizeRightSidebarCardOrder(
  configuredOrder?: ReadonlyArray<string>,
): RightSidebarCardKey[] {
  const explicitOrder = Array.isArray(configuredOrder) ? configuredOrder : [];

  return [
    ...explicitOrder.filter(
      (key, index, array): key is RightSidebarCardKey =>
        (RIGHT_SIDEBAR_CARD_ORDER as readonly string[]).includes(key) &&
        array.indexOf(key) === index,
    ),
    ...RIGHT_SIDEBAR_CARD_ORDER.filter((key) => !explicitOrder.includes(key)),
  ];
}

export function truncateRightSidebarText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
}
