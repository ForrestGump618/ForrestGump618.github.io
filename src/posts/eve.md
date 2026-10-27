---
title: "Eve：科研工作从检索走到验证"
description: "Eve 的能力、工作框架和实际使用方法。"
date: 2026-10-27
tags: [科研, Agent, 生物信息学]
categories: [工具]
draft: false
---

Eve 是一个面向科研工作的桌面智能体。它把文献、实验、数据和计算环境放在同一条工作流里，适合处理需要多步执行和结果核对的任务。

<p>
  <a href="https://github.com/ForrestGump618/suwen/releases"><img alt="Eve 1.0.0" src="https://img.shields.io/badge/Eve-1.0.0-202020" /></a>
  <a href="https://github.com/ForrestGump618/suwen/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/ForrestGump618/suwen?style=flat&logo=github" /></a>
  <a href="https://github.com/ForrestGump618/suwen"><img alt="Windows" src="https://img.shields.io/badge/platform-Windows-202020" /></a>
</p>

<details>
<summary>打开功能导航</summary>

- [深度调研](#eve-能做什么)
- [实验设计](#eve-能做什么)
- [多组学处理](#eve-能做什么)
- [图表批注](#怎么使用)

</details>

## Eve 能做什么

Eve 可以检索网页、PubMed、Europe PMC 和 UniProt，阅读论文与补充材料，整理研究主张和证据。对于需要复现的工作，它会记录数据版本、代码版本、参数和运行结果，再把复现结果与论文中的数值和图表进行比较。

它也可以协助设计 PCR、qPCR、克隆和表达实验。使用 accession 和参考序列作为输入后，Eve 会整理候选引物、Tm、GC、产物坐标、特异性检查、载体连接位点、对照和验证步骤。缺少序列时会先停下来询问，不会根据基因名猜序列。

面对多组学数据，Eve 会先盘点 RNA、ATAC、蛋白组、空间组学和临床文件，再确认样本配对、基因组版本、批次和协变量。确认这些信息后，才进入 QC、标准化、整合和可视化。

## 怎么使用

安装后打开工作台，在“设置”里连接模型，再选择一个本地目录或 SSH 工作区。普通任务可以直接写在输入框里：

```text
读取 metadata.csv，检查缺失值和重复样本，并把结果图保存到 figures/。
```

深度调研可以把论文编号、复现目标和验收标准一次写清楚：

```text
调研 PMID:12345678，列出主要主张和数据来源，获取公开代码，
复现一个最小结果，并比较论文结果与复现结果的差异。
```

实验设计要提供物种、accession、实验类型和限制条件。多组学分析则建议先让 Eve 盘点目录，确认样本和版本后再开始整合。

生成的图表会出现在图库中。打开图表后可以直接勾画、写批注，再把批注作为下一条指导发给 Eve。原始图表会保留，修改结果另存为新文件。

## 工作框架

Eve 分成四层：工作区层负责本地和 SSH 文件、终端与计算环境；Agent Harness 负责模型、工具、技能、审批、检查点和恢复；科研工作流层负责调研、实验设计、多组学分析和证据登记；桌面层负责工作台、会话、上下文、团队和图库。

工具结果会回到模型，再经过验证才会标记任务完成。科研课题按阶段保存产物和证据，结题需要人工复核。这样可以把“模型说完成了”和“结果确实完成了”区分开。
