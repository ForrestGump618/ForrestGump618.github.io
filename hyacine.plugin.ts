import { defineConfig } from "@hyacine/core/config";

import SiteUpTime from "@hyacine/site-uptime";

export default defineConfig({
  injectPoints: {
    // 页面 head 部分，用于注入元标签、CSS 等
    head: 'slot[name="head"]',
    // 主布局容器
    layout: "#container",
    // 导航栏（navbar）
    "right-nav": "#nav",
    // 侧边栏
    sidebar: "#sidebar",
    // 页脚
    footer: "#footer",
    "footer-status": ".status",
    // 页脚小部件区域
    widgets: ".widgets",
    // 文章页脚（版权、打赏等）
    "post-footer": ".post footer",
  },

  plugins: [
    SiteUpTime({
      siteCreatedAt: "2022-08-01T00:00:00Z",
    }),
  ],
});
