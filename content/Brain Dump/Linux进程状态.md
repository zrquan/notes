---
title: "Linux 进程状态"
author: ["4shen0ne"]
lastmod: 2024-12-14T19:17:27+08:00
tags: ["linux"]
draft: false
---

在 Linux 中使用 `ps` 命令列出[进程]({{< relref "进程" >}})时，可以看到 STAT 这一列有几个字母用来表示这个进
程的状态


## R (TASK_RUNNING) {#r--task-running}

可执行状态，只有在该状态的进程才可能在 CPU 上运行，而同一时刻可能有多个进程处于可
执行状态。这些进程的 [task_struct]({{< relref "#d41d8c" >}}) 结构（进程控制块）被放入对应 CPU 的可执行队列中（一
个进程最多只能出现在一个 CPU 的可执行队列中），由进程调度器就从各个 CPU 的可执行队列
中分别选择一个进程在该 CPU 上运行。

有些教材将正在 CPU 上运行的进程定义为 RUNNING 状态，放进了 CPU 可执行队列但仍未执行
的进程定义为 READY 状态，这两种状态在 Linux 下统一为 TASK_RINNING 状态。


## S (TASK_INTERRUPTIBLE) {#s--task-interruptible}

可中断的睡眠状态，处于这个状态的进程因为等待某事件的发生（比如等待[Socket]({{< relref "#d41d8c" >}})连接、等
待[信号量]({{< relref "#d41d8c" >}})）而被挂起。这些进程的 task_struct 结构（进程控制块）被放入对应事件的等待
队列中，当这些事件发生时（由外部中断或其他进程触发），对应的等待队列中的一个或多
个进程将被唤醒。

通常情况下，系统中的大部分进程都处于 TASK_INTERRUPTIBLE 状态。


## D (TASK_UNINTERRUPTIBLE) {#d--task-uninterruptible}

不可中断的睡眠状态，和 TASK_INTERRUPTIBLE 的区别在于该进程不响应异步信号，也就是
`kill -9` 也杀不死。该状态用于保护内核的某些不能被打断的处理流程，由于该状态总是非
常短暂，使用 `ps` 基本观察不到该状态的进程。

例如，在进程对某些硬件进行操作时（比如进程调用 read 系统调用对某个设备文件进行读操
作，而 read 系统调用最终执行到对应设备驱动的代码，并与对应的物理设备进行交互），可
能需要使用 TASK_UNINTERRUPTIBLE 状态对进程进行保护，以避免进程与设备交互的过程被打
断，导致设备陷入不可控的状态。


## T/t (TASK_STOPPED or TASK_TRACED) {#t-t--task-stopped-or-task-traced}


### T (TASK_STOPPED) {#t--task-stopped}

暂停状态，进程收到 SIGSTOP 信号时进入该状态（除非该进程本身处于
TASK_UNINTERRUPTIBLE 状态而不响应信号）。

SIGSTOP 与 SIGKILL 信号一样，是非常强制的。不允许用户进程通过 signal 系列的系统调用重
新设置对应的信号处理函数。

向进程发送一个 SIGCONT 信号 (`kill -18`)，可以让其从 TASK_STOPPED 状态恢复到
TASK_RUNNING 状态；或者 `kill -9` 直接尝试杀死进程。


### t (TASK_TRACED) {#t--task-traced}

跟踪状态，处于该状态的进程会暂停执行，等待跟踪它的进程对它进行操作。比如使用 gdb
对进程下断点后，进程执行到断点位置暂停时就处于 TASK_TRACED 状态。

和 TASK_STOPPED 的区别在于 TASK_TRACED 会保护进程不被 SIGCONT 信号唤醒，只能等到
调试进程通过 ptrace 系统调用执行 PTRACE_CONT、PTRACE_DETACH 等操作，或调试进程退出，
被调试的进程才能恢复到 TASK_RUNNING 状态。


## Z (TASK_DEAD - EXIT_ZOMBIE) {#z--task-dead-exit-zombie}

进程在退出的过程中处于 TASK_DEAD 状态，成为僵尸进程。在这个退出过程中，进程占有的
所有资源将被回收，除了 task_struct 结构以及少数资源以外。此时进程就只剩下
task_struct 这个空壳，故称为僵尸。

之所以保留 task_struct，是因为 task_struct 里面保存了进程的退出码以及一些统计信息，
其父进程很可能用到这些信息。

根据父/子进程退出时间点的差异，可以再细分两个不同状态：


### 僵尸状态 {#僵尸状态}

一般来说子进程在退出后，系统会通知父进程来回收僵尸进程，如果这个“收尸”过程不顺利，
子进程将处于僵尸状态直到父进程退出。


### 孤儿状态 {#孤儿状态}

如果一个进程还在执行，它的父进程就意外结束了，该进程将处于孤儿状态。孤儿进程会被
托管给父进程进程组的下一个进程，或者 init 进程（1号进程）。
