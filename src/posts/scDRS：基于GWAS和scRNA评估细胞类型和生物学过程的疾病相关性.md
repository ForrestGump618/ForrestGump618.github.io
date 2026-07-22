---
title: scDRS：基于GWAS和scRNA评估细胞类型和生物学过程的疾病相关性
date: 2023-08-11
tags:
  - 生物信息学
  - GWAS
  - 单细胞测序
categories:
  - 生物信息学
description: Jinye Zhang教授的scDRS工具简介和实操
---
## 方法学概述
&emsp;&emsp;scDRS的核心思想是建立合适的权重从而根据基因的表达对基因程序进行评分，即加权基因表达量。其算法可概述为：首先将基因根据MAGMA得到的gene-level z-scores从大到小排列（也可以自定义基因程序）, 选择潜在的致病基因。基于致病基因的表达量和权重接着计算致病基因程序加权表达量。从而评估该细胞的基因程序和疾病的相关度。  
&emsp;&emsp;算法对z-score采用算数加权，对技术噪声指标采用逆加权。也就是说，在GWAS中鉴定出的越相关的，且测序过程中技术原因造成误差较小的基因。根据输入数据集的基因表达，在蒙特卡洛随机模拟生成的B个对照组中，从而推断分布，进而对研究的疾病进行统计检验。利用这样的方法，我们可以计算单个细胞和疾病的相关性，以及鉴定相应的驱动基因，并基于此进行下游分析。

## 使用scdrs包在Python中进行分析
### 载入程序包
```python
import scanpy as sc
import pandas as pd
import scdrs
```

### 基础参数设置

```python
sc.settings.verbosity = 3 # 设置日志等级:errors(0),warnings(1),info(2),hints(3)  
sc.logging.print_header() # 输出版本号
sc.settings.set_figure_params(dpi=300, facecolor='white') # 设置图片的分辨率300dpi
```

### 读取计数矩阵和预处理
```python
adata = sc.read_csv("heart.csv") # 注意，这里的heart.csv列为细胞，行为基因，这一点和seurat框架是不同的。
# 其他的读取方法可参考scanpy的文档。
adata.var_names_make_unique()
adata.obs_names_make_unique()
adata.var.head() # 基因特征的摘要
adata.obs.head() # 细胞特征的摘要
adata # 返回矩阵大小，基因相关的变量以及细胞相关的变量数据  
sc.pl.highest_expr_genes(adata, n_top=20) # 显示在全部单个细胞中基因读数占总读数的百分比排名前20的基因
```

### 质量控制
&emsp;&emsp;质量控制，大部分都是针对细胞（obs）的质量控制。  
&emsp;&emsp;细胞质控通常对以下三个质控协变量进行：  
1. 每个条形码的计数数量（计数深度）  
2. 每个条形码的基因数量  
3. 每个条形码的线粒体基因计数比例  
&emsp;&emsp;如果一个细胞正在死亡，其mRNA被释放到内环境，导致线粒体基因的比例较高，所以我们可以通过线粒体基因的比例来过滤掉低质量的单细胞测序数据。但是如果仅考虑一个变量可能会造成生物学误差，共同考虑三个 QC 协变量至关重要。例如，线粒体计数相对较高的细胞可能参与呼吸过程，不应被过滤掉。然而，计数低或高的细胞可能对应于静止细胞群或尺寸较大的细胞。故我们在过滤低质量细胞的时候，要同时考虑不同的QC协变量之间的关系。

### 质控指标的计算
&emsp;&emsp;首先采用正则表达式识别线粒体；接着，我们将根据识别的结果进行比例的计算。
```python
adata.var["mt"] = adata.var_names.str.startswith("MT-")  
sc.pp.calculate_qc_metrics(adata, qc_vars=["mt"], inplace=True, percent_top=[20], log1p=True) # 此处可以计算其他给定基因；该步骤之后，才可以得到n_counts等数据。
```
&emsp;&emsp;通过上面的计算和adata.obs固有的数据，我们可以得到三个质控协变量：  
1. n_genes_by_counts/detected_genes: 一个细胞中发现的有效基因数量（即表达量不为0）  
2. total_counts/nUMIs: 一个细胞中发现的分子数量（UMI），通常也可以被认为是这个细胞的文库大小  
3. pct_counts_mt/mito_perc: 一个细胞中线粒体基因的表达计数占比  
&emsp;&emsp;可以绘制三个协变量的分布图。

```python
import matplotlib.pyplot as plt
mito_filter = 25 # 根据数据集合设定，注意，心室肌等组织富含线粒体，需要根据情况进行更改。
n_counts_filter = 4300 # 根据上述的MAD方法进行设定，官方教程认为counts数过多可能是双细胞，但是下面采用scrublet方法进行双细胞识别。
fig, axs = plt.subplots(ncols = 2, figsize = (8,4))
sc.pl.scatter(adata, x='total_counts', y='pct_counts_mt',ax = axs[0], show=False)  
sc.pl.scatter(adata, x='total_counts', y='n_genes_by_counts',ax = axs[1], show = False) 
# draw horizontal red lines indicating thresholds.
axs[0].hlines(y = mito_filter, xmin = 0, xmax = max(adata.obs['total_counts']), color = 'red', ls = 'dashed') 
axs[1].hlines(y = n_counts_filter, xmin = 0, xmax = max(adata.obs['total_counts']), color = 'red', ls = 'dashed')
fig.tight_layout()  
plt.show()
```

&emsp;&emsp;也可以采用小提琴图。

```python
sc.pl.violin(adata, ['n_genes_by_counts', 'total_counts', 'pct_counts_mt'],jitter=0.4, multi_panel=True)
```

&emsp;&emsp;还可以采用直方图。

```python
import seaborn as sns  
sns.histplot(adata.obs["n_genes_by_counts"], bins=100, kde=False)  
sns.histplot(adata.obs["total_counts"], bins=100, kde=False) 
```

### 双细胞过滤
&emsp;&emsp;双细胞被定义为在相同的细胞条形码（barcode）下进行测序的两个细胞，例如，如果它们被捕获在同一个液滴（droplet）中。双细胞由同型（homotypic）与异型（heterotypic）所构成 ：
1. 同型：同型通常被认为是不影响下游分析的，因为其是由一类相同的细胞中的两个所构成，所以这部分细胞不是我们所需要过滤的对象；  
2. 异型：异型通常是由来自两类不同的细胞所构成的，异型的存在会使得我们后续的细胞分类出现错误，因为其独特的数据分布特征。  
&emsp;&emsp;我们可以通过人工构建双细胞进行模拟识别，以排除异型的存在。我们将使用scrublet来完成双细胞的识别。
```python
sc.external.pp.scrublet(adata, random_state=112) 
adata = adata[adata.obs['predicted_doublet']==False, :]
```

### 低质量细胞过滤
```python
adata = adata[adata.obs.pct_counts_mt < 25, :]  
adata = adata[adata.obs.n_genes_by_counts > 200, :]  
adata = adata[adata.obs.total_counts > 300, :]  
sc.pp.filter_cells(adata, min_genes=200)  
sc.pp.filter_genes(adata, min_cells=3)  
  
# 小提琴图可视化  
sc.pl.violin(adata, ['n_genes_by_counts', 'total_counts', 'pct_counts_mt'],jitter=0.4, multi_panel=True)
```

### 保存结果用于scDRS的分析
```python
adata_raw = adata.copy()  
adata_raw.write_h5ad(f"./output/{sample}/expr.h5ad")  
  
df_cov = pd.DataFrame(index=adata_raw.obs.index)  
df_cov["const"] = 1  
df_cov["n_genes"] = adata_raw.obs["n_genes"]  
df_cov.to_csv(f"./output/{sample}/cov.tsv", sep="\t")  
  
summary = pd.DataFrame(adata_raw.obs)  
summary.to_csv(f"./output/{sample}/summary.tsv", sep="\t")
```

### scDRS分析
```python
adata = scdrs.util.load_h5ad(h5ad_file=f"./output/{sample}/expr.h5ad", flag_filter_data=False, flag_raw_count=True)  
dict_gs = scdrs.util.load_gs("./output/CHD.gs", src_species="human", dst_species="human",to_intersect=adata.var_names)  
df_cov = pd.read_csv(f"./output/{sample}/cov.tsv", sep="\t", index_col=0)  
adata_analysis = scdrs.preprocess(adata, cov=df_cov, n_mean_bin=20, n_var_bin=20, copy=True)  
dict_df_score = dict()  
for trait in dict_gs:  
	gene_list, gene_weights = dict_gs[trait]  
	dict_df_score[trait] = scdrs.score_cell(  
		data=adata_analysis,  
		gene_list=gene_list,  
		gene_weight=gene_weights,  
		ctrl_match_key="mean_var",  
		n_ctrl=1000,  
		weight_opt="vs",  
		return_ctrl_raw_score=False,  
		return_ctrl_norm_score=True,  
		verbose=False,  
	)  
chd = dict_df_score["CHD"]  
chd.to_csv(f"./output/{sample}/CHD.csv")
```

### 可视化
```python
sc.pp.highly_variable_genes(adata, n_top_genes=2000)  
adata = adata[:, adata.var.highly_variable]  
sc.pp.regress_out(adata, ['total_counts', 'pct_counts_mt'])  
#归一化 (事实上，只有PCA才采用归一化数据，使得不同PC的数据规模接近。)  
sc.pp.scale(adata, max_value=10)  
#主成分分析  
sc.tl.pca(adata, svd_solver="arpack")  
  
sc.pp.neighbors(adata, n_neighbors=10, n_pcs=40) #KNN算法，此处参数：n_neighbours更大，则聚类可能会变少；n_pcs一般为40，可参考碎石图。  
sc.tl.umap(adata)  
sc.tl.leiden(adata)  
sc.pl.umap(adata, color=['leiden'],save=f"{sample}_original.png")  
#非参数检验方法  
sc.tl.rank_genes_groups(adata, 'leiden', method='wilcoxon')  
sc.pl.rank_genes_groups(adata, n_genes=25, sharey=False)  
  
# 结果写入，方便后续可视化  
pd.DataFrame(adata.uns['rank_genes_groups']['names']).head(5)  
result = adata.uns['rank_genes_groups']  
groups = result['names'].dtype.names  
pd.DataFrame(adata.uns['rank_genes_groups']['names']).to_csv(f"./output/{sample}/marker.csv")  
for trait in dict_df_score:  
	adata.obs[trait] = dict_df_score[trait]["raw_score"]  
for trait in dict_df_score:  
	adata.obs[f"{trait}_norm"] = dict_df_score[trait]["norm_score"]  
sc.pl.umap(adata,color=dict_df_score.keys(),ncols=1,color_map="RdBu_r",save=f"{sample}_disease.png")  
df_group = adata.obs  
l = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]  
map_list = {}  
for i in range(len(l)):  
	map_list[str(i)] = l[i]  
df_group["group"] = df_group["leiden"].map(map_list)  
df_group.to_csv(f"./output/{sample}/leiden score.csv")  
df_gene = scdrs.method.downstream_gene_analysis(adata=adata, df_full_score=dict_df_score["CHD"])  
df_gene.to_csv(f"./output/{sample}/key gene.csv")  
df_group_analysis = scdrs.method.downstream_group_analysis(adata=adata, df_full_score=dict_df_score["CHD"], group_cols=["group"])
```

## 在命令行中使用scdrs

### 计算每个细胞的疾病富集分数
```bash
# Shell
scdrs compute-score \  
    --h5ad-file data/expr.h5ad \  
    --h5ad-species human \  
    --gs-file data/processed_geneset.gs \  
    --gs-species human \  
    --cov-file data/cov.tsv \  
    --flag-filter-data True \  
    --flag-raw-count True \  
    --flag-return-ctrl-raw-score False \  
    --flag-return-ctrl-norm-score True \  
    --out-folder data/  
  
  
# 可视化 python  
df_gs.index = ['CHD','Height']  
dict_score = {  
    trait: pd.read_csv(f"data/{trait}.full_score.gz", sep="\t", index_col=0)  
    for trait in df_gs.index  
}  
  
for trait in dict_score:  
    adata.obs[trait] = dict_score[trait]["norm_score"]  
  
sc.set_figure_params(figsize=[2.5, 2.5], dpi=150)  
sc.pl.umap(  
    adata,  
    color=dict_score.keys(),  
    ncols=1,  
    color_map="RdBu_r",  
    vmin=-5,  
    vmax=5,  
)  
  
sc.pl.umap(  
    adata,  
    color=dict_score.keys(),  
    color_map="RdBu_r",  
    vmin=-5,  
    vmax=5,  
    s=20,  
)
```
&emsp;&emsp;基于单个细胞的疾病富集分数，我们可以充分探索下游分析的方式。

## 参考
1. Zhang, M.J., Hou, K., Dey, K.K. et al. Polygenic enrichment distinguishes disease associations of individual cells in single-cell RNA-seq data. Nat Genet 54, 1572–1580 (2022).[DOI](https://doi.org/10.1038/s41588-022-01167-z).
2. scDRS的Github项目：[martinjzhang/scDRS](https://github.com/martinjzhang/scDRS)。
3. scDRS的官方文档：[scDRS](https://martinjzhang.github.io/scDRS/)。