export interface NavItemType {
  /**
   * 导航项的链接地址。
   * - 可以是站内路径（如 "/"、"/posts/"）
   * - 也可以是站外 URL
   * - 对于下拉菜单来说，这是父级菜单的链接
   * - 省略时该项仅作为下拉入口按钮，不产生独立落地页
   */
  href?: string;

  /**
   * 导航项显示的文本。
   * - 在顶部导航栏中显示
   * - 支持中英文
   */
  text: string;

  /**
   * 导航项图标。
   * - 使用 Iconify Remix Icon 格式：如 "i-ri-home-line"
   * - 可选，不填则只显示文本
   * - 图标会显示在文本左侧
   */
  icon?: string;

  /**
   * 下拉菜单配置。
   * - enable：是否启用下拉菜单
   * - items：下拉菜单的子菜单项
   * - 可选，不填或 enable 为 false 时为普通链接
   */
  dropbox?: {
    enable: boolean;
    /** 子菜单项必须带链接（父级才可以省略 href 仅作入口） */
    items?: Array<NavItemType & { href: string }>;
  };
}
