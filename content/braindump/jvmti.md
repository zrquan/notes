---
title: "JVMTI"
author: ["4shen0ne"]
tags: ["java"]
draft: false
---

全称 JVM Tool Interface，是 JVM 提供的 native 编程接口，可以用来操作并监控 JVM，
实现调试、监控、线程分析、覆盖率分析等等功能。

JVMTI 是一套接口，需要使用 agent 来对它们进行操作，而 agent 是由 C/C++ 开发的动
态链接库，在启动 JVM 时指定 agent 进行加载。
