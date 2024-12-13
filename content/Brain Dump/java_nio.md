---
title: "Java NIO"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:16+08:00
tags: ["java"]
draft: false
---

NIO（Non-blocking I/O，在 Java 领域，也称为 New I/O），是一种同步非阻塞的 I/O 模型，
也是 I/O 多路复用的基础，已经被越来越多地应用到大型应用服务器，成为解决高并发与大
量连接、I/O 处理问题的有效方式

NIO 主要有三大核心部分：Channel(通道)，Buffer(缓冲区), Selector。传统 IO 基于字节流
和字符流进行操作，而 NIO 基于 Channel 和 Buffer 进行操作，数据总是从通道读取到缓冲区中，
或者从缓冲区写入到通道中。Selector 用于监听多个通道的事件（比如：连接打开，数据到
达）。因此，单个线程可以监听多个数据通道。

常见 I/O 模型对比：

{{< figure src="../.images/_20220208_175334screenshot.png" >}}
