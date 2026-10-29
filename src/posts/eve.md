---
title: "Eve：科研工作台与使用方法"
description: "Eve 的能力、工作框架和实际使用方法。"
date: 2026-10-27
tags: [科研, Agent, 生物信息学]
categories: [工具]
draft: false
updated: 2026-10-30
---

Eve 是一个面向科研工作的桌面智能体。它把文献、实验、数据和计算环境放在同一条可追溯的工作流里，帮助研究者从问题出发，完成资料整理、分析执行、结果核验和报告交付。

<div class="eve-badges">
  <a href="https://github.com/ForrestGump618/suwen/releases/tag/eve-v1.5.0"><img alt="Release 1.5.0" src="https://img.shields.io/badge/release-1.5.0-202020"></a>
  <a href="https://github.com/ForrestGump618/suwen/releases"><img alt="Windows x64" src="https://img.shields.io/badge/platform-Windows_x64-202020"></a>
  <a href="https://github.com/ForrestGump618/suwen/blob/eve-v1.5.0/LICENSE"><img alt="License" src="https://img.shields.io/badge/license-MIT_/_Apache--2.0-202020"></a>
  <a href="https://github.com/ForrestGump618/suwen/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/ForrestGump618/suwen?style=flat&logo=github"></a>
</div>

> Eve 1.5.0 已提供 Windows x64 安装包。安装包未签名，Windows SmartScreen 可能提示；下载后请用 Release 中的 SHA-256 校验。

| 研究总览 | 文献雷达 | 许愿式科研 | 深度调研 | 实验设计 | 多组学 | 工作区 | 图表批注 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 进度、Token、耗时、计划 | 检索、评分、反思、技能候选 | 证据链推进与人工复核 | 论文、数据、代码、复现 | 引物、载体、对照、验证 | RNA、ATAC、蛋白、空间 | 本地、SSH、PowerShell | 勾画、批注、局部修改 |

<div class="eve-quick-links">
  <a href="#研究总览">研究总览</a>
  <a href="#文献雷达">文献雷达</a>
  <a href="#许愿式科研">许愿式科研</a>
  <a href="#深度调研">深度调研</a>
  <a href="#实验设计">实验设计</a>
  <a href="#多组学数据处理">多组学</a>
  <a href="#7-图表批注">图表批注</a>
</div>

<details>
<summary>快速选择入口</summary>

| 我想做什么 | 从哪里开始 |
| --- | --- |
| 看课题、运行、Token 和后续计划 | [研究总览](#研究总览) |
| 检索文献、投喂 PDF 或审核方法候选 | [文献雷达](#文献雷达) |
| 从一句研究目标建立持久项目 | [许愿式科研](#许愿式科研) |
| 读懂并复现一篇论文 | [深度调研](#深度调研) |
| 设计 PCR、qPCR 或克隆方案 | [实验设计](#实验设计) |
| 分析 RNA、ATAC、蛋白或空间数据 | [多组学数据处理](#多组学数据处理) |
| 修改已经生成的图表 | [图表批注](#7-图表批注) |
| 把研究方案或模块关系整理成交互页面 | [交互图解](#交互图解) |

</details>

<details>
<summary>点击查看一条科研任务如何流转</summary>

```mermaid
flowchart LR
  A[问题] --> B[资料与数据]
  B --> C[工作区执行]
  C --> D[结果与图表]
  D --> E[证据核验]
  E --> F[报告或下一步实验]
```

</details>

<details>
<summary>30 秒上手清单</summary>

- [ ] 从 [Eve 1.5.0 Release](https://github.com/ForrestGump618/suwen/releases/tag/eve-v1.5.0) 下载并安装 Windows x64 安装包
- [ ] 在“设置 → 模型连接”保存一个可用模型
- [ ] 选择本地目录或 SSH 工作区
- [ ] 在研究总览查看课题、运行与后续计划
- [ ] 在输入框发送一个只读任务
- [ ] 在“运行轨迹”检查工具结果和证据

</details>

### 安装体验

Windows 安装与卸载共六个页面已统一为 Eve 自有界面：欢迎、安装进度、安装完成、卸载确认、卸载进度和卸载完成。页面使用与主程序一致的中性灰、单一蓝色强调色、中文排版和主次操作层级，标准 Windows 向导页面与 `Back / Next / Cancel` 按钮不再显示。

<figure class="md-figure">
  <img
    src="https://raw.githubusercontent.com/ForrestGump618/suwen/eve-v1.5.0/docs/verification/installer-1.5.0/installer-welcome.png"
    alt="Eve 1.5.0 自定义 Windows 安装欢迎页"
    loading="lazy"
  />
  <figcaption>Eve 1.5.0 安装欢迎页：逐用户安装，可选择目录。</figcaption>
</figure>

<figure class="md-figure">
  <img
    src="https://raw.githubusercontent.com/ForrestGump618/suwen/eve-v1.5.0/docs/verification/installer-1.5.0/installer-finish.png"
    alt="Eve 1.5.0 自定义 Windows 安装完成页"
    loading="lazy"
  />
  <figcaption>安装完成页可直接打开 Eve；卸载时保留科研项目、技能、记忆和设置。</figcaption>
</figure>

安装器底层仍由 NSIS 和 Win32 API 承载窗口、文件写入与卸载流程；这里替换的是用户可见的标准向导外观和原生按钮。它不等于零 Win32，也不是对安装包签名或 SmartScreen 的替代。

## 能做什么

### 研究总览

启动后先进入「研究总览」。首页把当前课题、运行质量、Token 与耗时趋势、最近会话、最近运行、后续计划和待确认经验建议放在同一页，不暴露原始 JSON。

趋势图支持 7 天与 30 天切换，以及 Token、请求数、平均耗时和估算成本四种指标。鼠标悬停或键盘聚焦数据点可查看当天数值；课题卡显示阶段完成比例、当前阶段、阻塞数和下一步，并可进入对应科研愿望。

<details>
<summary>研究总览的数据从哪里来</summary>

页面只读取现有运行、会话、科研愿望和模型用量的聚合投影，不会因为打开首页而启动任务。没有记录的日期显示为零；没有配置模型价格时，成本保持“未配置”，不伪造估算值。

</details>

### 文献雷达

「文献」页从 Europe PMC、OpenAlex、bioRxiv 和 arXiv 收集候选文献，按主题相关、时效、期刊、跨学科方法和先验工作接地的新颖性排序。研究论文、综述、方法论文和观点文章分开标记。

<figure class="md-figure">
  <img
    src="https://raw.githubusercontent.com/ForrestGump618/suwen/eve-v1.5.0/docs/verification/wet-lab-1.5.0/literature-desktop.png"
    alt="Eve 文献雷达：今日指标、检索条件、文献卡片与审阅入口"
    loading="lazy"
  />
  <figcaption>来源：Eve 1.5.0 真实 Edge 验收截图，数据来自本地测试 fixture，不代表真实数据库检索结果。</figcaption>
</figure>

支持投喂 PDF、审核反思和技能候选、评论每日文献动态，以及把有价值的思考转入对话。新方法默认成为停用的孤立技能节点，只有用户启用并在真实任务中成功使用后，执行反馈才强化技能图连接。

<details>
<summary>文献评分与技能边界</summary>

接地新颖性只在检索到发表时间更早的先验工作时计算；找不到先验工作或只有年份、月份时保持未评分。跨学科检索使用拓扑数据分析、网络科学、因果推断、信息论、动力系统等桥接概念，而不是泛化订阅数学或物理分类。

辅助模型可按 `literature.embedding`、`literature.extraction`、`literature.classification`、`reflection.reasoning` 和 `skill.extraction` 分别配置；未配置时沿用角色模型或主模型。

</details>

### 许愿式科研

在聊天中直接说出研究目标，或进入「科研与证据 → 许愿式科研」。Eve 会建立持久项目，按证据依赖推进资源侦察、证据矩阵、可证伪假设、预注册、分析、实验设计和图表。

```text
我想研究肿瘤微环境中的细胞通讯如何影响免疫治疗响应。
请先盘点可用公共数据与文献证据，再提出可以证伪的假设和实施计划。
```

每个愿望使用独立工作区，数据、分析代码、实验设计、图表、报告和溯源记录分开归档。模型只有在真实产物落盘后才会登记阶段；最终结题必须由用户复核，模型不能代替用户结题。连续推进运行在现有持久任务内，失败、阻塞、审批或人工复核会停止。

### 做梦与经验整理

「设置 → 做梦与经验整理」默认关闭。用户主动开启后，Eve 可以回顾当前工作区的脱敏会话与记忆，提取重复出现的错误、有效工作流和团队偏好，形成待审候选：

- 记忆候选进入可检索知识库。
- 技能草稿保持停用，需用户确认后再测试。
- 后续课题保持未启动，由用户决定是否推进。
- 每条候选保留证据和适用范围，不接受无来源的“经验”。

经验整理只生成建议，不会在后台修改主任务，也不会把一次会话中的偶然做法自动升级为长期规则。

### 科学工作台

在「科研与证据 → 科学工作台」选择研究流程。文献、遗传变异、靶点药物、结构序列、分子设计、测序、单细胞、蛋白代谢组、仪器数据和实验设计使用同一个任务执行框架，结果可在原对话中继续追问或修改。

发行版的共享目录包含 390 项技能，覆盖科研、数据处理、湿实验和通用工作区操作；其中 175 项来自 K-Dense-AI/scientific-agent-skills。用户安装的扩展包在本机合并检索。技能数量表示已收录的流程与资源，实际计算还取决于执行主机的依赖、数据和服务权限。

![科学工作台](https://raw.githubusercontent.com/ForrestGump618/suwen/eve-v1.5.0/docs/screenshots/science-workbench.png)

<details>
<summary>检查数据，再开始分析</summary>

1. 选定本地目录或 SSH 工作区，点击「检查执行环境」查看该主机的 Python 包和计算程序。
2. 在「数据检查与预览」输入工作区内的文件路径：FASTA 查看序列，FASTQ 检查基础质量，原始计数矩阵查看样本文库大小，PDB 预览首个模型的坐标。
3. 选择研究流程，填写问题、样本信息、参考版本和限制条件，点击「启动任务」。
4. 在任务中批准所需操作，检查结果、来源与产物。补充要求会沿用现有任务与工作区。

数据预览不上传文件、不安装依赖。FASTQ 基础检查按 Phred+33 解释，不能代替接头、污染和重复检测。计数矩阵检查不等同于差异分析；PDB 坐标预览不推断化学键或结构质量。

专业计算使用执行主机上的依赖。需要 API 凭据、GPU、模型权重或集群运行环境时，任务会保留缺口，不以环境准备代替分析完成。技能按需读取，独立环境在当前主机缓存。

</details>

### 交互图解

把模块关系、实验流程、时序或结果说明整理成可打开的 HTML 页面。聊天中显示简洁的文件卡片，点击后可查看、缩放和切换主题，也可下载 HTML；文件树里可以再次打开。

![交互图解预览](https://raw.githubusercontent.com/ForrestGump618/suwen/eve-v1.5.0/docs/screenshots/interactive-pages.png)

<details>
<summary>怎么使用</summary>

1. 选择要保存文件的工作区。
2. 发送：“把这个实验方案整理成可交互的流程图，保留来源和待验证项。”
3. 根据当前权限模式批准执行，等待生成与检查完成，点击回复中的页面卡片。
4. 修改时指出要调整的节点或段落；候选文件、HTML 和校验记录均保留在工作区。

也可以在技能页搜索 `archify`，点击“查看与使用”。执行主机需要 Node.js 18 及以上版本；最终浏览器检查还需要 Chrome、Chromium 或 Edge。SSH 工作区使用远程主机的依赖与目录。缺少依赖或检查失败时会显示原因。

统计图仍使用科研绘图流程和原始数据；交互图解用于解释结构与过程。预览隔离了网络和主窗口权限，需要外部资源的页面请先将资源包含在交付文件中。

</details>

### 深度调研
- 检索网页、PubMed、Europe PMC 和 UniProt，并保留来源。
- 阅读论文、补充材料和数据说明，整理研究问题、方法、数据集与结论。
- 记录数据版本、代码版本、参数和随机种子，在本地或 SSH 工作区复现分析。
- 比较复现结果与论文中的数值和图表，区分已复现、部分复现、未复现和待人工判断。

<details>
<summary>查看调研交付物</summary>

`主张清单` · `数据与代码版本` · `复现命令` · `结果对比` · `限制与待核验项`

</details>

### 实验设计
- 设计 PCR、qPCR、克隆和表达实验方案。
- 根据 accession、参考序列和实验约束整理候选引物与载体设计。
- 检查 Tm、GC、产物位置、阅读框、连接位点、特异性和潜在冲突。
- 设计细胞活力、凋亡、克隆形成、迁移/侵袭、qPCR、Western、ELISA、流式和类器官实验。
- 解读原始读数，区分技术重复与生物学重复，并保留缺失值、QC、停止规则和证据等级。
- 输出对照、质控、测序引物、订购清单和验证步骤。
- 缺少参考序列或特异性证据时暂停设计，不用基因符号猜序列。

<details>
<summary>查看实验设计交付物</summary>

`候选引物` · `Tm / GC / 产物坐标` · `载体特征表` · `对照设计` · `订购与验证清单`

</details>

### 多组学数据处理
- 盘点 RNA、ATAC、蛋白组、空间组学和临床文件。
- 确认样本配对、基因组版本、标识符、批次和协变量。
- 执行质量检查、标准化、差异分析、整合和可视化。
- 生成表格、统计结果和适合汇报的图表，并保留中间产物。

<details>
<summary>查看多组学安全门</summary>

`样本配对` → `基因组版本` → `批次与协变量` → `模态 QC` → `整合分析` → `图表与证据`

</details>

### 工作区与协作
- 本地目录和 SSH 远程目录使用同一套文件、搜索、编辑和终端能力。
- 任务绑定工作区，连接失败不会偷偷切换到本地。
- 支持 PowerShell、远程终端、后台任务、任务恢复和多个独立会话。
- 主智能体按任务需要创建子智能体团队，在侧边栏查看成员、进度、依赖和讨论；用户可以直接与子智能体对话。
- 图库支持放大、下载、删除和勾画批注；批注可以作为后续任务的指导。

### 科学工具

预装 40 项科学技能，包含 65 个可执行脚本。可按问题选用变异解释、组织表达、蛋白结构、化合物活性和文献检索工具。技能按需加载，运行结果保存在当前本地或 SSH 工作区。

<details>
<summary>查看工具范围与使用方式</summary>

| 研究方向 | 可用资源 |
| --- | --- |
| 基因组与遗传变异 | AlphaGenome、ClinVar、gnomAD、GTEx、Ensembl |
| 蛋白与结构 | AlphaFold Database、UniProt、PDB、结构相似性搜索 |
| 药物与靶点 | ChEMBL、PubChem、Open Targets |
| 科学文献 | PubMed、Europe PMC、bioRxiv、OpenAlex、arXiv |

在“能力中心 → Skills”搜索 `science-`，点击“查看与使用”阅读指引，再将技能加入工作台输入框。首次运行会检查依赖和必要凭据；没有凭据的公开查询仍可执行。安装依赖遵循当前任务的权限设置。

例如：`使用 science-pubchem-database 查询阿司匹林的分子性质，将结果保存到当前工作区，并注明来源。`

[完整使用说明](https://github.com/ForrestGump618/suwen/blob/eve-v1.5.0/docs/SCIENCE-TOOLS.md)

</details>

<details>
<summary>核心交互</summary>

- `请求批准`：敏感操作先询问。
- `帮我审核`：低风险操作自动通过，高风险操作仍需确认。
- `完全权限`：由用户明确授予当前任务。
- `上下文`：查看组成、压缩记录、原文和运行轨迹。
- `团队`：先保存方案，再批准成员和依赖关系。

</details>

## 项目信息

| 项目 | 当前值 |
| --- | --- |
| 版本 | `1.5.0` |
| 平台 | Windows x64 |
| 当前交付 | 源码、Windows x64 安装包、SBOM 与校验清单 |
| 默认界面 | 研究总览 |
| 任务执行 | 本地目录或 SSH 工作区 |
| 数据策略 | 结果、轨迹和证据保存在本机工作区 |

<div class="eve-quick-links">
  <a href="https://github.com/ForrestGump618/suwen/releases/tag/eve-v1.5.0">下载 1.5.0</a>
  <a href="https://github.com/ForrestGump618/suwen/issues">提交问题</a>
  <a href="https://github.com/ForrestGump618/suwen/discussions">参与讨论</a>
</div>

## 使用方法

### 1. 连接模型

打开正式工作台，进入“设置 → 模型连接”，添加供应商，填写 API 地址和凭据。点击「获取模型列表」，勾选要保留的模型，指定首选模型，再点击「保存」。同一供应商可以保存多个模型，供应商之间独立保存连接信息；会话或团队成员可以分别选择模型。模型配置支持温度、上下文窗口、最大输出、Token 参数和输入模态。

如果供应商不支持模型列表接口，可以手动添加模型名称。获取失败会显示原因，保留之前保存的列表。凭据输入框默认遮蔽内容。

权限默认开放，便于本地科研工具直接运行；可在设置中按文件、终端、网络、技能和 Agent 操作逐项收窄。涉及凭据、远程主机或不可逆写入时，仍建议保留确认步骤。

### 2. 创建工作区

在左侧项目文件区域选择本地目录，或在“SSH”中保存主机后创建远程工作区。点击“刷新状态”确认目录可访问。之后的文件读取、搜索、编辑、终端和技能都会使用当前工作区。

Windows 上选择「记住密码」后，凭据保存在系统凭据库，重新打开程序时按主机档案读取。也可以使用密钥或系统 SSH Agent。断线后会尝试有限重连；终端命令不会自动重放，避免重复执行。连接仍失败时检查网络、主机状态和档案配置。

### 3. 普通分析

```text
读取当前项目中的 metadata.csv，检查缺失值和重复样本，输出一份简短报告，并把图表保存到 figures/。
```

Eve 会按需选择工具。工具结果会显示在运行轨迹中，最终回答只有在结果非空且通过验证后才会标记为完成。

输入框的技能选择器可以把已安装流程加入当前任务；所选技能会先加载，再由同一个任务继续调用工具。加载指引或安装依赖只表示准备完成，实际分析结果仍需核验。运行期间，输入框上方显示模型的中间回复和工具进度。

通过文件写入工具完成的修改会显示在「文件变更」中。展开可看差异、查看文件，或在内容没有再次改动时恢复旧内容。新建文件不会自动删除；Shell、Python 等命令产生的任意文件改动目前不自动计入该栏。

<details>
<summary>从源码运行桌面版</summary>

需要 Node.js、npm 和 Python 3.11 及以上版本。在项目根目录安装 Python 依赖，再构建桌面端：

```powershell
python -m pip install -e .
cd desktop
npm ci
npm run build
npm start
```

首次启动会检查工作台依赖，按界面提示完成安装。用户配置、凭据与历史会话使用独立数据目录，不放在源码中。

</details>

### 4. 深度文献调研

```text
请深度调研 PMID:12345678：
1. 阅读论文和补充材料；
2. 列出主要主张、使用的数据和分析方法；
3. 获取公开数据和代码；
4. 在当前工作区复现一个最小结果；
5. 对比论文结果，列出已复现、部分复现和未复现的结论。
```

在“科研”页面可以创建持久课题。课题按文献与问题、基线、假设、实验、分析、写作和结题复核推进，每个阶段都要登记真实产物，结题前需要人工复核。

### 5. 实验设计

提供物种、目标 accession、转录本或载体版本、实验类型和限制条件：

```text
为人类 TP53 转录本 NM_000546.6 设计 qPCR 方案，产物长度 80–150 bp，
给出候选引物、Tm、GC、产物坐标、特异性检查、对照和订购表。
```

没有 accession 或参考序列时，Eve 会先要求补充信息。设计结果是候选方案，仍需实验验证。

### 6. 多组学数据

```text
盘点当前目录中的 RNA、ATAC、蛋白组、空间组学和临床文件，
列出样本配对、基因组版本、批次信息和缺失的元数据。不要开始整合分析。
```

确认盘点结果后，再要求执行 QC、标准化、整合和制图，避免在样本配对或版本不明确时直接分析。

### 7. 图表批注

在“图库”打开图表，点击“勾画批注”，使用画笔标记需要修改的区域并写下说明。保存后回到对话，将批注作为新的指导发送给 Eve。原图会保留，修改结果会生成新文件。

> 小技巧：先圈出区域，再在批注框写“改什么、保持什么、如何验收”。例如：`把图例移到图外；保持配色和统计方法不变；重新导出 300 dpi PNG。`

<details>
<summary>图表批注流程</summary>

`图库` → `勾画` → `写批注` → `保存` → `发送指导` → `生成新版本` → `对比原图`

</details>

## 工作框架

1. **工作区层**：管理本地目录、SSH 主机、文件、终端和 Python 环境。
2. **Agent Harness 层**：负责模型、工具、技能、审批、取消、检查点和恢复。
3. **科研工作流层**：把调研、实验设计和多组学处理组织成有顺序的阶段，并保存产物和证据。
4. **桌面交互层**：提供统一工作台、项目文件、会话、上下文、团队、图库和运行轨迹。

模型、工具、MCP 服务和技能通过统一注册表接入。普通任务直接执行；复杂任务使用阶段和依赖；高风险操作需要批准。工具结果先回传模型，再由验证阶段决定任务是否完成。

## 证据与安全

- 原始文件、工具结果、运行轨迹和上下文日志保留在工作区或 Eve 数据目录中。
- 文件写入使用读取时的版本校验，避免覆盖未读取的修改。
- SSH、MCP、技能和 Shell 操作遵循当前任务权限。
- 科研阶段要求真实产物和指标文件；结题需要人工复核。
- Eve 不把模型回答本身当作实验已经完成，也不把视觉相似当作科学验证。

## 安装与运行

Eve 面向 Windows x64 桌面环境。发布包、SBOM、校验清单和版本说明见 [GitHub Release eve-v1.5.0](https://github.com/ForrestGump618/suwen/releases/tag/eve-v1.5.0)。安装包未签名，Windows SmartScreen 可能提示；部署前请核对 SHA-256。

源码开发需要 Node.js、Python 和项目依赖。完整功能、安装包体量、真实 Edge 验证与未验证边界见 [1.5.0 验收报告](https://github.com/ForrestGump618/suwen/blob/eve-v1.5.0/docs/verification/wet-lab-1.5.0/README.md) 和 [安装器验收](https://github.com/ForrestGump618/suwen/blob/eve-v1.5.0/docs/verification/installer-1.5.0/README.md)。

## 许可

Eve 的 Electron/TypeScript 代码采用 MIT，Python 工作台沿用 Apache-2.0。第三方技能和依赖保留各自许可。
