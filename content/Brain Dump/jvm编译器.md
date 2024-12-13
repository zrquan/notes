---
title: "JVM编译器"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:27+08:00
tags: ["java", "jvm"]
draft: false
---

JVM 中有三个重要的编译器：前端编译器、JIT 编译器、AOT 编译器


## 前端编译器 {#前端编译器}

前端编译器的作用是将 Java 源代码编译成字节码(class)文件，比如我们常用的 javac 就
是前端编译器


## JIT 编译器 {#jit-编译器}

[JIT(Just-In-Time) 即时编译器]({{< relref "java_jit原理解析.md" >}})将字节码转换成系统可以直接执行的机器码，在 HotSpot
虚拟机内置了两个即时编译器，分别称为 Client Compiler 和 Server Compiler, 这两个编
译器分别对应 C1 和 C2 两种编译模式

C1 编译模式做的优化相对比较保守，其编译速度相比 C2 较快；而 C2 编译模式会做一些
激进的优化，并且会根据性能监控做针对性优化，所以其编译质量相对较好，但是耗时更长。
而 HotSpot 默认会使用混合模式(Mixed Mode)，如果想单独使用 C1 模式或 C2 模式，使
用 -client 或 -server 选项


## AOT 编译器 {#aot-编译器}

AOT(Ahead-Of-Time) 编译器的基本思想是：在程序执行前生成 Java 方法的本地代码，以
便在程序运行时直接使用本地代码（即将源代码直接编译为机器码）。其存在的目的在于避
免 JIT 编译器的运行时性能消耗或内存消耗


## 总结 {#总结}

编译速度：解释执行 &gt; AOT 编译器 &gt; JIT 编译器
编译质量：JIT 编译器 &gt; AOT 编译器 &gt; 解释执行
