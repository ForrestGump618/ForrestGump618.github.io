/**
 * 文章封面登记表（图片与封面体系 Phase 1）。
 *
 * 每篇文章显式登记一种封面策略，渲染层不再随机取 stock 图：
 * - kind: "scientific" / "illustration" —— 使用文章正文真实图片（image 相对 src/ 根）；
 * - kind: "typographic" —— 排版式文字封面，tones 为纸色/墨色两色（低饱和），kicker 为短标签；
 * - kind: "none" —— 纯文字卡，不渲染封面块。
 *
 * 说明：kind 为 scientific/illustration 的条目 image 字段已与该文 frontmatter.cover 对齐；
 * 渲染优先级（frontmatter 覆盖 > 本表 > typographic 派生）由 toolkit/covers/resolveCover 实现。
 */
import type { CoverSpec } from "@/toolkit/covers/types";

export const postCovers: Record<string, CoverSpec> = {
  HEXO博客的轮播栏: {
    kind: "typographic",
    kicker: "开源 · 主题",
    tones: ["#eceef1", "#39434c"] as const,
  },
  "Hello World！": { kind: "none" },
  "LINGER：从单细胞多组学数据推断基因调控网络/LINGER：从单细胞多组学数据推断基因调控网络": {
    kind: "scientific",
    image: "posts/LINGER：从单细胞多组学数据推断基因调控网络/LINGER.png",
    alt: "LINGER 模型流程图：bulk 数据预训练与单细胞数据调控网络推断",
    caption: "论文方法总览：预训练模块与单细胞推断模块",
    credit: "文章原图",
    mode: "fit",
    band: true,
  },
  "celltogwas：细胞类型注释到基因组的工具包": {
    kind: "typographic",
    kicker: "生信 · 工具",
    tones: ["#e7ebec", "#3b4547"] as const,
  },
  "scDRS：基于GWAS和scRNA评估细胞类型和生物学过程的疾病相关性": {
    kind: "typographic",
    kicker: "生信 · 工具",
    tones: ["#e9ede6", "#3d4a41"] as const,
  },
  "scPagwas——整合scRNA和GWAS识别疾病的驱动基因和关键细胞类型": {
    kind: "typographic",
    kicker: "生信 · 工具",
    tones: ["#e7ebec", "#3b4547"] as const,
  },
  "suwen-2-1-0/suwen-2-1-0": {
    kind: "scientific",
    image: "posts/suwen-2-1-0/workbench-light.png",
    alt: "素问 Suwen 工作台主界面（浅色主题）",
    caption: "素问 Suwen 工作台：对话、变量、文件与任务共享同一作用域",
    credit: "素问仓库截图（Apache-2.0）",
    mode: "fit",
  },
  "Eve：科研工作台与使用方法": {
    kind: "scientific",
    image:
      "https://raw.githubusercontent.com/ForrestGump618/suwen/eve-v1.4.0/docs/verification/literature-1.4.0/dashboard-desktop.png",
    alt: "Eve 科研工作台研究总览：课题进度、运行质量、Token 趋势与后续计划",
    caption: "Eve 1.4.0 研究总览：课题、运行、资源用量与后续计划",
    credit: "Eve 1.4.0 验收截图",
    mode: "fit",
    band: true,
  },
  "【转载文章】影像组学的研究思路": {
    kind: "typographic",
    kicker: "转载 · 影像组学",
    tones: ["#e9ede6", "#3d4a41"] as const,
  },
  "一起来感受数据之美吧！": {
    kind: "typographic",
    kicker: "随笔 · 数据",
    tones: ["#f4efe7", "#3a3733"] as const,
  },
  乳腺癌组学资源: {
    kind: "typographic",
    kicker: "生信 · 资源",
    tones: ["#e9ede6", "#3d4a41"] as const,
  },
  产科学疾病诊断: {
    kind: "typographic",
    kicker: "医学课程 · 产科",
    tones: ["#efe9e4", "#4f463d"] as const,
  },
  从医行公众号内容整理: {
    kind: "typographic",
    kicker: "医学课程 · 整理",
    tones: ["#f1e8e2", "#5a443a"] as const,
  },
  医学心理学总结: {
    kind: "typographic",
    kicker: "医学课程 · 心身",
    tones: ["#efe9e4", "#4f463d"] as const,
  },
  "单细胞分析的最佳实践-概要": {
    kind: "typographic",
    kicker: "肿瘤学 · 分型",
    tones: ["#f3e9ea", "#513a42"] as const,
  },
  "单细胞转录组分析实战（一）：数据采集/单细胞转录组分析实战（一）：数据采集": {
    kind: "scientific",
    image: "posts/单细胞转录组分析实战（一）：数据采集/1.png",
    alt: "PBMC 样本临床信息表（Cell barcode、Sample、Efficacy、细胞类型等）",
    caption: "样本临床信息与分群结果表",
    credit: "文章原图",
    mode: "fit",
  },
  "单细胞转录组分析实战（二）：质控、数据变换和降维/单细胞转录组分析实战（二）：质控、数据变换和降维":
    {
      kind: "scientific",
      image: "posts/单细胞转录组分析实战（二）：质控、数据变换和降维/1.png",
      alt: "样本元数据表（Meta data：barcode、样本、组织、处理组、基因数、细胞类型等）",
      caption: "Meta data 表：质控前的样本元数据",
      credit: "文章原图",
      mode: "fit",
    },
  "卡尔·马克思：青年在选择职业时的考虑": {
    kind: "typographic",
    kicker: "随笔 · 摘录",
    tones: ["#efe9dd", "#4e4636"] as const,
  },
  "口腔科学总结/口腔科学总结": {
    kind: "illustration",
    image: "posts/口腔科学总结/a.png",
    alt: "牙体牙髓病诊疗路径思维导图",
    caption: "牙体牙髓病诊疗路径思维导图",
    credit: "文章原图",
    mode: "fit",
  },
  "回忆杀——初中的随笔": {
    kind: "typographic",
    kicker: "随笔 · 回忆",
    tones: ["#f4efe7", "#3a3733"] as const,
  },
  "基于NLP的密钥解码工具：Ciphey/基于NLP的密钥解码工具：Ciphey": {
    kind: "illustration",
    image: "posts/基于NLP的密钥解码工具：Ciphey/index.gif",
    alt: "Ciphey 命令行解码使用示例（动态图）",
    caption: "Ciphey 使用示例（动图）",
    credit: "文章原图",
    mode: "fit",
  },
  "大四课程资源（持续更新）": {
    kind: "typographic",
    kicker: "医学课程 · 资源",
    tones: ["#efe9e4", "#4f463d"] as const,
  },
  孟德尔随机化标准流程代码示例: {
    kind: "typographic",
    kicker: "流行病学 · 方法",
    tones: ["#eef0f1", "#39434c"] as const,
  },
  "实操：把chatGPT接入智能音箱？": {
    kind: "typographic",
    kicker: "随笔 · 折腾",
    tones: ["#efe9dd", "#4e4636"] as const,
  },
  常见的随机变量分布: {
    kind: "typographic",
    kicker: "统计学 · 分布",
    tones: ["#e9ece9", "#3f4840"] as const,
  },
  心律失常治疗方式总结: {
    kind: "typographic",
    kicker: "医学课程 · 心律",
    tones: ["#f1e8e2", "#5a443a"] as const,
  },
  "心电图基础参数/心电图基础参数": {
    kind: "scientific",
    image: "posts/心电图基础参数/1.png",
    alt: "心电轴六轴系统示意图（I、II、III、aVR、aVL、aVF 角度关系）",
    caption: "心电轴六轴系统",
    credit: "文章原图",
    mode: "fit",
  },
  "心脏听诊总结/心脏听诊总结": {
    kind: "scientific",
    image: "posts/心脏听诊总结/听诊区.png",
    alt: "心脏瓣膜解剖部位及瓣膜听诊区示意图",
    caption: "心脏瓣膜解剖部位与听诊区（M、A、E、P、T）",
    credit: "文章原图",
    mode: "fit",
    band: true,
  },
  "提升医学研究的严谨性：准确使用统计学": {
    kind: "typographic",
    kicker: "统计学 · 严谨性",
    tones: ["#e7eaf0", "#39465a"] as const,
  },
  "文献阅读：肿瘤单基因研究思路": {
    kind: "typographic",
    kicker: "文献阅读 · 单基因",
    tones: ["#e9ede6", "#3d4a41"] as const,
  },
  "文献阅读：自上而下描述肿瘤发展的时空动力学/文献阅读：自上而下描述肿瘤发展的时空动力学": {
    kind: "scientific",
    image: "posts/文献阅读：自上而下描述肿瘤发展的时空动力学/fx1.jpg",
    alt: "肿瘤时空动力学图形摘要：影像学进展、肿瘤体积演变、内在与外在屏障及肺多细胞生态型",
    caption: "论文图形摘要（Graphical Abstract）",
    credit: "文章原图",
    mode: "fit",
    band: true,
  },
  朴素贝叶斯法: {
    kind: "typographic",
    kicker: "机器学习 · 贝叶斯",
    tones: ["#f0efec", "#41403d"] as const,
  },
  "深度学习笔记（一）：线性回归": {
    kind: "typographic",
    kicker: "深度学习 · 01",
    tones: ["#e6e8e6", "#394039"] as const,
  },
  "深度学习笔记（七）：分布偏移": {
    kind: "typographic",
    kicker: "深度学习 · 07",
    tones: ["#e6e8e6", "#394039"] as const,
  },
  "深度学习笔记（三）：PyTorch 实现 Softmax 回归": {
    kind: "typographic",
    kicker: "深度学习 · 03",
    tones: ["#e6e8e6", "#394039"] as const,
  },
  "深度学习笔记（九）：卷积和卷积神经网络": {
    kind: "typographic",
    kicker: "深度学习 · 09",
    tones: ["#f0efec", "#41403d"] as const,
  },
  "深度学习笔记（二）：PyTorch实现线性回归": {
    kind: "typographic",
    kicker: "深度学习 · 02",
    tones: ["#ececec", "#3a3a3a"] as const,
  },
  "深度学习笔记（五）：权重衰减": {
    kind: "typographic",
    kicker: "深度学习 · 05",
    tones: ["#ececec", "#3a3a3a"] as const,
  },
  "深度学习笔记（八）：块和层": {
    kind: "typographic",
    kicker: "深度学习 · 08",
    tones: ["#e6e8e6", "#394039"] as const,
  },
  "深度学习笔记（六）：暂退法": {
    kind: "typographic",
    kicker: "深度学习 · 06",
    tones: ["#e6e8e6", "#394039"] as const,
  },
  "深度学习笔记（十）：批量归一化": {
    kind: "typographic",
    kicker: "深度学习 · 10",
    tones: ["#ececec", "#3a3a3a"] as const,
  },
  "深度学习笔记（四）：多层感知机": {
    kind: "typographic",
    kicker: "深度学习 · 04",
    tones: ["#ececec", "#3a3a3a"] as const,
  },
  焦虑抑郁相关多组学研究资源: {
    kind: "typographic",
    kicker: "生信 · 资源",
    tones: ["#e7ebec", "#3b4547"] as const,
  },
  生物信息学教程和资源聚合: {
    kind: "typographic",
    kicker: "生信 · 资源",
    tones: ["#e7ebec", "#3b4547"] as const,
  },
  "生物信息学笔记（一）：转录组测序技术/生物信息学笔记（一）：转录组测序技术": {
    kind: "scientific",
    image: "posts/生物信息学笔记（一）：转录组测序技术/1.png",
    alt: "NEB Next RNA 文库接头连接、U 切除与 PCR 富集流程示意图",
    caption: "NEB Next RNA 文库构建流程",
    credit: "文章原图",
    mode: "fit",
  },
  "生物信息学笔记（三）：基因定量": {
    kind: "typographic",
    kicker: "生信 · 定量",
    tones: ["#e9ede6", "#3d4a41"] as const,
  },
  "生物信息学笔记（二）：数据变换": {
    kind: "typographic",
    kicker: "生信 · 变换",
    tones: ["#e9ede6", "#3d4a41"] as const,
  },
  "网络爬虫自动获取教务处最新通知/网络爬虫自动获取教务处最新通知": {
    kind: "illustration",
    image: "posts/网络爬虫自动获取教务处最新通知/1.png",
    alt: "脚本自动推送教务处通知邮件效果截图",
    caption: "脚本运行效果：教务处通知公告邮件",
    credit: "文章原图",
    focus: "50% 50%",
    mode: "fit",
  },
  "耳鼻咽喉头颈外科学主要知识总结/耳鼻咽喉头颈外科学主要知识总结": {
    kind: "scientific",
    image: "posts/耳鼻咽喉头颈外科学主要知识总结/a.png",
    alt: "内耳骨迷路解剖示意图（中英双语标注）",
    caption: "内耳骨迷路解剖（原图仅 196×185，封面显示尺寸偏小）",
    credit: "文章原图",
    mode: "fit",
  },
  能解答一切的答案: {
    kind: "typographic",
    kicker: "随笔 · 答案",
    tones: ["#f4efe7", "#3a3733"] as const,
  },
  "表格：乳腺癌复旦分型": {
    kind: "typographic",
    kicker: "肿瘤学 · 分型",
    tones: ["#f3e9ea", "#513a42"] as const,
  },
  记录的目的: {
    kind: "typographic",
    kicker: "随笔 · 记录",
    tones: ["#f4efe7", "#3a3733"] as const,
  },
};
