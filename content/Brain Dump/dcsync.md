---
title: "DCSync"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:09+08:00
tags: ["域渗透"]
draft: false
---

DCSync 是 Mimikatz 在 2015 年添加的一个功能，能够用来导出域内所有用户的 hash。

利用条件是获得以下 `任一用户` 的权限：

-   Administrators 组内的用户
-   Domain Admins 组内的用户
-   Enterprise Admins 组内的用户
-   域控制器的计算机帐户（SYSTEM）

原理：通过 IDL_DRSGetNCChanges 函数（基于 [DRS]({{< relref "drs.md" >}})）从域控制器复制用户凭据
