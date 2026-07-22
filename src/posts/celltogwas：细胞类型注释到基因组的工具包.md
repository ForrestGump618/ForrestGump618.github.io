---
title: celltogwas：细胞类型注释到基因组的工具包
date: 2023-08-19
tags:
  - GWAS
  - python
categories:
  - 生物信息学
description: 本工具包用于从基因组注释文件中提取基因信息，合并基因区间，基于细胞类型和窗口大小生成基因组范围，以及注释GWAS（全基因组关联研究）数据。
---
## celltogwas

This code is a toolkit for genomic analysis. It includes several functions and helper functions to extract gene information from a genomic annotation file, merge gene intervals, generate genomic ranges based on cell types and window size, and annotate GWAS (Genome-Wide Association Study) data.

## Explanation of each function
**extract_gene_info(gtf_file)**: Extracts gene information from a genomic annotation file. It opens a gzip-compressed file, reads it line by line, and extracts gene name, chromosome, start position, and end position from each line. The extracted data is then stored in a Pandas DataFrame and returned.

**merge_intervals(intervals)**: Merges overlapping intervals. This function takes a list of intervals as input and merges overlapping intervals into larger intervals. It first sorts the intervals based on their start positions, then iterates through the intervals. If the current interval does not overlap with the merged interval, it adds the current interval to the merged list. Otherwise, it updates the end position of the merged interval. Finally, it returns the merged interval list.

**celltype_genome_range(cell_gene_dict, gene_info, windowsize)**: Generates genomic ranges based on cell types and window size. This function takes a dictionary mapping cell types to gene lists, a DataFrame of gene information, and a window size as input. It retrieves the gene list corresponding to each cell type from the dictionary and performs an inner join with the gene information to obtain the chromosome, start position, and end position of the corresponding genes. It then adjusts the start and end positions based on the window size and converts the data into a specific format of a list. Finally, it stores the genomic ranges for each cell type in a dictionary and returns it.

**check_value_in_intervals(intervals, value)**: Checks if a value is within the intervals. This function takes a list of intervals and a value as input. It uses binary search to determine if the value falls within the intervals. It first extracts the left boundaries of the intervals, then performs a binary search to find the position of the value in the left boundary list. If the position is less than the length of the interval list, it retrieves the corresponding interval and checks if the value falls within that interval. If the value is within the interval, it returns True; otherwise, it returns False.

**gwas_annotaion(gwas, celltype_range)**: Annotates GWAS data based on genomic ranges. This function takes a DataFrame of GWAS data and a dictionary of genomic ranges as input. It first retrieves the list of chromosomes from the GWAS data. Then, it iterates through the genomic ranges for each cell type. For each chromosome, it retrieves the subset of GWAS data corresponding to that chromosome and the annotation ranges from the genomic ranges. It then iterates through each data item in the subset and uses the check_value_in_intervals function to check if the position of the data item falls within the annotation ranges. If it does, the data item is marked as annotated. Finally, it stores the annotation results for all cell types in a dictionary and returns it.

## File format

**gtf_file**: Include CHR, START, END, Other info(GENE Symbol);

**cell_gene_dict**: A dictionary:(1) key:celltype’s name;(2)value:a list of genes;

**gene_info**: Output file from **extract_gene_info(gtf_file)**: Include: GENE, CHR, START, END;

**gwas**: First teo columns: chr, pos;

**celltype_range**: A dictionary:(1) key:celltype’s name;(2)value:a list of genome position:[chr, start, end];

**output_file**: A dictionary:(1) key:celltype’s name;(2)value:[chr, pos ,…… , annotation] (annotation: 1 for anntation and 0 for null).