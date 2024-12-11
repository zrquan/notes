---
title: "Resource temporarily unavailable"
author: ["4shen0ne"]
draft: false
---

## 1. 物理内存耗尽 {#1-dot-物理内存耗尽}


## 2. 进程启动超过了用户的 ulimit 限制 {#2-dot-进程启动超过了用户的-ulimit-限制}

可以通过命令 `ulimit -u` 查看

centos 默认 4096，可以调整最大进程数解决


## 3. 进程、线程启动过多，linux 无法分配新的 PID {#3-dot-进程-线程启动过多-linux-无法分配新的-pid}

-   /proc/sys/kernel/pid_max
    操作系统进程、线程 ID 的最大值，系统支持的最大线程数 sysctl kernel.pid_max

-   /proc/sys/kernel/threads-max
    表示内核所能使用的线程的最大数目

-   max_user_process
    系统限制某用户下最多可以运行多少进程或线程（ulimit -u）

-   /proc/sys/vm/max_map_count
    单进程 mmap 的限制，会影响单个进程可创建的线程数


### 缓解措施 {#缓解措施}

1.  不重启系统，动态调整 pid_max
2.  重启系统，清除 zombie 进程，释放 PID 资源
