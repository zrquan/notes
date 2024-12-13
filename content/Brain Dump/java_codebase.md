---
title: "Java Codebase"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:16+08:00
tags: ["java"]
draft: false
---

Codebase 即代码库，是 JVM 加载类的地方，通过指定 codebase, JVM 可以本地或远程加
载类字节码并执行。比如 CLASSPATH 环境变量可以视为本地的 codebase, 而通过 rmi、
applets 加载的远程对象可以视为远程 codebase

官方文档：<https://docs.oracle.com/javase/7/docs/technotes/guides/rmi/codebase.html>


## codebase 在 RMI 中的使用 {#codebase-在-rmi-中的使用}

Java RMI 中，客户端调用服务端注册的远程对象时，需要使用特殊的 stub 类实例进行远
程通信，而 java.rmi.server.codebase 为客户端指定了可以下载这些 stub 实例的地方

{{< figure src="/ox-hugo/_20241210_220112screenshot.png" >}}

{{< figure src="/ox-hugo/_20241210_220118screenshot.png" >}}
