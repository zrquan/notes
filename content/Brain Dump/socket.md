---
title: "Socket"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:57+08:00
draft: false
---

和[信号量]({{< relref "信号量.md" >}})、消息队列、[共享内存]({{< relref "共享内存.md" >}})一样，也是一种进程间通信的手段，但前者只适合单机多进
程通信，而 Socket 是更为普适的进程间通信机制，可用于不同机器之间的进程通信。

套接字（Socket）起初是由 UNIX 系统的 BSD 分支开发出来的。


## IPC Socket {#ipc-socket}

IPC Socket 是一种特殊的 Socket（套接字接口），专用名称为 UNIX Domain Socket。出于
效率考虑，当同一台主机的进程使用 Socket 进行进程间通信时，操作系统会对其进行优化，
不需要经过网络协议栈，也就省下了打包拆包、计算校验和、维护序号和应答等操作所带来
的开销，直接在应用层将一个进程的数据拷贝到另一个进程。
