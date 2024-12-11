---
title: "SMB"
author: ["4shen0ne"]
draft: false
---

服务器消息块（SMB）协议是一种网络文件共享协议，在 Microsoft Windows 中实现称为
Microsoft SMB 协议。SMB 允许您共享文件，磁盘，目录，打印机等。在 Windows 2000 之
前，SMB 过去通过 TCP / IP 端口 139 与 NetBIOS 一起运行。因此，建立 SMB 连接需要
NetBIOS 会话

从 Windows 2000 及更高版本开始，SMB 可以使用端口 445 在 TCP / IP 上运行，而无需
运行 NetBIOS 会话

另一方面，Samba 是 SMB 的 UNIX 实现。Samba 用于为客户端提供通过 SMB 协议访问
UNIX 目录和文件的能力，如果他们与 Windows 服务器通信则完全相同

经常看到两个特殊共享： `IPC$` 和 `ADMIN$` 共享。 `ADMIN$` 共享基本上可以被认为是路径
C:\Windows 的符号链接。 `IPC$` 略有不同，它不直接映射到文件系统，而是提供一个接口，
通过该接口可以执行远程过程调用（RPC）
