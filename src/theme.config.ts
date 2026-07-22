// cannot use path alias here because unocss can not resolve it
import { defineConfig } from "./toolkit/themeConfig";

export default defineConfig({
  siteName: "Echo",
  locale: "zh-CN",

  brand: {
    title: "Echo",
    subtitle: "Learn-Record",
    logo: "",
  },

  sidebar: {
    author: "Forrest Gump",
    description: "五颜六色的生活，不能乱七八糟的过",
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
      text: "关于",
      href: "/about/",
      icon: "i-ri-user-3-line",
    },
    {
      text: "文章",
      href: "/random/",
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
            href: "/archives/",
            text: "归档",
            icon: "i-ri-archive-line",
          },
        ],
      },
    },
    {
      text: "友链",
      href: "/friends/",
      icon: "i-ri-link",
    },
    {
      text: "动态",
      href: "/moments/",
      icon: "i-ri-chat-quote-line",
    },
    {
      text: "留言板",
      href: "/guestbook/",
      icon: "i-ri-message-2-line",
    },
    {
      text: "收藏",
      href: "/stars/",
      icon: "i-ri-star-line",
    },
    {
      text: "推免信息",
      href: "/summer/",
      icon: "i-ri-sun-line",
    },
    {
      text: "统计",
      href: "/statistics/",
      icon: "i-ri-bar-chart-box-line",
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
    aiSummary: { enable: true, title: "AI 摘要", showModel: true},
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

