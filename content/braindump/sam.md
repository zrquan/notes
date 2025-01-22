---
title: "SAM"
author: ["4shen0ne"]
tags: ["windows"]
draft: false
---

Security Account Manager (SAM) 是 Windows 中的一个加密的数据库文件，用来保存用户
的用户名、密码哈希值、安全标识符（[SID]({{< relref "sid.md" >}})）等关键信息，当需要验证用户身份时就会使用
SAM 中的数据

文件路径：%SystemRoot%/system32/config/SAM
