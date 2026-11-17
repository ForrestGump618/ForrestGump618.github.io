// cannot use path alias here because unocss can not resolve it
import { defineConfig } from "./toolkit/themeConfig";

export default defineConfig({
  siteName: "Echo",
  locale: "zh-CN",

  // 首页是聚合落地页：最新列表只展示 6 条，分页统一放在归档
  home: {
    pageSize: 6,
    featuredPostId: "eve",
  },

  brand: {
    title: "Echo",
    subtitle: "Learn-Record",
    logo: "",
  },

  sidebar: {
    author: "Forrest Gump",
    description: "我在这里整理生物信息学、医学和统计学的学习笔记，也记录自己做的开源工具。",
    social: {
      github: {
        url: "https://github.com/forrestgump618",
        icon: "i-ri-github-fill",
      },
      email: {
        url: "mailto:qingyuanzhuang2025@gmail.com",
        icon: "i-ri-mail-line",
      },
    },
  },

  nav: [
    {
      href: "/",
      text: "首页",
      icon: "i-ri-home-line",
    },
    {
      text: "文章",
      href: "/archives/",
      icon: "i-ri-quill-pen-fill",
      dropbox: {
        enable: true,
        items: [
          {
            href: "/categories/",
            text: "分类",
            icon: "i-ri-book-shelf-fill",
          },
          {
            href: "/tags/",
            text: "标签",
            icon: "i-ri-price-tag-3-fill",
          },
          {
            href: "/random/",
            text: "随机阅读",
            icon: "i-ri-dice-line",
          },
        ],
      },
    },
    {
      text: "关于",
      href: "/about/",
      icon: "i-ri-user-3-line",
    },
    {
      // 无 href：仅作为下拉入口，避免与子项重复的落地页
      text: "探索",
      icon: "i-ri-shuffle-line",
      dropbox: {
        enable: true,
        items: [
          {
            href: "/stars/",
            text: "收藏",
            icon: "i-ri-star-line",
          },
          {
            href: "/moments/",
            text: "动态",
            icon: "i-ri-chat-quote-line",
          },
          {
            href: "/guestbook/",
            text: "留言板",
            icon: "i-ri-message-2-line",
          },
          {
            href: "/friends/",
            text: "友链",
            icon: "i-ri-link",
          },
          {
            href: "/summer/",
            text: "推免信息",
            icon: "i-ri-sun-line",
          },
          {
            href: "/statistics/",
            text: "统计",
            icon: "i-ri-bar-chart-box-line",
          },
        ],
      },
    },
  ],

  comments: {
    enable: true,
    waline: {
      serverURL: "https://waline0723.vercel.app", // TODO: update with actual Waline server URL
      lang: "zh-CN",
    },
  },

  friends: {
    title: "友链",
    description: "卡片式展示，支持站点预览与主题色点缀。",
    comments: true,
    links: [
      {
        url: "https://www.52txr.cn",
        title: "陶小桃Blog",
        desc: "热衷于分享日常和技术的机械专业小哥哥~",
        author: "陶小桃",
        avatar: "/images/friends/touxiang2024.jpg",
        color: "var(--color-green)",
      },
      {
        url: "https://yuanj.top",
        title: "yuanj's blog",
        desc: "思绪来得快去得也快，偶尔会在这里停留",
        author: "yuanj",
        avatar: "/images/friends/yuanj.png",
        color: "var(--color-blue)",
      },
      {
        url: "https://xxu.do",
        title: "Jayden's site",
        desc: "为天地立心，为生民立命，为往圣继绝学，为万世开太平。",
        author: "Jayden",
        avatar: "/images/friends/Jaaayden.jpg",
        color: "var(--color-purple)",
      },
      {
        url: "https://www.wuyuankang.website/",
        title: "梦生",
        desc: "种田佬记录下生活的美好时刻",
        author: "梦生",
        avatar: "/images/friends/zhandiantubiao.jpg",
        color: "var(--color-orange)",
      },
      {
        url: "https://usehooks.site/",
        title: "prop",
        desc: "prop's blog",
        author: "prop",
        avatar: "/images/friends/prop.jpg",
        color: "var(--color-pink)",
      },
    ],
  },

  hyc: {
    enable: true,
    aiSummary: { enable: true, title: "AI 摘要", showModel: true },
    aiRecommend: { enable: true, limit: 3, minSimilarity: 0.4 },
  },

  footer: {
    since: 2023,
    icon: {
      name: "sakura rotate",
      color: "var(--color-pink)",
    },
    count: true,
    powered: true,
  },
});
