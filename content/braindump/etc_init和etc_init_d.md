---
title: "/etc/init和/etc/init.d"
author: ["4shen0ne"]
draft: false
---

/etc/init.d 存放System V init tools (SysVinit) 的管理脚本，SysVinit 是 linux 传
统的服务管理工具

/etc/init 其实功能差不多，也是存放服务的管理脚本，但是是 Upstart 工具使用的脚本。
Upstart 是 Ubuntu 使用的一个更年轻的服务管理工具，Ubuntu 正在从 SysVinit 过渡到
Upstart，当然 Upstart 也可以兼容SysVinit 的管理脚本
