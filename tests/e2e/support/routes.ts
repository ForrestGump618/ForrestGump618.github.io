export const ROUTES = {
  home: "/",
  page2: "/page/2/",
  page3: "/page/3/",
  moments: "/moments/",
  tags: "/tags/",
  categories: "/categories/",
  archives: "/archives/",
  about: "/about/",
  friends: "/friends/",
  stars: "/stars/",
} as const;

/**
 * 真实文章路由：所有文章统一为单层 URL；
 * folder-per-post 文章旧的双层 URL 会静态重定向到这里。
 */
export const POSTS = {
  helloWorld: "/posts/hello-world/",
  suwen: "/posts/eve/",
  linger: "/posts/linger从单细胞多组学数据推断基因调控网络/",
  heart: "/posts/心脏听诊总结/",
  literature: "/posts/文献阅读自上而下描述肿瘤发展的时空动力学/",
  table: "/posts/表格乳腺癌复旦分型/",
  cellSingle: "/posts/单细胞转录组分析实战一数据采集/",
} as const;

/** 旧双层 URL：构建后应为重定向页，落点是 POSTS 中对应的单层地址 */
export const LEGACY_POSTS = {
  heart: "/posts/心脏听诊总结/心脏听诊总结/",
  linger:
    "/posts/linger从单细胞多组学数据推断基因调控网络/linger从单细胞多组学数据推断基因调控网络/",
} as const;

export const SEARCH_TERMS = {
  /** 有真实配图与代码块的长文，用于阅读交互测试 */
  suwen: "素问 Suwen",
  heart: "心脏听诊总结",
  draftTitle: "深度学习笔记（九）",
} as const;
