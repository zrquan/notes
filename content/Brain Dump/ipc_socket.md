---
title: "IPC Socket"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:15+08:00
draft: false
---

IPC Socket 是一种特殊的 [Socket]({{< relref "socket.md" >}})（套接字接口），专用名称为 UNIX Domain Socket。出于
效率考虑，当同一台主机的进程使用 Socket 进行进程间通信时，操作系统会对其进行优化，
不需要经过网络协议栈，也就省下了打包拆包、计算校验和、维护序号和应答等操作所带来
的开销，直接在应用层将一个进程的数据拷贝到另一个进程。
