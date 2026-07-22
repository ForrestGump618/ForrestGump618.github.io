---
title: scPagwas——整合scRNA和GWAS识别疾病的驱动基因和关键细胞类型
tags:
  - 单细胞测序
  - 生物信息学
  - GWAS
date: 2023-08-25
categories:
  - 生物信息学
description: 将转录组转变为通路组，从基因到表型，更具实践性地描述细胞特性。scPagwas是整合scRNA和GWAS的新方法。
---
&emsp;&emsp;**scPagwas**的基本思想和CMU张金野教授开发的**scDRS**工具一脉相承。总的来说，该框架可以概述为：  
1. 基于基因表达计算单个细胞的通路富集得分（PAS）；  
2. SNP通过基因和通路联系，得到两者的回归系数，将该回归系数作为权数加权上面得到的PAS，得到一个细胞的gPAS。某种意义上，gPAS是一个细胞疾病相关通路组的富集得分；  
3. 将基因的表达和gPAS做相关性分析，确定最优先的疾病基因。  
&emsp;&emsp;(1) 到 (3) 的步骤本质上是GWAS映射驱动基因的过程，接着我们根据驱动基因的表达量和驱动基因的权重对细胞的表达量进行加权，从而得到具体的细胞评分——性状相关分数TRS。  
如果之间关注加权分数的绝对值，那么这个结果很容易受到细胞的检出count数影响，因此作者根据相应的表达值和方差匹配相近的表达基因。从而计算出经验分布，从而进行统计检验。隐含的思想是：疾病特征基因是显著高表达的。

## GWAS Summary Statistics数据的预处理
&emsp;&emsp;**下面的步骤可概述为：首先提取摘要数据中的SNP，然后去计算LD并过滤，最后将过滤后的SNP遴选出来，得到过滤后的GWAS数据。**  
&emsp;&emsp;根据scPagwas和Plink的要求，GWAS文件的以下信息应当被提取，并且要命名为下面的名称：
```bash
"chrom","pos","REF","ALT","rsid","nearest_genes","beta","se"
```
&emsp;&emsp;保存这个文件，比如我们命名为”Disease.txt”：
```bash
write.table(GWAS_raw,file="./Disease.txt",row.names=F,quote=F)
```
&emsp;&emsp;提取其中的rsid列，用于后续的分析（awk后面的$5代表rsid列的索引）：
```bash
mkdir tempfile  <br>awk  '{print $5 }' Disease.txt  > ./tempfile/Disease_SNP_list.txt
```
&emsp;&emsp;下载并解压plink所需要的文件，如下，这里我们下载东亚人的数据：
```bash
wget https://zenodo.org/record/7768714/files/1000G_Phase3_EAS_plinkfiles.tgz?download=1
```
&emsp;&emsp;制作bed文件：
```bash
for i in $(seq 1 22)
do
echo $i
plink
--bfile ./1000G_EUR_Phase3_plink/1000G.EAS.QC.$i
--extract ./tempfile/Disease_SNP_list.txt
--noweb --make-bed --out ./tempfile/1000G.EAS.QC.Disease_${i}_filtered
done
```
&emsp;&emsp;连锁不平衡过滤
```bash
for i in $(seq 1 22)    
do   
echo $i  
plink   
--bfile ./tempfile/1000G.EAS.QC.Disease_${i}_filtered   
--indep-pairwise 50 5 0.8   
--out  ./tempfile/Disease_${i}_plink_prune_EAS_filtered_LD0.8  
done
```
&emsp;&emsp;结果整合
```bash
cat ./tempfile/[Disease]*.prune.in > Disease_EAS_LD0.8.prune
```
&emsp;&emsp;从GWAS中选择过滤后的SNP
```bash
library(readr)  
library(dplyr)  
gwas<-read_table("./Disease.txt")  
SNP_prune<- read_table("./tempfile/Disease_EAS_LD0.8.prune")  
SNP_prune<-SNP_prune[!duplicated(unlist(SNP_prune)),]  
colnames(SNP_prune)<-"rsid"  
#### Left Join using inner_join function   
gwas= gwas %>% inner_join(SNP_prune,by="rsid")  
print(nrow(gwas))  
write.table(gwas,file="./Disease_prune_gwas_data.txt",row.names=F,quote=F)
```

## scRNA数据、Pathway数据、注释数据的准备

1. 事实上，scPagwas所需单细胞数据的必要条件是：**（1）单细胞数据已经完成了分群，并且给予了相应的注释；（2）单细胞数据已经被Normalized；**
2. 在scPagwas中预置了一个KEGG的通路数据集，所以不需要自己再额外处理；
3. 这一步骤完成的是导入外显子在基因组的范围，相应数据可以从[GENCODE - Human Release 44 (gencodegenes.org)](https://www.gencodegenes.org/human/)下载：
```r
library(rtracklayer)  
gtf_df<- rtracklayer::import("gencode.v34.annotation.gtf.gz")  
gtf_df <- as.data.frame(gtf_df)  
gtf_df <- gtf_df[,c("seqnames","start","end","type","gene_name")]  
gtf_df <- gtf_df[gtf_df$type=="gene",]  
block_annotation<-gtf_df[,c(1,2,3,5)]  
```

## 标准分析流程


### 单细胞数据导入
```r
library(scPagwas)  
Pagwas <- list()  
Pagwas <- Single_data_input(  
      Pagwas = Pagwas,  
      assay = "RNA",  
      Single_data = Single_data,  
      Pathway_list = Genes_by_pathway_kegg  
    )  
Single_data <- Single_data[, 
```

### 计算每个细胞的通路富集分数
```r
Pagwas <- Pathway_pcascore_run(  
        Pagwas = Pagwas,  
        Pathway_list = Genes_by_pathway_kegg  
      )
```

### 输入GWAS数据
&emsp;&emsp;注意，事实上，这里的maf不会对结果造成很大影响。
```r
Pagwas <- GWAS_summary_input(  
    Pagwas = Pagwas,  
    gwas_data = gwas_data,  
    maf_filter = 0.1  
  )
```

### SNP到基因的映射
&emsp;&emsp;marg可以设置windowsize，实际上在一些文献中会设计成10k；
```r
Pagwas$snp_gene_df <- SnpToGene(  
        gwas_data = Pagwas$gwas_data,  
        block_annotation = block_annotation,  
        marg = 100000  
      )
```

### SNP到通路的映射
&emsp;&emsp;这个步骤能够把通路注释到基因组上的区域。
```r
Pagwas <- Pathway_annotation_input(  
      Pagwas = Pagwas,  
      block_annotation = block_annotation  
    )
```
&emsp;&emsp;将通路的基因组位置和前面得到的pca矩阵（实质上是通路组）进行联系

```r
Pagwas <- Link_pathway_blocks_gwas(  
      Pagwas = Pagwas,  
      chrom_ld = chrom_ld,  
      singlecell = T,  
      celltype = T,  
      backingpath="./temp")
```

### 细胞类型回归
```r
Pagwas$lm_results <- Pagwas_perform_regression(  
	Pathway_ld_gwas_data =Pagwas$Pathway_ld_gwas_data  
)
```

### 计算gPAS，鉴定风险基因
```r
Pagwas <- scPagwas_perform_score(  
      Pagwas = Pagwas,  
      remove_outlier = TRUE  
    )  
Pagwas$PCC <- scPagwas::scGet_PCC(scPagwas.gPAS.score=Pagwas$scPagwas.gPAS.score,  
                                    data_mat=Pagwas$data_mat)  
mean_gpas<-mean(Pagwas$scPagwas.gPAS.score)  
a1<-which(Pagwas$scPagwas.gPAS.score >= mean_gpas)  
a2<-which(Pagwas$scPagwas.gPAS.score < mean_gpas)  
  
PCC_up <- scPagwas::scGet_PCC(scPagwas.gPAS.score=Pagwas$scPagwas.gPAS.score[a1],data_mat=Pagwas$data_mat[,a1])  
PCC1<- data.frame(PCC=PCC_up,genes=rownames(PCC_up))  
PCC1<-PCC1[order(PCC1$PCC,decreasing=T),]  
PCC<- data.frame(PCC=PCC1$PCC)  
rownames(PCC)<-PCC1$genes  
Pagwas$PCC_up<-PCC  
  
PCC_down <- scPagwas::scGet_PCC(scPagwas.gPAS.score=Pagwas$scPagwas.gPAS.score[a2],data_mat=Pagwas$data_mat[,a2])  
PCC1<- data.frame(PCC= -PCC_down,genes=rownames(PCC_down))  
PCC1<-PCC1[order(PCC1$PCC,decreasing=F),]  
PCC<- data.frame(PCC=PCC1$PCC)  
rownames(PCC)<-PCC1$genes  
Pagwas$PCC_down<-PCC
```

### 计算TRS
```r
#Obtain the top 500 genes with the highest PCC.  
n_topgenes=500  
scPagwas_topgenes <- rownames(Pagwas$PCC)[order(Pagwas$PCC, decreasing = T)[1:n_topgenes]]  
scPagwas_upgenes <- rownames(Pagwas$PCC_up)[1:n_topgenes]  
scPagwas_downgenes <- rownames(Pagwas$PCC_down)[1:n_topgenes]  
  
#Single_data refers to the single-cell data initially inputted.  
Single_data <- Seurat::AddModuleScore(Single_data, assay = "RNA", list(scPagwas_topgenes,scPagwas_upgenes,scPagwas_downgenes), name = c("scPagwas.TRS.Score","scPagwas.upTRS.Score","scPagwas.downTRS.Score"))  
  
#Calculate the p-values for scPagwas.TRS.Score of single cells after background correction.  
correct_pdf<-Get_CorrectBg_p(Single_data=Single_data,  
                             scPagwas.TRS.Score=Single_data$scPagwas.TRS.Score1,  
                             iters_singlecell=100,  
                             n_topgenes=1000,  
                             scPagwas_topgenes=scPagwas_topgenes)  
Pagwas$Random_Correct_BG_pdf <- correct_pdf  
  
#Merge the p-values of cells belonging to the same cell type into a single p-value for each cell type.  
Pagwas$Merged_celltype_pvalue<-Merge_celltype_p(single_p=correct_pdf$pooled_p,celltype=Pagwas$Celltype_anno$annotation)  
```

## 参考文献

[Polygenic regression uncovers trait-relevant cellular contexts through pathway activation transformation of single-cell RNA sequencing data: Cell Genomics](https://www.cell.com/cell-genomics/fulltext/S2666-979X(23)00180-5)