---
title: 深度学习笔记（三）：PyTorch 实现 Softmax 回归
tags:
  - 机器学习
  - 深度学习
date: 2024-04-02
categories:
  - 深度学习
description: 在深度学习中，Softmax 回归是一种常见且简单的分类模型。本文将详细介绍如何使用 PyTorch 实现 Softmax 回归模型，并使用 Fashion-MNIST 数据集进行训练和测试。
---

# 导入必要的库

```python
import torch
import torchvision
from torchvision import transforms
from torch.utils.data import DataLoader
from d2l import torch as d2l
```

# 定义一个函数，用于在一定布局下展示图像及其对应的标签

```python
def show_images(imgs, num_rows, num_cols, titles=None, scale=1.5):
    """展示图像及其标签"""
    figsize = (num_cols * scale, num_rows * scale)
    _, axes = d2l.plt.subplots(num_rows, num_cols, figsize=figsize)
    axes = axes.flatten()
    for i, (ax, img) in enumerate(zip(axes, imgs)):
        if torch.is_tensor(img):
            ax.imshow(img.numpy())
        else:
            ax.imshow(img)
        ax.axes.get_xaxis().set_visible(False)
        ax.axes.get_yaxis().set_visible(False)  # 修复了原代码中的错误
        if titles:
            ax.set_title(titles[i])
    return axes
```

# 定义一个函数，用于获取数据加载时使用的工作线程数

```python
def get_dataloader_workers():
    """获取数据加载时使用的工作线程数"""
    return 4
```

# 定义一个函数，用于加载 Fashion-MNIST 数据集

```python
def load_data_fashion_mnist(batch_size, resize=None):
    """加载Fashion-MNIST数据集，并可选择性地调整图像大小"""
    trans = [transforms.ToTensor()]
    if resize:
        trans.insert(0, transforms.Resize(resize))
    trans = transforms.Compose(trans)
    mnist_train = torchvision.datasets.FashionMNIST(root="./data", train=True, transform=trans, download=True)
    mnist_test = torchvision.datasets.FashionMNIST(root="./data", train=False, transform=trans, download=True)
    return (DataLoader(mnist_train, batch_size, shuffle=True, num_workers=get_dataloader_workers()),
            DataLoader(mnist_test, batch_size, shuffle=False, num_workers=get_dataloader_workers()))

# 设置批量大小
batch_size = 256
# 加载数据集
train_iter, test_iter = load_data_fashion_mnist(batch_size=batch_size)
```

# 定义模型

```python
# 网络的输入和输出维度
num_inputs = 28 * 28
num_outputs = 10

# 初始化模型参数
w = torch.normal(0, 0.01, size=(num_inputs, num_outputs), requires_grad=True)
b = torch.zeros(num_outputs, requires_grad=True)

# 定义softmax函数
def softmax(X):
    """计算softmax概率值"""
    X_exp = torch.exp(X)
    partition = X_exp.sum(1, keepdim=True)
    return X_exp / partition

# 定义模型
def net(X):
    """定义softmax回归模型"""
    return softmax(torch.matmul(X.reshape((-1, w.shape[0])), w) + b)
```

# 定义交叉熵损失函数

```python
def cross_entropy(y_hat, y):
    """计算预测值和真实值之间的交叉熵损失"""
    return -torch.log(y_hat[range(len(y_hat)), y])
```

# 模型评价指标计算

```python
def accuracy(y_hat, y):
    """计算预测准确率"""
    if len(y_hat.shape) > 1 and y_hat.shape[1] > 1:
        y_hat = y_hat.argmax(axis=1)
    cmp = y_hat.type(y.dtype) == y
    return float(cmp.type(y.dtype).sum())

class Accumulator:
    """在n个变量上累加"""
    def __init__(self, n):
        self.data = [0.0] * n

    def add(self, *args):
        self.data = [a + float(b) for a, b in zip(self.data, args)]

    def reset(self):
        self.data = [0.0] * len(self.data)

    def __getitem__(self, idx):
        return self.data[idx]
```

# 定义训练一个 epoch 的函数

```python
def train_epoch(net, train_iter, loss, updater):
    """训练模型一个epoch"""
    if isinstance(net, torch.nn.Module):
        net.train()  # 设置为训练模式
    metric = Accumulator(3)  # 损失总和，正确预测数，样本总数
    for X, y in train_iter:
        y_hat = net(X)
        l = loss(y_hat, y)
        if isinstance(updater, torch.optim.Optimizer):
            updater.zero_grad()
            l.mean().backward()
            updater.step()
        else:
            l.sum().backward()
            updater(X.shape[0])
        metric.add(float(l.sum()), accuracy(y_hat, y), y.numel())
    # 返回训练损失和训练准确率
    return metric[0] / metric[2], metric[1] / metric[2]
```
# 定义训练函数

```python
def train(net, train_iter, test_iter, loss, num_epochs, updater):
    """训练模型"""
    all_epoch = []
    for epoch in range(num_epochs):
        train_metrics = train_epoch(net, train_iter, loss, updater)
        all_epoch.append(train_metrics)
    return all_epoch

# 设置学习率和更新器
lr = 0.1

def updater(batch_size):
    """使用小批量随机梯度下降进行参数更新"""
    return d2l.sgd([w, b], lr, batch_size)

# 设置训练轮数并开始训练
num_epochs = 10
train(net, train_iter, test_iter, cross_entropy, num_epochs, updater)
```

通过以上步骤，我们成功实现了使用 PyTorch 进行 Softmax 回归模型的训练和测试。 Softmax 回归是深度学习中的重要组成部分，能够有效地处理分类问题。

# softmax的高级API实现

```python
import torch  # 导入PyTorch库  
from torch import nn  # 从PyTorch库中导入神经网络模块  
from d2l import torch as d2l 
  
# 设置批量大小为256  
batch_size = 256  
  
# 加载Fashion-MNIST数据集，并划分为训练集和测试集  
train_iter, test_iter = d2l.load_data_fashion_mnist(batch_size)  
  
# 定义一个简单的神经网络模型，包含一个Flatten层（用于将图像展平）和一个全连接层（784个输入节点，10个输出节点）  
net = nn.Sequential(nn.Flatten(), nn.Linear(784, 10))  
  
# 定义一个权重初始化函数  
def init_weights(m):  
    if type(m) == nn.Linear:  # 如果模块是线性层  
        nn.init.normal_(m.weight, std=0.01)  # 使用标准差为0.01的正态分布初始化权重  
  
# 应用初始化函数到模型的所有模块  
net.apply(init_weights)  
  
# 定义交叉熵损失函数，reduction设置为"None"，表示不进行任何约简，返回每个样本的损失值  
loss = nn.CrossEntropyLoss(reduction="None")  
  
# 定义优化器，使用随机梯度下降算法，学习率为0.1  
trainer = torch.optim.SGD(net.parameters(), lr=0.1)
```