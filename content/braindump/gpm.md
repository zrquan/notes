---
title: "GPM"
author: ["4shen0ne"]
tags: ["go"]
draft: false
---

GPM 是 Go 语言在运行时层面（runtime）实现的一套调度系统，用来实现轻量级用户线程
的创建和管理，并实现用户线程和内核线程的动态关联。


## Goroutine {#goroutine}

Go 语言中的轻量级线程，里面除了存放本 goroutine 信息外还有与所在 P 的绑定等信息。


## Process {#process}

Process 管理着一组 goroutine 队列，里面会存储当前 goroutine 运行的上下文环境（函
数指针，堆栈地址及地址边界），Process 会对自己管理的 goroutine 队列做一些调度
（比如把占用 CPU 时间较长的 goroutine 暂停、运行后续的 goroutine 等等），当自己的
队列消费完了就去全局队列里取，如果全局队列里也消费完了会去其他 Process 的队列里
抢任务。


## Machine {#machine}

Machine 是 Go 运行时对操作系统内核线程的虚拟，与内核线程一般是一一映射的关系，每
个 goroutine 最终都是要放到 Machine 上执行的。


## 调度过程 {#调度过程}

P 与 M 一般也是一一对应的。他们关系是：P 管理着一组 G，挂载在 M 上运行；当一个 G
长久阻塞在一个 M 上时，Go 会新建一个 M（内核线程），挂起 G 所在的 P 并把其他的 G
挂载在新建的 M 上；当旧的 G 阻塞完成或者认为其已经死掉时，回收旧的 M。
