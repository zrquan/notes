---
title: "Linux 目录结构"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:31+08:00
tags: ["linux"]
draft: false
---

根目录下的系统目录一览

{{< figure src="/ox-hugo/_20220123_190803screenshot.png" >}}

| 目录        | 目录放置的内容                                |
|-----------|----------------------------------------|
| bin         | binary 二进制文件，存放系统命令，如 cat，cp，mkdir |
| boot        | 存放开机启动过程所需的内容，如开机管理程序 grub2 |
| dev         | 所有设备文件的目录（如声卡、硬盘、光驱）      |
| etc         | etcetera，存放系统的主要配置文件              |
| home        | 用户家目录数据的存放目录                      |
| lib         | library，存放 sbin 和 bin 目录下命令所需的库文件，避免重复 |
| lib32/lib64 | 存放二进制函数库，支持 32/64 位               |
| lost+found  | 在 EXT3/4 系统中，当系统意外崩溃或意外关机时，会产生一些碎片文件在这个目录下面 |
| media       | 用于挂载光盘，软盘和 DVD 等设备               |
| mnt         | mount，同 media 作用一样，用于临时挂载存储设备 |
| opt         | 第三方软件安装存放目录                        |
| proc        | 进程及内核信息存放目录，不占用硬盘空间        |
| root        | root 用户的家目录                             |
| run         | 是一个临时文件系统，存储系统启动以来的信息当系统重启时，这个目录下的文件应该被删掉或清除。 |
| sbin        | system bin，存放 root 用户使用的命令，如格式化命令 mkfs |
| srv         | 一些网络服务所需要的数据文件                  |
| sys         | 同 proc 目录，用于记录 CPU 与系统硬件的相关信息 |
| tmp         | 存放程序运行时产生的临时文件                  |
| usr         | 系统存放程序的目录，类似于在 windows 下的文件夹 programefiles |
| var         | 存放内容常变动的文件目录，如系统日志文件      |
