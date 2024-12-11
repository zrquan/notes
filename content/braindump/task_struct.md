---
title: "task_struct"
author: ["4shen0ne"]
tags: ["linux"]
draft: false
---

task_struct 结构体是 Linux 内核中一个非常关键的记录性数据结构，也被称为进程控制
块 PCB(Process Control Block)。

这个结构体包含了操作系统用于管理进程的所有信息，例如进程的标识符（PID）、[进程状态]({{< relref "进程.md#linux-进程状态" >}})、
进程的内存地址空间、调度信息、优先级、信号处理状态等。每一个进程创建时都会创建一
个 PCB，直到该进程消亡。

task_struct 结构体定义在 `<linux/sched.h>` 头文件中。
