---
title: 实操：把chatGPT接入智能音箱？
tags:
  - LLM
  - AI
  - 智能音箱
date: 2024-03-18
categories:
  - 随笔
description: 基于GITHUB项目xiaogpt，把chatGPT接入智能音箱！
---
## 前言
&emsp;&emsp;学院以前比赛发了个小米音箱，使用场景比较局限。突发奇想能否把大语言模型和小爱音响结合起来，于是就有了这番折腾。包的原理十分直接，就是通过TTS识别，发送给chatGPT，再返回结果进行朗读。
## 储存库
&emsp;&emsp;[yihong0618/xiaogpt: Play ChatGPT and other LLM with Xiaomi AI Speaker (github.com)](https://github.com/yihong0618/xiaogpt)
&emsp;&emsp;感谢大佬！
## 环境准备

### 软件环境
&emsp;&emsp;实操过程中，发现Windows11系统无法兼容相关依赖包，所以建议通过Mac或者Linux系统的命令行运行如下指令。大家一般使用Windows系统，可以安装带有图形界面的Ubuntu双系统，或者在Windows下安装WSL-ubuntu子系统，相关教程可以bing！这里简述一下WSL-ubuntu的安装方法：

1. 首先，按下Win+R键打开运行对话框，然后输入"cmd"并按下回车键，这将打开CMD界面。
2. 在CMD界面中，输入以下命令以安装WSL-ubuntu子系统：
    ```
    wsl --install
    ```
    这个命令将自动下载并安装WSL-ubuntu子系统。
3. 安装完成后，重新启动计算机。
4. 在重新启动后的计算机上，点击Windows开始菜单，并搜索"WSL"。选择"WSL"或"WSL-ubuntu"来打开WSL-ubuntu子系统。
5. 第一次打开WSL-ubuntu子系统时，系统会提示你创建一个新的用户名和密码。按照提示进行操作，并记住你设置的用户名和密码。
6. 完成设置后，将进入WSL-ubuntu子系统的命令行界面。在这里，可以像在Linux系统中一样使用各种命令和工具。

&emsp;&emsp;下面我们以WSL-ubuntu为例进行演示！
&emsp;&emsp;打开CMD界面（Win+R打开运行，输入cmd），输入指令进入linux操作界面：
```bash
wsl
#or
ubuntu
```
&emsp;&emsp;为了避免每次进入系统都需要输入账号和密码，我们可以配置如下项目：
```bash
sudo visudo
mancuoj ALL=(ALL) NOPASSWD: ALL
```

### 网络环境
&emsp;&emsp;安装python之前呢，我们可以建立特殊访问，不需要配置镜像源，但是注意，即便电脑挂载了相关软件，wsl是不能通过我们的电脑访问特殊站点的。
&emsp;&emsp;WSL-buntu系统是作为局域网内主机存在的，那么就有了解决方案。首先在windows的代理软件中，打开允许局域网访问，并记录电脑相关软件的端口号，一般为7890。接着进入WSL系统中，配置网络项目：
&emsp;&emsp;首先需要查看IP地址，然后设置环境变量。完成如下设置后即可让WSL访问特殊站点：
```bash
cat /etc/resolv.conf
export ALL_PROXY="http://{ip}:{端口号，查看代理软件}"
```
&emsp;&emsp;**免责声明：这里的代理设置不指代任何国家法律禁止的访问方法。以上资料是完全的技术分享。**
&emsp;&emsp;若配置国内镜像源，可按照如下方法：
1. 备份配置文件：
```bash
cp /etc/apt/sources.list /etc/apt/sources.list.bak
```
2. 使用修改源的内容：
```bash
sudo vim sources.list
```
3. 全部删除后修改为阿里云的镜像：
```bash
deb http://mirrors.aliyun.com/ubuntu/ focal main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ focal main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ focal-security main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ focal-security main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ focal-updates main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ focal-updates main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ focal-proposed main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ focal-proposed main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ focal-backports main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ focal-backports main restricted universe multiverse
```
4. 更新软件列表：
```bash
sudo apt update 
sudo apt upgrade
```


### 安装Python
&emsp;&emsp;接下来，我们愉快的安装python！
#### 安装：
```bash
sudo apt install python3
sudo apt install python3-pip
```
#### # 配置清华镜像源
```bash
cd ~ 
mkdir .pip
sudo vim ~/.pip/pip.conf
```
&emsp;&emsp;修改为：
```bash
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple/ 
[install]
trusted-host = pypi.tuna.tsinghua.edu.cn
```
#### 默认进入Python3
```bash
# 删掉原来软链接，如果没有直接新建
sudo rm /usr/bin/python
sudo rm /usr/bin/pip

# 新建软链接
sudo ln -s /usr/bin/python3 /usr/bin/python
sudo ln -s /usr/bin/pip3 /usr/bin/pip
```
&emsp;&emsp;可以输入python，测试是否安装成功。

### xiaogpt包的使用
#### 安装软件和依赖包
1. 首先安装米家的开发者包：
```bash
pip install miservice_fork
```
2. 设置米家的账号和密码（注意，不需要加引号）：
```bash
export MI_USER=xxxx
export MI_PASS=xxx
```
3. 查询设备ID（DID），设置米家开发者的操纵设备：
```bash
micli list
set MI_DID=xxxx
```
4. 这里可以试验一些米家开发者包的常用函数
```bash
micli 5-3 你好
```
5. 安装xiaogpt包
```bash
pip install -U --force-reinstall xiaogpt
```

#### 实现
1. 设置chatgpt的api：
```bash
export OPENAI_API_KEY={your_api_key}
```
&emsp;&emsp;注意，如果是官方API或者是非直接访问的第三方API，就需要如之前一般设置代理环境；否则，不需要设置。
2. 运行：这里的型号，可以从小爱的屁股上寻找，也可以用micli list的命令查看：
```bash
xiaogpt --hardware {型号} --use_chatgpt_api
```
3. 对于部分机型，可能需要--use_comand指令，否则chatGPT会返回结果，但是不会通过TTS朗读；此外，mute_xiaoai命令可以剔除小爱自己的回答：
```bash
xiaogpt --hardware {型号} --use_chatgpt_api --use_command
```
4. 如果chatGPT的API非官方，可以使用--api_base {api link}指定API服务提供商，有一个第三方站点实操是可以的（不是广告！）：[AISKT API聚合](https://one.aiskt.com/)。
5. 使用阿里的通义千问，在网络环境上不需要特殊配置：
```bash
xiaogpt --hardware {型号}  --mute_xiaoai --use_qwen --qen_key {qwen_key}
```

#### 参数介绍
|参数|说明|默认值|可选值|
|---|---|---|---|
|hardware|设备型号|||
|account|小爱账户|||
|password|小爱账户密码|||
|openai_key|openai的apikey|||
|serpapi_api_key|serpapi的key 参考 [SerpAPI](https://serpapi.com/)|||
|glm_key|chatglm 的 apikey|||
|gemini_key|gemini 的 apikey [参考](https://makersuite.google.com/app/apikey)|||
|qwen_key|qwen 的 apikey [参考](https://help.aliyun.com/zh/dashscope/developer-reference/api-details)|||
|bard_token|bard 的 token 参考 [Bard-API](https://github.com/dsdanielpark/Bard-API)|||
|cookie|小爱账户cookie （如果用上面密码登录可以不填）|||
|mi_did|设备did|||
|use_command|使用 MI command 与小爱交互|`false`||
|mute_xiaoai|快速停掉小爱自己的回答|`true`||
|verbose|是否打印详细日志|`false`||
|bot|使用的 bot 类型，目前支持gpt3,chatgptapi和newbing|`chatgptapi`||
|tts|使用的 TTS 类型|`mi`|`edge`、 `openai`|
|tts_voice|TTS 的嗓音|`zh-CN-XiaoxiaoNeural`(edge), `alloy`(openai)||
|prompt|自定义prompt|`请用100字以内回答`||
|keyword|自定义请求词列表|`["请"]`||
|change_prompt_keyword|更改提示词触发列表|`["更改提示词"]`||
|start_conversation|开始持续对话关键词|`开始持续对话`||
|end_conversation|结束持续对话关键词|`结束持续对话`||
|stream|使用流式响应，获得更快的响应|`false`||
|proxy|支持 HTTP 代理，传入 http proxy URL|""||
|gpt_options|OpenAI API 的参数字典|`{}`||
|bing_cookie_path|NewBing使用的cookie路径，参考[这里](https://github.com/acheong08/EdgeGPT#getting-authentication-required)获取|也可通过环境变量 `COOKIE_FILE` 设置||
|bing_cookies|NewBing使用的cookie字典，参考[这里](https://github.com/acheong08/EdgeGPT#getting-authentication-required)获取|||
|deployment_id|Azure OpenAI 服务的 deployment ID|参考这个[如何找到deployment_id](https://github.com/yihong0618/xiaogpt/issues/347#issuecomment-1784410784)||
|api_base|如果需要替换默认的api,或者使用Azure OpenAI 服务|例如：`https://abc-def.openai.azure.com/`|
#### 个性化代码
&emsp;&emsp;程序默认使用“请、帮我”两个开头进行提问，而根据源代码来看，命令行输入无法更改此参数。此外默认Prompt也必须要源代码进行修改，有如下两个方法：
1. 可以在Linux系统中找到源码，使用vim进行修改；
2. 打开Windows系统读写WSL文件的权限，用图形界面修改：
&emsp;&emsp;首先在cmd中修改权限：
```bash
ubuntu config --default-user root
```
&emsp;&emsp;接着打开Ubuntu的网络位置，进行寻找和修改。
3. 源代码的config.py可以修改prompt和唤醒词，xiaogpt.py还能更改小爱其他回复。

## 结束语
&emsp;&emsp;这个项目，实际上应用场景也很有限，花了很大的精力去整理技术文档和debug，最后听到小爱同学的一句“正在询问ChatGPT”，感觉很好玩！
&emsp;&emsp;现在，利用HomeAssistant和智能家居的开发者环境，俺们宿舍实现了灯具、空调、电脑和音箱的互联。通过语音或一些终端即可控制电器的开关；可以远程提醒睡觉的室友去签到……说效率嘛，也没提高不少，但对于一个医学生而言，很少能体会到技术进步的新奇，这也算一种满足叭！
&emsp;&emsp;在Github上还有很多其他的“联名”项目，比如最常见的微信接入Chatgpt。（[cheungchazz/WeChat-AIChatbot-WinOnly: 基于chatgpt-on-wechat框架，只能运行在Win平台的项目，通过本项目可以将微信或者企业微信个人号接入ChatGpt、文心一言、FastGpt、LinkAI，可以文字对话、语音对话、图片交互、文件交互等。 (github.com)](https://github.com/cheungchazz/WeChat-AIChatbot-WinOnly)）

## 参考
1. [手把手教你在Ubuntu中愉快地使用Python_ubuntu使用python-CSDN博客](https://blog.csdn.net/Mancuojie/article/details/120411171#_31)
2. [yihong0618/xiaogpt: Play ChatGPT and other LLM with Xiaomi AI Speaker (github.com)](https://github.com/yihong0618/xiaogpt)

