---
title: 深度学习笔记（二）：PyTorch实现线性回归
date: 2024-04-01
tags:
  - 机器学习
  - 深度学习
description: 本篇博文将介绍如何使用Pytorch库实现线性回归模型，并对代码进行详细解释。
categories:
  - 深度学习
---

## 导入所需的库  


```python
import torch
import random
from d2l import torch as d2l
```

在这一部分，我们导入了实现线性回归所需的库。`torch` 是 PyTorch 库的主要接口，`random` 用于生成随机数，`d2l` 是对应的深度学习库。

## 生成数据集

```python
X = torch.normal(0, 1, (1000, 2))  # 生成1000个样本，每个样本有两个特征
true_w = torch.tensor([5.0, -2])    # 真实的权重参数
true_b = 2.0                         # 真实的偏置参数
y = torch.matmul(X, true_w) + true_b  # 生成标签
features = X
labels = y.reshape((-1, 1))
```

这一部分生成了一个线性回归模型的数据集。我们首先使用 `torch.normal` 生成一个具有标准正态分布的特征矩阵 `X`，包含 1000 个样本和 2 个特征。然后，定义了真实的权重参数 `true_w` 和偏置参数 `true_b`，并根据线性模型生成标签 `y`。最后将特征和标签存储在 `features` 和 `labels` 中。

## 数据集可视化

```python
d2l.set_figsize()
d2l.plt.scatter(features[:, (1)].detach().numpy(), labels.detach().numpy(), 1)
d2l.plt.scatter(features[:, (0)].detach().numpy(), labels.detach().numpy(), 1)
```

这部分代码将数据集可视化，使用 `d2l.set_figsize()` 设置图形大小，然后使用 `d2l.plt.scatter` 绘制散点图，展示特征与标签之间的关系。

## 定义数据迭代器

```python
def data_iter(batch_size, features, labels):
    num_examples = len(features)
    indices = list(range(num_examples))
    random.shuffle(indices)
    for i in range(0, num_examples, batch_size):
        batch_indices = torch.tensor(
            indices[i:min(i + batch_size, num_examples)])
        yield features[batch_indices], labels[batch_indices]
```

这段代码定义了一个数据迭代器，用于在训练过程中迭代数据集。首先计算数据集的样本数量 `num_examples`，然后生成样本索引 `indices` 并打乱顺序。接下来，使用 `yield` 关键字生成批量数据，并返回对应的特征和标签。

## 定义批量大小

```python
batch_size = 10
```

这部分定义了批量大小，即每次训练时用于计算梯度的样本数。

## 打印第一个批次的样本和标签

```python
for X, y in data_iter(batch_size, features, labels):
    print(X, "\n", y)
    break
```

这段代码打印了第一个批次的样本特征 `X` 和对应的标签 `y`。

## 初始化模型参数

```python
w = torch.normal(0, 0.01, size=(2, 1), requires_grad=True)
b = torch.zeros(1, requires_grad=True)
```

在这里，我们初始化模型参数 `w` 和 `b`。其中 `w` 是一个服从均值为 0，标准差为 0.01 的正态分布的张量，形状为 (2, 1)，表示权重参数；`b` 是一个零张量，表示偏置参数。

## 定义线性回归模型

```python
def linreg(X, w, b):
    return torch.matmul(X, w) + b
```
这部分定义了线性回归模型。给定输入特征 `X`、权重参数 `w` 和偏置参数 `b`，该函数返回预测结果。

## 定义平方损失函数

```python
def squared_loss(y_hat, y):
    return (y_hat - y.reshape(y_hat.shape)) ** 2 / 2
```

这段代码定义了平方损失函数，用于衡量预测值 `y_hat` 与真实值 `y` 之间的差异。

## 定义随机梯度下降优化算法

```python
def sgd(params, lr, batch_size):
    with torch.no_grad():
        for param in params:
            param -= lr * param.grad / batch_size
            param.grad.zero_()
```
这部分定义了随机梯度下降（SGD）优化算法，用于更新模型参数。其中 `params` 是需要更新的参数列表，`lr` 是学习率，`batch_size` 是批量大小。在函数中，首先通过 `torch.no_grad()` 禁用梯度计算，然后对参数进行更新，更新规则为参数减去学习率乘以梯度除以批量大小，并清零梯度。

## 设置学习率和训练轮数

```python
lr = 0.001
num_epochs = 100
```
这里设置了学习率 `lr` 和训练轮数 `num_epochs`。

## 训练模型

```python
net = linreg
loss = squared_loss
for epoch in range(num_epochs):
    for X, y in data_iter(batch_size, features, labels):
        l = loss(net(X, w, b), y)
        l.sum().backward()
        sgd([w, b], lr, batch_size)
    with torch.no_grad():
        train_l = loss(net(features, w, b), labels)
        print("epoch:{};loss:{}".format(epoch, train_l.mean()))
        print("w:{};b:{}".format(w, b))
```

这部分代码是模型的训练过程。首先定义了模型 `net` 和损失函数 `loss`，然后进行多轮训练。在每一轮中，通过 `data_iter` 函数迭代获取批量样本，计算模型预测值与真实值的损失，并进行反向传播更新模型参数。最后，输出每轮训练的损失值以及更新后的模型参数。

## 高级API的简洁实现

```python
import numpy as np
from torch.utils import data
import torch
from d2l import torch as d2l

# 定义真实的权重和偏置以生成合成数据
true_w = torch.tensor([2, -3.4])  # 真实权重
true_b = torch.tensor(2.0)        # 真实偏置

# 使用真实的权重和偏置生成合成数据
features, labels = d2l.synthetic_data(true_w, true_b, 10000) 

# 加载数据到DataLoader的函数
def load_array(data_arrays, batch_size, is_train=True):
    # 创建一个TensorDataset，使用输入的数据数组
    dataset = data.TensorDataset(*data_arrays)
    # 根据是否训练，创建一个DataLoader，并指定批次大小
    return data.DataLoader(dataset, batch_size, shuffle=is_train)

# 设置批次大小
batch_size = 100
# 将合成数据加载到DataLoader中
data_iter = load_array((features, labels), batch_size)

# 从torch中导入必要的模块
from torch import nn

# 使用Sequential容器定义一个神经网络模型
net = nn.Sequential(nn.Linear(2, 1))  # 使用输入大小为2和输出大小为1的线性层

# 初始化线性层的权重
net[0].weight.data.normal_(0, 0.01)  # 从均值为0、标准差为0.01的正态分布中初始化权重
net[0].weight.data.fill_(0)          # 将偏置填充为0

# 定义损失函数
loss = nn.MSELoss()

# 定义优化器
trainer = torch.optim.SGD(net.parameters(), lr=0.03)  # 学习率为0.03的随机梯度下降

# 设置训练的轮数
num_epochs = 10
# 训练循环
for epoch in range(num_epochs):
    # 遍历数据的批次
    for X, y in data_iter:
        # 前向传播：通过将X传递给模型来计算预测的y
        l = loss(X, y)  # 计算预测和真实标签之间的损失
        # 反向传播：计算损失相对于模型参数的梯度
        trainer.zero_grad()  # 在反向传播之前将梯度置零
        l.backward()         # 反向传播以计算梯度

```