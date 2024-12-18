---
title: "Namespace"
author: ["4shen0ne"]
tags: ["linux"]
draft: false
---

Linux 的 namespace 是一种内核特性，它可以为一组[进程]({{< relref "进程.md" >}})提供隔离的运行环境。通过使用
namespace，进程组可以拥有自己独立的系统资源，例如文件系统、网络接口、进程树、用
户 ID 和挂载点等。这种隔离可以增强系统的安全性，也使得运行环境更加可控。

Linux 中主要有以下几种类型的 namespace：

1.  Mount Namespace (mnt): 隔离文件系统挂载点，使每个 namespace 的进程看到的文件
    系统挂载点不同。

2.  PID Namespace: 隔离进程 ID，使得每个 namespace 内部的进程可以有自己的 `PID 1` ，
    并且与其他 namespace 中的进程 ID 相互独立。

3.  Network Namespace (net): 隔离网络资源，如网络设备和 IP 地址，每个 namespace 可
    以有自己的网络环境。

4.  Interprocess Communication Namespace (ipc): 隔离[进程间通信]({{< relref "进程间通信.md" >}})资源，包括[信号量]({{< relref "信号量.md" >}})、
    消息队列和[共享内存]({{< relref "共享内存.md" >}})。

5.  UTS Namespace: 隔离主机名和域名，允许每个 namespace 拥有独立的系统标识。

6.  User Namespace: 隔离用户和用户组的 ID，一个用户可以在 namespace 中拥有不同的权
    限，甚至可以是根用户，而对主系统无影响。

7.  [Cgroup]({{< relref "cgroup.md" >}}) Namespace: 隔离 cgroup 的根目录，使得每个 namespace 中的进程只能看到该
    namespace 中的 cgroup。
