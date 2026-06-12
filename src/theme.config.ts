// cannot use path alias here because unocss can not resolve it
import { defineConfig } from "./toolkit/themeConfig";

export default defineConfig({
  analytics: {
    googleAnalytics: {
      // GA4 衡量 ID，例如 "G-XXXXXXXXXX"；留空则不注入 GA 脚本
      measurementId: "",
    },
    umami: {
      // Umami 网站 ID；留空则不注入 Umami 脚本
      websiteId: "",
      // Umami 追踪脚本地址；留空时使用官方云端脚本
      scriptUrl: "",
    },
  },
});
