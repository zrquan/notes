---
title: "LSASS"
author: ["4shen0ne"]
tags: ["windows"]
draft: false
---

本地安全权限服务（Local Security Authority Service）是 Windows 的一个系统程序，
进程文件为 lsass.exe，用于本地安全和登陆策略

用户登录时，lsass.exe 接收用户输入的明文密码，将其转换成 [NTLM Hash]({{< relref "ntlm_hash.md" >}})，再和 [SAM]({{< relref "sam.md" >}}) 中
的用户数据进行比较
